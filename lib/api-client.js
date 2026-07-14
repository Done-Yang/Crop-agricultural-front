// Central HTTP client for the Smart Crop Light Backend.
//
// Reads its base URL and (optional) API key from public env vars, attaches the
// logged-in user's JWT as a Bearer token, and normalises errors. Every real
// api/*.js module calls through here.

const BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8100"
).replace(/\/$/, "");
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

const TOKEN_KEY = "token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (typeof window === "undefined") return;
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export function clearToken() {
  setToken(null);
}

export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

async function request(path, { method = "GET", body, auth = false, headers = {} } = {}) {
  const finalHeaders = { ...headers };
  if (API_KEY) finalHeaders["X-API-Key"] = API_KEY;
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) finalHeaders["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError(
      "ບໍ່ສາມາດເຊື່ອມຕໍ່ກັບເຊີບເວີໄດ້", // "Could not reach the server"
      0,
      networkErr?.message
    );
  }

  let data = null;
  const text = await res.text();
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const detail =
      (data && typeof data === "object" && (data.detail || data.message)) ||
      (typeof data === "string" ? data : null);
    throw new ApiError(detail || `Request failed (${res.status})`, res.status, detail);
  }

  return data;
}

export const apiGet = (path, opts) => request(path, { ...opts, method: "GET" });
export const apiPost = (path, body, opts) => request(path, { ...opts, method: "POST", body });
export const apiPatch = (path, body, opts) => request(path, { ...opts, method: "PATCH", body });

export const API_BASE_URL = BASE_URL;
