# Webquirer

Webquirer lets CLI applications collect answers through a browser-based form.

```text
CLI → local server → browser form → validated answers → CLI
```

## Run

```powershell
node demo.mjs
```

The CLI starts a single-use form session on localhost and opens it in the browser. When the form is submitted, the answers resolve back to the `await inquire()` call.

## Usage

```js
import { inquire } from './packages/cli/src/index.mjs';

const answers = await inquire({
  title: 'Project setup',
  questions: [
    { name: 'name', message: 'Project name', required: true },
    {
      type: 'select',
      name: 'stack',
      message: 'Stack',
      choices: ['React', 'Vue', 'Svelte']
    },
    { type: 'confirm', name: 'deploy', message: 'Deploy?', default: true }
  ]
});
```

Supported field types: `input`, `password`, `select`, and `confirm`.

## Structure

```text
packages/core    Form schema and answer validation
packages/server  Local session API and lifecycle
packages/web     Browser form renderer, CSS, and client script
packages/cli     await inquire(), browser launch, and server lifecycle
```

The web layer retrieves the schema from `GET /api/sessions/:id` and submits answers to `POST /api/sessions/:id/answers`.
