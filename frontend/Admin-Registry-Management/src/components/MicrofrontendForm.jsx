import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { registerService, fetchMicroservices } from "../services/registryApi";
import { LoadingOverlay, SuccessModal, FailureModal } from "./FeedbackModals";

const emptyComponent = { name: "", route: "", description: "", isActive: true, allowedPermissions: [], isExpanded: true };

const MicrofrontendForm = () => {
  const initialState = {
    name: "",
    description: "",
    route: "",
    remoteUrl: "",
    module: "",
    isActive: true,
    allowedPermissions: [],
  };
  const [formData, setFormData] = useState(initialState);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);
  
  const [allApis, setAllApis] = useState([]);
  const [apiSearchQuery, setApiSearchQuery] = useState('');
  const [loadingApis, setLoadingApis] = useState(false);

  // Fetch all APIs once on mount
  useEffect(() => {
    let isMounted = true;
    const loadApis = async () => {
      setLoadingApis(true);
      try {
        const res = await fetchMicroservices();
        if (isMounted) {
          const fetchedApis = Array.isArray(res) ? res : res?.data || [];
          setAllApis(fetchedApis);
        }
      } catch (e) {
        console.error("Failed to load APIs", e);
      } finally {
        if (isMounted) setLoadingApis(false);
      }
    };
    loadApis();
    return () => { isMounted = false; };
  }, []);

  // Group APIs by service
  const groupedApis = allApis.reduce((acc, api) => {
    if (!acc[api.service]) acc[api.service] = [];
    acc[api.service].push(api);
    return acc;
  }, {});

  // Filter services by search query
  const filteredServices = Object.keys(groupedApis).filter(service => 
    service.toLowerCase().includes(apiSearchQuery.toLowerCase())
  );
  
  const displayedServices = apiSearchQuery.trim() ? filteredServices : filteredServices.slice(0, 5);

  const toggleComponentServiceExpand = (compIndex, serviceName, apis) => {
    setComponents((prev) => {
      const newComps = [...prev];
      const comp = { ...newComps[compIndex] };
      const hasAny = apis.some((a) => comp.allowedPermissions.includes(a.permissionKey));
      let nextPerms = new Set(comp.allowedPermissions);
      if (hasAny) {
        apis.forEach((a) => nextPerms.delete(a.permissionKey));
      } else {
        apis.forEach((a) => nextPerms.add(a.permissionKey));
      }
      comp.allowedPermissions = Array.from(nextPerms);
      newComps[compIndex] = comp;
      return newComps;
    });
  };

  const toggleComponentPermission = (compIndex, permKey) => {
    setComponents((prev) => {
      const newComps = [...prev];
      const comp = { ...newComps[compIndex] };
      let nextPerms = new Set(comp.allowedPermissions);
      if (nextPerms.has(permKey)) nextPerms.delete(permKey);
      else nextPerms.add(permKey);
      comp.allowedPermissions = Array.from(nextPerms);
      newComps[compIndex] = comp;
      return newComps;
    });
  };

  const toggleRootServiceExpand = (serviceName, apis) => {
    setFormData((prev) => {
      let nextPerms = new Set(prev.allowedPermissions || []);
      const hasAny = apis.some((a) => (prev.allowedPermissions || []).includes(a.permissionKey));
      if (hasAny) {
        apis.forEach((a) => nextPerms.delete(a.permissionKey));
      } else {
        apis.forEach((a) => nextPerms.add(a.permissionKey));
      }
      return { ...prev, allowedPermissions: Array.from(nextPerms) };
    });
  };

  const toggleRootPermission = (permKey) => {
    setFormData((prev) => {
      let nextPerms = new Set(prev.allowedPermissions || []);
      if (nextPerms.has(permKey)) nextPerms.delete(permKey);
      else nextPerms.add(permKey);
      return { ...prev, allowedPermissions: Array.from(nextPerms) };
    });
  };

  const handleInputChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleComponentChange = (index, e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setComponents((prev) =>
      prev.map((comp, i) => (i === index ? { ...comp, [e.target.name]: value } : comp))
    );
  };

  const addComponent = () => setComponents((prev) => [...prev, { ...emptyComponent }]);

  const removeComponent = (index) =>
    setComponents((prev) => prev.filter((_, i) => i !== index));

  const slugify = (text) =>
    text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFailureMessage(null);
    const payload = {
      feature: slugify(formData.name),
      name: formData.name,
      description: formData.description,
      route: formData.route,
      remoteUrl: formData.remoteUrl,
      module: formData.module,
      isActive: formData.isActive,
      comps: components,
      allowedPermissions: formData.allowedPermissions || [],
    };
    try {
      const data = await registerService(payload, "microfrontend");
      setSuccessData(data);
      setFormData(initialState);
      setComponents([]);
    } catch (err) {
      setFailureMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingOverlay />}
      {successData && <SuccessModal data={successData} onClose={() => setSuccessData(null)} />}
      {failureMessage && (
        <FailureModal message={failureMessage} onClose={() => setFailureMessage(null)} />
      )}

      <form onSubmit={handleSubmit}>
        {/* ── Core MFE Fields ── */}
        <label style={styles.label}>Feature Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g. User Dashboard"
          style={styles.input}
          required
        />

        <label style={styles.label}>Description (Optional)</label>
        <input
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="e.g. User settings and profile management"
          style={styles.input}
        />

        <label style={styles.label}>Base Route</label>
        <input
          name="route"
          value={formData.route}
          onChange={handleInputChange}
          placeholder="e.g. /admin"
          style={styles.input}
          required
        />

        <label style={styles.label}>Remote Entry URL</label>
        <input
          name="remoteUrl"
          value={formData.remoteUrl}
          onChange={handleInputChange}
          placeholder="e.g. http://localhost:5001/assets/remoteEntry.js"
          style={styles.input}
          required
        />

        <label style={styles.label}>Module Name</label>
        <input
          name="module"
          value={formData.module}
          onChange={handleInputChange}
          placeholder="e.g. ./App"
          style={{ ...styles.input, marginBottom: "16px" }}
          required
        />

        {/* Active toggle */}
        <label style={formStyles.toggleRow}>
          <div
            style={{
              ...formStyles.toggleTrack,
              background: formData.isActive
                ? "linear-gradient(135deg, #818cf8, #a78bfa)"
                : "#e2e8f0",
            }}
            onClick={() =>
              setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))
            }
          >
            <div
              style={{
                ...formStyles.toggleThumb,
                transform: formData.isActive ? "translateX(20px)" : "translateX(2px)",
              }}
            />
          </div>
          <span style={formStyles.toggleLabel}>
            Active — {formData.isActive ? "Published immediately" : "Draft / hidden"}
          </span>
        </label>

        {/* ── Root Level APIs ── */}
        <div style={{ ...formStyles.section, marginBottom: "24px" }}>
          <p style={{...formStyles.sectionTitle, fontSize: "13px"}}>Root MFE Permissions</p>
          <p style={{...formStyles.sectionSub, marginBottom: "16px"}}>
            Select backend APIs required globally by this microfrontend.
          </p>
          
          <div style={{ marginBottom: "16px" }}>
            <input
              type="text"
              placeholder="Search services (e.g. user-svc)..."
              value={apiSearchQuery}
              onChange={(e) => setApiSearchQuery(e.target.value)}
              style={{...formStyles.fieldInput, padding: "8px 12px", fontSize: "12px"}}
            />
          </div>

          {loadingApis ? (
            <p style={{ fontSize: "12px", color: "#64748b" }}>Loading services...</p>
          ) : displayedServices.length === 0 ? (
            <p style={{ fontSize: "12px", color: "#64748b" }}>
              {apiSearchQuery.trim() ? "No services match your search." : "No services available."}
            </p>
          ) : (
            <div className="service-list">
              {displayedServices.map((serviceName) => {
                const apis = groupedApis[serviceName];
                const hasAny = apis.some(api => (formData.allowedPermissions || []).includes(api.permissionKey));
                
                return (
                  <div key={serviceName} className={`service-card ${hasAny ? "checked" : ""}`}>
                    <div
                      className="service-header"
                      onClick={() => toggleRootServiceExpand(serviceName, apis)}
                      style={{ padding: "10px 12px" }}
                    >
                      <input type="checkbox" checked={hasAny} readOnly />
                      <span className="service-name" style={{ fontSize: "13px" }}>{serviceName.toUpperCase()}</span>
                    </div>
                    
                    {hasAny && (
                      <div className="actions-list" style={{ padding: "10px 12px" }}>
                        <div className="actions-grid">
                          {apis.map((api) => {
                            const isSelected = (formData.allowedPermissions || []).includes(api.permissionKey);
                            return (
                              <div
                                key={api.permissionKey}
                                className={`action-chip ${isSelected ? "selected" : ""}`}
                                style={{ padding: "6px 8px", fontSize: "12px" }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleRootPermission(api.permissionKey);
                                }}
                              >
                                <input type="checkbox" checked={isSelected} readOnly />
                                <span className="action-name">{api.resource} :&nbsp;</span>
                                <span className="action-desc">{api.action}</span>
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
        </div>

        {/* ── Components Section ── */}
        <div style={formStyles.section}>
          {/* Section header */}
          <div style={formStyles.sectionHeader}>
            <div>
              <p style={formStyles.sectionTitle}>Sub-Components</p>
              <p style={formStyles.sectionSub}>
                Routes and views exposed by this microfrontend
              </p>
            </div>
            <button
              type="button"
              onClick={addComponent}
              style={formStyles.addBtn}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#0f172a";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#0f172a";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "#475569";
                e.currentTarget.style.borderColor = "#cbd5e1";
              }}
            >
              + Add Component
            </button>
          </div>

          {/* Empty state */}
          {components.length === 0 && (
            <div style={formStyles.emptyState}>
              <span style={formStyles.emptyIcon}>⚡</span>
              <p style={formStyles.emptyTitle}>No components yet</p>
              <p style={formStyles.emptySub}>
                Add sub-routes or views this MFE exposes (e.g. /admin/users/list)
              </p>
            </div>
          )}

          {/* Component cards */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {components.map((comp, index) => (
              <div key={index} style={formStyles.compCard}>
                {/* Card header */}
                <div
                  style={{ ...formStyles.compCardHeader, cursor: "pointer" }}
                  onClick={() => {
                    setComponents((prev) =>
                      prev.map((c, i) =>
                        i === index ? { ...c, isExpanded: c.isExpanded === false ? true : false } : c
                      )
                    );
                  }}
                >
                  <div style={formStyles.compIndex}>
                    <span style={formStyles.compIndexNum}>{index + 1}</span>
                  </div>
                  <span style={formStyles.compCardTitle}>
                    Component {index + 1} {comp.name ? `- ${comp.name}` : ""}
                  </span>
                  <span style={{ fontSize: "11px", color: "#94a3b8", marginLeft: "4px" }}>
                    {comp.isExpanded === false ? "▼" : "▲"}
                  </span>
                  <div style={{ flex: 1 }} />
                  {/* Active pill toggle */}
                  <label
                    style={formStyles.miniToggleRow}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      style={{
                        ...formStyles.miniTrack,
                        background: comp.isActive
                          ? "linear-gradient(135deg, #818cf8, #a78bfa)"
                          : "#e2e8f0",
                      }}
                      onClick={() =>
                        setComponents((prev) =>
                          prev.map((c, i) =>
                            i === index ? { ...c, isActive: !c.isActive } : c
                          )
                        )
                      }
                    >
                      <div
                        style={{
                          ...formStyles.miniThumb,
                          transform: comp.isActive ? "translateX(14px)" : "translateX(2px)",
                        }}
                      />
                    </div>
                    <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
                      {comp.isActive ? "Active" : "Inactive"}
                    </span>
                  </label>
                  {/* Remove */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeComponent(index);
                    }}
                    style={formStyles.removeBtn}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#fef2f2";
                      e.currentTarget.style.color = "#dc2626";
                      e.currentTarget.style.borderColor = "#fecaca";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#94a3b8";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                  >
                    ✕
                  </button>
                </div>

                {/* Fields */}
                {comp.isExpanded !== false && (
                  <div style={formStyles.compFields}>
                  <div style={formStyles.fieldGroup}>
                    <label style={formStyles.fieldLabel}>Component Name</label>
                    <input
                      name="name"
                      value={comp.name}
                      onChange={(e) => handleComponentChange(index, e)}
                      placeholder="e.g. User List"
                      style={formStyles.fieldInput}
                      required
                    />
                  </div>
                  <div style={formStyles.fieldGroup}>
                    <label style={formStyles.fieldLabel}>Route</label>
                    <input
                      name="route"
                      value={comp.route}
                      onChange={(e) => handleComponentChange(index, e)}
                      placeholder="e.g. /admin/users/list"
                      style={formStyles.fieldInput}
                      required
                    />
                  </div>
                  <div style={{ ...formStyles.fieldGroup, gridColumn: "1 / -1" }}>
                    <label style={formStyles.fieldLabel}>Description (Optional)</label>
                    <input
                      name="description"
                      value={comp.description || ""}
                      onChange={(e) => handleComponentChange(index, e)}
                      placeholder="e.g. Represents the user listing interface"
                      style={formStyles.fieldInput}
                    />
                  </div>

                  {/* API Mapping inside Component */}
                  <div style={{ gridColumn: "1 / -1", marginTop: "12px", borderTop: "1px dashed #cbd5e1", paddingTop: "12px" }}>
                    <p style={{...formStyles.sectionTitle, fontSize: "12px"}}>Component APIs</p>
                    <p style={{...formStyles.sectionSub, marginBottom: "12px"}}>Select backend APIs this specific component needs to access.</p>
                    
                    {/* Search Bar */}
                    <div style={{ marginBottom: "16px" }}>
                      <input
                        type="text"
                        placeholder="Search services (e.g. user-svc)..."
                        value={apiSearchQuery}
                        onChange={(e) => setApiSearchQuery(e.target.value)}
                        style={{...formStyles.fieldInput, padding: "8px 12px", fontSize: "12px"}}
                      />
                    </div>

                    {loadingApis ? (
                      <p style={{ fontSize: "12px", color: "#64748b" }}>Loading services...</p>
                    ) : displayedServices.length === 0 ? (
                      <p style={{ fontSize: "12px", color: "#64748b" }}>
                        {apiSearchQuery.trim() ? "No services match your search." : "No services available."}
                      </p>
                    ) : (
                      <div className="service-list">
                        {displayedServices.map((serviceName) => {
                          const apis = groupedApis[serviceName];
                          const hasAny = apis.some(api => (comp.allowedPermissions || []).includes(api.permissionKey));
                          
                          return (
                            <div key={serviceName} className={`service-card ${hasAny ? "checked" : ""}`}>
                              <div
                                className="service-header"
                                onClick={() => toggleComponentServiceExpand(index, serviceName, apis)}
                                style={{ padding: "10px 12px" }}
                              >
                                <input type="checkbox" checked={hasAny} readOnly />
                                <span className="service-name" style={{ fontSize: "13px" }}>{serviceName.toUpperCase()}</span>
                              </div>
                              
                              {hasAny && (
                                <div className="actions-list" style={{ padding: "10px 12px" }}>
                                  <div className="actions-grid">
                                    {apis.map((api) => {
                                      const isSelected = (comp.allowedPermissions || []).includes(api.permissionKey);
                                      return (
                                        <div
                                          key={api.permissionKey}
                                          className={`action-chip ${isSelected ? "selected" : ""}`}
                                          style={{ padding: "6px 8px", fontSize: "12px" }}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleComponentPermission(index, api.permissionKey);
                                          }}
                                        >
                                          <input type="checkbox" checked={isSelected} readOnly />
                                          <span className="action-name">{api.resource} :&nbsp;</span>
                                          <span className="action-desc">{api.action}</span>
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
                  </div>
                </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" style={{ ...styles.button, marginTop: "28px" }}>
          Register Microfrontend
        </button>
      </form>

      <style>{`
        .comp-card-input:focus {
          border-color: rgba(129, 140, 248, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1) !important;
          background: #fff !important;
          outline: none;
        }
        .service-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .service-card {
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          background: rgba(0, 0, 0, 0.2);
          transition: border 0.2s, background 0.2s;
        }
        .service-card.checked {
          border-color: #475569;
          background: rgba(51, 65, 85, 0.3);
        }
        .service-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          cursor: pointer;
        }
        .service-header:hover {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .service-header input {
          appearance: none;
          width: 17px;
          height: 17px;
          border-radius: 5px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          background: transparent;
          margin: 0;
          cursor: pointer;
        }
        .service-header input:checked {
          background: #334155;
          border-color: #475569;
        }
        .service-name {
          font-weight: 600;
          color: #f8fafc;
          font-size: 14px;
        }
        .actions-list {
          padding: 14px 16px 18px 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        .actions-title {
          font-size: 12px;
          color: #6b7280;
          margin-bottom: 10px;
          font-weight: 600;
        }
        .actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill,minmax(200px,1fr));
          gap: 8px;
        }
        .action-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 10px;
          border-radius: 7px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(0, 0, 0, 0.2);
          cursor: pointer;
          font-size: 13px;
          font-family: 'DM Mono', monospace;
          transition: all 0.15s;
        }
        .action-chip:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.3);
        }
        .action-chip.selected {
          background: rgba(51, 65, 85, 0.5);
          border-color: #475569;
        }
        .action-chip input {
          appearance: none;
          width: 15px;
          height: 15px;
          border-radius: 4px;
          border: 1.5px solid rgba(255, 255, 255, 0.3);
          margin: 0;
          cursor: pointer;
        }
        .action-chip input:checked {
          background: #334155;
          border-color: #475569;
        }
        .action-name {
          font-weight: 600;
          color: #f8fafc;
        }
        .action-desc {
          color: #94a3b8;
        }
      `}</style>
    </>
  );
};

// ── Local styles ──────────────────────────────────────────────────────────────
const formStyles = {
  /* Active toggle (main) */
  toggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
    marginBottom: "28px",
    marginTop: "4px",
    userSelect: "none",
  },
  toggleTrack: {
    width: "44px",
    height: "24px",
    borderRadius: "100px",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.25s ease",
    flexShrink: 0,
  },
  toggleThumb: {
    position: "absolute",
    top: "2px",
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 4px rgba(0,0,0,0.18)",
    transition: "transform 0.25s ease",
  },
  toggleLabel: {
    fontSize: "13.5px",
    color: "#475569",
    fontWeight: 500,
  },

  /* Components section wrapper */
  section: {
    marginTop: "8px",
    padding: "24px",
    borderRadius: "18px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.05)",
    backdropFilter: "blur(8px)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px",
  },
  sectionTitle: {
    fontSize: "13px",
    fontWeight: 700,
    color: "#f8fafc",
    marginBottom: "2px",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    margin: 0,
  },
  sectionSub: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "3px",
    fontWeight: 400,
    margin: 0,
  },
  addBtn: {
    padding: "8px 16px",
    fontSize: "12.5px",
    fontWeight: 600,
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: "10px",
    color: "#cbd5e1",
    cursor: "pointer",
    transition: "all 0.18s ease",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  },

  /* Empty state */
  emptyState: {
    textAlign: "center",
    padding: "32px 16px",
    border: "1.5px dashed rgba(255,255,255,0.2)",
    borderRadius: "14px",
    background: "rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
  },
  emptyIcon: { fontSize: "24px", marginBottom: "4px" },
  emptyTitle: {
    fontSize: "13.5px",
    fontWeight: 600,
    color: "#f8fafc",
    margin: 0,
  },
  emptySub: {
    fontSize: "12px",
    color: "#94a3b8",
    margin: 0,
    maxWidth: "300px",
  },

  /* Component card */
  compCard: {
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
  },
  compCardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(0,0,0,0.2)",
  },
  compIndex: {
    width: "24px",
    height: "24px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #818cf8, #a78bfa)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  compIndexNum: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#fff",
  },
  compCardTitle: {
    fontSize: "12.5px",
    fontWeight: 700,
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },

  /* Mini toggle inside card header */
  miniToggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "7px",
    cursor: "pointer",
    userSelect: "none",
  },
  miniTrack: {
    width: "32px",
    height: "18px",
    borderRadius: "100px",
    position: "relative",
    cursor: "pointer",
    transition: "background 0.22s ease",
    flexShrink: 0,
  },
  miniThumb: {
    position: "absolute",
    top: "2px",
    width: "14px",
    height: "14px",
    borderRadius: "50%",
    background: "#fff",
    boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
    transition: "transform 0.22s ease",
  },

  /* Remove button */
  removeBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.18s ease",
    flexShrink: 0,
  },

  /* Fields inside card */
  compFields: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "14px",
    padding: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  fieldLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  fieldInput: {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.2)",
    background: "rgba(0,0,0,0.2)",
    color: "#f8fafc",
    fontSize: "13.5px",
    fontFamily: "'DM Mono', monospace",
    outline: "none",
    transition: "border-color 0.18s, box-shadow 0.18s",
    boxSizing: "border-box",
    width: "100%",
  },
};

export default MicrofrontendForm;