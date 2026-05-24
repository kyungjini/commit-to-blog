import {
  fetchAuthenticatedUser,
  fetchBranches,
  fetchRecentCommits,
  fetchRepositories,
} from '../services/githubService.js'
import { HttpError } from '../utils/httpError.js'

export async function getAuthenticatedUser(req, res, next) {
  try {
    res.json(await fetchAuthenticatedUser(req.githubToken))
  } catch (err) {
    next(err)
  }
}

export async function getRepositories(req, res, next) {
  try {
    res.json(await fetchRepositories(req.githubToken))
  } catch (err) {
    next(err)
  }
}

export async function getBranches(req, res, next) {
  try {
    const { owner, repo } = req.params

    if (!owner || !repo) {
      throw new HttpError(400, 'Repository owner and name are required')
    }

    res.json(await fetchBranches(req.githubToken, owner, repo))
  } catch (err) {
    next(err)
  }
}

export async function getRecentCommits(req, res, next) {
  try {
    const { owner, repo } = req.params
    const { branch } = req.query

    if (!owner || !repo || !branch) {
      throw new HttpError(400, 'Repository owner, name, and branch are required')
    }

    res.json(await fetchRecentCommits(req.githubToken, owner, repo, branch))
  } catch (err) {
    next(err)
  }
}
