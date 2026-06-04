/**
 * One-time script: regenerate all policy summaries using AI.
 * Reads each policy's HTML content, strips tags, asks Claude Haiku for a
 * ≤1000-character summary, and writes it back to server/data.db.
 *
 * Usage (from project root):
 *   node scripts/regenerate-summaries.mjs
 *
 * Requires ANTHROPIC_API_KEY in .env (project root).
 */

import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DB_PATH  = join(__dirname, '../server/data.db');
const WASM_PATH = join(__dirname, '../node_modules/sql.js/dist/sql-wasm.wasm');

const SQL = await initSqlJs({ wasmBinary: readFileSync(WASM_PATH) });
const db  = new SQL.Database(readFileSync(DB_PATH));

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('ANTHROPIC_API_KEY not set in .env');
  process.exit(1);
}
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

function stripHtml(html = '') {
  return html.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

function dbAll(sql, params = []) {
  const stmt = db.prepare(sql);
  stmt.bind(params);
  const rows = [];
  while (stmt.step()) rows.push(stmt.getAsObject());
  stmt.free();
  return rows;
}

const policies = dbAll('SELECT id, title, content FROM policies ORDER BY title');
console.log(`Generating AI summaries for ${policies.length} policies...\n`);

let ok = 0, skipped = 0, failed = 0;

for (let i = 0; i < policies.length; i++) {
  const { id, title, content } = policies[i];
  const label = `[${i + 1}/${policies.length}]`;
  const plainText = stripHtml(content);

  if (!plainText) {
    console.log(`${label} SKIP (no content): ${title}`);
    skipped++;
    continue;
  }

  try {
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 350,
      messages: [{
        role: 'user',
        content: `Summarize this school district policy in 2-4 sentences (under 1000 characters total). Be specific about what the policy requires, allows, or prohibits. Do not begin with "This policy" or "The policy". Do not use bullet points.\n\nPolicy title: ${title}\n\nPolicy text:\n${plainText.slice(0, 4000)}`,
      }],
    });

    let summary = msg.content[0].text.trim().slice(0, 1000);
    db.run('UPDATE policies SET summary = ? WHERE id = ?', [summary, id]);
    console.log(`${label} OK: ${title}`);
    ok++;
  } catch (err) {
    console.error(`${label} ERROR: ${title}: ${err.message}`);
    failed++;
  }

  // Stay well within Haiku rate limits (1000 RPM / 100K TPM)
  await new Promise(r => setTimeout(r, 150));
}

writeFileSync(DB_PATH, Buffer.from(db.export()));

console.log(`\nDone. ${ok} updated, ${skipped} skipped, ${failed} failed.`);
console.log('DB saved to server/data.db — commit it to deploy the new summaries.');
