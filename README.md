# Webquirer prototype

A local proof of concept for browser-based CLI prompts:

```text
CLI → local Webquirer server → browser form → validated answers → CLI
```

## Run

```powershell
node demo.mjs
```

It starts a localhost-only server, opens the form in your default browser, and prints the submitted answers back in the terminal. If the browser does not open, copy the URL printed in the terminal.

## Use in another script

```js
import { inquire } from './src/webquirer.mjs';

const answers = await inquire({
  title: 'Project setup',
  questions: [
    { name: 'name', message: 'Project name', required: true },
    { type: 'select', name: 'stack', message: 'Stack', choices: ['React', 'Vue'] },
    { type: 'confirm', name: 'deploy', message: 'Deploy?', default: true }
  ]
});
```

Supported question types: `input`, `password`, `select`, and `confirm`.

## Package boundaries

```text
packages/core    question schema and answer validation
packages/server  localhost session API and lifecycle
packages/web     browser form renderer; consumes the session API
packages/cli     await inquire(), browser launch, and server lifecycle
```

The browser receives its schema from `GET /api/sessions/:id` and returns answers to `POST /api/sessions/:id/answers`. The CLI package never renders UI; it only starts a local server and awaits the session result.

This is deliberately dependency-free and local-only. It is a prototype: production work should add a timeout, richer validation, accessibility review, CSRF/session hardening, and a framework-neutral UI package.
