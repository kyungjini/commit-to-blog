import 'dotenv/config'

const defaultPort = 3001

export const config = {
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    requestTimeoutMs: Number(process.env.GEMINI_REQUEST_TIMEOUT_MS || 30000),
  },
  github: {
    callbackUrl:
      process.env.GITHUB_CALLBACK_URL ||
      `http://localhost:${process.env.PORT || defaultPort}/api/auth/github/callback`,
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    scope: process.env.GITHUB_OAUTH_SCOPE || 'repo',
  },
  port: process.env.PORT || defaultPort,
}

export function validateGeminiConfig() {
  const missingKeys = []

  if (!config.gemini.apiKey) {
    missingKeys.push('GEMINI_API_KEY')
  }

  return missingKeys
}

export function validateGitHubOAuthConfig() {
  const missingKeys = []

  if (!config.github.clientId) {
    missingKeys.push('GITHUB_CLIENT_ID')
  }

  if (!config.github.clientSecret) {
    missingKeys.push('GITHUB_CLIENT_SECRET')
  }

  return missingKeys
}

export function readPublicConfigStatus() {
  return {
    clientOrigin: config.clientOrigin,
    gemini: {
      configured: validateGeminiConfig().length === 0,
      model: config.gemini.model,
      timeoutMs: config.gemini.requestTimeoutMs,
    },
    github: {
      callbackUrl: config.github.callbackUrl,
      configured: validateGitHubOAuthConfig().length === 0,
      scope: config.github.scope,
    },
  }
}
