import { inquire } from './packages/cli/src/index.mjs';

try {
  const answers = await inquire({
    title: 'Create a project',
    questions: [
      {
        type: 'input',
        name: 'name',
        message: 'Project name',
        required: true
      },
      {
        type: 'select',
        name: 'stack',
        message: 'Stack',
        choices: ['React', 'Vue', 'Svelte'],
        default: 'React'
      },
      {
        type: 'confirm',
        name: 'deploy',
        message: 'Deploy after creation?',
        default: true
      }
    ]
  });

  console.log('\nAnswers received:');
  console.log(answers);
} catch (error) {
  console.error('\nForm cancelled:', error.message);
  process.exitCode = 1;
}
