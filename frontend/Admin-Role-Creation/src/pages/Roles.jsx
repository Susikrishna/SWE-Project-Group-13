import Navbar from "../components/Navbar";
import axios from "axios";
import { useState, useEffect } from "react";
const serverUrl = import.meta.env.VITE_SERVER_URL
function Roles() {
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null);
    const [name,setName] = useState("");
    const [editingRole, setEditingRole] = useState(null);
    const [microfrontends, setMicrofrontends] = useState([]);
    const [microservices, setMicroservices] = useState([]);
    const [editDescription, setEditDescription] = useState("");
    const [editIsTemp, setEditIsTemp] = useState(false);
    const [editExpiresAt, setEditExpiresAt] = useState("");
    const [editSelectedPermissions, setEditSelectedPermissions] = useState(new Set());
    const [editSelectedMfes, setEditSelectedMfes] = useState(new Set());
    const [allowedPermissionsWhitelist, setAllowedPermissionsWhitelist] = useState(new Set());
    const getRoles = async () => {
        try {
            const response = await axios.get("http://localhost:3002/roles");
            setRoles(response.data);
        } catch (err) {
            setError("Failed to fetch roles.");
        }
    };
    const openEditModal = (role) => {
        setName(role.name);
        setEditingRole(role);
        setEditDescription(role.description || "");
        setEditIsTemp(role.isTemp || false);
        setEditExpiresAt(role.expiresAt ? role.expiresAt.split("T")[0] : "");
        setEditSelectedPermissions(new Set(role.permissions || []));
        setEditSelectedMfes(new Set(role.mfeAccess || []));
    };
    
    useEffect(() => {
        getRoles();
    }, []);
    useEffect(() => {
        const fetchRegistries = async () => {
            try {
                const [mfeRes, svcRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_REGISTRY_URL}/registry/mfes`),
                    axios.get(`${import.meta.env.VITE_REGISTRY_URL}/registry/services`)
                ]);
                
                const mfes = mfeRes.data.map(m => ({
                    id: m.feature,
                    label: m.name,
                    allowedPermissions: m.allowedPermissions || [],
                    components: (m.components || []).map(c => ({
                        name: c.name,
                        route: c.route,
                        componentKey: `${m.feature}::${c.route}`
                    }))
                }));
                
                const groupedServices = {};
                svcRes.data.forEach(api => {
                    if (!groupedServices[api.service]) {
                        groupedServices[api.service] = {
                            id: api.service,
                            label: api.service.toUpperCase(),
                            permissions: []
                        };
                    }
                    groupedServices[api.service].permissions.push({
                        resource: api.resource,
                        action: api.action,
                        permissionKey: api.permissionKey
                    });
                });

                setMicrofrontends(mfes);
                setMicroservices(Object.values(groupedServices));
            } catch (err) {
                setError("Failed to load services. Please try again.");
            }
        };
        
        fetchRegistries();
    }, []);

    const closeEditModal = () => {
        setEditingRole(null);
    };
    
    // Whitelist management for edit mode
    useEffect(() => {
        const activeFeatures = new Set();
        editSelectedMfes.forEach(key => activeFeatures.add(key.split("::")[0]));
        
        const newWhitelist = new Set();
        activeFeatures.forEach(fid => {
            const mfe = microfrontends.find(m => m.id === fid);
            if (mfe) mfe.allowedPermissions.forEach(p => newWhitelist.add(p));
        });

        setAllowedPermissionsWhitelist(newWhitelist);

        // Hard Restriction: Remove any selected permissions that are no longer in the whitelist
        setEditSelectedPermissions(prev => {
            const next = new Set();
            prev.forEach(p => {
                if (newWhitelist.has(p)) next.add(p);
            });
            return next;
        });
    }, [editSelectedMfes, microfrontends]);

    const toggleMfe = (mfeId, components) => {
        const hasAny = components.some(c => editSelectedMfes.has(c.componentKey));
        const mfe = microfrontends.find(m => m.id === mfeId);

        setEditSelectedMfes(prev => {
            const next = new Set(prev);
            if (hasAny) {
                components.forEach(c => next.delete(c.componentKey));
            } else {
                components.forEach(c => next.add(c.componentKey));
                // Default Assignment: Add all related permissions when MFE is selected
                if (mfe) {
                    setEditSelectedPermissions(pPrev => {
                        const pNext = new Set(pPrev);
                        mfe.allowedPermissions.forEach(p => pNext.add(p));
                        return pNext;
                    });
                }
            }
            return next;
        });
    };

    const toggleComponent = (componentKey) => {
        const mfeId = componentKey.split("::")[0];
        const mfe = microfrontends.find(m => m.id === mfeId);

        setEditSelectedMfes(prev => {
            const next = new Set(prev);
            const isAdding = !next.has(componentKey);
            if (next.has(componentKey)) next.delete(componentKey);
            else next.add(componentKey);

            // If adding the VERY FIRST component of this MFE, auto-select its permissions
            if (isAdding) {
                const alreadySelectedAny = Array.from(prev).some(k => k.startsWith(mfeId + "::"));
                if (!alreadySelectedAny && mfe) {
                    setEditSelectedPermissions(pPrev => {
                        const pNext = new Set(pPrev);
                        mfe.allowedPermissions.forEach(p => pNext.add(p));
                        return pNext;
                    });
                }
            }
            return next;
        });
    };
    
    const toggleService = (permissions) => {
        const hasAny = permissions.some(p => editSelectedPermissions.has(p.permissionKey));
        setEditSelectedPermissions(prev => {
            const next = new Set(prev);
            if (hasAny) {
                permissions.forEach(p => next.delete(p.permissionKey));
            } else {
                permissions.forEach(p => next.add(p.permissionKey));
            }
            return next;
        });
    };

    const togglePermission = (permissionKey) => {
        setEditSelectedPermissions(prev => {
            const next = new Set(prev);
            if (next.has(permissionKey)) next.delete(permissionKey);
            else next.add(permissionKey);
            return next;
        });
    };
    
    const handleDelete = async(roleId) =>{
        try{
            const response = await axios.delete(`${serverUrl}/roles`,{
                data:{roleId:roleId}
            });
            getRoles()
        }catch(err){
            setError("Cannot delete Role")
        }
    }
    
    const handleSubmit = async () => {
        try {
            await axios.put(`${serverUrl}/roles`, {
                roleId: editingRole._id,
                name: name,
                description: editDescription,
                permissions: Array.from(editSelectedPermissions),
                mfeAccess: Array.from(editSelectedMfes),
                isTemp: editIsTemp,
                ...(editIsTemp && { expiresAt: editExpiresAt }),
            });
            closeEditModal();
            getRoles();
        } catch (err) {
            setError("Cannot update Role");
        }
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
                {!error && roles.length === 0 && (
                    <div className="status-msg">No roles found.</div>
                )}
                
                <div className="roles-grid">
                    {roles.map((role) => (
                        <div key={role._id} className="role-card">
                            <div className="role-card-header">
                                <span className="role-name">{role.name}</span> 
                                {role.isTemp && <span className="badge badge-temp">Temporary</span>} 
                                <button className="edit-button" onClick={() => openEditModal(role)}>Edit</button>
                                <button className="del-button" onClick={() => handleDelete(role._id)}>✕</button>
                            </div>
                            {role.description && (
                                <div className="role-description">{role.description}</div>
                            )}
                            
                            {role.isTemp && role.expiresAt && (
                                <div className="role-dates">
                                    <span> Expires: {formatDate(role.expiresAt)}</span> 
                                </div>
                            )}
                            
                            <div className="role-section">
                                <div className="section-label">API Permissions</div>
                                <div className="tag-list">
                                    {role.permissions && role.permissions.length > 0 ? (
                                        role.permissions.map((perm) => (
                                            <span key={perm} className="tag tag-green">{perm}</span>
                                        ))
                                    ) : (
                                        <span className="empty-tag">No API permissions assigned</span>
                                    )}
                                </div>
                            </div>
                            
                            <div className="role-section">
                                <div className="section-label">MFE Access</div>
                                <div className="tag-list">
                                    {role.mfeAccess && role.mfeAccess.length > 0 ? (
                                        role.mfeAccess.map((mfe) => (
                                            <span key={mfe} className="tag tag-purple">{mfe}</span> 
                                        ))
                                    ) : (
                                        <span className="empty-tag">No MFE access assigned</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {editingRole && (
                <div className="modal-overlay" onClick={closeEditModal}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>

                        <div className="modal-header">
                            <h2>Edit Role</h2>
                            <button className="modal-close" onClick={closeEditModal}>✕</button>
                        </div>
                        
                        <div className="form-group">
                            <label>Role Name</label>
                            {name}
                        </div>
                        
                        <div className="form-group">
                            <label>Description</label>
                            <input
                                type="text"
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                            />
                        </div>

                        <div className="form-divider" />
                        
                        <p className="section-title">Microfrontend Access</p>
                        { microfrontends.length === 0 ? (
                            <p className="status-text">No microfrontends registered.</p>
                        ) : (
                            <div className="service-list">
                                {microfrontends.map((item) => {
                                    const hasAny = item.components.some(c => editSelectedMfes.has(c.componentKey));
                                    return (
                                        <div key={item.id} className={`service-card ${hasAny ? "checked" : ""}`}>
                                            <div className="service-header" onClick={() => toggleMfe(item.id, item.components)}>
                                                <input type="checkbox" checked={hasAny} readOnly />
                                                <span className="service-name">{item.label}</span>
                                            </div>
                                            {hasAny && item.components.length > 0 && (
                                                <div className="actions-list">
                                                    <p className="actions-title">Components:</p>
                                                    <div className="actions-grid">
                                                        {item.components.map((comp) => {
                                                            const isSelected = editSelectedMfes.has(comp.componentKey);
                                                            return (
                                                                <div
                                                                    key={comp.componentKey}
                                                                    className={`action-chip ${isSelected ? "selected" : ""}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        toggleComponent(comp.componentKey);
                                                                    }}
                                                                >
                                                                    <input type="checkbox" checked={isSelected} readOnly />
                                                                    <span className="action-name">{comp.name} :&nbsp;</span>
                                                                    <span className="action-desc">{comp.route}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="form-divider" />
                        
                        <p className="section-title">Microservice Access (Filtered by MFE selection)</p>
                        { microfrontends.length > 0 && editSelectedMfes.size === 0 ? (
                            <p className="status-text warning">Select a Microfrontend first to enable related API permissions.</p>
                        ) : microservices.length === 0 ? (
                            <p className="status-text">No microservices registered.</p>
                        ) : (
                            <div className="service-list">
                                {microservices.map((item) => {
                                    // Filter to whitelist
                                    const filteredPermissions = item.permissions.filter(p => allowedPermissionsWhitelist.has(p.permissionKey));
                                    
                                    if (filteredPermissions.length === 0) return null;

                                    const hasAny = filteredPermissions.some(p => editSelectedPermissions.has(p.permissionKey));
                                    return (
                                        <div key={item.id} className={`service-card ${hasAny ? "checked" : ""}`}>
                                            <div className="service-header" onClick={() => toggleService(filteredPermissions)}>
                                                <input type="checkbox" checked={hasAny} readOnly />
                                                <span className="service-name">{item.label}</span>
                                            </div>
                                            {hasAny && (
                                                <div className="actions-list">
                                                    <p className="actions-title">Resource List:</p>
                                                    <div className="actions-grid">
                                                        {filteredPermissions.map((perm) => {
                                                            const isSelected = editSelectedPermissions.has(perm.permissionKey);
                                                            return (
                                                                <div
                                                                    key={perm.permissionKey}
                                                                    className={`action-chip ${isSelected ? "selected" : ""}`}
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        togglePermission(perm.permissionKey);
                                                                    }}
                                                                >
                                                                    <input type="checkbox" checked={isSelected} readOnly />
                                                                    <span className="action-name">{perm.resource} :&nbsp;</span>
                                                                    <span className="action-desc">{perm.action}</span>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="form-divider" />
                        
                        <div
                            className={`permission-item ${editIsTemp ? "checked" : ""}`}
                            onClick={() => setEditIsTemp(!editIsTemp)}
                        >
                            <input type="checkbox" checked={editIsTemp} readOnly />
                            <label>Is the Role Temporary?</label>
                        </div>

                        {editIsTemp && (
                            <div className="form-group" style={{ marginTop: "10px" }}>
                                <label>Expiration Date</label>
                                <input
                                    type="date"
                                    value={editExpiresAt}
                                    onChange={(e) => setEditExpiresAt(e.target.value)}
                                    required
                                />
                            </div>
                        )}
                        
                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={closeEditModal}>Cancel</button>
                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Roles;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
.form-divider {
    height: 1px;
    background: #e4e7f0;
    margin: 4px 0;
}

.section-title {
    font-size: 13px;
    font-weight: 700;
    color: #0d0a41;
    margin: 0 0 8px 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.status-text {
    font-size: 13px;
    color: #9ca3af;
    margin: 0;
}

.service-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.service-card {
    border: 1px solid #e4e7f0;
    border-radius: 8px;
    padding: 10px 12px;
    cursor: pointer;
    transition: border-color 0.15s, background 0.15s;
}

.service-card.checked {
    border-color: #4f46e5;
    background: #f5f3ff;
}

.service-header {
    display: flex;
    align-items: center;
    gap: 10px;
}

.service-name {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
}

.actions-list {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid #e4e7f0;
}

.actions-title {
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 8px 0;
}

.actions-grid {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.action-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 10px;
    border-radius: 6px;
    border: 1px solid #e4e7f0;
    background: #fff;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
    font-size: 13px;
}

.action-chip.selected {
    background: #eef2ff;
    border-color: #4f46e5;
}

.action-chip:hover {
    background: #f5f3ff;
}

.action-name {
    font-weight: 600;
    color: #374151;
}

.action-desc {
    color: #6b7280;
    font-size: 12px;
}
.roles-container {
padding: 32px;
font-family: 'DM Sans', sans-serif;
max-width: 1100px;
margin: 0 auto;
}
.card-actions {
    display: flex;
    gap: 6px;
    margin-left: auto;
}

.edit-button {
    background: #f0f2f9;
    color: #4f46e5;
    padding: 4px 10px;
    border-radius: 8px;
    border: 1px solid #e4e7f0;
    cursor: pointer;
    font-size: 13px;
    transition: background 0.15s;
}

.edit-button:hover { background: #eef2ff; }

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: #fff;
    border-radius: 12px;
    padding: 28px;
    width: 480px;
    max-width: 90vw;
    max-height: 85vh;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.15);
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.modal-header h2 {
    font-size: 18px;
    font-weight: 700;
    color: #0d0a41;
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    font-size: 16px;
    cursor: pointer;
    color: #6b7280;
}

.modal-close:hover { color: #d01d1d; }

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.form-group label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.form-group input {
    padding: 8px 12px;
    border-radius: 8px;
    border: 1px solid #e4e7f0;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    outline: none;
}

.form-group input:focus { border-color: #4f46e5; }

.permission-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    border: 1px solid #e4e7f0;
    cursor: pointer;
}

.permission-item.checked {
    background: #eef2ff;
    border-color: #4f46e5;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 8px;
}

.cancel-btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: 1px solid #e4e7f0;
    background: #fff;
    color: #6b7280;
    font-size: 14px;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
}

.cancel-btn:hover { background: #f9fafb; }

.submit-btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: none;
    background: #4f46e5;
    color: #fff;
    font-size: 14px;
    font-weight: 600;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
}

.submit-btn:hover { background: #4338ca; }

.del-button {
    background: #d01d1d;
    color: #ffffff;
    padding: 4px 10px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 13px;
    font-weight: 600;
    margin-left: auto;
    line-height: 1;
    transition: background 0.15s;
}

.del-button:hover {
    background: #b01515;
}

.roles-header {
display: flex;
align-items: center;
justify-content: space-between;
margin-bottom: 24px;
}
.roles-title {
font-size: 22px;
font-weight: 700;
color: #0d0a41;
margin: 0;
}
.refresh-btn {
padding: 7px 16px;
border-radius: 8px;
border: 1px solid #e4e7f0;
background: #fff;
color: #4f46e5;
font-size: 13px;
font-weight: 600;
font-family: 'DM Sans', sans-serif;
}
.refresh-btn:hover { background: #eef2ff; }
.status-msg {
text-align: center;
color: #6b7280;
font-size: 14px;
padding: 48px 0;
}
.status-msg.error { 
color: #ef4444; 
}

.roles-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
gap: 16px;
}
.role-card {
background: #fff;
border-radius: 12px;
border: 1px solid #e4e7f0;
padding: 20px;
box-shadow: 0 1px 4px rgba(79,70,229,0.06);
display: flex;
flex-direction: column;
gap: 14px;
transition: box-shadow 0.15s;
}
.role-card:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.10); }
.role-card-header {
display: flex;
align-items: center;
gap: 10px;
flex-wrap: wrap;
}
.role-name {
font-size: 16px;
font-weight: 700;
color: #0d0a41;
}
.badge {
padding: 2px 10px;
border-radius: 20px;
font-size: 11px;
font-weight: 600;
}
.badge-temp { background: #fff7ed; color: #f97316; border: 1px solid #fed7aa; }
.role-description {
font-size: 13px;
color: #6b7280;
line-height: 1.5;
}
.role-dates {
display: flex;
align-items: center;
gap: 8px;
font-size: 12px;
color: #f97316;
background: #fff7ed;
padding: 6px 10px;
border-radius: 8px;
}
.date-arrow { color: #9ca3af; }
.role-section { display: flex; flex-direction: column; gap: 8px; }
.section-label {
font-size: 11px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.6px;
color: #9ca3af;
}
.service-block {
background: #f9fafb;
border: 1px solid #f3f4f6;
border-radius: 8px;
padding: 10px 12px;
display: flex;
flex-direction: column;
gap: 6px;
}
.service-id {
font-size: 13px;
font-weight: 600;
color: #374151;
text-transform: capitalize;
}
.tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.tag-blue   { background: #eff6ff; color: #3b82f6; }
.tag-purple { background: #eef2ff; color: #4f46e5; }
.tag-green  { background: #f0fdf4; color: #16a34a; }
.empty-tag { font-size: 12px; color: #d1d5db; }
`;