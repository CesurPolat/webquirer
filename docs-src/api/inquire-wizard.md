# inquireWizard()

```js
const result = await inquireWizard(options);
```

Creates a multi-step browser session. It accepts the same session options as `inquire()` and additionally requires a `next` callback.

## `next` callback

```ts
next({
  step: number,
  answers: Record<string, unknown>,
  allAnswers: Record<string, unknown>
}) => Promise<NextStep> | NextStep
```

`answers` contains the answers submitted for the current step. `allAnswers` contains the accumulated answers from every completed step.

```js
next: ({ step }) => step === 0
  ? { questions: [{ name: 'details', message: 'Details' }] }
  : { done: true }
```
