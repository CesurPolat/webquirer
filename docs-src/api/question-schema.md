# Question schema

```ts
{
  name: string,
  message: string,
  type?: 'input' | 'password' | 'select' | 'confirm',
  default?: string | boolean,
  required?: boolean,
  choices?: string[] | Choice[],
  validate?: (value: string, answers: object) => true | string | Promise<true | string>,
  section?: string,
  sectionIcon?: string,
  presentation?: 'default' | 'buttons'
}
```

## Choice

```ts
{
  name: string,
  value: string,
  description?: string
}
```

Question names must be unique. `select` questions require at least one valid choice. Unsupported types, invalid sections, duplicate names, and malformed choices are rejected before a session is created.
