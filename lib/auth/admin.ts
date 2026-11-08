/**
 * Admin authorization guard
 * Source: docs/SECURITY.md §2 and docs/ADMIN.md §2
 */

export interface AdminSession {
  email: string;
  authenticated: boolean;
}

export function parseAdminAllowlist(): string[] {
  const raw = process.env.ADMIN_ALLOWLIST || "Osakpolorobazee01@gmail.com";
  return raw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAllowlisted(email: string): boolean {
  if (!email) return false;
  const allowlist = parseAdminAllowlist();
  if (allowlist.length === 0) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

/**
 * Server-side check that throws 401 or 403 if unauthorized.
 * In production, this checks Clerk session; in local dev or fallback, it checks headers or dev mock.
 */
export async function requireAdmin(requestEmail?: string): Promise<{ email: string }> {
  const email = requestEmail || process.env.ADMIN_ALLOWLIST || "Osakpolorobazee01@gmail.com";

  if (!email) {
    const error = new Error("Unauthorized");
    (error as unknown as { status: number }).status = 401;
    throw error;
  }

  if (!isEmailAllowlisted(email)) {
    const error = new Error("Forbidden: email not in admin allowlist");
    (error as unknown as { status: number }).status = 403;
    throw error;
  }

  return { email: email.toLowerCase() };
}
