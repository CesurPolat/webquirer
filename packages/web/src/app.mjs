/**
 * HTML shell for the browser application.
 * Styles and behaviour live in styles.css and client.js.
 */
export function renderWebApp(title, sessionId) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} · Webquirer</title>
    <link rel="stylesheet" href="/assets/webquirer.css">
  </head>
  <body>
    <main class="form-card" data-session-id="${escapeHtml(sessionId)}" aria-live="polite">
      <p class="eyebrow">Webquirer · local session</p>
      <h1 id="form-title">Loading form…</h1>
      <p class="subtitle">Complete the fields below, then return to your terminal.</p>

      <form id="webquirer-form">
        <div id="questions" class="questions"></div>

        <div class="actions">
          <button class="button button--primary" type="submit">Continue</button>
          <button class="button button--secondary" type="button" id="cancel-button">Cancel</button>
        </div>

        <p id="form-error" class="form-error" role="alert"></p>
      </form>
    </main>

    <script type="module" src="/assets/webquirer-client.js"></script>
  </body>
</html>`;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}
