import { randomUUID } from 'node:crypto';
import { createReadStream, existsSync, statSync } from 'node:fs';
import http from 'node:http';
import path from 'node:path';

const HOST = '0.0.0.0';
const PORT = Number(process.env.PORT || 4173);
const DIST_DIR = path.resolve('dist');
const SESSION_COOKIE = 'branches_beta_session';
const SITE_PASSWORD = process.env.SITE_PASSWORD || 'stillBeta2026';
const activeSessions = new Set();

const MIME_TYPES = {
  '.css': 'text/css; charset=utf-8',
  '.gif': 'image/gif',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpeg': 'image/jpeg',
  '.jpg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.webp': 'image/webp',
};

function escapeHtml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function parseCookies(cookieHeader = '') {
  return cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .reduce((cookies, part) => {
      const separatorIndex = part.indexOf('=');

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = part.slice(0, separatorIndex);
      const value = part.slice(separatorIndex + 1);
      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});
}

function getRequestUrl(req) {
  return new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
}

function normalizeRedirect(target) {
  if (!target || !target.startsWith('/') || target.startsWith('//')) {
    return '/';
  }

  return target;
}

function sendHtml(res, statusCode, html, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/html; charset=utf-8',
    'Content-Length': Buffer.byteLength(html),
    ...headers,
  });
  res.end(html);
}

function sendText(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    ...headers,
  });
  res.end(body);
}

function redirect(res, location, headers = {}) {
  res.writeHead(302, {
    Location: location,
    ...headers,
  });
  res.end();
}

function renderLoginPage({ errorMessage = '', redirectTo = '/' } = {}) {
  const safeRedirectTo = escapeHtml(normalizeRedirect(redirectTo));
  const errorMarkup = errorMessage
    ? `<p class="error" role="alert">${escapeHtml(errorMessage)}</p>`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Branches.Family Beta Access</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f3ebda;
        --panel: rgba(255, 252, 245, 0.92);
        --text: #1c1914;
        --muted: #645948;
        --accent: #a04d2a;
        --accent-dark: #7f3b1e;
        --border: rgba(28, 25, 20, 0.12);
        --shadow: 0 20px 60px rgba(51, 33, 20, 0.18);
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        font-family: Georgia, serif;
        color: var(--text);
        background:
          radial-gradient(circle at top left, rgba(160, 77, 42, 0.18), transparent 30%),
          radial-gradient(circle at bottom right, rgba(83, 120, 88, 0.18), transparent 28%),
          linear-gradient(160deg, #efe1c8 0%, var(--bg) 100%);
      }

      .card {
        width: min(100%, 460px);
        padding: 32px;
        border: 1px solid var(--border);
        border-radius: 24px;
        background: var(--panel);
        box-shadow: var(--shadow);
        backdrop-filter: blur(12px);
      }

      h1 {
        margin: 0 0 12px;
        font-size: clamp(2rem, 5vw, 2.6rem);
        line-height: 1;
      }

      p {
        margin: 0 0 16px;
        color: var(--muted);
        line-height: 1.5;
      }

      label {
        display: block;
        margin: 0 0 8px;
        font-weight: 700;
      }

      input {
        width: 100%;
        padding: 14px 16px;
        border: 1px solid var(--border);
        border-radius: 14px;
        font: inherit;
        color: inherit;
        background: rgba(255, 255, 255, 0.82);
      }

      button {
        width: 100%;
        margin-top: 16px;
        padding: 14px 16px;
        border: 0;
        border-radius: 999px;
        font: inherit;
        font-weight: 700;
        color: #fffaf5;
        background: linear-gradient(135deg, var(--accent) 0%, var(--accent-dark) 100%);
        cursor: pointer;
      }

      .hint {
        margin-top: 14px;
        font-size: 0.95rem;
      }

      .error {
        padding: 12px 14px;
        border-radius: 12px;
        background: rgba(160, 52, 42, 0.1);
        color: #8d251b;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Private Beta</h1>
      <p>Enter the current beta password to access Branches.Family.</p>
      ${errorMarkup}
      <form method="post" action="/login">
        <input type="hidden" name="redirectTo" value="${safeRedirectTo}" />
        <label for="password">Password</label>
        <input id="password" name="password" type="password" autocomplete="current-password" required />
        <button type="submit">Enter site</button>
      </form>
      <p class="hint">If you change the password later, set SITE_PASSWORD in the server environment.</p>
    </main>
  </body>
</html>`;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });

    req.on('end', () => resolve(body));
    req.on('error', reject);
  });
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  return Boolean(cookies[SESSION_COOKIE] && activeSessions.has(cookies[SESSION_COOKIE]));
}

function clearSession(req, res) {
  const cookies = parseCookies(req.headers.cookie);
  const token = cookies[SESSION_COOKIE];

  if (token) {
    activeSessions.delete(token);
  }

  redirect(res, '/', {
    'Set-Cookie': `${SESSION_COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`,
  });
}

function serveFile(req, res, filePath) {
  const stat = statSync(filePath);
  const extension = path.extname(filePath).toLowerCase();

  res.writeHead(200, {
    'Content-Type': MIME_TYPES[extension] || 'application/octet-stream',
    'Content-Length': stat.size,
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  createReadStream(filePath).pipe(res);
}

function resolveStaticPath(pathname) {
  const safePath = path.normalize(pathname).replace(/^(\.\.(\/|\\|$))+/, '');
  const candidate = path.resolve(DIST_DIR, `.${safePath}`);

  if (!candidate.startsWith(DIST_DIR)) {
    return null;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    return candidate;
  }

  return null;
}

function hasFileExtension(pathname) {
  return path.extname(pathname) !== '';
}

const server = http.createServer(async (req, res) => {
  const requestUrl = getRequestUrl(req);
  const pathname = requestUrl.pathname;

  if (!existsSync(DIST_DIR)) {
    sendText(res, 500, 'Build output not found. Run npm run build first.');
    return;
  }

  if (pathname === '/login' && req.method === 'GET') {
    if (isAuthenticated(req)) {
      redirect(res, '/');
      return;
    }

    sendHtml(res, 200, renderLoginPage({ redirectTo: requestUrl.searchParams.get('redirectTo') || '/' }));
    return;
  }

  if (pathname === '/login' && req.method === 'POST') {
    try {
      const rawBody = await readBody(req);
      const form = new URLSearchParams(rawBody);
      const password = form.get('password') || '';
      const redirectTo = normalizeRedirect(form.get('redirectTo') || '/');

      if (password !== SITE_PASSWORD) {
        sendHtml(res, 401, renderLoginPage({
          errorMessage: 'Incorrect password. Try again.',
          redirectTo,
        }));
        return;
      }

      const sessionToken = randomUUID();
      activeSessions.add(sessionToken);

      redirect(res, redirectTo, {
        'Set-Cookie': `${SESSION_COOKIE}=${encodeURIComponent(sessionToken)}; Path=/; HttpOnly; SameSite=Lax`,
      });
    } catch {
      sendText(res, 400, 'Unable to process login request.');
    }
    return;
  }

  if (pathname === '/logout') {
    clearSession(req, res);
    return;
  }

  if (!isAuthenticated(req)) {
    const wantsHtml = (req.headers.accept || '').includes('text/html');

    if (!wantsHtml) {
      sendText(res, 401, 'Authentication required.');
      return;
    }

    sendHtml(res, 401, renderLoginPage({
      redirectTo: `${pathname}${requestUrl.search}`,
      errorMessage: '',
    }));
    return;
  }

  const staticPath = resolveStaticPath(pathname);
  if (staticPath) {
    serveFile(req, res, staticPath);
    return;
  }

  if (hasFileExtension(pathname)) {
    sendText(res, 404, 'Not found');
    return;
  }

  serveFile(req, res, path.join(DIST_DIR, 'index.html'));
});

server.listen(PORT, HOST, () => {
  console.log(`Branches.Family protected site running at http://${HOST}:${PORT}`);
});