/**
 * Request Engine
 * --------------
 * This is the heart of the backend. The browser CANNOT freely call arbitrary
 * APIs because of CORS. We call them HERE, on the server, where CORS does not
 * apply, then hand the clean response back to the frontend.
 *
 * It returns a normalised shape the frontend can render directly:
 *   { ok, status, statusText, headers, data, time, size, contentType }
 */
const axios = require('axios');

function hasHeader(headers, name) {
  return Object.keys(headers || {}).some((k) => k.toLowerCase() === name.toLowerCase());
}

/**
 * @param {object} req
 * @param {string} req.method   GET | POST | PUT | PATCH | DELETE | HEAD | OPTIONS
 * @param {string} req.url      full target URL (already validated by ssrfGuard)
 * @param {object} [req.headers] key/value request headers
 * @param {object} [req.params]  query params appended to the URL
 * @param {*}      [req.body]    request body (object or string)
 * @param {string} [req.bodyType] 'json' | 'form' | 'raw' | 'none'
 * @param {number} [req.timeout] ms (default 30s)
 */
async function executeRequest({
  method = 'GET',
  url,
  headers = {},
  params = {},
  body,
  bodyType = 'none',
  timeout = 30000,
}) {
  const start = process.hrtime.bigint();
  const upperMethod = String(method).toUpperCase();

  const config = {
    method: upperMethod,
    url,
    headers: { ...headers },
    params,
    timeout,
    maxRedirects: 5,
    // We want the real response even for 4xx/5xx — never throw on status.
    validateStatus: () => true,
    // arraybuffer lets us measure exact byte size and handle any content type.
    responseType: 'arraybuffer',
  };

  // Attach a body only for methods that allow one.
  const bodyAllowed = !['GET', 'HEAD'].includes(upperMethod);
  if (bodyAllowed && bodyType !== 'none' && body != null && body !== '') {
    if (bodyType === 'json') {
      config.data = typeof body === 'string' ? body : JSON.stringify(body);
      if (!hasHeader(config.headers, 'content-type')) {
        config.headers['Content-Type'] = 'application/json';
      }
    } else if (bodyType === 'form') {
      config.data = new URLSearchParams(body).toString();
      if (!hasHeader(config.headers, 'content-type')) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
      }
    } else {
      // raw text / xml / anything
      config.data = body;
    }
  }

  try {
    const res = await axios(config);
    const timeMs = Number(process.hrtime.bigint() - start) / 1e6;

    const buf = Buffer.from(res.data);
    const size = buf.length;
    const contentType = String(res.headers['content-type'] || '').toLowerCase();
    const text = buf.toString('utf8');

    // Parse JSON when the server says it is JSON (and it actually parses).
    let data = text;
    if (contentType.includes('json')) {
      try { data = JSON.parse(text); } catch { /* keep raw text */ }
    }

    return {
      ok: res.status >= 200 && res.status < 300,
      status: res.status,
      statusText: res.statusText || '',
      headers: res.headers,
      contentType,
      data,
      time: Math.round(timeMs),
      size,
    };
  } catch (err) {
    const timeMs = Number(process.hrtime.bigint() - start) / 1e6;
    // Network-level failure (DNS, timeout, connection refused, etc.)
    return {
      ok: false,
      networkError: true,
      status: 0,
      statusText: err.code || 'NETWORK_ERROR',
      message: err.message || 'Request failed before a response was received.',
      time: Math.round(timeMs),
      size: 0,
    };
  }
}

module.exports = { executeRequest };
