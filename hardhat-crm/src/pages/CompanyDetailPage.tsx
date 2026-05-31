import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import {
  DEAL_STAGES, SERVICE_TYPE_LABELS, STATUS_LABELS,
  type Activity, type ActivityType, type Company, type Contact, type Deal, type Task,
} from '../lib/types'

export function CompanyDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [company, setCompany] = useState<Company | null>(null)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    if (!id) return
    setLoading(true)
    const [c, ct, d, a, t] = await Promise.all([
      supabase.from('companies').select('*').eq('id', id).single(),
      supabase.from('contacts').select('*').eq('company_id', id).order('first_name'),
      supabase.from('deals').select('*').eq('company_id', id).order('created_at', { ascending: false }),
      supabase.from('activities').select('*').eq('company_id', id).order('occurred_at', { ascending: false }),
      supabase.from('tasks').select('*').eq('company_id', id).order('due_date'),
    ])
    setCompany(c.data ?? null)
    setContacts(ct.data ?? [])
    setDeals(d.data ?? [])
    setActivities(a.data ?? [])
    setTasks(t.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [id])

  if (loading) return <p className="muted">Loading…</p>
  if (!company) return <p className="muted">Company not found. <Link to="/companies">Back</Link></p>

  return (
    <div>
      <div className="page-header">
        <div>
          <Link to="/companies" className="back-link">← Companies</Link>
          <h1>{company.name}</h1>
          <div className="meta-row">
            <span className={`badge status-${company.status}`}>{STATUS_LABELS[company.status]}</span>
            {company.trade && <span className="badge">{company.trade}</span>}
            <span className="badge">{(company.preferred_language ?? 'en').toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="detail-grid">
        <section className="card">
          <h3>Details</h3>
          <dl className="detail-list">
            <dt>Phone</dt><dd>{company.phone ?? '—'}</dd>
            <dt>Website</dt><dd>{company.website ?? '—'}</dd>
            <dt>Address</dt><dd>{company.address ?? '—'}</dd>
            <dt>Accounting</dt><dd>{company.accounting_software ?? '—'}</dd>
            <dt>Annual revenue</dt><dd>{company.annual_revenue ? `$${company.annual_revenue.toLocaleString()}` : '—'}</dd>
            <dt>Lead source</dt><dd>{company.lead_source ?? '—'}</dd>
          </dl>
          {company.notes && <p className="notes">{company.notes}</p>}
        </section>

        <ContactsCard companyId={company.id} contacts={contacts} onChange={load} />
        <DealsCard companyId={company.id} deals={deals} onChange={load} />
        <TasksCard companyId={company.id} tasks={tasks} onChange={load} />
        <ActivitiesCard companyId={company.id} activities={activities} onChange={load} />
      </div>
    </div>
  )
}

function ContactsCard({ companyId, contacts, onChange }: { companyId: string; contacts: Contact[]; onChange: () => void }) {
  const [adding, setAdding] = useState(false)
  const [first, setFirst] = useState('')
  const [last, setLast] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    await supabase.from('contacts').insert({
      company_id: companyId, first_name: first, last_name: last || null,
      title: title || null, email: email || null, phone: phone || null,
    })
    setFirst(''); setLast(''); setTitle(''); setEmail(''); setPhone(''); setAdding(false)
    onChange()
  }

  return (
    <section className="card">
      <div className="card-header"><h3>Contacts</h3><button className="btn-small" onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : '+ Add'}</button></div>
      {adding && (
        <form className="inline-form" onSubmit={add}>
          <div className="row">
            <input placeholder="First name" value={first} onChange={(e) => setFirst(e.target.value)} required />
            <input placeholder="Last name" value={last} onChange={(e) => setLast(e.target.value)} />
          </div>
          <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
          <div className="row">
            <input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input placeholder="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
          <button type="submit" className="btn-small">Save contact</button>
        </form>
      )}
      {contacts.length === 0 ? <p className="muted">No contacts.</p> : (
        <ul className="plain-list">
          {contacts.map((c) => (
            <li key={c.id}>
              <strong>{c.first_name} {c.last_name}</strong>{c.title && <span className="muted"> · {c.title}</span>}
              <div className="muted small">{[c.email, c.phone].filter(Boolean).join(' · ') || '—'}</div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function DealsCard({ companyId, deals, onChange }: { companyId: string; deals: Deal[]; onChange: () => void }) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [value, setValue] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    await supabase.from('deals').insert({
      company_id: companyId, title, stage: 'new_lead',
      estimated_monthly_value: value ? Number(value) : null,
    })
    setTitle(''); setValue(''); setAdding(false)
    onChange()
  }

  async function updateStage(dealId: string, stage: string) {
    await supabase.from('deals').update({ stage: stage as Deal['stage'] }).eq('id', dealId)
    onChange()
  }

  return (
    <section className="card">
      <div className="card-header"><h3>Deals</h3><button className="btn-small" onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : '+ Add'}</button></div>
      {adding && (
        <form className="inline-form" onSubmit={add}>
          <input placeholder="Deal title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input placeholder="Est. monthly value ($)" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          <button type="submit" className="btn-small">Save deal</button>
        </form>
      )}
      {deals.length === 0 ? <p className="muted">No deals.</p> : (
        <ul className="plain-list">
          {deals.map((d) => (
            <li key={d.id}>
              <strong>{d.title}</strong>
              {d.service_type && <span className="muted"> · {SERVICE_TYPE_LABELS[d.service_type]}</span>}
              <div className="row tight">
                <select value={d.stage} onChange={(e) => updateStage(d.id, e.target.value)}>
                  {DEAL_STAGES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
                <span className="muted small">{d.estimated_monthly_value ? `$${d.estimated_monthly_value}/mo` : ''}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function TasksCard({ companyId, tasks, onChange }: { companyId: string; tasks: Task[]; onChange: () => void }) {
  const [adding, setAdding] = useState(false)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    await supabase.from('tasks').insert({ company_id: companyId, title, due_date: due || null })
    setTitle(''); setDue(''); setAdding(false)
    onChange()
  }

  async function toggle(task: Task) {
    await supabase.from('tasks').update({ status: task.status === 'open' ? 'done' : 'open' }).eq('id', task.id)
    onChange()
  }

  return (
    <section className="card">
      <div className="card-header"><h3>Tasks</h3><button className="btn-small" onClick={() => setAdding(!adding)}>{adding ? 'Cancel' : '+ Add'}</button></div>
      {adding && (
        <form className="inline-form" onSubmit={add}>
          <input placeholder="Task" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <button type="submit" className="btn-small">Save task</button>
        </form>
      )}
      {tasks.length === 0 ? <p className="muted">No tasks.</p> : (
        <ul className="plain-list">
          {tasks.map((t) => (
            <li key={t.id} className="task-row">
              <label className={t.status === 'done' ? 'done' : ''}>
                <input type="checkbox" checked={t.status === 'done'} onChange={() => toggle(t)} />
                {t.title}
              </label>
              {t.due_date && <span className="muted small">{t.due_date}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ActivitiesCard({ companyId, activities, onChange }: { companyId: string; activities: Activity[]; onChange: () => void }) {
  const [type, setType] = useState<ActivityType>('note')
  const [summary, setSummary] = useState('')

  async function add(e: FormEvent) {
    e.preventDefault()
    if (!summary.trim()) return
    const { data: userData } = await supabase.auth.getUser()
    await supabase.from('activities').insert({
      company_id: companyId, type, summary, created_by: userData.user?.id ?? null,
    })
    setSummary(''); setType('note')
    onChange()
  }

  return (
    <section className="card activity-card">
      <h3>Activity Log</h3>
      <form className="inline-form" onSubmit={add}>
        <div className="row">
          <select value={type} onChange={(e) => setType(e.target.value as ActivityType)}>
            <option value="note">Note</option>
            <option value="call">Call</option>
            <option value="email">Email</option>
            <option value="meeting">Meeting</option>
          </select>
          <input placeholder="What happened?" value={summary} onChange={(e) => setSummary(e.target.value)} />
          <button type="submit" className="btn-small">Log</button>
        </div>
      </form>
      {activities.length === 0 ? <p className="muted">No activity yet.</p> : (
        <ul className="timeline">
          {activities.map((a) => (
            <li key={a.id}>
              <span className={`badge activity-${a.type}`}>{a.type}</span>
              <span>{a.summary}</span>
              <span className="muted small">{new Date(a.occurred_at).toLocaleDateString()}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
