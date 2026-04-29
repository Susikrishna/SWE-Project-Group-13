/**
 * utils/resolvePermissionSets.js
 *
 * Given a list of PermissionSet ObjectId strings, fetches the full set
 * documents from registry-service and returns the union of:
 *   - additional API permissionKeys  (string[])
 *   - additional MFE component keys  (string[], format: "feature::route")
 *
 * This is called once per request in loadAccessProfile so that effective
 * permissions are always computed at runtime — making set edits immediately
 * reflected without touching the role document.
 */

const http = require("http");
const https = require("https");

const REGISTRY_URL =
  process.env.REGISTRY_SERVICE_URL || "http://localhost:3001";

/**
 * Low-level helper: fetch JSON from a URL without external dependencies.
 */
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

/**
 * Given an array of PermissionSet ObjectId strings (may be empty),
 * returns { additionalPermissions: string[], additionalMfes: string[] }.
 *
 * additionalMfes uses the component-key format: "feature::componentRoute"
 * (consistent with how role.mfeAccess stores direct MFE selections).
 */
async function resolvePermissionSets(setIds) {
  const result = { additionalPermissions: [], additionalMfes: [] };

  if (!Array.isArray(setIds) || setIds.length === 0) return result;

  // Deduplicate and stringify IDs
  const ids = [...new Set(setIds.map(String))].filter(Boolean);
  if (ids.length === 0) return result;

  let sets;
  try {
    const url = `${REGISTRY_URL}/registry/permission-sets?ids=${ids.join(",")}`;
    sets = await fetchJson(url);
  } catch (err) {
    // Soft-fail: if registry is unreachable, effective permissions fall back
    // to the role's direct permissions only. Log the error but don't crash.
    console.error("[resolvePermissionSets] Failed to fetch sets:", err.message);
    return result;
  }

  if (!Array.isArray(sets)) return result;

  const permSet = new Set();
  const mfeSet = new Set();

  for (const set of sets) {
    // APIs — use permissionKey string
    for (const api of set.apis || []) {
      const key = api.permissionKey || api;
      if (key) permSet.add(String(key).trim().toLowerCase());
    }

    // MFEs — produce component-level keys: "feature::componentRoute"
    for (const mfe of set.mfes || []) {
      const feature = mfe.feature || mfe;
      if (!feature) continue;

      const components = Array.isArray(mfe.components) ? mfe.components : [];

      if (components.length === 0) {
        // No components defined — fall back to feature slug only
        mfeSet.add(String(feature).toLowerCase());
      } else {
        // Emit one key per component (matches direct selection format)
        for (const comp of components) {
          if (comp.route) {
            mfeSet.add(`${feature}::${comp.route}`.toLowerCase());
          }
        }
      }
    }
  }

  result.additionalPermissions = Array.from(permSet);
  result.additionalMfes = Array.from(mfeSet);
  return result;
}

module.exports = { resolvePermissionSets };
