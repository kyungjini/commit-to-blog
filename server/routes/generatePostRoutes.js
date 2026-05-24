import { Router } from 'express'
import { generatePost } from '../controllers/generatePostController.js'

const router = Router()

router.post('/', generatePost)

export default router
