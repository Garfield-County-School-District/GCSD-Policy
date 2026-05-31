import { useEffect, useState, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { DEAL_STAGES, SERVICE_TYPE_LABELS, type Company, type Deal, type DealStage } from '../lib/types'

interface DealWithCompany extends Deal {
  company?: Pick<Company, 'id' | 'name'> | null
}

export function PipelinePage() {
  const [deals, setDeals] = useState<DealWithCompany[]>([])
  const [loading, setLoading] = useState(true)
  const [dragId, setDragId] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    const { data, error } = await supabase
      .from('deals')
      .select('*, company:companies(id, name)')
      .order('created_at', { ascending: false })
    if (error) console.error(error)
    setDeals((data as unknown as DealWithCompany[]) ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function moveTo(dealId: string, stage: DealStage) {
    setDeals((prev) => prev.map((d) => (d.id === dealId ? { ...d, stage } : d)))
    await supabase.from('deals').update({ stage }).eq('id', dealId)
  }

  function onDrop(e: DragEvent, stage: DealStage) {
    e.preventDefault()
    if (dragId) moveTo(dragId, stage)
    setDragId(null)
  }

  if (loading) return <p className="muted">Loading…</p>

  const totalByStage = (stage: DealStage) =>
    deals.filter((d) => d.stage === stage)
      .reduce((sum, d) => sum + (d.estimated_monthly_value ?? 0), 0)

  return (
    <div>
      <div className="page-header"><h1>Pipeline</h1></div>
      <div className="kanban">
        {DEAL_STAGES.map((stage) => {
          const stageDeals = deals.filter((d) => d.stage === stage.value)
          return (
            <div
              key={stage.value}
              className="kanban-col"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDrop(e, stage.value)}
            >
              <div className="kanban-col-header">
                <span>{stage.label}</span>
                <span className="count">{stageDeals.length}</span>
              </div>
              <div className="kanban-col-sub muted small">${totalByStage(stage.value).toLocaleString()}/mo</div>
              {stageDeals.map((d) => (
                <div
                  key={d.id}
                  className="kanban-card"
                  draggable
                  onDragStart={() => setDragId(d.id)}
                >
                  <div className="kanban-card-title">{d.title}</div>
                  {d.company && <Link className="muted small" to={`/companies/${d.company.id}`}>{d.company.name}</Link>}
                  <div className="kanban-card-meta">
                    {d.service_type && <span className="badge">{SERVICE_TYPE_LABELS[d.service_type]}</span>}
                    {d.estimated_monthly_value != null && <span className="muted small">${d.estimated_monthly_value}/mo</span>}
                  </div>
                </div>
              ))}
              {stageDeals.length === 0 && <div className="kanban-empty muted small">Drop here</div>}
            </div>
          )
        })}
      </div>
      <p className="muted small">Tip: drag a card between columns to move the deal through the funnel.</p>
    </div>
  )
}
