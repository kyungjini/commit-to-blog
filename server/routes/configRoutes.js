import { Router } from 'express'
import { getConfigStatus } from '../controllers/configController.js'

const router = Router()

router.get('/status', getConfigStatus)

export default router
