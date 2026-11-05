import type { Policy } from '../types';

const DISTRICT_NAME = 'Garfield County School District';

function safeFileName(title: string) {
  return (
    title
      .replace(/[—–]/g, '-')
      .replace(/[^a-zA-Z0-9 \-_.]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 120) || 'policy'
  );
}

function formatDate(value?: string) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

async function loadLogo(): Promise<string | null> {
  try {
    const res = await fetch('/flame-logo.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(typeof reader.result === 'string' ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

// Loaded only when someone clicks "Download PDF", so the page itself stays fast.
export async function downloadPolicyPdf(policy: Policy) {
  const [{ default: pdfMake }, { default: vfs }, { default: htmlToPdfmake }, logo] = await Promise.all([
    import('pdfmake/build/pdfmake'),
    import('pdfmake/build/vfs_fonts'),
    import('html-to-pdfmake'),
    loadLogo(),
  ]);

  if (typeof pdfMake.addVirtualFileSystem === 'function') {
    pdfMake.addVirtualFileSystem(vfs);
  } else {
    pdfMake.vfs = (vfs as any)?.pdfMake?.vfs ?? vfs;
  }

  const body = htmlToPdfmake(policy.content || '', {
    defaultStyles: {
      p: { margin: [0, 0, 0, 8] },
      h1: { fontSize: 16, bold: true, margin: [0, 8, 0, 6] },
      h2: { fontSize: 14, bold: true, margin: [0, 8, 0, 6] },
      h3: { fontSize: 12, bold: true, margin: [0, 6, 0, 4] },
      ul: { margin: [0, 0, 0, 8] },
      ol: { margin: [0, 0, 0, 8] },
      li: { margin: [0, 0, 0, 2] },
      a: { color: '#1d4ed8', decoration: 'underline' },
    },
  });

  const updated = formatDate(policy.updatedAt);

  const header: any[] = [
    {
      columns: [
        logo ? { image: logo, width: 40 } : { text: '', width: 0 },
        {
          stack: [
            { text: DISTRICT_NAME, style: 'district' },
            { text: 'policy.garfk12.org', style: 'subtle' },
          ],
          margin: [logo ? 10 : 0, 4, 0, 0],
        },
      ],
      margin: [0, 0, 0, 14],
    },
    { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#d1d5db' }] },
    { text: policy.title, style: 'title', margin: [0, 14, 0, 4] },
    {
      text: [policy.category, updated ? `  ·  Last updated ${updated}` : ''].filter(Boolean).join(''),
      style: 'subtle',
      margin: [0, 0, 0, 14],
    },
  ];

  const docDefinition = {
    info: { title: policy.title, author: DISTRICT_NAME },
    pageSize: 'LETTER',
    pageMargins: [48, 48, 48, 56],
    content: [...header, body],
    footer: (currentPage: number, pageCount: number) => ({
      columns: [
        { text: `${policy.title}`, style: 'footer' },
        { text: `Page ${currentPage} of ${pageCount}`, style: 'footer', alignment: 'right' },
      ],
      margin: [48, 16, 48, 0],
    }),
    defaultStyle: { fontSize: 10.5, lineHeight: 1.25, color: '#111827' },
    styles: {
      district: { fontSize: 13, bold: true },
      title: { fontSize: 17, bold: true },
      subtle: { fontSize: 9.5, color: '#6b7280' },
      footer: { fontSize: 8, color: '#9ca3af' },
      citation: { italics: true, fontSize: 9, color: '#6b7280' },
    },
  };

  pdfMake.createPdf(docDefinition).download(`${safeFileName(policy.title)}.pdf`);
}
