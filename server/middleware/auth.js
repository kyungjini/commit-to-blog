import { HttpError } from '../utils/httpError.js'

export function requireGitHubToken(req, res, next) {
  const authHeader = req.get('authorization') || ''
  const [scheme, token] = authHeader.split(' ')

  if (scheme !== 'Bearer' || !token) {
    next(new HttpError(401, 'GitHub access token is required'))
    return
  }

  req.githubToken = token
  next()
}
