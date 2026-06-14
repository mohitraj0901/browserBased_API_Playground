require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

const proxyRoute = require('./src/routes/proxy');
const codegenRoute = require('./src/routes/codegen');
const healthRoute = require('./src/routes/health');
const { proxyLimiter } = require('./src/middleware/rateLimiter');
const { errorHandler, notFound } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 4000;

// --- Core middleware ---
app.use(cors());                       // allow our frontend (any origin) to call us
app.use(express.json({ limit: '5mb' })); // parse JSON bodies, generous limit for big payloads
app.use(morgan('dev'));                // request logging — looks great in the demo terminal

// --- Routes ---
app.use('/api', healthRoute);
app.use('/api', proxyLimiter, proxyRoute);   // rate-limit only the proxy
app.use('/api', codegenRoute);

// --- Serve the built-in test client (public/index.html) ---
app.use(express.static(path.join(__dirname, 'public')));

// --- Errors ---
app.use(notFound);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`\n  API Playground backend running`);
  console.log(`  ➜  Local:   http://localhost:${PORT}`);
  console.log(`  ➜  Health:  http://localhost:${PORT}/api/health`);
  console.log(`  ➜  Proxy:   POST http://localhost:${PORT}/api/proxy\n`);
});

module.exports = app;
