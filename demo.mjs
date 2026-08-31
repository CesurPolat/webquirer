import { inquire } from './packages/cli/src/index.mjs';

try {
  const answers = await inquire({
    title: 'Create a project',
    questions: [
      {
        type: 'input',
        name: 'name',
        message: 'Project name',
        section: 'Project details',
        sectionIcon: '◫',
        required: true
      },
      {
        type: 'input',
        name: 'description',
        message: 'Description',
        section: 'Project details',
        default: 'A new Webquirer project'
      },
      {
        type: 'select',
        name: 'stack',
        message: 'Stack',
        section: 'Technology',
        sectionIcon: '◌',
        choices: ['React', 'Vue', 'Svelte'],
        default: 'React'
      },
      {
        type: 'select',
        name: 'packageManager',
        message: 'Package manager',
        section: 'Technology',
        choices: ['npm', 'pnpm', 'yarn'],
        default: 'npm'
      },
      {
        type: 'password',
        name: 'registryToken',
        message: 'Registry token',
        section: 'Publishing',
        sectionIcon: '↗'
      },
      {
        type: 'confirm',
        name: 'deploy',
        message: 'Deploy after creation?',
        section: 'Publishing',
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
