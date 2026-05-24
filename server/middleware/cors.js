import { config } from '../config/env.js'

export function applyCors(req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', config.clientOrigin)
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Authorization,Content-Type')

  if (req.method === 'OPTIONS') {
    res.sendStatus(204)
    return
  }

  next()
}
