import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { DEAL_STAGES, type Activity, type Company, type Deal, type DealStage, type Task } from '../lib/types'

interface TaskWithCompany extends Task { company?: Pick<Company, 'id' | 'name'> | null }
interface ActivityWithCompany extends Activity { company?: Pick<Company, 'id' | 'name'> | null }

export function DashboardPage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [tasks, setTasks] = useState<TaskWithCompany[]>([])
  const [activities, setActivities] = useState<ActivityWithCompany[]>([])
  const [clientCount, setClientCount] = useState(0)
  const [prospectCount, setProspectCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      const [d, t, a, clients, prospects] = await Promise.all([
        supabase.from('deals').select('*'),
        supabase.from('tasks').select('*, company:companies(id, name)').eq('status', 'open').order('due_date', { nullsFirst: false }).limit(8),
        supabase.from('activities').select('*, company:companies(id, name)').order('occurred_at', { ascending: false }).limit(8),
        supabase.from('companies').select('id', { count: 'exact', head: true }).eq('status', 'active_client'),
        supabase.from('companies').select('id', { count: 'exact', head: true }).eq('status', 'prospect'),
      ])
      setDeals(d.data ?? [])
      setTasks((t.data as unknown as TaskWithCompany[]) ?? [])
      setActivities((a.data as unknown as ActivityWithCompany[]) ?? [])
      setClientCount(clients.count ?? 0)
      setProspectCount(prospects.count ?? 0)
      setLoading(false)
    })()
  }, [])

  if (loading) return <p className="muted">Loading…</p>

  const openDeals = deals.filter((d) => d.stage !== 'won' && d.stage !== 'lost')
  const pipelineValue = openDeals.reduce((s, d) => s + (d.estimated_monthly_value ?? 0), 0)
  const wonValue = deals.filter((d) => d.stage === 'won').reduce((s, d) => s + (d.estimated_monthly_value ?? 0), 0)
  const countByStage = (stage: DealStage) => deals.filter((d) => d.stage === stage).length
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <div className="page-header"><h1>Dashboard</h1></div>

      <div className="stat-grid">
        <Stat label="Active clients" value={clientCount} />
        <Stat label="Prospects" value={prospectCount} />
        <Stat label="Open pipeline" value={`$${pipelineValue.toLocaleString()}/mo`} />
        <Stat label="Won (MRR)" value={`$${wonValue.toLocaleString()}/mo`} />
      </div>

      <div className="detail-grid">
        <section className="card">
          <h3>Pipeline by stage</h3>
          <ul className="bar-list">
            {DEAL_STAGES.map((s) => (
              <li key={s.value}>
                <span>{s.label}</span>
                <span className="bar"><span className="bar-fill" style={{ width: `${Math.min(countByStage(s.value) * 28, 100)}%` }} /></span>
                <span className="count">{countByStage(s.value)}</span>
              </li>
            ))}
          </ul>
          <Link to="/pipeline" className="muted small">Open pipeline →</Link>
        </section>

        <section className="card">
          <div className="card-header"><h3>Tasks due</h3><Link to="/tasks" className="muted small">All tasks →</Link></div>
          {tasks.length === 0 ? <p className="muted">No open tasks.</p> : (
            <ul className="plain-list">
              {tasks.map((t) => (
                <li key={t.id} className="task-list-row">
                  <span>{t.title}</span>
                  {t.due_date && <span className={t.due_date < today ? 'due overdue' : 'due'}>{t.due_date}</span>}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card">
          <h3>Recent activity</h3>
          {activities.length === 0 ? <p className="muted">No activity yet.</p> : (
            <ul className="timeline">
              {activities.map((a) => (
                <li key={a.id}>
                  <span className={`badge activity-${a.type}`}>{a.type}</span>
                  <span>{a.summary}</span>
                  {a.company && <Link className="muted small" to={`/companies/${a.company.id}`}>{a.company.name}</Link>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="card stat">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  )
}
