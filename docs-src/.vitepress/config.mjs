import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Webquirer',
  description: 'Browser-based forms for Node.js CLI prompts.',
  cleanUrls: true,
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API', link: '/api/inquire' }
    ],
    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting started', link: '/guide/getting-started' },
          { text: 'Questions and fields', link: '/guide/questions' },
          { text: 'Multi-step wizards', link: '/guide/wizards' }
        ]
      },
      {
        text: 'Reference',
        items: [
          { text: 'inquire()', link: '/api/inquire' },
          { text: 'inquireWizard()', link: '/api/inquire-wizard' },
          { text: 'Question schema', link: '/api/question-schema' }
        ]
      },
      {
        text: 'Project',
        items: [
          { text: 'Architecture', link: '/project/architecture' },
          { text: 'Development', link: '/project/development' }
        ]
      }
    ],
    socialLinks: [],
    search: { provider: 'local' },
    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2026 Webquirer contributors'
    }
  }
});
