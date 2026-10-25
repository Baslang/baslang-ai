# Baslang AI

Baslang AI is the starting point for a practical AI assistant: a chat interface backed by a server-side model API, with secrets kept in environment variables.

## Current MVP
- Responsive chat interface
- Server-side AI requests (the API key is never sent to the browser)
- Conversation context sent with each request
- Health endpoint for deployment checks
- Safe-by-default configuration using environment variables

## Run locally
1. Install Node.js 20 or newer.
2. Copy `.env.example` to `.env`.
3. Add your model provider API key to `.env`.
4. Run:

```bash
npm install
npm start
```

Open http://localhost:3000.

## Environment variables
- `OPENAI_API_KEY` — required to generate AI replies.
- `OPENAI_MODEL` — optional model name; defaults to `gpt-4o-mini`.
- `PORT` — optional server port; defaults to `3000`.

Do not commit `.env`, API keys, passwords, or other credentials.

## Deploy
This project includes a `render.yaml` Blueprint for a Node web service. Create a Render web service from this repository and add `OPENAI_API_KEY` as a secret environment variable in Render. The app will start with `npm start`.

## Roadmap
1. Connect a model provider and verify chat responses.
2. Add durable, private memory.
3. Add tool integrations with explicit permission checks.
4. Add authentication and per-user data isolation before public multi-user launch.
5. Add tests, logging, and usage limits.

This is an early MVP scaffold, not yet a fully autonomous production agent.