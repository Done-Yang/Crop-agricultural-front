// Authentication + profile — real calls to the Light Backend /api/v1/auth/*.
// The JWT is persisted by lib/api-client (localStorage) and attached to
// authenticated requests automatically.

import { apiGet, apiPost, apiPatch, setToken, clearToken, ApiError } from "@/lib/api-client";

// The login form collects an "email" field, the signup form a "phoneNumber"
// field; the backend accepts either as the login identifier.
export async function login(identifier, password) {
  try {
    const res = await apiPost("/api/v1/auth/login", { identifier, password });
    setToken(res.token);
    return { success: true, user: res.user, token: res.token };
  } catch (err) {
    return {
      success: false,
      error:
        err instanceof ApiError
          ? err.message
          : "ອີເມວ/ເບີໂທ ຫຼື ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ", // invalid credentials
    };
  }
}

export async function signup(data) {
  try {
    const res = await apiPost("/api/v1/auth/register", {
      name: data.name,
      password: data.password,
      email: data.email,
      phoneNumber: data.phoneNumber,
    });
    setToken(res.token);
    return { success: true, user: res.user, token: res.token };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "ການສະໝັກລົ້ມເຫຼວ",
    };
  }
}

export async function getProfile() {
  return await apiGet("/api/v1/auth/me", { auth: true });
}

export async function updateProfile(updates) {
  try {
    const res = await apiPatch("/api/v1/auth/me", updates, { auth: true });
    return { success: true, user: res.user };
  } catch (err) {
    return {
      success: false,
      error: err instanceof ApiError ? err.message : "ບໍ່ສາມາດອັບເດດໂປຣໄຟລ໌ໄດ້",
    };
  }
}

export function logout() {
  clearToken();
}
