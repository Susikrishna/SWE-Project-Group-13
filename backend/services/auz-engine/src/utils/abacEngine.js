/**
 * utils/abacEngine.js
 *
 * Evaluates ABAC policy conditions against a user's subject attributes.
 *
 * Attribute path format accepted:
 *   "subject.clearanceLevel"  →  subjectAttributes.clearanceLevel
 *   "subject.department"      →  subjectAttributes.department
 *   "department"              →  subjectAttributes.department   (no prefix also works)
 *
 * Operators supported:
 *   eq            — strict equality (string or number, case-insensitive for strings)
 *   neq           — not equal
 *   gte           — greater than or equal (numeric)
 *   lte           — less than or equal (numeric)
 *   gt            — greater than (numeric)
 *   lt            — less than (numeric)
 *   in            — subject value is in the provided array
 *   nin           — subject value is NOT in the provided array
 *   contains      — subject array attribute contains value  (e.g. customTags contains "beta-tester")
 *   gte_clearance — string clearance hierarchy: public < internal < confidential < secret
 */

const CLEARANCE_ORDER = ["public", "internal", "confidential", "secret"];

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Resolve a (possibly dot-prefixed) attribute path against the subject attributes object.
 * "subject.clearanceLevel" → subjectAttributes["clearanceLevel"]
 * "department"             → subjectAttributes["department"]
 */
function resolveAttribute(attributePath, subjectAttributes) {
    const key = attributePath.startsWith("subject.")
        ? attributePath.slice("subject.".length)   // strip "subject." prefix
        : attributePath;

    // Support one level of nesting in case attributes is a sub-object
    if (key.includes(".")) {
        const parts = key.split(".");
        let cursor = subjectAttributes;
        for (const part of parts) {
            if (cursor == null) return undefined;
            cursor = cursor[part];
        }
        return cursor;
    }

    return subjectAttributes?.[key];
}

/**
 * Evaluate a single condition.
 * Returns { passed: boolean, reason: string }
 */
function evaluateCondition(condition, subjectAttributes) {
    const { attribute, op, value } = condition;

    const subjectValue = resolveAttribute(attribute, subjectAttributes);

    switch (op) {

        case "eq": {
            const passed = typeof subjectValue === "string" && typeof value === "string"
                ? subjectValue.toLowerCase() === value.toLowerCase()
                : subjectValue === value;
            return {
                passed,
                reason: passed ? null : `${attribute} is "${subjectValue}", expected eq "${value}"`,
            };
        }

        case "neq": {
            const passed = typeof subjectValue === "string" && typeof value === "string"
                ? subjectValue.toLowerCase() !== value.toLowerCase()
                : subjectValue !== value;
            return {
                passed,
                reason: passed ? null : `${attribute} is "${subjectValue}", must not eq "${value}"`,
            };
        }

        case "gte": {
            const a = Number(subjectValue);
            const b = Number(value);
            if (isNaN(a) || isNaN(b)) {
                return { passed: false, reason: `${attribute} gte requires numeric values, got "${subjectValue}" and "${value}"` };
            }
            const passed = a >= b;
            return { passed, reason: passed ? null : `${attribute} is ${a}, required >= ${b}` };
        }

        case "lte": {
            const a = Number(subjectValue);
            const b = Number(value);
            if (isNaN(a) || isNaN(b)) {
                return { passed: false, reason: `${attribute} lte requires numeric values` };
            }
            const passed = a <= b;
            return { passed, reason: passed ? null : `${attribute} is ${a}, required <= ${b}` };
        }

        case "gt": {
            const a = Number(subjectValue);
            const b = Number(value);
            if (isNaN(a) || isNaN(b)) {
                return { passed: false, reason: `${attribute} gt requires numeric values` };
            }
            const passed = a > b;
            return { passed, reason: passed ? null : `${attribute} is ${a}, required > ${b}` };
        }

        case "lt": {
            const a = Number(subjectValue);
            const b = Number(value);
            if (isNaN(a) || isNaN(b)) {
                return { passed: false, reason: `${attribute} lt requires numeric values` };
            }
            const passed = a < b;
            return { passed, reason: passed ? null : `${attribute} is ${a}, required < ${b}` };
        }

        case "in": {
            if (!Array.isArray(value)) {
                return { passed: false, reason: `${attribute} "in" operator requires value to be an array` };
            }
            const haystack = value.map(v => String(v).toLowerCase());
            const needle   = String(subjectValue ?? "").toLowerCase();
            const passed   = haystack.includes(needle);
            return { passed, reason: passed ? null : `${attribute} "${subjectValue}" not in [${value.join(", ")}]` };
        }

        case "nin": {
            if (!Array.isArray(value)) {
                return { passed: false, reason: `${attribute} "nin" operator requires value to be an array` };
            }
            const haystack = value.map(v => String(v).toLowerCase());
            const needle   = String(subjectValue ?? "").toLowerCase();
            const passed   = !haystack.includes(needle);
            return { passed, reason: passed ? null : `${attribute} "${subjectValue}" must not be in [${value.join(", ")}]` };
        }

        case "contains": {
            // subject attribute is an array; value is a scalar that must be in it
            if (!Array.isArray(subjectValue)) {
                return { passed: false, reason: `${attribute} "contains" requires subject attribute to be an array, got ${typeof subjectValue}` };
            }
            const haystack = subjectValue.map(v => String(v).toLowerCase());
            const passed   = haystack.includes(String(value).toLowerCase());
            return { passed, reason: passed ? null : `${attribute} does not contain "${value}"` };
        }

        case "gte_clearance": {
            // String-based clearance hierarchy
            const userIdx = CLEARANCE_ORDER.indexOf(String(subjectValue ?? "").toLowerCase());
            const reqIdx  = CLEARANCE_ORDER.indexOf(String(value ?? "").toLowerCase());
            if (reqIdx === -1) {
                return { passed: false, reason: `Unknown required clearance level: "${value}"` };
            }
            if (userIdx === -1) {
                return { passed: false, reason: `User has no recognised clearance level (got "${subjectValue}")` };
            }
            const passed = userIdx >= reqIdx;
            return { passed, reason: passed ? null : `clearance "${subjectValue}" is below required "${value}"` };
        }

        default:
            return { passed: false, reason: `Unknown operator: "${op}"` };
    }
}

/**
 * Evaluate an inline policy (array of conditions, logical AND).
 *
 * @param {Array}  allOf            - array of condition objects
 * @param {Object} subjectAttributes - flat subject attributes from loadAccessProfile
 * @returns {{ passed: boolean, failedConditions: Array }}
 */
function evaluateInlinePolicy(allOf, subjectAttributes) {
    const failedConditions = [];

    for (const condition of allOf) {
        const { passed, reason } = evaluateCondition(condition, subjectAttributes);
        if (!passed) {
            failedConditions.push({
                attribute: condition.attribute,
                op:        condition.op,
                value:     condition.value,
                reason,
            });
        }
    }

    return {
        passed: failedConditions.length === 0,
        failedConditions,
    };
}

module.exports = { evaluateInlinePolicy, evaluateCondition, CLEARANCE_ORDER };
