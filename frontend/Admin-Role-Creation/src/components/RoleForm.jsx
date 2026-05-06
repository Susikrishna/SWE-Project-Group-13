import { useState, useEffect } from "react";
import axios from "axios";
const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3002';
const registryUrl = import.meta.env.VITE_REGISTRY_URL || 'http://localhost:5001';

function RoleForm() {
    const [roleName, setRoleName] = useState("");
    const [isTemp, setIsTemp] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");
    
    const [permissionSets, setPermissionSets] = useState([]);  // all sets from registry
    const [selectedSetIds, setSelectedSetIds] = useState(new Set()); // attached to this role
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showSummaryDetails, setShowSummaryDetails] = useState(false);

    useEffect(() => {
        const fetchRegistries = async () => {
            try {
                // Fetch permission sets from registry
                const setsRes = await axios.get(`${registryUrl}/registry/permission-sets`);
                setPermissionSets(Array.isArray(setsRes.data) ? setsRes.data : []);
            } catch (err) {
                setError("Failed to load permission sets. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchRegistries();
    }, []);
    
    // ── Derived: inherited permissions/MFEs from selected sets ─────────────
    // Dynamically derive from the populated mfes.mfeId structure — no static apis array.
    const inheritedPermissions = new Set(
        Array.from(selectedSetIds).flatMap(id => {
            const set = permissionSets.find(s => s._id === id);
            if (!set) return [];
            return (set.mfes || []).flatMap(entry => {
                const mfe = entry.mfeId || {};
                const selectedComps = new Set(entry.components || []);
                const hasFilter = selectedComps.size > 0;
                const rootPerms = mfe.allowedPermissions || [];
                if (!hasFilter) {
                    // All component permissions as well
                    const compPerms = (mfe.components || []).flatMap(c => c.allowedPermissions || []);
                    return [...rootPerms, ...compPerms];
                }
                const compPerms = (mfe.components || [])
                    .filter(c => selectedComps.has(c.route))
                    .flatMap(c => c.allowedPermissions || []);
                return [...rootPerms, ...compPerms];
            });
        })
    );
    const inheritedMfes = new Set(
        Array.from(selectedSetIds).flatMap(id => {
            const set = permissionSets.find(s => s._id === id);
            if (!set) return [];
            return (set.mfes || []).flatMap(entry => {
                const mfe = entry.mfeId || {};
                const feature = mfe.feature;
                if (!feature) return [];
                const selectedComps = entry.components || [];
                if (selectedComps.length === 0) return [feature]; // whole MFE
                return selectedComps.map(route => `${feature}::${route}`);
            });
        })
    );

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedSetIds.size === 0) {
            alert("Please select at least one permission set.");
            return;
        }

        const roleData = {
            name: roleName,
            permissions: [], // Ignored by auz-engine, sent for legacy compatibility
            mfeAccess: [],   // Ignored by auz-engine, sent for legacy compatibility
            permissionSets: Array.from(selectedSetIds),
            isTemp,
            ...(isTemp && { expiresAt }),
        };

        try {
            await axios.post(`${serverUrl}/roles`, roleData, {
                headers: { "Content-Type": "application/json" },
            });
            alert(`Role "${roleName}" created successfully!`);
            
            setRoleName("");
            setIsTemp(false);
            setExpiresAt("");
            setSelectedSetIds(new Set());
        } catch (err) {
            alert(err.response?.data?.error || "Failed to create role.");
        }
    };

    return (
        <>
            <style>{styles}</style>
            <div className="role-container">
                <form className="role-form" onSubmit={handleSubmit}>
                    
                    <div className="form-header">
                        <h2>Create Role</h2>
                    </div>
                    
                    <div className="form-group">
                        <label>Role Name</label>
                        <input
                            type="text"
                            value={roleName}
                            placeholder="ex: admin, viewer, editor"
                            onChange={(e) => setRoleName(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="form-divider" />

                    {/* ── Permission Sets Section ── */}
                    <p className="section-title">Permission Sets</p>
                    <p className="section-subtitle">
                        Attach reusable sets of MFEs + APIs. Sets are atomic — attach or detach the whole set.
                    </p>
                    {loading ? (
                        <p className="status-text loading-pulse">Loading sets…</p>
                    ) : error ? (
                        <p className="status-text error">{error}</p>
                    ) : permissionSets.length === 0 ? (
                        <p className="status-text">No permission sets found. Create one in the Registry first.</p>
                    ) : (
                        <div className="service-list">
                            {permissionSets.map(set => {
                                const attached = selectedSetIds.has(set._id);
                                return (
                                    <div
                                        key={set._id}
                                        className={`service-card ${attached ? "checked" : ""}`}
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setSelectedSetIds(prev => {
                                            const next = new Set(prev);
                                            attached ? next.delete(set._id) : next.add(set._id);
                                            return next;
                                        })}
                                    >
                                        <div className="service-header" style={{ pointerEvents: "none" }}>
                                            <input type="checkbox" checked={attached} readOnly />
                                            <div style={{ flex: 1 }}>
                                                <span className="service-name">{set.name}</span>
                                                {set.description && (
                                                    <span style={{ marginLeft: 8, fontSize: 12, color: "#94a3b8" }}>{set.description}</span>
                                                )}
                                            </div>
                                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                                                {(set.mfes || []).map(m => (
                                                    <span key={m._id} style={{ background: "#f5f3ff", color: "#7c3aed", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                                                        {m.name || m.feature}
                                                    </span>
                                                ))}
                                                {(set.apis || []).slice(0, 3).map(a => (
                                                    <span key={a._id} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontFamily: "'JetBrains Mono', monospace" }}>
                                                        {a.permissionKey}
                                                    </span>
                                                ))}
                                                {(set.apis || []).length > 3 && (
                                                    <span style={{ background: "#f1f5f9", color: "#64748b", borderRadius: 10, padding: "2px 8px", fontSize: 11 }}>
                                                        +{set.apis.length - 3} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* ── Effective Permissions Summary ── */}
                    {selectedSetIds.size > 0 && (
                        <>
                            <div className="form-divider" />
                            <div 
                                className="accordion-header" 
                                onClick={() => setShowSummaryDetails(!showSummaryDetails)}
                            >
                                <div>
                                    <p className="section-title" style={{ color: "#0f172a", marginBottom: 0 }}>Effective Permissions Summary</p>
                                    <p className="section-subtitle" style={{ marginBottom: 0 }}>
                                        Click to view the specific permissions this role will get.
                                    </p>
                                </div>
                                <span className="accordion-icon">{showSummaryDetails ? "▲" : "▼"}</span>
                            </div>

                            {showSummaryDetails && (
                                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 14, padding: "18px 20px", marginTop: "16px" }}>
                                    {/* MFE Access */}
                                    <div style={{ marginBottom: 14 }}>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
                                            MFE Component Access
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {Array.from(inheritedMfes).map(m => (
                                                <span key={m} style={{ background: "#fff7ed", color: "#f97316", borderRadius: 10, padding: "3px 10px", fontSize: 12, fontWeight: 500, border: "1px solid #fed7aa" }}>
                                                    {m}
                                                </span>
                                            ))}
                                            {inheritedMfes.size === 0 && (
                                                <span style={{ color: "#94a3b8", fontSize: 13 }}>None</span>
                                            )}
                                        </div>
                                    </div>
                                    {/* API Permissions */}
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.6px", marginBottom: 8 }}>
                                            Backend API Access
                                        </div>
                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                            {Array.from(inheritedPermissions).map(p => (
                                                <span key={p} style={{ background: "#f0fdf4", color: "#16a34a", borderRadius: 10, padding: "3px 10px", fontSize: 12, fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, border: "1px solid #bbf7d0" }}>
                                                    {p}
                                                </span>
                                            ))}
                                            {inheritedPermissions.size === 0 && (
                                                <span style={{ color: "#94a3b8", fontSize: 13 }}>None</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    <div className="form-divider" />

                    <label
                        className={`permission-item ${isTemp ? "checked" : ""}`}
                        style={{ marginBottom: "10px" }}
                    >
                        <input type="checkbox" checked={isTemp} onChange={() => setIsTemp(!isTemp)} />
                        <span>Is the Role Temporary?</span>
                    </label>

                    {isTemp && (
                        <div className="date-range">
                            <div className="form-group">
                                <label>Expiration Date</label>
                                <input
                                    type="date"
                                    value={expiresAt}
                                    onChange={(e) => setExpiresAt(e.target.value)}
                                    required={isTemp}
                                />
                            </div>
                        </div>
                    )}

                    <div style={{ marginTop: "32px" }}>
                        <button
                            className="submit-btn"
                            type="submit"
                            disabled={!roleName.trim() || loading}
                        >
                            Create Role
                        </button>
                    </div>

                </form>
            </div>
        </>
    );
}

export default RoleForm;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

.role-container {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    font-family: 'Inter', sans-serif;
    padding: 40px 20px;
    background: #f4f6fb;
    min-height: 100vh;
}

.role-form {
    background: #ffffff;
    border: 1px solid rgba(226, 232, 240, 0.8);
    padding: 48px;
    border-radius: 24px;
    width: 65%;
    max-width: 900px;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.02);
}

.form-header {
    margin-bottom: 40px;
}

.form-header h2 {
    font-size: 28px;
    font-weight: 800;
    color: #0f172a;
    letter-spacing: -0.5px;
    margin: 0;
}

.form-divider {
    height: 1px;
    background: linear-gradient(to right, transparent, rgba(226, 232, 240, 0.8), transparent);
    margin: 36px 0;
}

.form-group {
    margin-bottom: 24px;
}

.form-group label {
    display: block;
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.form-group input[type="text"],
.form-group input[type="date"] {
    width: 100%;
    padding: 14px 18px;
    border-radius: 12px;
    border: 1px solid #cbd5e1;
    background: #f8fafc;
    color: #0f172a;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 500;
    transition: all 0.25s ease;
    box-sizing: border-box;
    outline: none;
}

.form-group input:focus {
    border-color: #090649;
    box-shadow: 0 0 0 4px rgba(9, 6, 73, 0.1);
    background: #ffffff;
}

.section-title {
    font-size: 14px;
    font-weight: 700;
    color: #0f172a;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    margin-bottom: 6px;
}

.section-subtitle {
    font-size: 13px;
    color: #64748b;
    margin-bottom: 24px;
    margin-top: 0;
}

.service-list {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.service-card {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    background: #ffffff;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
    overflow: hidden;
}

.service-card:hover {
    border-color: #cbd5e1;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.service-card.checked {
    border-color: #090649;
    background: #fafbff;
    box-shadow: 0 4px 16px rgba(9, 6, 73, 0.06);
}

.service-header {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    cursor: pointer;
    background: #f8fafc;
    transition: background 0.2s;
}

.service-card.checked .service-header {
    background: #f4f6ff;
}

.service-header:hover {
    background: #f1f5f9;
}

.service-card.checked .service-header:hover {
    background: #eceffc;
}

.service-header input, .permission-item input {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 6px;
    border: 2px solid #cbd5e1;
    background: white;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    flex-shrink: 0;
}

.service-header input:checked, .permission-item input:checked {
    background: #090649;
    border-color: #090649;
}

.service-header input:checked::after, .permission-item input:checked::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 6px;
    width: 4px;
    height: 8px;
    border: solid white;
    border-width: 0 2px 2px 0;
    transform: rotate(45deg);
}

.service-name {
    font-weight: 700;
    color: #1e293b;
    font-size: 15px;
    letter-spacing: 0.5px;
}

.status-text {
    font-size: 14px;
    color: #64748b;
    font-weight: 500;
    padding: 24px;
    text-align: center;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed #cbd5e1;
}

.status-text.error {
    color: #ef4444;
    background: #fef2f2;
    border-color: #fecaca;
}

.status-text.warning {
    color: #f59e0b;
    background: #fffbeb;
    border-color: #fde68a;
}

.loading-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: .5; }
}

.permission-item {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    border-radius: 12px;
    border: 1px solid #e2e8f0;
    background: #ffffff;
    cursor: pointer;
    font-weight: 600;
    color: #334155;
    transition: all 0.2s;
}

.permission-item:hover {
    background: #f8fafc;
}

.permission-item.checked {
    background: #f4f6ff;
    border-color: #090649;
    color: #090649;
}

.date-range {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
    margin-top: 16px;
    padding: 20px;
    background: #f8fafc;
    border-radius: 12px;
    border: 1px dashed #cbd5e1;
}

.submit-btn {
    width: 100%;
    padding: 18px;
    background: #090734;
    color: white;
    border: none;
    border-radius: 14px;
    font-family: 'Inter', sans-serif;
    font-size: 16px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 6px 16px rgba(9, 7, 52, 0.2);
}

.submit-btn:hover:not(:disabled) {
    transform: translateY(-2px);
    background: #0d0a4c;
    box-shadow: 0 10px 20px rgba(9, 7, 52, 0.3);
}

.submit-btn:active:not(:disabled) {
    transform: translateY(1px);
    box-shadow: 0 4px 10px rgba(9, 7, 52, 0.2);
}

.submit-btn:disabled {
    background: #cbd5e1;
    box-shadow: none;
    cursor: not-allowed;
    color: #94a3b8;
}

.accordion-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    padding: 10px 14px;
    background: #f1f5f9;
    border-radius: 8px;
    transition: background 0.2s;
}

.accordion-header:hover {
    background: #e2e8f0;
}

.accordion-icon {
    font-size: 14px;
    color: #64748b;
}
`;
