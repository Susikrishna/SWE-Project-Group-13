/**
 * utils/resolvePermissionSets.js
 *
 * Given a list of PermissionSet ObjectId strings, fetches the full set
 * documents from registry-service (with mfes.mfeId populated) and returns
 * the union of:
 *   - mergedPermissions:  API permissionKeys derived dynamically from the MFE registry data.
 *   - allowedMfes:        MFE feature slugs or specific component keys the user can access.
 *
 * NO static `apis` array is consulted — permissions are always derived from
 * the MfeRegistry at runtime, so they stay in sync with registry changes.
 */

const http = require("http");
const https = require("https");

const REGISTRY_URL = process.env.REGISTRY_SERVICE_URL || "http://localhost:3001";

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, (res) => {
        let raw = "";
        res.on("data", (chunk) => (raw += chunk));
        res.on("end", () => {
          try {
            resolve(JSON.parse(raw));
          } catch (e) {
            reject(new Error(`JSON parse error from ${url}: ${e.message}`));
          }
        });
      })
      .on("error", reject);
  });
}

async function resolvePermissionSets(setIds) {
  const result = { additionalPermissions: [], additionalMfes: [] };

  if (!Array.isArray(setIds) || setIds.length === 0) return result;

  const ids = [...new Set(setIds.map(String))].filter(Boolean);
  if (ids.length === 0) return result;

  let sets;
  try {
    const url = `${REGISTRY_URL}/registry/permission-sets?ids=${ids.join(",")}`;
    sets = await fetchJson(url);
  } catch (err) {
    console.error("[resolvePermissionSets] Failed to fetch sets:", err.message);
    return result;
  }

  if (!Array.isArray(sets)) return result;

  const permSet = new Set();
  const mfeSet = new Set();

    for (const set of sets) {
      if (!set.isActive) continue; // Skip inactive permission sets

      for (const entry of set.mfes || []) {
        const mfe = entry.mfeId;
        if (!mfe || !mfe.feature || mfe.isActive === false) continue; // Skip inactive MFEs

        const selectedComponents = new Set(entry.components || []);
        const hasComponentFilter = selectedComponents.size > 0;

        if (!hasComponentFilter) {
          // Root MFE only — grant root-level permissions, no sub-component access
          mfeSet.add(mfe.feature.toLowerCase());
          (mfe.allowedPermissions || []).forEach((k) => permSet.add(k.toLowerCase()));
        } else {
          // Specific components only
          mfeSet.add(mfe.feature.toLowerCase());
          (mfe.allowedPermissions || []).forEach((k) => permSet.add(k.toLowerCase()));

          (mfe.components || []).forEach((comp) => {
            if (selectedComponents.has(comp.route) && comp.isActive !== false) {
              mfeSet.add(`${mfe.feature}::${comp.route}`.toLowerCase());
              (comp.allowedPermissions || []).forEach((k) => permSet.add(k.toLowerCase()));
            }
          });
        }
      }
    }

  result.additionalPermissions = Array.from(permSet);
  result.additionalMfes = Array.from(mfeSet);
  return result;
}

module.exports = { resolvePermissionSets };
