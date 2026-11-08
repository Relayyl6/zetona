/**
 * Admin Authentication & Session Management
 * Driven by process.env.ADMIN_PASSWORD
 */

export const ADMIN_COOKIE_NAME = "zetona_admin_auth";
export const ADMIN_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days in seconds

const DEFAULT_SECRET = "zetona-secret-salt-2026-admin-key";

/**
 * Validates the password against the environment variable ADMIN_PASSWORD
 */
export function verifyAdminPassword(password: string): boolean {
  if (!password) return false;
  const expected = process.env.ADMIN_PASSWORD || "zetona2026";
  return password.trim() === expected.trim();
}

/**
 * Creates a lightweight signed token string for session verification
 * Format: `${timestamp}.${signature}`
 */
export async function createAdminSessionToken(): Promise<string> {
  const secret = process.env.IP_HASH_SALT || process.env.ADMIN_PASSWORD || DEFAULT_SECRET;
  const timestamp = Date.now().toString();
  const signature = await generateHash(`${timestamp}:${secret}`);
  return `${timestamp}.${signature}`;
}

/**
 * Verifies that the session token is properly signed and within expiration (7 days)
 */
export async function verifyAdminSessionToken(token: string | undefined | null): Promise<boolean> {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [timestamp, signature] = parts;
  const time = parseInt(timestamp, 10);
  if (isNaN(time)) return false;

  // Max age check (7 days)
  if (Date.now() - time > ADMIN_COOKIE_MAX_AGE * 1000) {
    return false;
  }

  const secret = process.env.IP_HASH_SALT || process.env.ADMIN_PASSWORD || DEFAULT_SECRET;
  const expectedSignature = await generateHash(`${timestamp}:${secret}`);
  return signature === expectedSignature;
}

/**
 * SHA-256 hash generator using standard Web Crypto API (supported in Node & Edge)
 */
async function generateHash(message: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
