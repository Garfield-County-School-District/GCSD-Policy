import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/pipeline', label: 'Pipeline' },
  { to: '/companies', label: 'Companies' },
  { to: '/tasks', label: 'Tasks' },
]

export function Layout() {
  const { session, signOut } = useAuth()
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">⛑️ Hard Hat CRM</div>
        <nav>
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-email">{session?.user.email}</div>
          <button className="btn-link" onClick={signOut}>Sign out</button>
        </div>
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  )
}
