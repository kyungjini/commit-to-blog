import { Router } from 'express'
import {
  handleGitHubCallback,
  redirectToGitHubLogin,
} from '../controllers/authController.js'

const router = Router()

router.get('/github/login', redirectToGitHubLogin)
router.get('/github/callback', handleGitHubCallback)

export default router
