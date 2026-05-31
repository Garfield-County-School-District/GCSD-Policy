import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { STATUS_LABELS, type Company, type CompanyStatus, type LeadSource, type Language } from '../lib/types'

const TRADES = ['roofing', 'paving', 'landscaping', 'HVAC', 'concrete', 'electrical', 'plumbing', 'other']

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<CompanyStatus | 'all'>('all')
  const [showForm, setShowForm] = useState(false)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('companies').select('*').order('name')
    if (error) console.error(error)
    setCompanies(data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = companies.filter((c) => {
    const matchesQuery = c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.trade ?? '').toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter
    return matchesQuery && matchesStatus
  })

  return (
    <div>
      <div className="page-header">
        <h1>Companies</h1>
        <button onClick={() => setShowForm(true)}>+ New Company</button>
      </div>

      <div className="toolbar">
        <input placeholder="Search name or trade…" value={query} onChange={(e) => setQuery(e.target.value)} />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as CompanyStatus | 'all')}>
          <option value="all">All statuses</option>
          <option value="prospect">Prospect</option>
          <option value="active_client">Active Client</option>
          <option value="churned">Churned</option>
        </select>
      </div>

      {loading ? (
        <p className="muted">Loading…</p>
      ) : filtered.length === 0 ? (
        <p className="muted">No companies yet.</p>
      ) : (
        <table className="data-table">
          <thead>
            <tr><th>Name</th><th>Trade</th><th>Status</th><th>Lang</th><th>Phone</th></tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id}>
                <td><Link to={`/companies/${c.id}`}>{c.name}</Link></td>
                <td>{c.trade ?? '—'}</td>
                <td><span className={`badge status-${c.status}`}>{STATUS_LABELS[c.status]}</span></td>
                <td>{(c.preferred_language ?? 'en').toUpperCase()}</td>
                <td>{c.phone ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showForm && <NewCompanyModal onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load() }} />}
    </div>
  )
}

function NewCompanyModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState('')
  const [trade, setTrade] = useState('')
  const [status, setStatus] = useState<CompanyStatus>('prospect')
  const [leadSource, setLeadSource] = useState<LeadSource>('referral')
  const [language, setLanguage] = useState<Language>('en')
  const [phone, setPhone] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true); setError(null)
    const { error } = await supabase.from('companies').insert({
      name, trade: trade || null, status, lead_source: leadSource,
      preferred_language: language, phone: phone || null, notes: notes || null,
    })
    setBusy(false)
    if (error) setError(error.message)
    else onSaved()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="card modal" onClick={(e) => e.stopPropagation()} onSubmit={onSubmit}>
        <h2>New Company</h2>
        <label>Name<input value={name} onChange={(e) => setName(e.target.value)} required autoFocus /></label>
        <label>Trade
          <select value={trade} onChange={(e) => setTrade(e.target.value)}>
            <option value="">— select —</option>
            {TRADES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </label>
        <div className="row">
          <label>Status
            <select value={status} onChange={(e) => setStatus(e.target.value as CompanyStatus)}>
              <option value="prospect">Prospect</option>
              <option value="active_client">Active Client</option>
              <option value="churned">Churned</option>
            </select>
          </label>
          <label>Lead source
            <select value={leadSource} onChange={(e) => setLeadSource(e.target.value as LeadSource)}>
              <option value="referral">Referral</option>
              <option value="web">Web</option>
              <option value="partner">Partner</option>
              <option value="social">Social</option>
              <option value="other">Other</option>
            </select>
          </label>
          <label>Language
            <select value={language} onChange={(e) => setLanguage(e.target.value as Language)}>
              <option value="en">EN</option>
              <option value="es">ES</option>
            </select>
          </label>
        </div>
        <label>Phone<input value={phone} onChange={(e) => setPhone(e.target.value)} /></label>
        <label>Notes<textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} /></label>
        {error && <div className="error">{error}</div>}
        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
        </div>
      </form>
    </div>
  )
}
