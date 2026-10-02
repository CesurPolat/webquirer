# Multi-step wizards

Use `inquireWizard()` when later questions depend on earlier answers. The `next` callback receives the current step and accumulated answers, then returns the next form or finishes the wizard.

```js
import { inquireWizard } from '@cesur_polat/webquirer';

const result = await inquireWizard({
  title: 'Create a project',
  questions: [
    { type: 'select', name: 'kind', message: 'Project kind', choices: ['web', 'cli'] }
  ],
  next: async ({ step, answers, allAnswers }) => {
    if (step === 0 && allAnswers.kind === 'web') {
      return {
        title: 'Web project details',
        questions: [{ name: 'framework', message: 'Framework', choices: ['React', 'Vue'] }]
      };
    }

    return { done: true, result: { ...allAnswers, ...answers } };
  }
});
```

The callback can return:

- `{ questions, title? }` to render another step;
- `{ done: true }` to resolve with all accumulated answers;
- `{ done: true, result }` to resolve with a custom result.

Wizard answers are merged by question name. A later step can therefore validate or branch on `allAnswers`.
