export const AUTH_TOKEN_KEY = "admin_token";

export function setToken(token) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}
