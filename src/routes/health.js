const express = require('express');
const router = express.Router();

const startedAt = Date.now();

/**
 * GET /api/health
 * Used by Render/Railway health checks and to prove the server is alive in the demo.
 */
router.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'api-playground-backend',
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    timestamp: new Date().toISOString(),
  });
});

module.exports = router;
