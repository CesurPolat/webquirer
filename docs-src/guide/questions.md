# Questions and fields

Every question needs a unique `name` and a user-facing `message`. The default field type is `input`.

## Supported types

| Type | Answer | Notes |
| --- | --- | --- |
| `input` | string | General text input |
| `password` | string | Browser password input |
| `select` | string | Requires a non-empty `choices` array |
| `confirm` | boolean | Renders a checkbox |

```js
{
  type: 'select',
  name: 'packageManager',
  message: 'Package manager',
  choices: ['npm', 'pnpm', 'yarn'],
  default: 'npm'
}
```

Select choices can include descriptions and a separate value:

```js
choices: [
  { name: 'React', value: 'react', description: 'Component-based UI' },
  { name: 'Vue', value: 'vue', description: 'Progressive framework' }
]
```

## Required fields and defaults

Use `required: true` for non-empty text and select values. `default` pre-fills the browser control; for a confirm question it controls the initial checkbox state.

## Custom validation

`validate(value, answers)` runs on the local server. Return `true` for a valid value or a string for a field-level error. The second argument contains answers that have already been processed in the current step.

```js
{
  name: 'port',
  message: 'Port',
  default: '3000',
  validate: (value) => {
    const port = Number(value);
    return Number.isInteger(port) && port > 0 && port < 65536
      ? true
      : 'Enter a valid TCP port.';
  }
}
```

## Sections and presentations

Consecutive questions with the same `section` are grouped together. `sectionIcon` adds an icon to the section navigation item. A select question can use `presentation: 'buttons'` to render choices as large buttons.
