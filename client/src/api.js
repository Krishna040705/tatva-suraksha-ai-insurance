const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

async function request(path, options = {}, token) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Request failed.");
  }

  return payload;
}

export const api = {
  bootstrapDemo: (persona = "worker") =>
    request("/demo/bootstrap", {
      method: "POST",
      body: JSON.stringify({ persona }),
    }),
  register: (body) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  login: (body) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),
  fetchOverview: (token) => request("/dashboard/overview", {}, token),
  fetchQuote: (token, body) =>
    request(
      "/policies/quote",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    ),
  createPolicy: (token, body) =>
    request(
      "/policies",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    ),
  updatePolicy: (token, policyId, body) =>
    request(
      `/policies/${policyId}`,
      {
        method: "PATCH",
        body: JSON.stringify(body),
      },
      token,
    ),
  simulateTriggers: (token, body) =>
    request(
      "/triggers/simulate",
      {
        method: "POST",
        body: JSON.stringify(body),
      },
      token,
    ),
  releaseClaim: (token, claimId) =>
    request(
      `/claims/${claimId}/release`,
      {
        method: "POST",
      },
      token,
    ),
};
