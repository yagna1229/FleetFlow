const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

async function request(path, options = {}) {
  const res = await fetch(path, {
    credentials: "include",
    ...options,
    headers: {
      ...DEFAULT_HEADERS,
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");

  let data = null;
  try {
    data = isJson ? await res.json() : await res.text();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const message =
      (data && typeof data === "object" && (data.detail || data.message)) ||
      (typeof data === "string" && data) ||
      `Request failed (${res.status})`;

    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

export function apiGet(path) {
  return request(path, { method: "GET" });
}

export function apiPost(path, body) {
  return request(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiPatch(path, body) {
  return request(path, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function apiPut(path, body) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function apiDelete(path) {
  return request(path, { method: "DELETE" });
}

/**
 * Open Google OAuth login — passes role as query param so backend
 * stores it in session and assigns it on callback.
 */
export function openGoogleLogin(role) {
  window.location.href = `/auth/google/login?role=${encodeURIComponent(role || "manager")}`;
}
