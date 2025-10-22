// src/utils/getBackendBase.ts
// Safe helper to determine backend base URL.
// Works with Vite (import.meta.env.VITE_BACKEND_URL) and CRA (process.env.REACT_APP_BACKEND_URL).
// Returns empty string for same-origin relative calls.

export function getBackendBase(): string {
  // Try to read Vite env first (import.meta.env)
  try {
    // @ts-ignore - import.meta may not be typed in some TS setups but Vite provides it at build time
    const meta: any = import.meta;
    if (meta && meta.env && meta.env.VITE_BACKEND_URL) {
      return String(meta.env.VITE_BACKEND_URL).replace(/\/+$/, "");
    }
  } catch (_) {
    // import.meta access not available — ignore and continue
  }

  // Then try CRA-style env (process.env) with a typeof guard so it never throws in the browser
  if (typeof process !== "undefined" && process && process.env && process.env.REACT_APP_BACKEND_URL) {
    return String(process.env.REACT_APP_BACKEND_URL).replace(/\/+$/, "");
  }

  // Otherwise fallback to empty for same-origin relative path
  return "";
}

export function getCreateUserUrl(): string {
  const base = getBackendBase();
  if (!base) return "/api/admin/create-user";
  // Corrected line: Use template literals (backticks) for string interpolation
  return `${base.replace(/\/+$/, "")}/api/admin/create-user`;
}