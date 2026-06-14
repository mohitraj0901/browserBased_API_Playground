const express = require('express');
const router = express.Router();
const { assertSafeUrl } = require('../middleware/ssrfGuard');
const { executeRequest } = require('../services/requestEngine');

const ALLOWED_METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'];

/**
 * POST /api/proxy
 * The single endpoint the frontend calls. It validates input, runs the request
 * through the engine (server-side, so no CORS), and returns a clean response.
 *
 * Request body:
 * {
 *   "method": "POST",
 *   "url": "https://api.example.com/users",
 *   "headers": { "Authorization": "Bearer xyz" },
 *   "params":  { "page": "1" },
 *   "body":    { "name": "Mohit" },
 *   "bodyType": "json"        // json | form | raw | none
 * }
 */
router.post('/proxy', async (req, res) => {
  const { method = 'GET', url, headers = {}, params = {}, body, bodyType = 'none' } = req.body || {};

  // --- Validation ---
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ ok: false, error: 'A "url" string is required.' });
  }
  if (!ALLOWED_METHODS.includes(String(method).toUpperCase())) {
    return res.status(400).json({ ok: false, error: `Method must be one of: ${ALLOWED_METHODS.join(', ')}` });
  }

  // --- Security: block internal/private targets ---
  try {
    await assertSafeUrl(url);
  } catch (e) {
    return res.status(403).json({ ok: false, error: e.message || 'Blocked URL', code: e.code });
  }

  // --- Execute ---
  const result = await executeRequest({ method, url, headers, params, body, bodyType });
  return res.json(result);
});

module.exports = router;
