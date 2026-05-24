# Commit to Blog

Commit to Blog is a local MVP that turns GitHub commit history into editable Markdown blog drafts with the Gemini API.

## Features

- GitHub OAuth login
- Repository, branch, and recent commit loading
- Commit selection workflow
- Gemini-powered Markdown draft generation
- Markdown preview, editor, copy, and `.md` export

## Setup

Install dependencies:

```bash
npm install
```

Create a local `.env` file from `.env.example`:

```bash
cp .env.example .env
```

Fill these values:

```env
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
GITHUB_OAUTH_SCOPE=repo
CLIENT_ORIGIN=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_REQUEST_TIMEOUT_MS=30000
PORT=3001
```

The `.env` file is ignored by Git and must not be committed.

## GitHub OAuth App

Create a GitHub OAuth App with:

```text
Homepage URL: http://localhost:5173
Authorization callback URL: http://localhost:3001/api/auth/github/callback
```

## Run Locally

Start the backend in one terminal:

```bash
npm run server
```

Start the frontend in another terminal:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Verification

Run:

```bash
npm run lint
npm run build
```

Check the backend:

```bash
curl http://localhost:3001/api/health
curl http://localhost:3001/api/config/status
```

## Troubleshooting

If `Connect GitHub` refuses to connect, start the backend:

```bash
npm run server
```

If GitHub redirects back to a dead page, start the frontend:

```bash
npm run dev
```

Check running local processes:

```bash
pgrep -af "node server/index.js"
pgrep -af "vite"
```

Stop the backend:

```bash
pkill -f "node server/index.js"
```
