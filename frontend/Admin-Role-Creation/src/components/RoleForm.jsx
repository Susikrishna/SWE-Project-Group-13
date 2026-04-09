import { useState, useEffect } from "react";
import axios from "axios";
const serverUrl = import.meta.env.VITE_SERVER_URL
const registryUrl = import.meta.env.VITE_REGISTRY_URL
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

    useEffect(() => {
        const fetchRegistries = async () => {
            try {
                // Fetch from the updated Registry Service on Port 3001
                const [mfeRes, svcRes] = await Promise.all([
                    axios.get("http://localhost:3001/registry/mfes"),
                    axios.get("http://localhost:3001/registry/services")
                ]);
                
                const mfes = mfeRes.data.map(m => ({
                    id: m.feature,
                    label: m.name,
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
            } finally {
                setLoading(false);
            }
        };

        fetchRegistries();
    }, []);
    
    const toggleMfe = (mfeId, components) => {
        const hasAny = components.some(c => selectedMfes.has(c.componentKey));
        setSelectedMfes(prev => {
            const next = new Set(prev);
            if (hasAny) {
                components.forEach(c => next.delete(c.componentKey));
            } else {
                components.forEach(c => next.add(c.componentKey));
            }
            return next;
        });
    };
    
    const toggleComponent = (componentKey) => {
        setSelectedMfes(prev => {
            const next = new Set(prev);
            if (next.has(componentKey)) next.delete(componentKey);
            else next.add(componentKey);
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

        const roleData = {
            name: roleName,
            permissions: Array.from(selectedPermissions),
            mfeAccess: Array.from(selectedMfes),
            isTemp,
            ...(isTemp && { expiresAt }),
        };

        try {
            await axios.post("http://localhost:3002/roles", roleData, {
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
                                const hasAny = item.components.some(c => selectedMfes.has(c.componentKey));
                                return (
                                    <div key={item.id} className={`service-card ${hasAny ? "checked" : ""}`}>
                                        <div
                                            className="service-header"
                                            onClick={() => toggleMfe(item.id, item.components)}
                                        >
                                            <input type="checkbox" checked={hasAny} readOnly />
                                            <span className="service-name">{item.label}</span>
                                        </div>
                                        {hasAny && item.components.length > 0 && (
                                            <div className="actions-list">
                                                <p className="actions-title">Components:</p>
                                                <div className="actions-grid">
                                                    {item.components.map((comp) => {
                                                        const isSelected = selectedMfes.has(comp.componentKey);
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
                    <p className="section-title">Microservice Access</p>
                    {loading ? (
                        <p className="status-text">Loading services...</p>
                    ) : error ? (
                        <p className="status-text error">{error}</p>
                    ) : microservices.length === 0 ? (
                        <p className="status-text">No microservices registered.</p>
                    ) : (
                        <div className="service-list">
                            {microservices.map((item) => {
                                const hasAny = item.permissions.some(p => selectedPermissions.has(p.permissionKey));
                                return (
                                    <div key={item.id} className={`service-card ${hasAny ? "checked" : ""}`}>
                                        <div
                                            className="service-header"
                                            onClick={() => toggleServiceExpand(item.id, item.permissions)}
                                        >
                                            <input type="checkbox" checked={hasAny} readOnly />
                                            <span className="service-name">{item.label}</span>
                                        </div>
                                        {hasAny && (
                                            <div className="actions-list">
                                                <p className="actions-title">Resource List:</p>
                                                <div className="actions-grid">
                                                    {item.permissions.map((perm) => {
                                                        const isSelected = selectedPermissions.has(perm.permissionKey);
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
                        onClick={() => setIsTemp(!isTemp)}
                        className={`permission-item ${isTemp ? "checked" : ""}`}
                        style={{ marginBottom: "10px" }}
                    >
                        <input type="checkbox" checked={isTemp} readOnly />
                        <label>Is the Role Temporary?</label>
                    </div>

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

                    <button
                        className="submit-btn"
                        type="submit"
                        disabled={!roleName.trim() || loading}
                    >
                        Create Role
                    </button>

                </form>
            </div>
        </>
    );
}

export default RoleForm;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.role-container {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'DM Sans', sans-serif;
    padding: 20px;
}

.role-form {
    background: #ffffff;
    border: 1px solid #e4e7f0;
    padding: 40px;
    border-radius: 16px;
    width: 60%;
    box-shadow: 0 8px 32px rgba(79,70,229,0.08), 0 1px 3px rgba(0,0,0,0.06);
}

.form-header {
    margin-bottom: 32px;
}

.form-header h2 {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
}

.form-divider {
    height: 1px;
    background: #e9ebf2;
    margin: 28px 0;
}

.form-group {
    margin-bottom: 24px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

.form-group input[type="text"],
.form-group input[type="date"] {
    width: 100%;
    padding: 11px 14px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    color: #111827;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    outline: none;
}

.form-group input:focus {
    border-color: #070441;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
    background: #ffffff;
}

.section-title {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    margin-bottom: 14px;
}

.service-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.service-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fafafa;
    transition: border 0.2s, background 0.2s;
}

.service-card.checked {
    border-color: #090649;
    background: #f4f6ff;
}

.service-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    cursor: pointer;
}

.service-header:hover {
    background: #eef0fd;
}

.service-header input {
    appearance: none;
    width: 17px;
    height: 17px;
    border-radius: 5px;
    border: 1.5px solid #d1d5db;
    background: white;
}

.service-header input:checked {
    background: #090649;
    border-color: #040220;
}

.service-name {
    font-weight: 600;
    color: #111827;
}

.service-id {
    margin-left: auto;
    font-size: 12px;
    color: #6b7280;
    font-family: 'DM Mono', monospace;
}

.actions-list {
    padding: 14px 16px 18px 16px;
    border-top: 1px solid #e5e7eb;
}

.actions-title {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 10px;
    font-weight: 600;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill,minmax(180px,1fr));
    gap: 8px;
}

.action-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border-radius: 7px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    cursor: pointer;
    font-size: 13px;
    font-family: 'DM Mono', monospace;
    transition: all 0.15s;
}

.action-chip:hover {
    background: #eef0fd;
    border-color: #c7d0fb;
}

.action-chip.selected {
    background: #eef2ff;
    border-color: #090649;
}

.action-chip input {
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 4px;
    border: 1.5px solid #d1d5db;
}

.action-chip input:checked {
    background: #090649;
    border-color: #040220;
}

.action-name {
    font-weight: 600;
}

.action-desc {
    color: #6b7280;
}

.status-text {
    font-size: 13px;
    color: #6b7280;
}

.status-text.error {
    color: #dc2626;
}

.permission-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    cursor: pointer;
}

.permission-item.checked {
    background: #eef2ff;
    border-color: #090649;
}

.date-range {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
}

.submit-btn {
    width: 100%;
    padding: 13px;
    background: #090734;
    color: white;
    border: none;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
}

.submit-btn:hover {
    opacity: 0.92;
}

.submit-btn:active {
    transform: scale(0.99);
}

.submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
`;