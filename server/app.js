import express from 'express'
import healthRoutes from './routes/healthRoutes.js'

const app = express()

app.use(express.json())
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

  res.status(500).json({
    error: 'Unexpected server error',
  })
})

export default app
