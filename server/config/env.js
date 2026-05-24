import 'dotenv/config'

const defaultPort = 3001

export const config = {
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
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
