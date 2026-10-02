import { createServer } from 'node:http';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { normalizeForm, validateAnswers } from '../../core/src/schema.mjs';
import { renderWebApp } from '../../web/src/app.mjs';

const webAssets = {
  client: new URL('../../web/src/client.js', import.meta.url),
  styles: new URL('../../web/src/styles.css', import.meta.url)
};

export async function createWebquirerServer() {
  const sessions = new Map();
  const server = createServer(async (req, res) => {
    const url = new URL(req.url ?? '/', `http://${req.headers.host}`);
    const match = url.pathname.match(/^\/(?:s|api\/sessions)\/([\w-]+)(?:\/(answers|cancel))?$/);
    const send = (status, body, type = 'application/json; charset=utf-8') => { res.writeHead(status, { 'content-type': type, 'cache-control': 'no-store' }); res.end(body); };
    if (req.method === 'GET' && url.pathname === '/assets/webquirer-client.js') return send(200, await readFile(webAssets.client), 'text/javascript; charset=utf-8');
    if (req.method === 'GET' && url.pathname === '/assets/webquirer.css') return send(200, await readFile(webAssets.styles), 'text/css; charset=utf-8');
    if (!match) return send(404, JSON.stringify({ error: 'Not found' }));
    const [, id, action] = match; const session = sessions.get(id);
    if (!session) return send(404, JSON.stringify({ error: 'Unknown or closed session' }));
    if (url.pathname === `/s/${id}` && req.method === 'GET') return send(200, renderWebApp(session.form.title, id), 'text/html; charset=utf-8');
    if (url.pathname === `/api/sessions/${id}` && req.method === 'GET') return send(200, JSON.stringify(session.form));
    if (req.method === 'POST' && action === 'answers') {
      try {
        const answers = await validateAnswers(session.form.questions, JSON.parse(await readBody(req)));
        if (session.wizard) {
          const allAnswers = { ...session.answers, ...answers };
          const next = await session.next({ step: session.step, answers, allAnswers });
          if (!next || next.done) {
            finish(id, null, next?.result ?? allAnswers);
            return send(200, JSON.stringify({ ok: true, done: true }));
          }
          session.answers = allAnswers;
          session.step += 1;
          session.form = normalizeForm({ title: next.title ?? session.form.title, questions: next.questions });
          return send(200, JSON.stringify({ ok: true, done: false, form: session.form }));
        }
        finish(id, null, answers);
        return send(200, JSON.stringify({ ok: true, done: true }));
      } catch (error) {
        return send(422, JSON.stringify({ error: error.message, ...(error.field ? { field: error.field } : {}) }));
      }
    }
    if (req.method === 'POST' && action === 'cancel') { finish(id, new Error('Browser form was cancelled.')); return send(200, JSON.stringify({ ok: true })); }
    return send(405, JSON.stringify({ error: 'Method not allowed' }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  function finish(id, error, answers) {
    const session = sessions.get(id);
    if (!session) return;
    if (session.timer) clearTimeout(session.timer);
    sessions.delete(id);
    error ? session.reject(error) : session.resolve(answers);
  }
  return {
    createSession(options) {
      const form = normalizeForm(options); const id = randomUUID(); let resolve; let reject;
      const result = new Promise((res, rej) => { resolve = res; reject = rej; });
      const session = { form, resolve, reject };
      sessions.set(id, session);
      if (Number.isFinite(options.timeout) && options.timeout > 0) session.timer = setTimeout(() => finish(id, new Error('Webquirer session timed out.')), options.timeout);
      return { id, url: `http://127.0.0.1:${port}/s/${id}`, result };
    },
    createWizardSession(options) {
      if (!options || typeof options.next !== 'function') throw new TypeError('A wizard needs a next callback.');
      const form = normalizeForm(options);
      const id = randomUUID();
      let resolve; let reject;
      const result = new Promise((res, rej) => { resolve = res; reject = rej; });
      const session = { form, resolve, reject, wizard: true, next: options.next, step: 0, answers: {} };
      sessions.set(id, session);
      if (Number.isFinite(options.timeout) && options.timeout > 0) session.timer = setTimeout(() => finish(id, new Error('Webquirer session timed out.')), options.timeout);
      return { id, url: `http://127.0.0.1:${port}/s/${id}`, result };
    },
    close() { for (const [id] of sessions) finish(id, new Error('Webquirer server closed.')); return new Promise(resolve => server.close(resolve)); }
  };
}
function readBody(req) { return new Promise((resolve, reject) => { let body = ''; req.setEncoding('utf8'); req.on('data', chunk => { body += chunk; if (body.length > 64_000) reject(new Error('Request body is too large.')); }); req.on('end', () => resolve(body)); req.on('error', reject); }); }
