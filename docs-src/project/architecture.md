# Architecture

Webquirer is split into small packages with a one-way flow from the CLI to the browser and back.

```text
packages/cli    → starts the server, prints the URL, opens the browser
packages/server → owns sessions and HTTP endpoints
packages/core   → normalizes schemas and validates answers
packages/web    → renders the HTML shell, client behaviour, and styles
```

## Request flow

1. `inquire()` creates a server and registers a session.
2. The CLI opens `/s/:id` in the browser.
3. The browser fetches the normalized form from `GET /api/sessions/:id`.
4. The browser posts answers to `POST /api/sessions/:id/answers`.
5. The core validator accepts the answers or returns a field error.
6. The session promise resolves and the server closes.

The server binds to `127.0.0.1` and sessions are single-use. The `/s/:id` page, session API, assets, answer submission, and cancellation are all handled by the local HTTP server.
