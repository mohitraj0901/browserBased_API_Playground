const express = require('express');
const router = express.Router();
const { generate } = require('../services/codegen');

/**
 * POST /api/codegen
 * Takes the same request shape as /api/proxy and returns code snippets.
 * Body: { method, url, headers, params, body, bodyType }
 * Response: { curl, fetch, axios }
 */
router.post('/codegen', (req, res) => {
  const { url } = req.body || {};
  if (!url || typeof url !== 'string') {
    return res.status(400).json({ ok: false, error: 'A "url" string is required.' });
  }
  try {
    const snippets = generate(req.body);
    return res.json({ ok: true, ...snippets });
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }
});

module.exports = router;
