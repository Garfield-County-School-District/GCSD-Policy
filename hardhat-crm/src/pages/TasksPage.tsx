import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Company, Task } from '../lib/types'

interface TaskWithCompany extends Task {
  company?: Pick<Company, 'id' | 'name'> | null
}

export function TasksPage() {
  const [tasks, setTasks] = useState<TaskWithCompany[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [showDone, setShowDone] = useState(false)
  const [title, setTitle] = useState('')
  const [due, setDue] = useState('')
  const [companyId, setCompanyId] = useState('')

  async function load() {
    setLoading(true)
    const [t, c] = await Promise.all([
      supabase.from('tasks').select('*, company:companies(id, name)').order('due_date', { nullsFirst: false }),
      supabase.from('companies').select('*').order('name'),
    ])
    setTasks((t.data as unknown as TaskWithCompany[]) ?? [])
    setCompanies(c.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function add(e: FormEvent) {
    e.preventDefault()
    await supabase.from('tasks').insert({ title, due_date: due || null, company_id: companyId || null })
    setTitle(''); setDue(''); setCompanyId('')
    load()
  }

  async function toggle(task: Task) {
    await supabase.from('tasks').update({ status: task.status === 'open' ? 'done' : 'open' }).eq('id', task.id)
    load()
  }

  const today = new Date().toISOString().slice(0, 10)
  const visible = tasks.filter((t) => (showDone ? true : t.status === 'open'))

  return (
    <div>
      <div className="page-header"><h1>Tasks</h1></div>

      <form className="card inline-form" onSubmit={add}>
        <div className="row">
          <input placeholder="New task…" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <input type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          <select value={companyId} onChange={(e) => setCompanyId(e.target.value)}>
            <option value="">No company</option>
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit">Add</button>
        </div>
      </form>

      <label className="checkbox-inline">
        <input type="checkbox" checked={showDone} onChange={(e) => setShowDone(e.target.checked)} /> Show completed
      </label>

      {loading ? <p className="muted">Loading…</p> : visible.length === 0 ? <p className="muted">Nothing to do. 🎉</p> : (
        <ul className="task-list">
          {visible.map((t) => {
            const overdue = t.status === 'open' && t.due_date && t.due_date < today
            return (
              <li key={t.id} className="task-list-row">
                <label className={t.status === 'done' ? 'done' : ''}>
                  <input type="checkbox" checked={t.status === 'done'} onChange={() => toggle(t)} />
                  {t.title}
                </label>
                <div className="task-list-meta">
                  {t.company && <Link className="muted small" to={`/companies/${t.company.id}`}>{t.company.name}</Link>}
                  {t.due_date && <span className={overdue ? 'due overdue' : 'due'}>{t.due_date}</span>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
