const API_BASE_URL = "http://localhost:5001";

export function getApiUrl(path) {
  return `${API_BASE_URL}${path}`;
}

export function getAuthToken() {
  return localStorage.getItem("token");
}

export function createAuthHeaders(token, extraHeaders = {}) {
  if (!token) {
    return { ...extraHeaders };
  }

  return {
    Authorization: `Bearer ${token}`,
    ...extraHeaders,
  };
}
