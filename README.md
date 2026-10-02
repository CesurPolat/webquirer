# 🚀 Webquirer

**Webquirer — Browser-based forms for Node.js CLI prompts.**

A local-first Node.js utility that lets CLI applications collect richer answers through a browser form, then returns the validated result to the original terminal process.

```text
CLI prompt → local server → browser form → validated answers → CLI
```

### ✨ Features

* 🌐 **Browser-Based CLI Forms**  
  Replace long terminal prompts with a clean, responsive local form.

* ✅ **Built-In Validation**  
  Support required fields, valid select choices, and custom synchronous or asynchronous validators.

* 🧩 **Multiple Field Types**  
  Use `input`, `password`, `select`, and `confirm` questions with defaults and descriptions.

* 🪄 **Multi-Step Wizards**  
  Build conditional flows with `inquireWizard()` and accumulate answers across steps.

* 🔒 **Local-First Sessions**  
  Forms are served from a short-lived server bound to `127.0.0.1`; submitted answers stay in the local process.

* 🎨 **Responsive Form UI**  
  Organize questions into sections, choose light/dark/system themes, and use button-style select choices.

---

## 📦 Installation

Clone the repository and install its dependencies:

```bash
git clone <your-repository-url>
cd webquirer
npm install
```

Webquirer requires **Node.js 20 or newer**.

---

## 🚀 Quick Start

```js
import { inquire } from './packages/cli/src/index.mjs';

const answers = await inquire({
  title: 'Project setup',
  questions: [
    { name: 'name', message: 'Project name', required: true },
    { type: 'select', name: 'stack', message: 'Stack', choices: ['React', 'Vue', 'Svelte'] },
    { type: 'confirm', name: 'deploy', message: 'Deploy after creation?', default: true }
  ]
});

console.log(answers);
```

Run the included demo:

```bash
npm run demo
```

The CLI starts a local form session, prints the browser URL, and opens the default browser automatically.

---

## 🧙 Multi-Step Wizard

Use `inquireWizard()` when later questions depend on earlier answers:

```js
import { inquireWizard } from './packages/cli/src/index.mjs';

const result = await inquireWizard({
  title: 'Create a project',
  questions: [
    { type: 'select', name: 'kind', message: 'Project kind', choices: ['web', 'cli'] }
  ],
  next: ({ step, allAnswers }) => {
    if (step === 0) {
      return {
        questions: [{ name: 'name', message: `Name for the ${allAnswers.kind} project` }]
      };
    }

    return { done: true };
  }
});
```

The wizard callback can return another question list or `{ done: true, result }` to finish with a custom result.

---

## 🧱 Supported Questions

| Type | Answer | Use case |
| --- | --- | --- |
| `input` | `string` | General text |
| `password` | `string` | Secrets and tokens |
| `select` | `string` | One choice from a list |
| `confirm` | `boolean` | Yes/no decisions |

Questions can also define `required`, `default`, `section`, `sectionIcon`, `presentation`, and `validate`.

---

## 🛠️ Development

Run the flow tests without opening a browser:

```bash
npm run test:flow
```

Work on the documentation site:

```bash
npm run docs:dev
```

Build the static documentation site into the `docs/` directory:

```bash
npm run docs:build
```

Markdown sources live in `docs-src/`, while `docs/index.html` is the generated static entry point.

---

## 📁 Project Structure

```text
packages/core    Form schema and answer validation
packages/server  Local session API and lifecycle
packages/web     Browser form renderer, CSS, and client script
packages/cli     inquire(), browser launch, and server lifecycle
docs-src/        VitePress Markdown sources
docs/            Generated static documentation site
```

---

## 🗺️ Roadmap

* [x] Browser-based form sessions
* [x] Required fields and custom validation
* [x] Select, password, confirm, and text inputs
* [x] Multi-step wizard flows
* [x] Responsive themes and section navigation
* [ ] Published npm package workflow
* [ ] TypeScript type declarations
* [ ] Additional field types and richer form layouts

---

## 🤝 Contributing

Contributions are welcome. For larger changes, open an issue first to discuss the proposed API or user experience.

If you find Webquirer useful, consider giving the project a star ⭐

### 📄 License

MIT License
