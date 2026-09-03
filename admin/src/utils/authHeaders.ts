/**
 * Production-ready Admin API and Authorization Header Utility
 */

export const getAdminApiBase = (): string => {
  const raw = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "https://api.awesomehandwork.com" : "http://localhost:5000")).trim().replace(/\/+$/, "");
  return raw.endsWith("/api/v1") ? raw : `${raw}/api/v1`;
};

export const getAdminAuthHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...extraHeaders
  };

  if (typeof window !== "undefined") {
    const token = localStorage.getItem("awesome_admin_token") || localStorage.getItem("aaramly_admin_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  return headers;
};
