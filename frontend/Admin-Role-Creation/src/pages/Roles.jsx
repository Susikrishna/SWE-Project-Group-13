import Navbar from "../components/Navbar";
import AbacPolicyBuilder from "../components/AbacPolicyBuilder";
import axios from "axios";
import { useState, useEffect } from "react";

const serverUrl   = import.meta.env.VITE_SERVER_URL || 'http://localhost:3002';
const registryUrl = import.meta.env.VITE_REGISTRY_URL || 'http://localhost:5001';

const RESPONSES = { ALLOW: "ALLOW", DENY: "DENY", NA: "NA" };

function Roles() {
    const [roles,      setRoles]      = useState([]);
    const [error,      setError]      = useState(null);
    const [name,       setName]       = useState("");
    const [editingRole,setEditingRole]= useState(null);
    const [microfrontends, setMicrofrontends] = useState([]);
    const [microservices,  setMicroservices]  = useState([]);
    const [permissionSets, setPermissionSets] = useState([]);  // all sets from registry
    const [editDescription,          setEditDescription]          = useState("");
    const [editIsTemp,               setEditIsTemp]               = useState(false);
    const [editExpiresAt,            setEditExpiresAt]            = useState("");
    const [editSelectedSetIds,       setEditSelectedSetIds]       = useState(new Set()); // attached sets

    // ── NEW: ABAC policies state ──────────────────────────────────────────────
    const [editAbacPolicies, setEditAbacPolicies] = useState([]);
    const [activeTab, setActiveTab] = useState("rbac"); // "rbac" | "abac"

    const getRoles = async () => {
        try {
            const response = await axios.get(`${serverUrl}/roles`);
            setRoles(response.data);
        } catch {
            setError("Failed to fetch roles.");
        }
    };

    const openEditModal = (role) => {
        setName(role.name);
        setEditingRole(role);
        setEditDescription(role.description || "");
        setEditIsTemp(role.isTemp || false);
        setEditExpiresAt(role.expiresAt ? role.expiresAt.split("T")[0] : "");
        setEditSelectedSetIds(new Set((role.permissionSets || []).map(String)));
        setEditAbacPolicies(role.abacPolicies || []);   // ← load existing ABAC policies
        setActiveTab("rbac");
    };

    useEffect(() => { getRoles(); }, []);

    useEffect(() => {
        const fetchRegistries = async () => {
            try {
                const [mfeRes, svcRes, setsRes] = await Promise.all([
                    axios.get(`${registryUrl}/registry/mfes`),
                    axios.get(`${registryUrl}/registry/services`),
                    axios.get(`${registryUrl}/registry/permission-sets`)
                ]);

                const mfes = mfeRes.data.map(m => ({
                    id: m.feature,
                    label: m.name,
                    allowedPermissions: m.allowedPermissions || [],
                    components: (m.components || []).map(c => ({
                        name: c.name,
                        route: c.route,
                        componentKey: `${m.feature}::${c.route}`,
                    })),
                }));

                const groupedServices = {};
                svcRes.data.forEach(api => {
                    if (!groupedServices[api.service]) {
                        groupedServices[api.service] = { id: api.service, label: api.service.toUpperCase(), permissions: [] };
                    }
                    groupedServices[api.service].permissions.push({ resource: api.resource, action: api.action, permissionKey: api.permissionKey });
                });

                setMicrofrontends(mfes);
                setMicroservices(Object.values(groupedServices));
                setPermissionSets(Array.isArray(setsRes.data) ? setsRes.data : []);
            } catch {
                setError("Failed to load services. Please try again.");
            }
        };
        fetchRegistries();
    }, []);

    const closeEditModal = () => { setEditingRole(null); };



    const handleDelete = async (roleId) => {
        try {
            await axios.delete(`${serverUrl}/roles`, { data: { roleId } });
            getRoles();
        } catch { setError("Cannot delete Role"); }
    };

    const handleSubmit = async () => {
        try {
            await axios.put(`${serverUrl}/roles`, {
                roleId:      editingRole._id,
                name,
                description: editDescription,
                permissionSets: Array.from(editSelectedSetIds),
                isTemp:      editIsTemp,
                ...(editIsTemp && { expiresAt: editExpiresAt }),
                abacPolicies: editAbacPolicies,   // ← send ABAC policies
            });
            closeEditModal();
            getRoles();
        } catch { setError("Cannot update Role"); }
    };

    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

    return (
        <div style={{ minHeight: "120vh", background: "#f0f2f9" }}>
            <Navbar />
            <style>{styles}</style>
            <div className="roles-container">
                <div className="roles-header">
                    <h1 className="roles-title">All Roles</h1>
                    <button className="refresh-btn" onClick={getRoles}>↻ Refresh</button>
                </div>

                {error && <div className="status-msg error">{error}</div>}
                {!error && roles.length === 0 && <div className="status-msg">No roles found.</div>}

                <div className="roles-grid">
                    {roles.map((role) => (
                        <div key={role._id} className="role-card">
                            <div className="role-card-header">
                                <span className="role-name">{role.name}</span>
                                {role.isTemp && <span className="badge badge-temp">Temporary</span>}
                                {role.permissionSets?.length > 0 && (
                                    <span className="badge badge-sets">{role.permissionSets.length} Set{role.permissionSets.length !== 1 ? 's' : ''}</span>
                                )}
                                {role.abacPolicies?.length > 0 && (
                                    <span className="badge badge-abac">ABAC</span>
                                )}
                                <button className="edit-button" onClick={() => openEditModal(role)}>Edit</button>
                                <button className="del-button" onClick={() => handleDelete(role._id)}>✕</button>
                            </div>
                            {role.description && <div className="role-description">{role.description}</div>}
                            {role.isTemp && role.expiresAt && (
                                <div className="role-dates"><span>Expires: {formatDate(role.expiresAt)}</span></div>
                            )}

                            {/* ── Permission Sets ── */}
                            {role.permissionSets?.length > 0 && (
                                <div className="role-section">
                                    <div className="section-label">Permission Sets</div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                        {role.permissionSets.map((id) => {
                                            const set = permissionSets.find(s => s._id === String(id));
                                            if (!set) return (
                                                <span key={String(id)} className="tag tag-set">
                                                    🔑 {String(id).slice(-8)}…
                                                </span>
                                            );
                                            return (
                                                <div key={String(id)} style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 8, padding: "7px 10px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: set.mfes?.length || set.apis?.length ? 6 : 0 }}>
                                                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0d9488" }}>🔑 {set.name}</span>
                                                        {set.description && <span style={{ fontSize: 11, color: "#94a3b8" }}>{set.description}</span>}
                                                    </div>
                                                    {(set.mfes?.length > 0 || set.apis?.length > 0) && (
                                                        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                                            {(set.mfes || []).map(m => (
                                                                <span key={m._id} style={{ background: "#f5f3ff", color: "#7c3aed", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                                                                    {m.name || m.feature}
                                                                </span>
                                                            ))}
                                                            {(set.apis || []).map(a => (
                                                                <span key={a._id} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 10, padding: "2px 8px", fontSize: 11, fontFamily: "monospace" }}>
                                                                    {a.permissionKey}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* ── ABAC policy summary ── */}
                            {role.abacPolicies?.length > 0 && (
                                <div className="role-section">
                                    <div className="section-label">ABAC Policies</div>
                                    <div className="tag-list">
                                        {role.abacPolicies.map((p, i) => (
                                            <span key={i} className="tag tag-abac" title={p.conditions?.map(c => `${c.attribute} ${c.operator} ${JSON.stringify(c.value)}`).join(" AND ")}>
                                                {p.permissionKey === "*" ? "all perms" : p.permissionKey}
                                                {p.label ? ` · ${p.label}` : ""}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>


                    ))}
                </div>
            </div>

            {/* ── Edit Modal ── */}
            {editingRole && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Edit Role — {name}</h2>
                            <button className="modal-close" onClick={closeEditModal}>✕</button>
                        </div>

                        {/* Tab bar */}
                        <div className="modal-tabs">
                            <button className={`modal-tab ${activeTab === "rbac" ? "active" : ""}`} onClick={() => setActiveTab("rbac")}>
                                RBAC Permissions
                            </button>
                            <button className={`modal-tab ${activeTab === "abac" ? "active" : ""}`} onClick={() => setActiveTab("abac")}>
                                ABAC Policies
                                {editAbacPolicies.length > 0 && (
                                    <span className="tab-badge">{editAbacPolicies.length}</span>
                                )}
                            </button>
                        </div>

                        {/* ── RBAC Tab ── */}
                        {activeTab === "rbac" && (
                            <>
                                <div className="form-group">
                                    <label>Description</label>
                                    <input type="text" value={editDescription} onChange={e => setEditDescription(e.target.value)} />
                                </div>



                                {/* ── Permission Sets ── */}
                                <p className="section-title">Permission Sets</p>
                                {permissionSets.length === 0 ? (
                                    <p className="status-text">No permission sets. Create one in the Registry.</p>
                                ) : (
                                    <div className="service-list">
                                        {permissionSets.map(set => {
                                            const attached = editSelectedSetIds.has(set._id);
                                            return (
                                                <div
                                                    key={set._id}
                                                    className={`service-card ${attached ? "checked" : ""}`}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => setEditSelectedSetIds(prev => {
                                                        const next = new Set(prev);
                                                        attached ? next.delete(set._id) : next.add(set._id);
                                                        return next;
                                                    })}
                                                >
                                                    <div className="service-header" style={{ pointerEvents: "none" }}>
                                                        <input type="checkbox" checked={attached} readOnly />
                                                        <div style={{ flex: 1 }}>
                                                            <span className="service-name">{set.name}</span>
                                                            {set.description && <span style={{ marginLeft: 8, fontSize: 11, color: "#9ca3af" }}>{set.description}</span>}
                                                        </div>
                                                        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                                                            {(set.mfes || []).map(m => (
                                                                <span key={m._id} style={{ background: "#f5f3ff", color: "#7c3aed", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontWeight: 600 }}>{m.name || m.feature}</span>
                                                            ))}
                                                            {(set.apis || []).slice(0, 2).map(a => (
                                                                <span key={a._id} style={{ background: "#e0f2fe", color: "#0369a1", borderRadius: 10, padding: "1px 7px", fontSize: 10, fontFamily: "monospace" }}>{a.permissionKey}</span>
                                                            ))}
                                                            {(set.apis || []).length > 2 && <span style={{ background: "#f1f5f9", color: "#64748b", borderRadius: 10, padding: "1px 7px", fontSize: 10 }}>+{set.apis.length - 2}</span>}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}



                                <div className="form-divider" />
                                <div className={`permission-item ${editIsTemp ? "checked" : ""}`} onClick={() => setEditIsTemp(!editIsTemp)}>
                                    <input type="checkbox" checked={editIsTemp} readOnly />
                                    <label>Is the Role Temporary?</label>
                                </div>
                                {editIsTemp && (
                                    <div className="form-group" style={{ marginTop: 10 }}>
                                        <label>Expiration Date</label>
                                        <input type="date" value={editExpiresAt} onChange={e => setEditExpiresAt(e.target.value)} required />
                                    </div>
                                )}
                            </>
                        )}


                        {/* ── ABAC Tab ── */}
                        {activeTab === "abac" && (
                            <AbacPolicyBuilder
                                policies={editAbacPolicies}
                                onChange={setEditAbacPolicies}
                                permissions={Array.from(new Set(
                                    Array.from(editSelectedSetIds).flatMap(id => {
                                        const s = permissionSets.find(x => x._id === id);
                                        return s ? (s.apis || []).map(a => a.permissionKey || a) : [];
                                    })
                                ))}
                            />
                        )}

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={closeEditModal}>Cancel</button>
                            <button className="submit-btn" onClick={handleSubmit}>Save Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Roles;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.roles-container { padding: 32px; font-family: 'DM Sans', sans-serif; max-width: 1100px; margin: 0 auto; }
.roles-header    { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.roles-title     { font-size: 22px; font-weight: 700; color: #0d0a41; margin: 0; }
.refresh-btn     { padding: 7px 16px; border-radius: 8px; border: 1px solid #e4e7f0; background: #fff; color: #4f46e5; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.refresh-btn:hover { background: #eef2ff; }
.status-msg      { text-align: center; color: #6b7280; font-size: 14px; padding: 48px 0; }
.status-msg.error { color: #ef4444; }
.roles-grid      { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

.role-card       { background: #fff; border-radius: 12px; border: 1px solid #e4e7f0; padding: 20px; box-shadow: 0 1px 4px rgba(79,70,229,0.06); display: flex; flex-direction: column; gap: 14px; transition: box-shadow 0.15s; }
.role-card:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.10); }
.role-card-header { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }
.role-name       { font-size: 16px; font-weight: 700; color: #0d0a41; }
.badge           { padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
.badge-temp      { background: #fff7ed; color: #f97316; border: 1px solid #fed7aa; }
.badge-abac      { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.badge-sets      { background: #ecfdf5; color: #0d9488; border: 1px solid #99f6e4; }
.role-description { font-size: 13px; color: #6b7280; line-height: 1.5; }
.role-dates      { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #f97316; background: #fff7ed; padding: 6px 10px; border-radius: 8px; }
.role-section    { display: flex; flex-direction: column; gap: 8px; }
.section-label   { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.6px; color: #9ca3af; }
.tag-list        { display: flex; flex-wrap: wrap; gap: 6px; }
.tag             { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.tag-purple      { background: #eef2ff; color: #4f46e5; }
.tag-green       { background: #f0fdf4; color: #16a34a; }
.tag-set         { background: #f0fdfa; color: #0d9488; border: 1px solid #99f6e4; font-size: 11px; font-weight: 600; }
.tag-abac        { background: #fef9c3; color: #92400e; border: 1px solid #fde68a; font-size: 11px; font-family: 'DM Mono', monospace; cursor: default; }
.empty-tag       { font-size: 12px; color: #d1d5db; }

.edit-button     { background: #f0f2f9; color: #4f46e5; padding: 4px 10px; border-radius: 8px; border: 1px solid #e4e7f0; cursor: pointer; font-size: 13px; transition: background 0.15s; }
.edit-button:hover { background: #eef2ff; }
.del-button      { background: #d01d1d; color: #ffffff; padding: 4px 10px; border-radius: 8px; border: none; cursor: pointer; font-size: 13px; font-weight: 600; margin-left: auto; transition: background 0.15s; }
.del-button:hover { background: #b01515; }

.modal-overlay   { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal           { background: #fff; border-radius: 12px; padding: 28px; width: 520px; max-width: 92vw; max-height: 87vh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
.modal-header    { display: flex; align-items: center; justify-content: space-between; }
.modal-header h2 { font-size: 18px; font-weight: 700; color: #0d0a41; margin: 0; }
.modal-close     { background: none; border: none; font-size: 16px; cursor: pointer; color: #6b7280; }
.modal-close:hover { color: #d01d1d; }

.modal-tabs      { display: flex; gap: 4px; border-bottom: 1px solid #e4e7f0; }
.modal-tab       { padding: 7px 16px; border: none; background: none; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 500; color: #6b7280; cursor: pointer; border-radius: 8px 8px 0 0; border-bottom: 2px solid transparent; margin-bottom: -1px; transition: color 0.15s; }
.modal-tab:hover { color: #0d0a41; background: #f5f5ff; }
.modal-tab.active { color: #4f46e5; border-bottom-color: #4f46e5; font-weight: 700; }
.tab-badge       { margin-left: 6px; background: #4f46e5; color: #fff; border-radius: 10px; padding: 1px 6px; font-size: 10px; font-weight: 700; }

.form-divider    { height: 1px; background: #e4e7f0; margin: 4px 0; }
.section-title   { font-size: 13px; font-weight: 700; color: #0d0a41; margin: 0 0 8px 0; text-transform: uppercase; letter-spacing: 0.5px; }
.status-text     { font-size: 13px; color: #9ca3af; margin: 0; }
.status-text.warning { color: #f59e0b; }

.form-group      { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 12px; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
.form-group input { padding: 8px 12px; border-radius: 8px; border: 1px solid #e4e7f0; font-size: 14px; font-family: 'DM Sans', sans-serif; outline: none; }
.form-group input:focus { border-color: #4f46e5; }

.service-list    { display: flex; flex-direction: column; gap: 8px; }
.service-card    { border: 1px solid #e4e7f0; border-radius: 8px; padding: 10px 12px; cursor: pointer; transition: border-color 0.15s, background 0.15s; }
.service-card.checked { border-color: #4f46e5; background: #f5f3ff; }
.service-header  { display: flex; align-items: center; gap: 10px; }
.service-name    { font-size: 14px; font-weight: 600; color: #374151; }
.actions-list    { margin-top: 10px; padding-top: 10px; border-top: 1px solid #e4e7f0; }
.actions-title   { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.5px; margin: 0 0 8px 0; }
.actions-grid    { display: flex; flex-direction: column; gap: 6px; }
.action-chip     { display: flex; align-items: center; gap: 8px; padding: 6px 10px; border-radius: 6px; border: 1px solid #e4e7f0; background: #fff; cursor: pointer; transition: background 0.15s, border-color 0.15s; font-size: 13px; }
.action-chip.selected { background: #eef2ff; border-color: #4f46e5; }
.action-chip:hover { background: #f5f3ff; }
.action-name     { font-weight: 600; color: #374151; }
.action-desc     { color: #6b7280; font-size: 12px; }

.permission-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; border: 1px solid #e4e7f0; cursor: pointer; }
.permission-item.checked { background: #eef2ff; border-color: #4f46e5; }

.modal-footer    { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.cancel-btn      { padding: 8px 18px; border-radius: 8px; border: 1px solid #e4e7f0; background: #fff; color: #6b7280; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.cancel-btn:hover { background: #f9fafb; }
.submit-btn      { padding: 8px 18px; border-radius: 8px; border: none; background: #4f46e5; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.submit-btn:hover { background: #4338ca; }
`;

