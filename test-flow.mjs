import assert from 'node:assert/strict';
import { inquire, inquireWizard } from './src/webquirer.mjs';

async function start(factory) {
  let url;
  const result = factory((value) => { url = value; });
  while (!url) await new Promise((resolve) => setTimeout(resolve, 5));
  return { api: url.replace('/s/', '/api/sessions/'), result };
}

const normal = await start((onOpen) => inquire({
  open: false,
  onOpen,
  questions: [{
    type: 'select',
    name: 'stack',
    message: 'Stack',
    choices: [{ name: 'React', value: 'react', description: 'UI' }],
  }],
}));
const form = await fetch(normal.api).then((response) => response.json());
assert.equal(form.questions[0].choices[0].value, 'react');
await fetch(normal.api + '/answers', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ stack: 'react' }),
});
assert.deepEqual(await normal.result, { stack: 'react' });

const wizard = await start((onOpen) => inquireWizard({
  open: false,
  onOpen,
  title: 'Wizard',
  questions: [{ name: 'action', message: 'Action', type: 'select', choices: ['next'] }],
  next: async ({ step }) => step === 0
    ? { questions: [{ name: 'value', message: 'Value', required: true, validate: (value) => value === 'ok' || 'bad value' }] }
    : { done: true },
}));
await fetch(wizard.api + '/answers', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ action: 'next' }),
});
const next = await fetch(wizard.api).then((response) => response.json());
assert.equal(next.questions[0].name, 'value');
const invalid = await fetch(wizard.api + '/answers', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ value: 'no' }),
});
assert.equal(invalid.status, 422);
assert.equal((await invalid.json()).field, 'value');
await fetch(wizard.api + '/answers', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ value: 'ok' }),
});
assert.deepEqual(await wizard.result, { action: 'next', value: 'ok' });
console.log('Webquirer flow tests passed.');
