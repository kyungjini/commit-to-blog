import { readHealthStatus } from '../services/healthService.js'

export function getHealthStatus(req, res) {
  res.json(readHealthStatus())
}
