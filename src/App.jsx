import { useEffect, useMemo, useState } from 'react'
import './App.css'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001'
const githubTokenStorageKey = 'commit-to-blog:github-token'
const githubStateStorageKey = 'commit-to-blog:github-state'

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

function createOAuthState() {
  const stateBytes = new Uint32Array(4)
  window.crypto.getRandomValues(stateBytes)
  return Array.from(stateBytes, (value) => value.toString(16)).join('')
}

function getTokenFromSession() {
  return sessionStorage.getItem(githubTokenStorageKey)
}

async function apiRequest(path, token) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error || 'API request failed')
  }

  return payload
}

async function apiPost(path, body) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(payload?.error || 'API request failed')
  }

  return payload
}

function createMarkdownFilename(repository, branch) {
  const date = new Date().toISOString().slice(0, 10)
  const baseName = [repository, branch, date]
    .filter(Boolean)
    .join('-')
    .replace(/[^a-zA-Z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()

  return `${baseName || 'commit-blog-post'}.md`
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

function RepositorySelector({
  branches,
  commits,
  generatedPost,
  generationError,
  isGeneratingPost,
  loadingBranches,
  loadingCommits,
  onCopyPost,
  onExportPost,
  onGeneratePost,
  onSelectBranch,
  onSelectCommit,
  onSelectRepo,
  onUpdatePost,
  repositories,
  selectedBranch,
  selectedCommitShas,
  selectedRepoFullName,
}) {
  const selectedCommitCount = selectedCommitShas.length
  const canGeneratePost = selectedCommitCount > 0 && !isGeneratingPost

  return (
    <section className="workspace-grid" aria-label="Blog creation workflow">
      <div className="selector-panel">
        <label htmlFor="repository-select">Repository</label>
        <select
          id="repository-select"
          onChange={(event) => onSelectRepo(event.target.value)}
          value={selectedRepoFullName}
        >
          <option value="">Select a repository</option>
          {repositories.map((repo) => (
            <option key={repo.fullName} value={repo.fullName}>
              {repo.fullName}
            </option>
          ))}
        </select>

        <label htmlFor="branch-select">Branch</label>
        <select
          disabled={!selectedRepoFullName || loadingBranches}
          id="branch-select"
          onChange={(event) => onSelectBranch(event.target.value)}
          value={selectedBranch}
        >
          <option value="">{loadingBranches ? 'Loading branches' : 'Select a branch'}</option>
          {branches.map((branch) => (
            <option key={branch.sha} value={branch.name}>
              {branch.name}
            </option>
          ))}
        </select>

        <div className="selection-summary">
          <span>{selectedCommitCount} commits selected</span>
          <button
            className="primary-action"
            disabled={!canGeneratePost}
            onClick={onGeneratePost}
            type="button"
          >
            {isGeneratingPost ? 'Generating' : 'Generate AI Summary'}
          </button>
        </div>
      </div>

      <div className="commit-panel">
        <div className="panel-heading">
          <h2>Recent commits</h2>
          {loadingCommits && <span className="inline-status">Loading</span>}
        </div>
        {commits.length > 0 ? (
          <ul className="commit-list">
            {commits.map((commit) => (
              <li key={commit.sha}>
                <label className="commit-option">
                  <input
                    checked={selectedCommitShas.includes(commit.sha)}
                    onChange={() => onSelectCommit(commit.sha)}
                    type="checkbox"
                  />
                  <span>{commit.shortSha}</span>
                  <strong>{commit.message.split('\n')[0]}</strong>
                </label>
                <small>
                  {commit.author} {commit.date ? `on ${commit.date.slice(0, 10)}` : ''}
                  {' · '}
                  <a href={commit.url} rel="noreferrer" target="_blank">
                    View commit
                  </a>
                </small>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state">
            Select a repository and branch to preview recent commits.
          </p>
        )}
      </div>

      <div className="preview-panel">
        <div className="panel-heading">
          <h2>AI summary preview</h2>
          {generatedPost && <span className="inline-status">Markdown</span>}
        </div>
        {generationError && <p className="error-banner compact">{generationError}</p>}
        {generatedPost ? (
          <pre className="markdown-preview">{generatedPost}</pre>
        ) : (
          <p className="empty-state">
            Select commits and generate a summary to preview the draft.
          </p>
        )}
      </div>

      <div className="editor-panel">
        <div className="panel-heading">
          <h2>Editor</h2>
          <div className="panel-actions">
            <button
              className="secondary-action compact"
              disabled={!generatedPost}
              onClick={onCopyPost}
              type="button"
            >
              Copy
            </button>
            <button
              className="secondary-action compact"
              disabled={!generatedPost}
              onClick={onExportPost}
              type="button"
            >
              Export .md
            </button>
          </div>
        </div>
        <textarea
          aria-label="Generated markdown editor"
          onChange={(event) => onUpdatePost(event.target.value)}
          placeholder="Generated markdown will appear here."
          value={generatedPost}
        />
      </div>
    </section>
  )
}

function MyBlogPage({
  authError,
  branches,
  commits,
  generatedPost,
  generationError,
  isAuthenticated,
  isGeneratingPost,
  loadingBranches,
  loadingCommits,
  loadingRepos,
  onCopyPost,
  onExportPost,
  onGeneratePost,
  onLogin,
  onLogout,
  onSelectBranch,
  onSelectCommit,
  onSelectRepo,
  onUpdatePost,
  repositories,
  selectedBranch,
  selectedCommitShas,
  selectedRepoFullName,
  user,
}) {
  return (
    <PageContainer
      description="Connect GitHub, choose a repository branch, and inspect recent commits for future blog generation."
      eyebrow="Workspace"
      title="My Blog"
    >
      <section className="dashboard-grid" aria-label="Blog workflow overview">
        <article className="metric-card">
          <span className="metric-value">0</span>
          <span className="metric-label">Drafts ready</span>
        </article>
        <article className="metric-card">
          <span className="metric-value">{repositories.length}</span>
          <span className="metric-label">Repositories connected</span>
        </article>
        <article className="metric-card">
          <span className="metric-value">{selectedCommitShas.length}</span>
          <span className="metric-label">Commits selected</span>
        </article>
      </section>

      <section className="content-panel">
        <div>
          <h2>{isAuthenticated ? `Connected as ${user?.login}` : 'Start from GitHub'}</h2>
          <p>
            {isAuthenticated
              ? 'Select commits, generate a Markdown draft, then edit or export the result.'
              : 'Authorize this app to read your repositories and recent commit history.'}
          </p>
        </div>
        {isAuthenticated ? (
          <button className="secondary-action" onClick={onLogout} type="button">
            Disconnect
          </button>
        ) : (
          <button className="primary-action" onClick={onLogin} type="button">
            Connect GitHub
          </button>
        )}
      </section>

      {authError && <p className="error-banner">{authError}</p>}
      {loadingRepos && <p className="loading-banner">Loading GitHub repositories</p>}

      {isAuthenticated && (
        <RepositorySelector
          branches={branches}
          commits={commits}
          generatedPost={generatedPost}
          generationError={generationError}
          isGeneratingPost={isGeneratingPost}
          loadingBranches={loadingBranches}
          loadingCommits={loadingCommits}
          onCopyPost={onCopyPost}
          onExportPost={onExportPost}
          onGeneratePost={onGeneratePost}
          onSelectBranch={onSelectBranch}
          onSelectCommit={onSelectCommit}
          onSelectRepo={onSelectRepo}
          onUpdatePost={onUpdatePost}
          repositories={repositories}
          selectedBranch={selectedBranch}
          selectedCommitShas={selectedCommitShas}
          selectedRepoFullName={selectedRepoFullName}
        />
      )}
    </PageContainer>
  )
}

function SettingsPage({ isAuthenticated }) {
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
            <p>Uses the backend OAuth callback and session storage token state.</p>
          </div>
          <span className={isAuthenticated ? 'status-pill ready' : 'status-pill'}>
            {isAuthenticated ? 'Connected' : 'Pending'}
          </span>
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
  const [authError, setAuthError] = useState('')
  const [branches, setBranches] = useState([])
  const [commits, setCommits] = useState([])
  const [generatedPost, setGeneratedPost] = useState('')
  const [generationError, setGenerationError] = useState('')
  const [githubToken, setGithubToken] = useState(getTokenFromSession)
  const [isGeneratingPost, setIsGeneratingPost] = useState(false)
  const [loadingBranches, setLoadingBranches] = useState(false)
  const [loadingCommits, setLoadingCommits] = useState(false)
  const [loadingRepos, setLoadingRepos] = useState(false)
  const [repositories, setRepositories] = useState([])
  const [selectedBranch, setSelectedBranch] = useState('')
  const [selectedCommitShas, setSelectedCommitShas] = useState([])
  const [selectedRepoFullName, setSelectedRepoFullName] = useState('')
  const [user, setUser] = useState(null)

  const isAuthenticated = Boolean(githubToken)
  const selectedRepo = useMemo(
    () => repositories.find((repo) => repo.fullName === selectedRepoFullName),
    [repositories, selectedRepoFullName],
  )

  useEffect(() => {
    const hash = window.location.hash
    const queryIndex = hash.indexOf('?')

    if (queryIndex === -1) {
      return
    }

    const params = new URLSearchParams(hash.slice(queryIndex + 1))
    const token = params.get('github_token')
    const state = params.get('state')
    const expectedState = sessionStorage.getItem(githubStateStorageKey)

    if (!token) {
      return
    }

    if (expectedState && state !== expectedState) {
      window.history.replaceState(null, '', routes.blog.path)
      queueMicrotask(() => {
        setAuthError('GitHub OAuth state validation failed')
      })
      return
    }

    sessionStorage.setItem(githubTokenStorageKey, token)
    sessionStorage.removeItem(githubStateStorageKey)
    window.history.replaceState(null, '', routes.blog.path)
    queueMicrotask(() => {
      setGithubToken(token)
      setAuthError('')
    })
  }, [])

  useEffect(() => {
    if (!githubToken) {
      return
    }

    let isCurrent = true

    async function loadGitHubAccount() {
      setLoadingRepos(true)
      setAuthError('')

      try {
        const [profile, repoList] = await Promise.all([
          apiRequest('/api/github/user', githubToken),
          apiRequest('/api/github/repos', githubToken),
        ])

        if (!isCurrent) {
          return
        }

        setUser(profile)
        setRepositories(repoList)
      } catch (err) {
        if (isCurrent) {
          setAuthError(err.message)
        }
      } finally {
        if (isCurrent) {
          setLoadingRepos(false)
        }
      }
    }

    loadGitHubAccount()

    return () => {
      isCurrent = false
    }
  }, [githubToken])

  useEffect(() => {
    if (!githubToken || !selectedRepo) {
      return
    }

    let isCurrent = true

    async function loadBranches() {
      setLoadingBranches(true)
      setBranches([])
      setCommits([])
      setGeneratedPost('')
      setGenerationError('')
      setSelectedBranch('')
      setSelectedCommitShas([])

      try {
        const branchList = await apiRequest(
          `/api/github/repos/${selectedRepo.owner}/${selectedRepo.name}/branches`,
          githubToken,
        )

        if (!isCurrent) {
          return
        }

        setBranches(branchList)
        setSelectedBranch(selectedRepo.defaultBranch || branchList[0]?.name || '')
      } catch (err) {
        if (isCurrent) {
          setAuthError(err.message)
        }
      } finally {
        if (isCurrent) {
          setLoadingBranches(false)
        }
      }
    }

    loadBranches()

    return () => {
      isCurrent = false
    }
  }, [githubToken, selectedRepo])

  useEffect(() => {
    if (!githubToken || !selectedRepo || !selectedBranch) {
      return
    }

    let isCurrent = true

    async function loadCommits() {
      setLoadingCommits(true)
      setCommits([])
      setSelectedCommitShas([])

      try {
        const commitList = await apiRequest(
          `/api/github/repos/${selectedRepo.owner}/${selectedRepo.name}/commits?branch=${encodeURIComponent(selectedBranch)}`,
          githubToken,
        )

        if (isCurrent) {
          setCommits(commitList)
        }
      } catch (err) {
        if (isCurrent) {
          setAuthError(err.message)
        }
      } finally {
        if (isCurrent) {
          setLoadingCommits(false)
        }
      }
    }

    loadCommits()

    return () => {
      isCurrent = false
    }
  }, [githubToken, selectedBranch, selectedRepo])

  function handleNavigate(routeKey) {
    setActiveRoute(routeKey)
  }

  function handleLogin() {
    const state = createOAuthState()
    sessionStorage.setItem(githubStateStorageKey, state)
    window.location.href = `${apiBaseUrl}/api/auth/github/login?state=${state}`
  }

  function handleLogout() {
    sessionStorage.removeItem(githubTokenStorageKey)
    setAuthError('')
    setBranches([])
    setCommits([])
    setGeneratedPost('')
    setGenerationError('')
    setGithubToken('')
    setRepositories([])
    setSelectedBranch('')
    setSelectedCommitShas([])
    setSelectedRepoFullName('')
    setUser(null)
  }

  function handleSelectCommit(commitSha) {
    setSelectedCommitShas((currentShas) =>
      currentShas.includes(commitSha)
        ? currentShas.filter((sha) => sha !== commitSha)
        : [...currentShas, commitSha],
    )
  }

  async function handleGeneratePost() {
    const selectedCommits = commits.filter((commit) =>
      selectedCommitShas.includes(commit.sha),
    )

    if (!selectedRepo || !selectedBranch || selectedCommits.length === 0) {
      setGenerationError('Select a repository, branch, and at least one commit')
      return
    }

    setIsGeneratingPost(true)
    setGenerationError('')

    try {
      const generated = await apiPost('/api/generate-post', {
        branch: selectedBranch,
        commits: selectedCommits,
        repository: selectedRepo.fullName,
      })

      setGeneratedPost(generated.markdown)
    } catch (err) {
      setGenerationError(err.message)
    } finally {
      setIsGeneratingPost(false)
    }
  }

  async function handleCopyPost() {
    if (!generatedPost) {
      return
    }

    try {
      await navigator.clipboard.writeText(generatedPost)
      setGenerationError('')
    } catch {
      setGenerationError('Clipboard write failed')
    }
  }

  function handleExportPost() {
    if (!generatedPost) {
      return
    }

    const blob = new Blob([generatedPost], { type: 'text/markdown;charset=utf-8' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = createMarkdownFilename(selectedRepo?.fullName, selectedBranch)
    link.click()
    URL.revokeObjectURL(objectUrl)
  }

  return (
    <div className="app-shell">
      <Navbar activeRoute={activeRoute} onNavigate={handleNavigate} />
      {activeRoute === 'settings' ? (
        <SettingsPage isAuthenticated={isAuthenticated} />
      ) : (
        <MyBlogPage
          authError={authError}
          branches={branches}
          commits={commits}
          generatedPost={generatedPost}
          generationError={generationError}
          isAuthenticated={isAuthenticated}
          isGeneratingPost={isGeneratingPost}
          loadingBranches={loadingBranches}
          loadingCommits={loadingCommits}
          loadingRepos={loadingRepos}
          onCopyPost={handleCopyPost}
          onExportPost={handleExportPost}
          onGeneratePost={handleGeneratePost}
          onLogin={handleLogin}
          onLogout={handleLogout}
          onSelectBranch={setSelectedBranch}
          onSelectCommit={handleSelectCommit}
          onSelectRepo={setSelectedRepoFullName}
          onUpdatePost={setGeneratedPost}
          repositories={repositories}
          selectedBranch={selectedBranch}
          selectedCommitShas={selectedCommitShas}
          selectedRepoFullName={selectedRepoFullName}
          user={user}
        />
      )}
      <Footer />
    </div>
  )
}

export default App
