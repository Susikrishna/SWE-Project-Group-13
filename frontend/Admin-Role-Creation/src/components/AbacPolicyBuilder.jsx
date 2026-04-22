import { useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────
const OPERATORS = [
    { value: "eq",            label: "equals",              hint: "exact match" },
    { value: "neq",           label: "not equals",          hint: "must differ" },
    { value: "in",            label: "is one of",           hint: "comma-separated list" },
    { value: "nin",           label: "is not one of",       hint: "comma-separated list" },
    { value: "gte_clearance", label: "clearance ≥",         hint: "public < internal < confidential < secret" },
];

const ATTRIBUTES = [
    { value: "department",   label: "Department",    placeholder: "e.g. engineering" },
    { value: "clearance",    label: "Clearance",     placeholder: "public / internal / confidential / secret" },
    { value: "location",     label: "Location",      placeholder: "e.g. office, remote" },
    { value: "employeeType", label: "Employee Type", placeholder: "fulltime / contractor / intern" },
    { value: "customTags",   label: "Custom Tag",    placeholder: "e.g. beta-tester" },
];

const CLEARANCE_LEVELS = ["public", "internal", "confidential", "secret"];

// ─── Empty builders ────────────────────────────────────────────────────────────
const emptyCondition  = () => ({ attribute: "department", operator: "eq", value: "" });
const emptyPolicy     = (permKey = "") => ({ permissionKey: permKey, label: "", conditions: [emptyCondition()] });

// ─── AbacPolicyBuilder ────────────────────────────────────────────────────────
/**
 * Props:
 *   policies        {Array}    - current abacPolicies array
 *   onChange        {Function} - called with new policies array on every change
 *   permissions     {string[]} - list of permission keys available (from RBAC selection)
 */
export default function AbacPolicyBuilder({ policies = [], onChange, permissions = [] }) {
    const [expanded, setExpanded] = useState(new Set([0]));

    const update = (next) => onChange(next);

    const addPolicy = () => {
        const next = [...policies, emptyPolicy()];
        update(next);
        setExpanded(prev => new Set([...prev, next.length - 1]));
    };

    const removePolicy = (idx) => {
        const next = policies.filter((_, i) => i !== idx);
        update(next);
    };

    const updatePolicy = (idx, field, val) => {
        const next = policies.map((p, i) => i === idx ? { ...p, [field]: val } : p);
        update(next);
    };

    const addCondition = (pIdx) => {
        const next = policies.map((p, i) =>
            i === pIdx ? { ...p, conditions: [...p.conditions, emptyCondition()] } : p
        );
        update(next);
    };

    const removeCondition = (pIdx, cIdx) => {
        const next = policies.map((p, i) =>
            i === pIdx ? { ...p, conditions: p.conditions.filter((_, ci) => ci !== cIdx) } : p
        );
        update(next);
    };

    const updateCondition = (pIdx, cIdx, field, val) => {
        const next = policies.map((p, i) =>
            i === pIdx
                ? { ...p, conditions: p.conditions.map((c, ci) => ci === cIdx ? { ...c, [field]: val } : c) }
                : p
        );
        update(next);
    };

    const toggleExpand = (idx) => {
        setExpanded(prev => {
            const n = new Set(prev);
            n.has(idx) ? n.delete(idx) : n.add(idx);
            return n;
        });
    };

    const permOptions = ["*", ...permissions];

    return (
        <div style={S.root}>
            <style>{css}</style>

            {/* ── Header ── */}
            <div style={S.sectionHeader}>
                <div>
                    <span style={S.sectionTitle}>ABAC Policies</span>
                    <span style={S.sectionSub}> — fine-grained attribute conditions</span>
                </div>
                <button className="abac-add-policy-btn" onClick={addPolicy}>+ Add Policy</button>
            </div>

            {policies.length === 0 && (
                <div style={S.empty}>
                    No ABAC policies. This role uses RBAC only — all users with the role get all permissions.
                    Add a policy to restrict specific permissions based on user attributes.
                </div>
            )}

            {policies.map((policy, pIdx) => (
                <div key={pIdx} style={S.policyCard}>
                    {/* ── Policy header ── */}
                    <div style={S.policyHeader} onClick={() => toggleExpand(pIdx)}>
                        <div style={S.policyHeaderLeft}>
                            <span style={S.chevron}>{expanded.has(pIdx) ? "▾" : "▸"}</span>
                            <div style={S.policyMeta}>
                                <span style={S.policyPermBadge}>
                                    {policy.permissionKey || "(no permission set)"}
                                </span>
                                {policy.label && (
                                    <span style={S.policyLabel}>{policy.label}</span>
                                )}
                                <span style={S.condCount}>
                                    {policy.conditions.length} condition{policy.conditions.length !== 1 ? "s" : ""}
                                </span>
                            </div>
                        </div>
                        <button
                            className="abac-remove-btn"
                            onClick={(e) => { e.stopPropagation(); removePolicy(pIdx); }}
                        >✕</button>
                    </div>

                    {/* ── Policy body ── */}
                    {expanded.has(pIdx) && (
                        <div style={S.policyBody}>
                            {/* Permission key */}
                            <div style={S.row}>
                                <div style={S.field}>
                                    <label style={S.label}>Applies to permission</label>
                                    <select
                                        style={S.select}
                                        value={policy.permissionKey}
                                        onChange={e => updatePolicy(pIdx, "permissionKey", e.target.value)}
                                    >
                                        <option value="">— select —</option>
                                        {permOptions.map(p => (
                                            <option key={p} value={p}>{p === "*" ? "* (all permissions)" : p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={S.field}>
                                    <label style={S.label}>Policy label (optional)</label>
                                    <input
                                        style={S.input}
                                        placeholder="e.g. Finance dept only"
                                        value={policy.label}
                                        onChange={e => updatePolicy(pIdx, "label", e.target.value)}
                                    />
                                </div>
                            </div>

                            {/* Conditions */}
                            <div style={S.conditionsWrap}>
                                <div style={S.conditionsHeader}>
                                    <span style={S.condLabel}>Conditions <span style={S.andBadge}>ALL must pass</span></span>
                                </div>

                                {policy.conditions.map((cond, cIdx) => (
                                    <ConditionRow
                                        key={cIdx}
                                        cond={cond}
                                        onChange={(field, val) => updateCondition(pIdx, cIdx, field, val)}
                                        onRemove={() => removeCondition(pIdx, cIdx)}
                                        canRemove={policy.conditions.length > 1}
                                    />
                                ))}

                                <button
                                    className="abac-add-cond-btn"
                                    onClick={() => addCondition(pIdx)}
                                >+ Add condition</button>
                            </div>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}

// ─── Single condition row ─────────────────────────────────────────────────────
function ConditionRow({ cond, onChange, onRemove, canRemove }) {
    const attrMeta = ATTRIBUTES.find(a => a.value === cond.attribute);
    const isList   = cond.operator === "in" || cond.operator === "nin";
    const isClear  = cond.operator === "gte_clearance";

    return (
        <div style={S.condRow}>
            {/* Attribute */}
            <select style={S.selectSm} value={cond.attribute} onChange={e => onChange("attribute", e.target.value)}>
                {ATTRIBUTES.map(a => (
                    <option key={a.value} value={a.value}>{a.label}</option>
                ))}
            </select>

            {/* Operator */}
            <select style={S.selectSm} value={cond.operator} onChange={e => onChange("operator", e.target.value)}>
                {OPERATORS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>

            {/* Value */}
            {isClear ? (
                <select style={S.selectSm} value={cond.value} onChange={e => onChange("value", e.target.value)}>
                    <option value="">— level —</option>
                    {CLEARANCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                </select>
            ) : isList ? (
                <input
                    style={{ ...S.inputSm, flex: 2 }}
                    placeholder="val1, val2, ..."
                    value={Array.isArray(cond.value) ? cond.value.join(", ") : cond.value}
                    onChange={e => onChange("value", e.target.value.split(",").map(v => v.trim()).filter(Boolean))}
                />
            ) : (
                <input
                    style={{ ...S.inputSm, flex: 2 }}
                    placeholder={attrMeta?.placeholder || "value"}
                    value={cond.value}
                    onChange={e => onChange("value", e.target.value)}
                />
            )}

            {canRemove && (
                <button className="abac-remove-cond-btn" onClick={onRemove}>✕</button>
            )}
        </div>
    );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = {
    root: { display: "flex", flexDirection: "column", gap: 10 },
    sectionHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    sectionTitle:  { fontSize: 13, fontWeight: 700, color: "#0d0a41", textTransform: "uppercase", letterSpacing: "0.5px" },
    sectionSub:    { fontSize: 12, color: "#9ca3af", fontWeight: 400 },
    empty: {
        fontSize: 13, color: "#9ca3af", background: "#f9fafb",
        border: "1px dashed #d1d5db", borderRadius: 8, padding: "14px 16px", lineHeight: 1.6,
    },
    policyCard: { border: "1px solid #e4e7f0", borderRadius: 10, overflow: "hidden", background: "#fff" },
    policyHeader: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 14px", cursor: "pointer", background: "#f8f9ff",
        borderBottom: "1px solid #e4e7f0",
    },
    policyHeaderLeft: { display: "flex", alignItems: "center", gap: 10 },
    chevron: { fontSize: 12, color: "#6b7280" },
    policyMeta: { display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" },
    policyPermBadge: {
        fontSize: 12, fontWeight: 700, fontFamily: "'DM Mono', monospace",
        background: "#eef2ff", color: "#4338ca", padding: "2px 8px", borderRadius: 5,
    },
    policyLabel: { fontSize: 12, color: "#6b7280", fontStyle: "italic" },
    condCount:   { fontSize: 11, color: "#9ca3af" },
    policyBody:  { padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14 },
    row:   { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
    field: { display: "flex", flexDirection: "column", gap: 5 },
    label: { fontSize: 11, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" },
    select: {
        padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db",
        fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none",
        background: "#f9fafb", color: "#374151",
    },
    input: {
        padding: "8px 10px", borderRadius: 7, border: "1px solid #d1d5db",
        fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none",
        background: "#f9fafb", color: "#374151",
    },
    conditionsWrap: { display: "flex", flexDirection: "column", gap: 8 },
    conditionsHeader: { display: "flex", alignItems: "center", justifyContent: "space-between" },
    condLabel: { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.5px" },
    andBadge: {
        fontSize: 10, fontWeight: 700, background: "#fef9c3", color: "#a16207",
        borderRadius: 4, padding: "1px 6px", marginLeft: 6,
    },
    condRow: { display: "flex", alignItems: "center", gap: 8, background: "#f9fafb", padding: "8px 10px", borderRadius: 7 },
    selectSm: {
        padding: "5px 8px", borderRadius: 6, border: "1px solid #d1d5db",
        fontSize: 12, fontFamily: "'DM Sans', sans-serif", outline: "none",
        background: "#fff", color: "#374151", flex: 1,
    },
    inputSm: {
        padding: "5px 8px", borderRadius: 6, border: "1px solid #d1d5db",
        fontSize: 12, fontFamily: "'DM Mono', monospace", outline: "none",
        background: "#fff", color: "#374151", flex: 1,
    },
};

const css = `
.abac-add-policy-btn {
    padding: 5px 14px; background: #4f46e5; color: #fff; border: none;
    border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; transition: background 0.15s;
}
.abac-add-policy-btn:hover { background: #4338ca; }
.abac-remove-btn {
    background: none; border: none; color: #9ca3af; font-size: 14px;
    cursor: pointer; padding: 2px 6px; border-radius: 5px; transition: color 0.15s;
}
.abac-remove-btn:hover { color: #ef4444; }
.abac-add-cond-btn {
    padding: 5px 10px; background: #fff; color: #4f46e5;
    border: 1px dashed #a5b4fc; border-radius: 6px;
    font-size: 12px; font-weight: 600; cursor: pointer;
    font-family: 'DM Sans', sans-serif; align-self: flex-start;
    transition: background 0.15s;
}
.abac-add-cond-btn:hover { background: #eef2ff; }
.abac-remove-cond-btn {
    background: none; border: none; color: #d1d5db; font-size: 13px;
    cursor: pointer; padding: 2px 4px; flex-shrink: 0; transition: color 0.15s;
}
.abac-remove-cond-btn:hover { color: #ef4444; }
`;
