/**
 * Central error handler. Any uncaught error in a route lands here so the
 * server never crashes mid-demo and always returns clean JSON.
 */
function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  console.error('[ERROR]', err.message);
  res.status(err.status || 500).json({
    ok: false,
    error: err.message || 'Internal server error',
  });
}

function notFound(req, res) {
  res.status(404).json({ ok: false, error: `Route not found: ${req.method} ${req.path}` });
}

module.exports = { errorHandler, notFound };
