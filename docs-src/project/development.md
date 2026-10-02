# Development

## Run the flow test

```bash
npm run test:flow
```

The test exercises a normal select form, a wizard, custom validation, and the final answer objects without opening a browser.

## Work on the docs site

```bash
npm run docs:dev
```

Build the static site for CI or deployment:

```bash
npm run docs:build
```

The generated site is written directly to `docs/`, with `docs/index.html` as its entry point. Preview that build with:

```bash
npm run docs:preview
```

Documentation source files live in `docs-src/`. Add new pages to the sidebar in `docs-src/.vitepress/config.mjs` when they should be part of the main navigation.
