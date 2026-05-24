import { config, validateGitHubOAuthConfig } from '../config/env.js'
import { HttpError } from '../utils/httpError.js'

export function createGitHubAuthorizationUrl(state) {
  const missingKeys = validateGitHubOAuthConfig()

  if (missingKeys.length > 0) {
    throw new HttpError(
      500,
      `Missing GitHub OAuth configuration: ${missingKeys.join(', ')}`,
    )
  }

  const params = new URLSearchParams({
    client_id: config.github.clientId,
    redirect_uri: config.github.callbackUrl,
    scope: config.github.scope,
  })

  if (state) {
    params.set('state', state)
  }

  return `https://github.com/login/oauth/authorize?${params.toString()}`
}

export async function exchangeCodeForAccessToken(code) {
  if (!code) {
    throw new HttpError(400, 'GitHub OAuth code is required')
  }

  const missingKeys = validateGitHubOAuthConfig()

  if (missingKeys.length > 0) {
    throw new HttpError(
      500,
      `Missing GitHub OAuth configuration: ${missingKeys.join(', ')}`,
    )
  }

  const response = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.github.clientId,
      client_secret: config.github.clientSecret,
      code,
      redirect_uri: config.github.callbackUrl,
    }),
  })

  const tokenResponse = await response.json()

  if (!response.ok || tokenResponse.error) {
    throw new HttpError(
      502,
      tokenResponse.error_description || 'GitHub OAuth token exchange failed',
      tokenResponse,
    )
  }

  if (!tokenResponse.access_token) {
    throw new HttpError(502, 'GitHub OAuth response did not include an access token')
  }

  return tokenResponse.access_token
}
