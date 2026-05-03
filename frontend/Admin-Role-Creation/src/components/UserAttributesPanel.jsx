import { useState } from "react";
import axios from "axios";

const CLEARANCE_LEVELS  = ["public", "internal", "confidential", "secret"];
const EMPLOYEE_TYPES    = ["fulltime", "contractor", "intern", "parttime"];
const COMMON_LOCATIONS  = ["office", "remote", "branch-hyd", "branch-mum", "branch-del"];
const COMMON_DEPTS      = ["engineering", "finance", "hr", "marketing", "operations", "legal", "academic", "admin"];

/**
 * Props:
 *   user      {Object}   - full user object (with attributes field)
 *   onSaved   {Function} - called after successful save so parent can refetch
 *   onClose   {Function} - close panel
 */
export default function UserAttributesPanel({ user, onSaved, onClose }) {
    const init = user?.attributes ?? {};
    const [dept,     setDept]     = useState(init.department   ?? "");
    const [clearance,setClearance]= useState(init.clearance    ?? "");
    const [location, setLocation] = useState(init.location     ?? "");
    const [empType,  setEmpType]  = useState(init.employeeType ?? "");
    const [tagsInput,setTagsInput]= useState((init.customTags ?? []).join(", "));
    const [saving,   setSaving]   = useState(false);
    const [msg,      setMsg]      = useState(null);

    const handleSave = async () => {
        setSaving(true);
        setMsg(null);
        try {
            const customTags = tagsInput.split(",").map(t => t.trim()).filter(Boolean);
            const userServiceUrl = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3003';
            await axios.put(`${userServiceUrl}/user/attributes`, {
                username: user.username,
                attributes: {
                    department:   dept      || null,
                    clearance:    clearance || null,
                    location:     location  || null,
                    employeeType: empType   || null,
                    customTags,
                },
            });
            setMsg({ type: "success", text: "Attributes saved successfully." });
            onSaved?.();
        } catch (err) {
            setMsg({ type: "error", text: err.response?.data?.error || err.message });
        } finally {
            setSaving(false);
        }
    };

    return (
        <div style={S.overlay} onClick={onClose}>
            <div style={S.panel} onClick={e => e.stopPropagation()}>
                <style>{css}</style>

                {/* Header */}
                <div style={S.header}>
                    <div>
                        <h3 style={S.title}>ABAC Attributes</h3>
                        <p style={S.sub}>{user.username}</p>
                    </div>
                    <button className="attr-close-btn" onClick={onClose}>✕</button>
                </div>

                <div style={S.explainer}>
                    These attributes are evaluated at runtime against ABAC policies on the user's roles.
                    Permissions are only granted when <strong>all conditions pass</strong>.
                </div>

                {/* Fields */}
                <div style={S.grid}>
                    <Field label="Department">
                        <select style={S.select} value={dept} onChange={e => setDept(e.target.value)}>
                            <option value="">— none —</option>
                            {COMMON_DEPTS.map(d => <option key={d} value={d}>{d}</option>)}
                            <option value="__custom__">custom…</option>
                        </select>
                        {dept === "__custom__" && (
                            <input style={S.input} placeholder="type department" onChange={e => setDept(e.target.value)} autoFocus />
                        )}
                    </Field>

                    <Field label="Clearance Level">
                        <select style={S.select} value={clearance} onChange={e => setClearance(e.target.value)}>
                            <option value="">— none —</option>
                            {CLEARANCE_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                        <div style={S.clearanceBand}>
                            {CLEARANCE_LEVELS.map((l, i) => (
                                <span
                                    key={l}
                                    style={{
                                        ...S.clearancePip,
                                        background: i === 0 ? "#86efac" : i === 1 ? "#fde68a" : i === 2 ? "#fca5a5" : "#f87171",
                                        opacity: clearance === l ? 1 : 0.3,
                                        fontWeight: clearance === l ? 700 : 400,
                                    }}
                                >{l}</span>
                            ))}
                        </div>
                    </Field>

                    <Field label="Location">
                        <select style={S.select} value={location} onChange={e => setLocation(e.target.value)}>
                            <option value="">— none —</option>
                            {COMMON_LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                            <option value="__custom__">custom…</option>
                        </select>
                        {location === "__custom__" && (
                            <input style={S.input} placeholder="type location" onChange={e => setLocation(e.target.value)} autoFocus />
                        )}
                    </Field>

                    <Field label="Employee Type">
                        <select style={S.select} value={empType} onChange={e => setEmpType(e.target.value)}>
                            <option value="">— none —</option>
                            {EMPLOYEE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </Field>
                </div>

                <Field label="Custom Tags (comma-separated)" style={{ marginTop: 12 }}>
                    <input
                        style={S.input}
                        placeholder="e.g. beta-tester, on-boarding"
                        value={tagsInput}
                        onChange={e => setTagsInput(e.target.value)}
                    />
                    {tagsInput && (
                        <div style={S.tagPreview}>
                            {tagsInput.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                                <span key={t} style={S.tag}>{t}</span>
                            ))}
                        </div>
                    )}
                </Field>

                {msg && (
                    <div style={{ ...S.msg, background: msg.type === "success" ? "#f0fdf4" : "#fef2f2", color: msg.type === "success" ? "#16a34a" : "#dc2626", borderColor: msg.type === "success" ? "#bbf7d0" : "#fecaca" }}>
                        {msg.text}
                    </div>
                )}

                <div style={S.footer}>
                    <button className="attr-cancel-btn" onClick={onClose}>Cancel</button>
                    <button className="attr-save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving…" : "Save Attributes"}
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children, style }) {
    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
            <label style={S.label}>{label}</label>
            {children}
        </div>
    );
}

const S = {
    overlay: {
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
        display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100,
    },
    panel: {
        background: "#fff", borderRadius: 14, padding: "28px 28px 24px",
        width: 540, maxWidth: "92vw", maxHeight: "88vh", overflowY: "auto",
        display: "flex", flexDirection: "column", gap: 16,
        boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
    },
    header:  { display: "flex", alignItems: "flex-start", justifyContent: "space-between" },
    title:   { fontSize: 17, fontWeight: 700, color: "#0d0a41", margin: 0 },
    sub:     { fontSize: 13, color: "#6b7280", margin: "3px 0 0", fontFamily: "'DM Mono', monospace" },
    explainer: {
        fontSize: 12, color: "#6b7280", background: "#f0f4ff", border: "1px solid #dde3ff",
        borderRadius: 8, padding: "10px 13px", lineHeight: 1.6,
    },
    grid:    { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
    label:   { fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.6px" },
    select:  { padding: "8px 10px", borderRadius: 8, border: "1px solid #e4e7f0", fontSize: 13, outline: "none", background: "#f9fafb", color: "#374151", fontFamily: "'DM Sans', sans-serif" },
    input:   { padding: "8px 10px", borderRadius: 8, border: "1px solid #e4e7f0", fontSize: 13, outline: "none", background: "#f9fafb", color: "#374151", fontFamily: "'DM Sans', sans-serif" },
    clearanceBand: { display: "flex", gap: 4, marginTop: 4 },
    clearancePip: { fontSize: 10, fontWeight: 500, padding: "2px 7px", borderRadius: 4, transition: "opacity 0.2s" },
    tagPreview: { display: "flex", flexWrap: "wrap", gap: 5, marginTop: 4 },
    tag:  { fontSize: 11, background: "#eef2ff", color: "#4338ca", borderRadius: 5, padding: "2px 8px", fontWeight: 600 },
    msg:  { fontSize: 13, border: "1px solid", borderRadius: 8, padding: "10px 13px", fontWeight: 500 },
    footer: { display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 4 },
};

const css = `
.attr-close-btn  { background: none; border: none; font-size: 17px; cursor: pointer; color: #9ca3af; padding: 2px 6px; border-radius: 6px; }
.attr-close-btn:hover { color: #ef4444; }
.attr-cancel-btn { padding: 8px 18px; border-radius: 8px; border: 1px solid #e4e7f0; background: #fff; color: #6b7280; font-size: 13px; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.attr-cancel-btn:hover { background: #f9fafb; }
.attr-save-btn { padding: 8px 20px; border-radius: 8px; border: none; background: #4f46e5; color: #fff; font-size: 13px; font-weight: 700; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
.attr-save-btn:hover:not(:disabled) { background: #4338ca; }
.attr-save-btn:disabled { opacity: 0.45; cursor: not-allowed; }
`;
