# inquire()

```js
const answers = await inquire(options);
```

Creates one browser form session and resolves with an object keyed by question name.

## Options

| Property | Type | Description |
| --- | --- | --- |
| `title` | `string` | Form title. Defaults to `Complete this form`. |
| `questions` | `Question[]` | One or more questions. |
| `open` | `boolean` | Open the default browser. Defaults to `true`. |
| `onOpen` | `(url) => void` | Called with the local session URL. |
| `timeout` | `number` | Optional timeout in milliseconds. |

The returned promise rejects when the user cancels the form, the session times out, or the server closes before submission.

## Example

```js
const answers = await inquire({
  open: false,
  onOpen: (url) => console.log(`Open ${url}`),
  questions: [{ name: 'email', message: 'Email', required: true }]
});
```
