import { _ as _export_sfc, o as openBlock, c as createElementBlock, a2 as createStaticVNode } from "./chunks/framework.B1k-ukVh.js";
const __pageData = JSON.parse('{"title":"Architecture","description":"","frontmatter":{},"headers":[],"relativePath":"project/architecture.md","filePath":"project/architecture.md"}');
const _sfc_main = { name: "project/architecture.md" };
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return openBlock(), createElementBlock("div", null, [..._cache[0] || (_cache[0] = [
    createStaticVNode('<h1 id="architecture" tabindex="-1">Architecture <a class="header-anchor" href="#architecture" aria-label="Permalink to &quot;Architecture&quot;">​</a></h1><p>Webquirer is split into small packages with a one-way flow from the CLI to the browser and back.</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>packages/cli    → starts the server, prints the URL, opens the browser</span></span>\n<span class="line"><span>packages/server → owns sessions and HTTP endpoints</span></span>\n<span class="line"><span>packages/core   → normalizes schemas and validates answers</span></span>\n<span class="line"><span>packages/web    → renders the HTML shell, client behaviour, and styles</span></span></code></pre></div><h2 id="request-flow" tabindex="-1">Request flow <a class="header-anchor" href="#request-flow" aria-label="Permalink to &quot;Request flow&quot;">​</a></h2><ol><li><code>inquire()</code> creates a server and registers a session.</li><li>The CLI opens <code>/s/:id</code> in the browser.</li><li>The browser fetches the normalized form from <code>GET /api/sessions/:id</code>.</li><li>The browser posts answers to <code>POST /api/sessions/:id/answers</code>.</li><li>The core validator accepts the answers or returns a field error.</li><li>The session promise resolves and the server closes.</li></ol><p>The server binds to <code>127.0.0.1</code> and sessions are single-use. The <code>/s/:id</code> page, session API, assets, answer submission, and cancellation are all handled by the local HTTP server.</p>', 6)
  ])]);
}
const architecture = /* @__PURE__ */ _export_sfc(_sfc_main, [["render", _sfc_render]]);
export {
  __pageData,
  architecture as default
};
