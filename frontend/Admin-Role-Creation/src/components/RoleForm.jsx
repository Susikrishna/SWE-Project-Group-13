import { useState, useEffect } from "react";
import axios from "axios";
const serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3002';
const registryUrl = import.meta.env.VITE_REGISTRY_URL || 'http://localhost:3001';
function RoleForm() {
    const [roleName, setRoleName] = useState("");
    const [isTemp, setIsTemp] = useState(false);
    const [expiresAt, setExpiresAt] = useState("");
    
    const [microfrontends, setMicrofrontends] = useState([]);
    const [microservices, setMicroservices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // State for flattened permissions
    const [selectedPermissions, setSelectedPermissions] = useState(new Set());
    const [selectedMfes, setSelectedMfes] = useState(new Set());
    const [allowedPermissionsWhitelist, setAllowedPermissionsWhitelist] = useState(new Set()); // Whitelist for hard restriction

    useEffect(() => {
        const fetchRegistries = async () => {
            try {
                // Fetch from the updated Registry Service on Port 3001
                const [mfeRes, svcRes] = await Promise.all([
                    axios.get(`${registryUrl}/registry/mfes`),
                    axios.get(`${registryUrl}/registry/services`)
                ]);
                
                const mfes = mfeRes.data.map(m => ({
                    id: m.feature,
                    label: m.name,
                    allowedPermissions: m.allowedPermissions || [],
                    components: (m.components || []).map(c => ({
                        name: c.name,
                        route: c.route,
                        componentKey: `${m.feature}::${c.route}`,
                        allowedPermissions: c.allowedPermissions || []
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
            } finally {
                setLoading(false);
            }
        };

        fetchRegistries();
    }, []);
    
    // Update whitelist whenever MFEs change
    useEffect(() => {
        const activeFeatures = new Set();
        selectedMfes.forEach(key => activeFeatures.add(key.split("::")[0]));
        
        const newWhitelist = new Set();
        activeFeatures.forEach(fid => {
            const mfe = microfrontends.find(m => m.id === fid);
            if (mfe) mfe.allowedPermissions.forEach(p => newWhitelist.add(p));
        });

        // Add permissions from specifically selected components
        selectedMfes.forEach(key => {
            if (key.includes("::")) {
                const fid = key.split("::")[0];
                const mfe = microfrontends.find(m => m.id === fid);
                if (mfe) {
                    const comp = mfe.components.find(c => c.componentKey === key);
                    if (comp) comp.allowedPermissions.forEach(p => newWhitelist.add(p));
                }
            }
        });

        setAllowedPermissionsWhitelist(newWhitelist);

        // Hard Restriction: Remove any selected permissions that are no longer in the whitelist
        setSelectedPermissions(prev => {
            const next = new Set();
            prev.forEach(p => {
                if (newWhitelist.has(p)) next.add(p);
            });
            return next;
        });
    }, [selectedMfes, microfrontends]);

    const toggleMfe = (mfeId, components) => {
        const hasAny = components.length > 0 
            ? components.some(c => selectedMfes.has(c.componentKey))
            : selectedMfes.has(mfeId);
            
        const mfe = microfrontends.find(m => m.id === mfeId);

        setSelectedMfes(prev => {
            const next = new Set(prev);
            if (hasAny) {
                if (components.length > 0) {
                    components.forEach(c => next.delete(c.componentKey));
                } else {
                    next.delete(mfeId);
                }
            } else {
                if (components.length > 0) {
                    components.forEach(c => next.add(c.componentKey));
                } else {
                    next.add(mfeId);
                }
                // Default Assignment: Add all related permissions when MFE is selected
                if (mfe) {
                    setSelectedPermissions(pPrev => {
                        const pNext = new Set(pPrev);
                        mfe.allowedPermissions.forEach(p => pNext.add(p));
                        if(components.length > 0) {
                            components.forEach(c => (c.allowedPermissions || []).forEach(p => pNext.add(p)));
                        }
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
        
        setSelectedMfes(prev => {
            const next = new Set(prev);
            const isAdding = !next.has(componentKey);
            if (next.has(componentKey)) next.delete(componentKey);
            else next.add(componentKey);

            // Auto-select permissions specific to this component when added
            if (isAdding) {
                const compToSelect = mfe?.components?.find(c => c.componentKey === componentKey);
                if (compToSelect || mfe) {
                    setSelectedPermissions(pPrev => {
                        const pNext = new Set(pPrev);
                        if (mfe) mfe.allowedPermissions.forEach(p => pNext.add(p));
                        if (compToSelect) compToSelect.allowedPermissions.forEach(p => pNext.add(p));
                        return pNext;
                    });
                }
            }
            return next;
        });
    };

    const toggleServiceExpand = (serviceId, permissions) => {
        const hasAny = permissions.some(p => selectedPermissions.has(p.permissionKey));

        setSelectedPermissions(prev => {
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
        setSelectedPermissions(prev => {
            const next = new Set(prev);
            if (next.has(permissionKey)) next.delete(permissionKey);
            else next.add(permissionKey);
            return next;
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (selectedPermissions.size === 0 && selectedMfes.size === 0) {
            alert("Please select at least one service or microfrontend.");
            return;
        }

        const activeMfes = new Set();
        selectedMfes.forEach(key => activeMfes.add(key.split("::")[0]));

        const roleData = {
            name: roleName,
            permissions: Array.from(selectedPermissions),
            mfeAccess: Array.from(activeMfes),
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
            setSelectedPermissions(new Set());
            setSelectedMfes(new Set());
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
                    <p className="section-title">Microfrontend Access</p>
                    {loading ? (
                        <p className="status-text">Loading services...</p>
                    ) : error ? (
                        <p className="status-text error">{error}</p>
                    ) : microfrontends.length === 0 ? (
                        <p className="status-text">No microfrontends registered.</p>
                    ) : (
                        <div className="service-list">
                            {microfrontends.map((item) => {
                                const hasAny = item.components.length > 0 
                                    ? item.components.some(c => selectedMfes.has(c.componentKey))
                                    : selectedMfes.has(item.id);
                                    
                                return (
                                    <div key={item.id} className={`service-card ${hasAny ? "checked" : ""}`}>
                                        <div
                                            className="service-header"
                                            onClick={() => toggleMfe(item.id, item.components)}
                                        >
                                            <input type="checkbox" checked={hasAny} readOnly />
                                            <span className="service-name">{item.label}</span>
                                        </div>
                                        {hasAny && item.allowedPermissions?.length > 0 && (
                                            <div className="actions-list root-permissions-block">
                                                <div className="section-badge-header">
                                                    <span className="badge-icon">⚡</span>
                                                    <p className="actions-title-premium">Root Permissions (Always granted)</p>
                                                </div>
                                                <div className="api-badges">
                                                    {item.allowedPermissions.map((p) => (
                                                        <span key={p} className="api-badge root-badge">{p}</span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                        {hasAny && item.components.length > 0 && (
                                            <div className={`actions-list ${item.allowedPermissions?.length > 0 ? "components-block-continued" : "components-block"}`}>
                                                <p className="actions-title-premium" style={{ marginBottom: "12px" }}>Components</p>
                                                <div className="actions-grid">
                                                    {item.components.map((comp) => {
                                                        const isSelected = selectedMfes.has(comp.componentKey);
                                                        return (
                                                            <label
                                                                key={comp.componentKey}
                                                                className={`action-chip ${isSelected ? "selected" : ""}`}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    toggleComponent(comp.componentKey);
                                                                }}
                                                            >
                                                                <div className="chip-header">
                                                                    <input type="checkbox" checked={isSelected} readOnly />
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span className="action-name">{comp.name}</span>
                                                                        <span className="action-desc">{comp.route}</span>
                                                                    </div>
                                                                </div>
                                                                {comp.allowedPermissions?.length > 0 && (
                                                                    <div className="api-badge-container">
                                                                        <span className="api-badge-label">Required APIs</span>
                                                                        <div className="api-badges">
                                                                            {comp.allowedPermissions.map(p => (
                                                                                <span key={p} className="api-badge">{p}</span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </label>
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
                    <p className="section-title">Microservice Access</p>
                    <p className="section-subtitle">Filtered to only show backend APIs required by your Microfrontend choices above.</p>
                    {loading ? (
                        <p className="status-text loading-pulse">Loading services...</p>
                    ) : error ? (
                        <p className="status-text error">{error}</p>
                    ) : selectedMfes.size === 0 ? (
                        <p className="status-text warning">Select a Microfrontend above to enable related APIs.</p>
                    ) : (
                        <div className="service-list">
                            {microservices.map((item) => {
                                // Filter permissions to ONLY those in the whitelist
                                const filteredPermissions = item.permissions.filter(p => allowedPermissionsWhitelist.has(p.permissionKey));
                                
                                if (filteredPermissions.length === 0) return null;

                                const hasAny = filteredPermissions.some(p => selectedPermissions.has(p.permissionKey));
                                return (
                                    <div key={item.id} className={`service-card ${hasAny ? "checked" : ""}`}>
                                        <div
                                            className="service-header"
                                            onClick={() => toggleServiceExpand(item.id, filteredPermissions)}
                                        >
                                            <input type="checkbox" checked={hasAny} readOnly />
                                            <span className="service-name">{item.label}</span>
                                        </div>
                                        {hasAny && (
                                            <div className="actions-list components-block">
                                                <p className="actions-title-premium" style={{ marginBottom: "12px" }}>Resource List</p>
                                                <div className="actions-grid">
                                                    {filteredPermissions.map((perm) => {
                                                        const isSelected = selectedPermissions.has(perm.permissionKey);
                                                        return (
                                                            <label
                                                                key={perm.permissionKey}
                                                                className={`action-chip microservice-chip ${isSelected ? "selected" : ""}`}
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    togglePermission(perm.permissionKey);
                                                                }}
                                                            >
                                                                <div className="chip-header">
                                                                    <input type="checkbox" checked={isSelected} readOnly />
                                                                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                                        <span className="action-name">{perm.resource}</span>
                                                                        <span className="action-desc">{perm.action}</span>
                                                                    </div>
                                                                </div>
                                                            </label>
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

.service-header input, .chip-header input, .permission-item input {
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

.service-header input:checked, .chip-header input:checked, .permission-item input:checked {
    background: #090649;
    border-color: #090649;
}

.service-header input:checked::after, .chip-header input:checked::after, .permission-item input:checked::after {
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

.actions-list {
    padding: 0 20px 20px 20px;
    background: #ffffff;
}

.components-block {
    padding-top: 20px;
    border-top: 1px dashed #e2e8f0;
}

.components-block-continued {
    padding-top: 16px;
}

.root-permissions-block {
    padding-top: 20px;
    padding-bottom: 20px;
    border-top: 1px dashed #e2e8f0;
    background: #fdfdfe;
}

.actions-title-premium {
    font-size: 12px;
    color: #090649;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    margin: 0;
}

.section-badge-header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
}

.badge-icon {
    font-size: 14px;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 12px;
    align-items: stretch;
}

.action-chip {
    display: flex;
    flex-direction: column;
    padding: 14px 16px;
    border-radius: 12px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    height: 100%;
    box-sizing: border-box;
}

.action-chip:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
}

.action-chip.selected {
    background: #f4f6ff;
    border-color: #090649;
    box-shadow: inset 0 0 0 1px #090649;
}

.action-chip.microservice-chip.selected {
    background: #f8f9ff;
    border-color: #0a0868;
    box-shadow: inset 0 0 0 1px #0a0868;
}
.action-chip.microservice-chip.selected .chip-header input:checked {
    background: #0a0868;
    border-color: #0a0868;
}

.chip-header {
    display: flex;
    align-items: flex-start;
    gap: 12px;
}

.action-name {
    font-weight: 600;
    color: #1e293b;
    font-size: 14px;
    line-height: 1.4;
}

.action-desc {
    color: #64748b;
    font-size: 12px;
    font-family: 'JetBrains Mono', monospace;
    margin-top: 2px;
}

.api-badge-container {
    margin-top: 14px;
    padding-top: 12px;
    border-top: 1px solid rgba(226, 232, 240, 0.6);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.api-badge-label {
    font-size: 11px;
    font-weight: 600;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.api-badges {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.api-badge {
    background: #f1f5f9;
    color: #475569;
    font-size: 11px;
    font-family: 'JetBrains Mono', monospace;
    padding: 4px 8px;
    border-radius: 6px;
    border: 1px solid #e2e8f0;
    line-height: 1.2;
}

.root-badge {
    background: #eef0fc;
    color: #090649;
    border-color: #c7d0fb;
    font-weight: 500;
}

.action-chip.selected .api-badge {
    background: #e8ecfc;
    color: #090649;
    border-color: #bac4f5;
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
`;
