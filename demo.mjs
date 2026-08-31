import { inquire } from './packages/cli/src/index.mjs';

const answers = await inquire({
  title: 'Create a project',
  questions: [
    { type: 'input', name: 'name', message: 'Project name', required: true },
    { type: 'select', name: 'stack', message: 'Stack', choices: ['React', 'Vue', 'Svelte'] },
    { type: 'confirm', name: 'deploy', message: 'Deploy after creation?', default: true }
  ]
});

console.log('\nReceived answers:');
console.log(answers);
