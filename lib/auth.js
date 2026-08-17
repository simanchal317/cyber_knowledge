// Server-side Authentication for Admin operations

const DEFAULT_ADMIN_USER = process.env.ADMIN_USERNAME || 'ganesh';
const DEFAULT_ADMIN_PASS = process.env.ADMIN_PASSWORD || '2006';
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'range-sec-platform-token-secret-xyz';

/**
 * Validate admin credentials
 */
export function verifyCredentials(username, password) {
  const validUser = process.env.ADMIN_USERNAME || DEFAULT_ADMIN_USER;
  const validPass = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASS;
  return username === validUser && password === validPass;
}

/**
 * Generate session auth token
 */
export function generateAdminToken() {
  const timestamp = Date.now();
  const raw = `${timestamp}:${ADMIN_SECRET}`;
  return Buffer.from(raw).toString('base64');
}

/**
 * Validate incoming request authorization
 */
export function validateAdminRequest(request) {
  const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [timestamp, secret] = decoded.split(':');
    if (secret !== ADMIN_SECRET) return false;

    // Token valid for 7 days
    const age = Date.now() - parseInt(timestamp, 10);
    return age < 7 * 24 * 60 * 60 * 1000;
  } catch (err) {
    return false;
  }
}
