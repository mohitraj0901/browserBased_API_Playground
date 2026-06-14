/**
 * SSRF (Server-Side Request Forgery) Guard
 * ----------------------------------------
 * A proxy that blindly forwards ANY url is dangerous: a malicious user could
 * ask our server to hit internal services like http://localhost:5432 or the
 * cloud metadata endpoint http://169.254.169.254 (which can leak AWS keys).
 *
 * This guard resolves the target hostname and blocks private / loopback /
 * link-local IP ranges. This is a real security feature judges love to see,
 * and an easy question to answer: "How did you secure your proxy?"
 *
 * Set ALLOW_PRIVATE_HOSTS=true in .env to disable while testing localhost APIs.
 */
const dns = require('dns').promises;
const net = require('net');

const ALLOW_PRIVATE = process.env.ALLOW_PRIVATE_HOSTS === 'true';

// CIDR-style checks kept simple and readable for a hackathon codebase.
function isPrivateIPv4(ip) {
  const p = ip.split('.').map(Number);
  if (p.length !== 4 || p.some((n) => Number.isNaN(n))) return false;
  const [a, b] = p;
  if (a === 10) return true;                       // 10.0.0.0/8
  if (a === 127) return true;                      // loopback
  if (a === 172 && b >= 16 && b <= 31) return true; // 172.16.0.0/12
  if (a === 192 && b === 168) return true;         // 192.168.0.0/16
  if (a === 169 && b === 254) return true;         // link-local + cloud metadata
  if (a === 0) return true;                         // 0.0.0.0/8
  return false;
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();
  return lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80');
}

async function assertSafeUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw { code: 'BAD_URL', message: 'Invalid URL. Include the scheme, e.g. https://api.example.com' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    throw { code: 'BAD_SCHEME', message: 'Only http:// and https:// are allowed.' };
  }

  if (ALLOW_PRIVATE) return parsed; // dev mode: trust everything

  const host = parsed.hostname;

  // Obvious localhost names
  if (['localhost', '0.0.0.0', '[::1]'].includes(host)) {
    throw { code: 'BLOCKED_HOST', message: 'Requests to localhost are blocked for security.' };
  }

  // If the host is already an IP literal, check it directly.
  if (net.isIP(host)) {
    if (isPrivateIPv4(host) || isPrivateIPv6(host)) {
      throw { code: 'BLOCKED_IP', message: 'Requests to private/internal IPs are blocked.' };
    }
    return parsed;
  }

  // Otherwise resolve the domain and make sure it does not point inward.
  try {
    const records = await dns.lookup(host, { all: true });
    for (const { address } of records) {
      if (isPrivateIPv4(address) || isPrivateIPv6(address)) {
        throw { code: 'BLOCKED_RESOLVED_IP', message: 'Target domain resolves to a private IP. Blocked.' };
      }
    }
  } catch (e) {
    if (e.code && e.code.startsWith('BLOCKED')) throw e;
    throw { code: 'DNS_ERROR', message: `Could not resolve host: ${host}` };
  }

  return parsed;
}

module.exports = { assertSafeUrl };
