// src/utils/getBackendBase.ts
export function getBackendBase(): string {
  // Vite supports import.meta.env.VITE_BACKEND_URL
  try {
    // @ts-ignore
    if (typeof import !== "undefined" && typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_BACKEND_URL) {
      return String(import.meta.env.VITE_BACKEND_URL).replace(/\/+$/, "");
    }
  } catch (_) { /* ignore */ }

  // CRA: process.env.REACT_APP_BACKEND_URL (guarded)
  if (typeof process !== "undefined" && process && process.env && process.env.REACT_APP_BACKEND_URL) {
    return String(process.env.REACT_APP_BACKEND_URL).replace(/\/+$/, "");
  }

  // Fallback => same origin relative path
  return "";
}

export function getCreateUserUrl(): string {
  const base = getBackendBase();
  if (!base) return "/api/admin/create-user";
  return `${base.replace(/\/+$/, "")}/api/admin/create-user`;
}
