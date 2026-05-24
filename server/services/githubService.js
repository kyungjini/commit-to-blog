import { HttpError } from '../utils/httpError.js'

const githubApiBaseUrl = 'https://api.github.com'

async function requestGitHub(path, token) {
  const response = await fetch(`${githubApiBaseUrl}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    throw new HttpError(
      response.status,
      payload?.message || 'GitHub API request failed',
      payload,
    )
  }

  return payload
}

export async function fetchAuthenticatedUser(token) {
  const user = await requestGitHub('/user', token)

  return {
    avatarUrl: user.avatar_url,
    login: user.login,
    name: user.name,
    profileUrl: user.html_url,
  }
}

export async function fetchRepositories(token) {
  const repos = await requestGitHub(
    '/user/repos?sort=updated&direction=desc&per_page=50',
    token,
  )

  return repos.map((repo) => ({
    defaultBranch: repo.default_branch,
    description: repo.description,
    fullName: repo.full_name,
    isPrivate: repo.private,
    name: repo.name,
    owner: repo.owner.login,
    updatedAt: repo.updated_at,
    url: repo.html_url,
  }))
}

export async function fetchBranches(token, owner, repo) {
  const branches = await requestGitHub(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/branches?per_page=100`,
    token,
  )

  return branches.map((branch) => ({
    name: branch.name,
    sha: branch.commit.sha,
  }))
}

export async function fetchRecentCommits(token, owner, repo, branch) {
  const params = new URLSearchParams({
    per_page: '20',
    sha: branch,
  })

  const commits = await requestGitHub(
    `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/commits?${params.toString()}`,
    token,
  )

  return commits.map((commit) => ({
    author: commit.commit.author?.name || commit.author?.login || 'Unknown author',
    date: commit.commit.author?.date,
    message: commit.commit.message,
    sha: commit.sha,
    shortSha: commit.sha.slice(0, 7),
    url: commit.html_url,
  }))
}
