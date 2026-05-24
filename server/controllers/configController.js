import { readPublicConfigStatus } from '../config/env.js'

export function getConfigStatus(req, res) {
  res.json(readPublicConfigStatus())
}
