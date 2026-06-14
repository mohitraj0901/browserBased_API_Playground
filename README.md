# ⚡ API Playground — Backend

The request engine + secure CORS proxy that powers the API Playground. Built with Node.js + Express.

### 🔗 Live
**Health check:** https://browserbased-api-playground.onrender.com/api/health
*(returns `{ "ok": true }` when the server is up)*

> **Why a backend?** Browsers can't call most APIs directly because of CORS. This backend makes the request server-side (no CORS), measures timing/size, and returns a clean response.

## Features
- **CORS proxy** — `POST /api/proxy`: all HTTP methods, custom headers, query params, JSON/form/raw bodies
- **Response metrics** — status, time (ms), size (bytes), content-type
- **Code generator** — `POST /api/codegen`: turns any request into cURL / fetch / axios
- **SSRF guard** — blocks localhost, private IPs, and cloud-metadata endpoints
- **Rate limiting** — 100 req/min/IP, plus a 5 MB body cap

## API
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/proxy` | Run a request `{ method, url, headers, params, body, bodyType }` |
| POST | `/api/codegen` | Get `{ curl, fetch, axios }` snippets |
| GET | `/api/health` | Uptime check |

## Tech
Node.js · Express · Axios · deployed on **Render**

Stateless by design — history & collections live in the browser. Easy to scale, nothing to leak.

## Run locally (optional)
```bash
npm install
npm start          # http://localhost:4000
```
