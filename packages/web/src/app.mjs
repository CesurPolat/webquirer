/**
 * HTML shell for the browser application.
 * Styles and behaviour live in styles.css and client.js.
 */
export function renderWebApp(title, sessionId) {
  return `<!doctype html>
<html lang="en" data-theme="system">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(title)} · Webquirer</title>
    <link rel="stylesheet" href="/assets/webquirer.css">
  </head>
  <body>
    <main class="form-card" data-session-id="${escapeHtml(sessionId)}" aria-live="polite">
      <header class="form-header">
        <p class="eyebrow">Webquirer · local session</p>
        <h1 id="form-title">Loading form…</h1>
        <p class="subtitle">Complete the fields below, then return to your terminal.</p>
      </header>

      <div class="settings-layout">
        <aside class="settings-nav" aria-label="Form settings">
          <a class="settings-nav__item settings-nav__item--active" href="#form-fields">⌘ <span>Form</span></a>
          <a class="settings-nav__item" href="#form-fields">◫ <span>Fields</span></a>
          <a class="settings-nav__item" href="#form-fields">◌ <span>Validation</span></a>
          <a class="settings-nav__item" href="#form-fields">↗ <span>Behaviour</span></a>
          <label class="theme-picker" for="theme-select">
            <span>Theme</span>
            <select id="theme-select">
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </aside>

        <section class="settings-content">
          <section id="loading-state" class="state-panel" aria-live="polite">
            <span class="state-spinner" aria-hidden="true"></span>
            <h2>Loading form</h2>
            <p>Preparing your local Webquirer session…</p>
          </section>

          <form id="webquirer-form" hidden>
            <div id="questions" class="questions"></div>

            <p id="form-error" class="form-error" role="alert"></p>

            <div class="actions">
              <button class="button button--primary" type="submit">Continue</button>
              <button class="button button--secondary" type="button" id="cancel-button">Cancel</button>
            </div>
          </form>
        </section>
      </div>
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
