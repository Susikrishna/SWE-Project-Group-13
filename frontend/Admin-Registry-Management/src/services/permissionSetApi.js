/**
 * permissionSetApi.js
 * CRUD helpers for the /registry/permission-sets endpoint.
 */

const BASE = import.meta.env.VITE_REGISTRY_URL || "http://localhost:5001";
const BASE_URL = `${BASE}/registry/permission-sets`;

async function handleResponse(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

export const fetchPermissionSets = () =>
  fetch(BASE_URL).then(handleResponse);

export const createPermissionSet = (payload) =>
  fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const updatePermissionSet = (id, payload) =>
  fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then(handleResponse);

export const deletePermissionSet = (id) =>
  fetch(`${BASE_URL}/${id}`, { method: "DELETE" }).then(handleResponse);
