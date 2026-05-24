import { config } from '../config/env.js'
import {
  createGitHubAuthorizationUrl,
  exchangeCodeForAccessToken,
} from '../services/githubAuthService.js'
import { HttpError } from '../utils/httpError.js'

export function redirectToGitHubLogin(req, res, next) {
  try {
    res.redirect(createGitHubAuthorizationUrl(req.query.state))
  } catch (err) {
    next(err)
  }
}

export async function handleGitHubCallback(req, res, next) {
  try {
    if (req.query.error) {
      throw new HttpError(
        400,
        req.query.error_description || 'GitHub OAuth authorization failed',
      )
    }

    const accessToken = await exchangeCodeForAccessToken(req.query.code)
    const params = new URLSearchParams({
      github_token: accessToken,
    })

    if (req.query.state) {
      params.set('state', req.query.state)
    }

    res.redirect(`${config.clientOrigin}/#/blog?${params.toString()}`)
  } catch (err) {
    next(err)
  }
}
