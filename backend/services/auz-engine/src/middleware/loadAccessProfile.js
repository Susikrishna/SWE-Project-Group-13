const Role = require("../models/Role");
const User = require("../models/User");   // ← was missing in original
const {
    buildRoleSummary,
    extractRoleIdsFromPayload,
    isTempRoleCurrentlyValid,
    validateRoleIds,
} = require("../utils/accessProfile");
const { resolvePermissionSets } = require("../utils/resolvePermissionSets");

/**
 * Reads JWT payload, fetches roles from DB, fetches user subject attributes,
 * and attaches a complete accessProfile to req for downstream use.
 *
 * req.accessProfile shape:
 * {
 *   userId          : string,
 *   roleIds         : string[],
 *   roles           : Role[],
 *   roleSummaries   : RoleSummary[],
 *   mergedPermissions: string[],
 *   mergedMfes      : string[],
 *   subjectAttributes: {          ← NEW — used by ABAC engine
 *     department     : string | null,
 *     clearance      : string | null,   // "public"|"internal"|"confidential"|"secret"
 *     clearanceLevel : number | null,   // numeric equivalent: public=1 internal=3 confidential=7 secret=10
 *     location       : string | null,
 *     employeeType   : string | null,
 *     customTags     : string[],
 *   }
 * }
 */
const loadAccessProfile = async (req, res, next) => {
    try {
        const tokenPayload = req.tokenPayload || {};
        console.log(`[AuzEngine] Received Token Payload:`, tokenPayload);
        
        const roleIds = extractRoleIdsFromPayload(tokenPayload);
        console.log(`[AuzEngine] Extracted Role IDs:`, roleIds);

        if (roleIds.length === 0) {
            console.warn(`[AuzEngine] Missing roleId in token for user: ${tokenPayload.userId}`);
            return res.status(400).json({ error: "Token payload missing roleId" });
        }

        if (!validateRoleIds(roleIds)) {
            console.warn(`[AuzEngine] Invalid role IDs:`, roleIds);
            return res.status(400).json({ error: "Invalid role IDs in token" });
        }

        // ── 1. Load roles ────────────────────────────────────────────────────
        const roles = await Role.find({ _id: { $in: roleIds } }).lean();

        if (roles.length === 0) {
            return res.status(403).json({ error: "No matching roles found" });
        }

        const activeRoles = roles.filter(isTempRoleCurrentlyValid);
        if (activeRoles.length === 0) {
            return res.status(403).json({ error: "All assigned roles are expired" });
        }

        // ── 1b. Resolve Permission Sets → union into effective permissions ────
        // Collect all unique set IDs across active roles
        const allSetIds = [
            ...new Set(
                activeRoles.flatMap(r => (r.permissionSets || []).map(String))
            )
        ];
        const { additionalPermissions, additionalMfes } = await resolvePermissionSets(allSetIds);

        const effectivePermissions = new Set(additionalPermissions);
        
        // Parse the returned additionalMfes (e.g. "feature" or "feature::route")
        const mfeAccessMap = {};
        for (const mfeKey of additionalMfes) {
            const [feature, route] = mfeKey.split("::");
            if (!mfeAccessMap[feature]) {
                mfeAccessMap[feature] = new Set();
            }
            if (route) {
                mfeAccessMap[feature].add(route);
            } else {
                mfeAccessMap[feature].add("*"); // access to all components if just feature is listed
            }
        }

        const allowedFeatures = Object.keys(mfeAccessMap);

        // Fetch current active MFE registry entries
        const MfeRegistry = require("../models/mfeRegistry.model");
        const activeMfes = await MfeRegistry.find({
            feature: { $in: allowedFeatures },
            isActive: { $ne: false },
        }).lean();

        const allowedMicrofrontends = [];

        for (const mfe of activeMfes) {
            const allowedComps = mfeAccessMap[mfe.feature];
            
            // Filter out components the user doesn't have access to, or that are inactive
            let activeComponents = [];
            if (allowedComps && allowedComps.has("*")) {
                // Empty components in the PermissionSet = root MFE only, no sub-components
                activeComponents = [];
            } else if (allowedComps) {
                activeComponents = (mfe.components || []).filter(c => 
                    c.isActive !== false && allowedComps.has(c.route)
                );
            }

            // Push to the allowed list for the frontend
            allowedMicrofrontends.push({
                ...mfe,
                components: activeComponents
            });
        }

        // ── 2. Load user's subject attributes for ABAC ───────────────────────
        //   userId is stored in the token as tokenPayload.userId
        const userId = tokenPayload.userId || null;
        let subjectAttributes = buildDefaultAttributes();

        if (userId) {
            console.log(`[AuzEngine] Looking up user by username: ${userId}`);
            const user = await User.findOne({ username: userId }).lean();
            if (user) {
                console.log(`[AuzEngine] User found with roles:`, user.roles);
                if (user.attributes) {
                    const a = user.attributes;
                    subjectAttributes = {
                        department:    a.department    ?? null,
                        clearance:     a.clearance     ?? null,
                        clearanceLevel: resolveClearanceLevel(a.clearance, a.clearanceLevel),
                        location:      a.location      ?? null,
                        employeeType:  a.employeeType  ?? null,
                        customTags:    a.customTags    ?? [],
                    };
                    console.log(`[AuzEngine] Loaded subject attributes:`, subjectAttributes);
                } else {
                    console.log(`[AuzEngine] No custom attributes found for user.`);
                }
            } else {
                console.warn(`[AuzEngine] User not found in database: ${userId}`);
            }
        }

        // ── 3. Attach complete profile ────────────────────────────────────────
        req.accessProfile = {
            userId,
            roleIds,
            roles: activeRoles,
            roleSummaries: activeRoles.map(buildRoleSummary),
            mergedPermissions: Array.from(effectivePermissions),
            allowedMicrofrontends,
            subjectAttributes,   // ← available to checkAccess & abacEngine
        };

        return next();
    } catch (error) {
        console.error("loadAccessProfile error:", error);
        return res.status(500).json({ error: "Failed to resolve access profile", detail: error.message });
    }
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildDefaultAttributes() {
    return {
        department:    null,
        clearance:     null,
        clearanceLevel: null,
        location:      null,
        employeeType:  null,
        customTags:    [],
    };
}

/**
 * Maps a string clearance label to a numeric level, OR uses an explicit
 * numeric value already stored on the user.
 *
 * Scale: public=1, internal=3, confidential=7, secret=10
 * This lets callers do: { "attribute": "subject.clearanceLevel", "op": "gte", "value": 5 }
 */
const CLEARANCE_NUMERIC = {
    public:       1,
    internal:     3,
    confidential: 7,
    secret:       10,
};

function resolveClearanceLevel(clearanceString, explicitLevel) {
    if (typeof explicitLevel === "number") return explicitLevel;
    if (!clearanceString) return null;
    return CLEARANCE_NUMERIC[clearanceString.toLowerCase()] ?? null;
}

module.exports = loadAccessProfile;
