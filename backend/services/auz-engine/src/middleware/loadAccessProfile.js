const Role = require("../models/Role");
const User = require("../models/User");   // ← was missing in original
const {
    buildRoleSummary,
    extractRoleIdsFromPayload,
    isTempRoleCurrentlyValid,
    mergeAllowedServices,
    validateRoleIds,
} = require("../utils/accessProfile");

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
        const roleIds = extractRoleIdsFromPayload(tokenPayload);

        if (roleIds.length === 0) {
            return res.status(400).json({ error: "Token payload missing roleId" });
        }

        if (!validateRoleIds(roleIds)) {
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

        const { mergedPermissions, mergedMfes } = mergeAllowedServices(activeRoles);

        // ── 2. Load user's subject attributes for ABAC ───────────────────────
        //   userId is stored in the token as tokenPayload.userId
        const userId = tokenPayload.userId || null;
        let subjectAttributes = buildDefaultAttributes();

        if (userId) {
            const user = await User.findOne({ username: userId }).lean();
            if (user && user.attributes) {
                const a = user.attributes;
                subjectAttributes = {
                    department:    a.department    ?? null,
                    clearance:     a.clearance     ?? null,
                    clearanceLevel: resolveClearanceLevel(a.clearance, a.clearanceLevel),
                    location:      a.location      ?? null,
                    employeeType:  a.employeeType  ?? null,
                    customTags:    a.customTags    ?? [],
                };
            }
        }

        // ── 3. Attach complete profile ────────────────────────────────────────
        req.accessProfile = {
            userId,
            roleIds,
            roles: activeRoles,
            roleSummaries: activeRoles.map(buildRoleSummary),
            mergedPermissions,
            mergedMfes,
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
