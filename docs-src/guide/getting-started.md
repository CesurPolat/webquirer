# Getting started

Webquirer turns a Node.js question list into a browser form. The CLI starts a local, single-use session, prints its URL, optionally opens the browser, and resolves the returned answers when the form is submitted.

## Requirements

- Node.js 20 or newer
- A browser available on the local machine

## Install and run from this repository

```bash
npm install
npm run demo
```

The demo is defined in `demo.mjs`. It collects project details, technology choices, a registry token, and a deployment confirmation.

## Use in an application

```js
import { inquire } from 'webquirer';

const answers = await inquire({
  title: 'Create a project',
  questions: [
    { name: 'name', message: 'Project name', required: true },
    { name: 'description', message: 'Description', default: 'A new project' }
  ]
});

console.log(answers.name, answers.description);
```

Set `open: false` when the caller needs to handle the URL itself. The `onOpen(url)` callback receives the session URL after the server is ready.

## Session lifetime

Each call creates an isolated session. The server listens on a loopback address and is closed after submission, cancellation, timeout, or an error. Use `timeout` in milliseconds to reject an abandoned session.
