import React, { useState } from "react";
import { styles } from "../styles/registryTheme";
import { registerService } from "../services/registryApi";
import { LoadingOverlay, SuccessModal, FailureModal } from "./FeedbackModals";

const METHODS  = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const ACTIONS  = ["read", "create", "update", "delete", "list", "revoke", "manage", "send", "export", "schedule", "generate", "cancel", "refund"];

const emptyEndpoint = {
  route: "",
  method: "GET",
  description: "",
  resource: "",
  action: "read",
  isPublic: false,
  isActive: true,
};

const METHOD_COLORS = {
  GET:    { bg: "#dcfce7", text: "#15803d" },
  POST:   { bg: "#dbeafe", text: "#1d4ed8" },
  PUT:    { bg: "#fef9c3", text: "#a16207" },
  PATCH:  { bg: "#ffedd5", text: "#c2410c" },
  DELETE: { bg: "#fee2e2", text: "#b91c1c" },
};

const slugify = (text) =>
  text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

const MicroserviceForm = () => {
  const [formData, setFormData] = useState({
    serviceName: "",
    basePath: "",
    endpoints: [{ ...emptyEndpoint }],
  });
  const [loading,        setLoading]        = useState(false);
  const [successData,    setSuccessData]    = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);

  const handleInputChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleEndpointChange = (index, field, value) => {
    const updated = [...formData.endpoints];
    updated[index][field] = value;
    setFormData({ ...formData, endpoints: updated });
  };

  const addEndpoint = () =>
    setFormData({ ...formData, endpoints: [...formData.endpoints, { ...emptyEndpoint }] });

  const removeEndpoint = (index) => {
    const updated = formData.endpoints.filter((_, i) => i !== index);
    setFormData({ ...formData, endpoints: updated.length > 0 ? updated : [{ ...emptyEndpoint }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFailureMessage(null);
    const payload = {
      service: slugify(formData.serviceName),
      basePath: formData.basePath,
      apis: formData.endpoints.filter((ep) => ep.route !== "" && ep.resource !== ""),
    };
    try {
      const data = await registerService(payload, "microservice");
      setSuccessData(data);
      setFormData({ serviceName: "", basePath: "", endpoints: [{ ...emptyEndpoint }] });
    } catch (err) {
      setFailureMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading        && <LoadingOverlay />}
      {successData    && <SuccessModal    data={successData}       onClose={() => setSuccessData(null)} />}
      {failureMessage && <FailureModal    message={failureMessage} onClose={() => setFailureMessage(null)} />}

      <form onSubmit={handleSubmit}>
        {/* ── Service Info ── */}
        <label style={styles.label}>Service Name</label>
        <input
          name="serviceName"
          value={formData.serviceName}
          onChange={handleInputChange}
          placeholder="e.g. User API"
          style={styles.input}
          required
        />

        <label style={styles.label}>Base Path (Gateway Prefix)</label>
        <input
          name="basePath"
          value={formData.basePath}
          onChange={handleInputChange}
          placeholder="e.g. /api/v1/users"
          style={{ ...styles.input, marginBottom: "4px" }}
          required
        />

        {/* ── Endpoints Section ── */}
        <div style={formStyles.section}>
          {/* Section header */}
          <div style={formStyles.sectionHeader}>
            <div>
              <p style={formStyles.sectionTitle}>Endpoints & Permissions</p>
              <p style={formStyles.sectionSub}>
                Map each route to a resource, action, and access level
              </p>
            </div>
            <button
              type="button"
              onClick={addEndpoint}
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
              + Add Endpoint
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {formData.endpoints.map((ep, index) => {
              const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
              return (
                <div key={index} style={formStyles.endpointCard}>
                  {/* Card header */}
                  <div style={formStyles.cardHeader}>
                    {/* Numbered pill */}
                    <div style={formStyles.indexPill}>
                      <span style={formStyles.indexNum}>{index + 1}</span>
                    </div>

                    {/* Method badge (live) */}
                    <span style={{ ...formStyles.methodBadge, background: mc.bg, color: mc.text }}>
                      {ep.method}
                    </span>

                    <span style={formStyles.endpointRoute}>
                      {ep.route ? `${formData.basePath}${ep.route}` : "Set route below"}
                    </span>

                    <div style={{ flex: 1 }} />

                    {/* Public toggle */}
                    <label style={formStyles.miniToggleRow}>
                      <div
                        style={{
                          ...formStyles.miniTrack,
                          background: ep.isPublic ? "linear-gradient(135deg, #34d399, #059669)" : "#e2e8f0",
                        }}
                        onClick={() => handleEndpointChange(index, "isPublic", !ep.isPublic)}
                      >
                        <div
                          style={{
                            ...formStyles.miniThumb,
                            transform: ep.isPublic ? "translateX(14px)" : "translateX(2px)",
                          }}
                        />
                      </div>
                      <span style={formStyles.toggleLabel}>
                        {ep.isPublic ? "Public" : "Protected"}
                      </span>
                    </label>

                    {/* Active toggle */}
                    <label style={formStyles.miniToggleRow}>
                      <div
                        style={{
                          ...formStyles.miniTrack,
                          background: ep.isActive ? "linear-gradient(135deg, #818cf8, #a78bfa)" : "#e2e8f0",
                        }}
                        onClick={() => handleEndpointChange(index, "isActive", !ep.isActive)}
                      >
                        <div
                          style={{
                            ...formStyles.miniThumb,
                            transform: ep.isActive ? "translateX(14px)" : "translateX(2px)",
                          }}
                        />
                      </div>
                      <span style={formStyles.toggleLabel}>
                        {ep.isActive ? "Active" : "Inactive"}
                      </span>
                    </label>

                    {/* Remove */}
                    {formData.endpoints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEndpoint(index)}
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
                    )}
                  </div>

                  {/* Field grid */}
                  <div style={formStyles.fieldGrid}>
                    {/* Route */}
                    <div style={{ ...formStyles.fieldGroup, gridColumn: "span 2" }}>
                      <label style={formStyles.fieldLabel}>Route</label>
                      <input
                        value={ep.route}
                        onChange={(e) => handleEndpointChange(index, "route", e.target.value)}
                        placeholder="e.g. /:id"
                        style={formStyles.fieldInput}
                        required
                      />
                    </div>

                    {/* Method */}
                    <div style={formStyles.fieldGroup}>
                      <label style={formStyles.fieldLabel}>Method</label>
                      <select
                        value={ep.method}
                        onChange={(e) => handleEndpointChange(index, "method", e.target.value)}
                        style={formStyles.fieldSelect}
                      >
                        {METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                      </select>
                    </div>

                    {/* Resource */}
                    <div style={formStyles.fieldGroup}>
                      <label style={formStyles.fieldLabel}>Resource</label>
                      <input
                        value={ep.resource}
                        onChange={(e) => handleEndpointChange(index, "resource", e.target.value)}
                        placeholder="e.g. profile"
                        style={formStyles.fieldInput}
                        required
                      />
                    </div>

                    {/* Action */}
                    <div style={formStyles.fieldGroup}>
                      <label style={formStyles.fieldLabel}>Action</label>
                      <select
                        value={ep.action}
                        onChange={(e) => handleEndpointChange(index, "action", e.target.value)}
                        style={formStyles.fieldSelect}
                      >
                        {ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>

                    {/* Description */}
                    <div style={{ ...formStyles.fieldGroup, gridColumn: "span 3" }}>
                      <label style={formStyles.fieldLabel}>Description (optional)</label>
                      <input
                        value={ep.description}
                        onChange={(e) => handleEndpointChange(index, "description", e.target.value)}
                        placeholder="e.g. Fetches a single user by ID"
                        style={formStyles.fieldInput}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit */}
        <button type="submit" style={{ ...styles.button, marginTop: "28px" }}>
          Register Microservice
        </button>
      </form>

      <style>{`
        input:focus, select:focus {
          border-color: rgba(129, 140, 248, 0.6) !important;
          box-shadow: 0 0 0 3px rgba(129, 140, 248, 0.1) !important;
          outline: none;
        }
      `}</style>
    </>
  );
};

// ── Local styles ──────────────────────────────────────────────────────────────
const formStyles = {
  section: {
    marginTop: "24px",
    padding: "24px",
    borderRadius: "18px",
    border: "1px solid rgba(226,232,240,0.8)",
    background: "rgba(248,250,252,0.7)",
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
    color: "#0f172a",
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
    border: "1px solid #cbd5e1",
    borderRadius: "10px",
    color: "#475569",
    cursor: "pointer",
    transition: "all 0.18s ease",
    fontFamily: "'DM Sans', sans-serif",
    whiteSpace: "nowrap",
  },

  endpointCard: {
    background: "rgba(255,255,255,0.88)",
    border: "1px solid rgba(226,232,240,0.9)",
    borderRadius: "14px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    borderBottom: "1px solid rgba(226,232,240,0.7)",
    background: "rgba(248,250,252,0.85)",
    flexWrap: "wrap",
  },
  indexPill: {
    width: "24px",
    height: "24px",
    borderRadius: "8px",
    background: "linear-gradient(135deg, #6366f1, #818cf8)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  indexNum: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#fff",
  },
  methodBadge: {
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "10.5px",
    fontWeight: 700,
    fontFamily: "'DM Mono', monospace",
    letterSpacing: "0.4px",
    flexShrink: 0,
  },
  endpointRoute: {
    fontSize: "12.5px",
    fontFamily: "'DM Mono', monospace",
    color: "#64748b",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    maxWidth: "260px",
  },

  miniToggleRow: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
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
  toggleLabel: {
    fontSize: "11.5px",
    color: "#64748b",
    fontWeight: 500,
  },

  removeBtn: {
    width: "28px",
    height: "28px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
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

  fieldGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: "12px",
    padding: "16px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },
  fieldLabel: {
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  fieldInput: {
    padding: "9px 12px",
    borderRadius: "9px",
    border: "1px solid rgba(203,213,225,0.7)",
    background: "rgba(255,255,255,0.9)",
    color: "#0f172a",
    fontSize: "13px",
    fontFamily: "'DM Mono', monospace",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
    transition: "border-color 0.18s, box-shadow 0.18s",
  },
  fieldSelect: {
    padding: "9px 12px",
    borderRadius: "9px",
    border: "1px solid rgba(203,213,225,0.7)",
    background: "#fff",
    color: "#0f172a",
    fontSize: "13px",
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    boxSizing: "border-box",
    width: "100%",
    cursor: "pointer",
    transition: "border-color 0.18s",
  },
};

export default MicroserviceForm;