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
    { name: 'name', message: 'Project name', section: 'Project details', sectionIcon: '◫', required: true },
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

Supported field types: `input`, `password`, `select`, and `confirm`. Add the
same `section` label to consecutive questions to render them under a shared
section heading. Use `sectionIcon` on the first question in a section to add an
icon to its navigation item.

Select choices can be strings or objects with `name`, `value`, and an optional
`description`. Questions may also provide a `validate(value, answers)` callback;
it runs on the local server and returns field-level errors to the browser.

For a single browser tab with multiple steps, use `inquireWizard({ questions,
next })`. The `next` callback receives the current step and accumulated answers,
and returns the next question list or `{ done: true, result }`.

## Structure

```text
packages/core    Form schema and answer validation
packages/server  Local session API and lifecycle
packages/web     Browser form renderer, CSS, and client script
packages/cli     await inquire(), browser launch, and server lifecycle
```

The web layer retrieves the schema from `GET /api/sessions/:id` and submits answers to `POST /api/sessions/:id/answers`.
