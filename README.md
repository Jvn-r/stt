# Live Speech-to-Text Dashboard

A small web app with authentication (Nhost) and a live, real-time speech-to-text dashboard (Deepgram).

Built in ~1 hour, start to finish, from npm create vite to this README(first commit of readme, i realized later to emphasize on this fact), including debugging Nhost auth (email verification, refresh token persistence, allowed redirect URLs) and wiring up live Deepgram streaming, to finally setting up vercel and deploying it.

**Live demo:** https://stt-mocha-two.vercel.app

## Stack

- **Frontend:** React + Vite
- **Auth:** Nhost (email + password, session persistence via refresh tokens)
- **Speech-to-text:** Deepgram streaming API (`nova-2` model) over WebSocket

## How it works

1. **Login / Signup page** — a single form toggles between sign up and log in. Nhost handles account creation, authentication, and keeps the user logged in across page refreshes using a stored refresh token.
2. **Protected dashboard** — the app checks `useAuthenticationStatus()`. Unauthenticated users only ever see the login form; the dashboard component is never rendered for them.
3. **Live transcription** — on the dashboard, clicking "Start Speaking":
   - Requests mic access via `getUserMedia`
   - Opens a WebSocket directly to Deepgram's `/v1/listen` endpoint (browser-side, using the API key as a WebSocket subprotocol token)
   - Streams audio chunks from `MediaRecorder` (250ms intervals, webm/Opus) to Deepgram
   - Renders interim (gray, live-updating) and final (black, committed) transcript text as it arrives

## Running locally

\`\`\`bash
npm install
npm run dev
\`\`\`

You'll need to set:
- \`src/nhost.js\` — your Nhost project's \`subdomain\` and \`region\`
- \`src/Dashboard.jsx\` — your Deepgram API key (\`DEEPGRAM_API_KEY\`)

Also add your local dev URL (e.g. \`http://localhost:5173\`) and your deployed URL to Nhost's allowed redirect URLs (Auth settings).

## Notes & tradeoffs

- The Deepgram API key is used client-side for simplicity and speed. In a production setting this would be proxied through a backend to avoid exposing the key.
- Email verification is disabled in Nhost for this demo to keep the signup -> dashboard flow frictionless.
- No router is used -- the dashboard is gated purely by auth state, since the app only has two views.

## Known issues / things to improve with more time

- Visual indicator while waiting for mic permission
- Clear transcript / export transcript option
