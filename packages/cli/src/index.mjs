import { exec } from 'node:child_process';
import { createWebquirerServer } from '../../server/src/index.mjs';

export async function inquire(options) {
  const server = await createWebquirerServer();
  try {
    const session = server.createSession(options);
    printFormLink(session.url);
    options.onOpen?.(session.url);
    if (options.open !== false) openBrowser(session.url);
    return await session.result;
  } finally { await server.close(); }
}
function openBrowser(url) { const command = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`; exec(command, { windowsHide: true }); }

function printFormLink(url) {
  const terminal = process.stdout.isTTY;
  const cyan = terminal ? '\x1b[36m' : '';
  const blue = terminal ? '\x1b[34m' : '';
  const dim = terminal ? '\x1b[2m' : '';
  const reset = terminal ? '\x1b[0m' : '';
  const clickableUrl = terminal
    ? '\x1b]8;;' + url + '\x1b\\' + url + '\x1b]8;;\x1b\\'
    : url;

  console.log('');
  console.log(cyan + '  ┌─ Webquirer ──────────────────────┐' + reset);
  console.log(cyan + '  │' + reset + '  ✦  ' + blue + 'Browser form is ready' + reset + '          ' + cyan + '│' + reset);
  console.log(cyan + '  └──────────────────────────────────┘' + reset);
  console.log('  ' + blue + '→ Open:' + reset + ' ' + clickableUrl);
  console.log(dim + '  Waiting for your response…' + reset);
  console.log('');
}
