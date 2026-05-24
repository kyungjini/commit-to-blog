import { useMemo, useState } from 'react'
import './App.css'

const routes = {
  blog: {
    label: 'My Blog',
    path: '#/blog',
  },
  settings: {
    label: 'Settings',
    path: '#/settings',
  },
}

function getInitialRoute() {
  return window.location.hash === routes.settings.path ? 'settings' : 'blog'
}

function Navbar({ activeRoute, onNavigate }) {
  return (
    <header className="app-header">
      <a className="brand" href={routes.blog.path} onClick={() => onNavigate('blog')}>
        <span className="brand-mark" aria-hidden="true">
          C
        </span>
        <span>Commit to Blog</span>
      </a>
      <nav className="nav-links" aria-label="Primary navigation">
        {Object.entries(routes).map(([routeKey, route]) => (
          <a
            aria-current={activeRoute === routeKey ? 'page' : undefined}
            className={activeRoute === routeKey ? 'active' : ''}
            href={route.path}
            key={routeKey}
            onClick={() => onNavigate(routeKey)}
          >
            {route.label}
          </a>
        ))}
      </nav>
    </header>
  )
}

function Footer() {
  return (
    <footer className="app-footer">
      <span>Smart Blog MVP</span>
      <span>GitHub commits to structured engineering posts</span>
    </footer>
  )
}

function PageContainer({ children, eyebrow, title, description }) {
  return (
    <main className="page-container">
      <section className="page-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{description}</p>
      </section>
      {children}
    </main>
  )
}

function MyBlogPage() {
  return (
    <PageContainer
      description="Review generated drafts, track publishing readiness, and prepare commit-based stories for export."
      eyebrow="Workspace"
      title="My Blog"
    >
      <section className="dashboard-grid" aria-label="Blog workflow overview">
        <article className="metric-card">
          <span className="metric-value">0</span>
          <span className="metric-label">Drafts ready</span>
        </article>
        <article className="metric-card">
          <span className="metric-value">0</span>
          <span className="metric-label">Repositories connected</span>
        </article>
        <article className="metric-card">
          <span className="metric-value">0</span>
          <span className="metric-label">Posts exported</span>
        </article>
      </section>

      <section className="content-panel">
        <div>
          <h2>Start from a repository</h2>
          <p>
            GitHub authentication and commit selection will appear here in the next
            implementation phase.
          </p>
        </div>
        <button className="primary-action" type="button" disabled>
          Connect GitHub
        </button>
      </section>
    </PageContainer>
  )
}

function SettingsPage() {
  return (
    <PageContainer
      description="Prepare the integration settings that will power GitHub access and AI blog generation."
      eyebrow="Configuration"
      title="Settings"
    >
      <section className="settings-list" aria-label="Application settings">
        <article className="settings-row">
          <div>
            <h2>GitHub OAuth</h2>
            <p>Client configuration will be connected during Phase 2.</p>
          </div>
          <span className="status-pill">Pending</span>
        </article>
        <article className="settings-row">
          <div>
            <h2>Gemini API</h2>
            <p>Generation credentials will be configured during Phase 3.</p>
          </div>
          <span className="status-pill">Pending</span>
        </article>
      </section>
    </PageContainer>
  )
}

function App() {
  const [activeRoute, setActiveRoute] = useState(getInitialRoute)

  const activePage = useMemo(() => {
    if (activeRoute === 'settings') {
      return <SettingsPage />
    }

    return <MyBlogPage />
  }, [activeRoute])

  function handleNavigate(routeKey) {
    setActiveRoute(routeKey)
  }

  return (
    <div className="app-shell">
      <Navbar activeRoute={activeRoute} onNavigate={handleNavigate} />
      {activePage}
      <Footer />
    </div>
  )
}

export default App
