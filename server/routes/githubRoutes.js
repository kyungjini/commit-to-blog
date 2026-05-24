import { Router } from 'express'
import {
  getAuthenticatedUser,
  getBranches,
  getRecentCommits,
  getRepositories,
} from '../controllers/githubController.js'
import { requireGitHubToken } from '../middleware/auth.js'

const router = Router()

router.use(requireGitHubToken)
router.get('/user', getAuthenticatedUser)
router.get('/repos', getRepositories)
router.get('/repos/:owner/:repo/branches', getBranches)
router.get('/repos/:owner/:repo/commits', getRecentCommits)

export default router
