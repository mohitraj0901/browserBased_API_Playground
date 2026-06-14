# ⚡ API Playground — Backend

> A lightweight, browser-based API testing tool. This repo is the **backend**:
> the request engine + secure CORS proxy that makes the whole thing actually work.

Built for **Track 9: Browser-Based API Playground**.

---

## 🧠 The one insight that wins this track

A browser **cannot** freely call arbitrary APIs. Browser `fetch` is blocked by
**CORS** for most third-party APIs. That is *the entire reason* Postman is a
desktop app and not a website.

This backend solves that. It receives the request from the frontend, makes the
call **server-side** (where CORS does not exist), and returns a clean response.

> **If a judge asks "why do you even need a backend for a frontend tool?"** —
> this is your answer. Say: *"Because of CORS. The browser can't call most APIs
> directly. Our backend is a secure proxy + request engine that does it for them,
> measures timing and size, and protects against SSRF."* That answer wins points.

---

## ✨ What the backend does

| Feature | Endpoint | Notes |
|---|---|---|
| **Request engine / CORS proxy** | `POST /api/proxy` | All methods, headers, query params, JSON/form/raw bodies |
| **Response metrics** | (in proxy response) | status, statusText, response time (ms), size (bytes), content-type |
| **Code generator** | `POST /api/codegen` | Turns any request into cURL / fetch / axios |
| **SSRF security guard** | (middleware) | Blocks localhost, private IPs, cloud-metadata endpoint |
| **Rate limiting** | (middleware) | 100 req/min/IP so nobody abuses the public proxy |
| **Health check** | `GET /api/health` | For Render/Railway + live demo |
| **Built-in test client** | `GET /` | A dark-themed UI to demo the backend instantly |

---

## 🚀 Run locally (60 seconds)

```bash
npm install
cp .env.example .env      # optional
npm start
```

Open **http://localhost:4000** — the built-in test client loads. Try:
`GET https://jsonplaceholder.typicode.com/posts/1` → hit **SEND**.

> The test client (`public/index.html`) is a backend demo harness so you can show
> a working product even before your teammate's React UI is ready. Your teammate's
> polished React + Tailwind frontend just needs to call the same `/api/proxy`
> endpoint — the contract is identical.

---

## 📡 API reference

### `POST /api/proxy`
The single endpoint the frontend calls.

**Request body**
```json
{
  "method": "POST",
  "url": "https://api.example.com/users",
  "headers": { "Authorization": "Bearer xyz" },
  "params":  { "page": "1" },
  "body":    { "name": "Mohit" },
  "bodyType": "json"
}
```
`bodyType` = `"json"` | `"form"` | `"raw"` | `"none"`

**Response**
```json
{
  "ok": true,
  "status": 201,
  "statusText": "Created",
  "headers": { "...": "..." },
  "contentType": "application/json",
  "data": { "id": 101, "name": "Mohit" },
  "time": 142,
  "size": 87
}
```
On a network failure (DNS, timeout, refused) you get `{ ok:false, networkError:true, ... }`
instead of a crash.

### `POST /api/codegen`
Same request body as above → returns `{ curl, fetch, axios }` code strings.

### `GET /api/health`
Returns `{ ok:true, uptimeSeconds, timestamp }`.

---

## ☁️ Deployment (your part)

### Option A — Render (recommended, `render.yaml` included)
1. Push this repo to GitHub.
2. Render → **New → Blueprint** → select the repo. It auto-reads `render.yaml`.
3. Deploy. Health check path `/api/health` is pre-configured.
4. Your URL: `https://your-app.onrender.com`

### Option B — Railway
1. Railway → **New Project → Deploy from GitHub**.
2. It auto-detects Node + the `Procfile`. No config needed.

### After deploying
In the React frontend, point the backend URL to your deployed address, e.g.
`https://your-app.onrender.com/api/proxy`. That's it.

> **Demo tip:** Render free tier sleeps after inactivity. Hit `/api/health`
> ~30 seconds before your demo so the first real request isn't slow.

---

## 🔐 Security (great talking points)

- **SSRF guard** — without it, anyone could ask your server to fetch
  `http://169.254.169.254/...` (cloud metadata, can leak secrets) or your internal
  services. We resolve the target host and block private/loopback/link-local IPs.
  Toggle with `ALLOW_PRIVATE_HOSTS` for local testing.
- **Rate limiting** — 100 requests/min/IP stops your public proxy being abused as
  a free traffic relay.
- **Body size cap** — 5 MB, prevents memory-exhaustion.
- **Never crashes** — every error returns clean JSON via a central handler.

---

## 🏗️ Architecture

```
Browser (React UI)
   │  POST /api/proxy  { method, url, headers, body }
   ▼
Express server  ──► rate limiter ──► SSRF guard ──► request engine (axios)
   │                                                      │
   │                                            real API (no CORS here)
   ▼                                                      │
clean JSON  ◄───────────── normalised response ◄──────────┘
{ status, data, time, size }
```

**Stateless by design.** Collections & history live in the browser's
localStorage (frontend). The backend stores nothing → trivial to scale, trivial
to deploy, nothing to leak. That's a deliberate, defensible choice.

---

## 🎤 Judge Q&A — be ready

**Q: Why a backend if data is in localStorage?**
CORS. The browser can't call most APIs directly. The backend is the proxy/engine
that makes real requests, and adds timing, size, codegen, and SSRF protection.

**Q: How is this different from just using fetch in the browser?**
Browser fetch fails on CORS for almost every external API and can't read full
response headers. Our server-side engine has no such limits.

**Q: How do you stop people abusing your public proxy?**
Rate limiting per IP + SSRF guard + body size cap.

**Q: What happens on a bad/slow API?**
Timeout (30s) and a structured `networkError` response — the server never crashes.

**Q: How would you scale this?**
It's stateless, so just run more instances behind a load balancer. No DB to shard.

---

## 📁 Structure

```
server.js                  entry point, wires middleware + routes
src/routes/proxy.js        POST /api/proxy
src/routes/codegen.js      POST /api/codegen
src/routes/health.js       GET  /api/health
src/services/requestEngine.js  the core: runs the HTTP request
src/services/codegen.js        curl/fetch/axios generator
src/middleware/ssrfGuard.js    blocks internal/private targets
src/middleware/rateLimiter.js  100 req/min/IP
src/middleware/errorHandler.js central errors + 404
public/index.html          built-in dark test client
render.yaml / Procfile     deployment
```

Good luck — go win it. 🏆
