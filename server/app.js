import express from 'express'
import authRoutes from './routes/authRoutes.js'
import githubRoutes from './routes/githubRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import { applyCors } from './middleware/cors.js'

const app = express()

app.use(applyCors)
app.use(express.json())
app.use('/api/auth', authRoutes)
app.use('/api/github', githubRoutes)
app.use('/api/health', healthRoutes)

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
  })
})

app.use((err, req, res, next) => {
  if (res.headersSent) {
    next(err)
    return
  }

  const statusCode = err.statusCode || 500

  res.status(statusCode).json({
    details: err.details,
    error: err.message || 'Unexpected server error',
  })
})

export default app
