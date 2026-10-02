---
layout: home

hero:
  name: Webquirer
  text: Browser forms for CLI prompts
  tagline: Collect rich, validated answers in a local browser session and return them to Node.js.
  actions:
    - theme: brand
      text: Get started
      link: /guide/getting-started
    - theme: alt
      text: API reference
      link: /api/inquire

features:
  - title: Simple CLI API
    details: Await a single inquire() call and receive a typed-by-convention answers object.
  - title: Local by default
    details: Forms are served from a short-lived server bound to 127.0.0.1.
  - title: Built-in validation
    details: Required fields, select choices, custom validators, cancellation, and timeouts are supported.
---

## The flow

```text
CLI → local server → browser form → validated answers → CLI
```

Webquirer is useful when a terminal prompt is too constrained for a richer setup flow, while keeping the application running locally and returning the result to the original process.

## Quick example

```js
import { inquire } from '@cesur_polat/webquirer';

const answers = await inquire({
  title: 'Project setup',
  questions: [
    { name: 'name', message: 'Project name', required: true },
    { type: 'select', name: 'stack', message: 'Stack', choices: ['React', 'Vue', 'Svelte'] },
    { type: 'confirm', name: 'deploy', message: 'Deploy?', default: true }
  ]
});
```
