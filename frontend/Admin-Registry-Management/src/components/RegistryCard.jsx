import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { updateMicroservice, updateMicrofrontend } from "../services/registryApi";

// Method badge colors
const methodColors = {
  GET: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  POST: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  PUT: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  PATCH: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  DELETE: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
};

export const Badge = ({ label, color = "#64748b", bg = "#f1f5f9", border = "#e2e8f0" }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.5px",
      borderRadius: "8px",
      background: bg,
      color,
      border: `1px solid ${border}`,
      textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
    }}
  >
    {label}
  </span>
);

const RegistryCard = ({ item, isEditing, onEdit, onSave, onCancel }) => {
  const isApi = item._type === "API";
  const mc = isApi ? methodColors[item.method] || methodColors.GET : null;

  // Form state for inline editing
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditing) {
      if (isApi) {
        setFormData({
          service: item.service || "",
          basePath: item.basePath || "",
          route: item.route || "",
          method: item.method || "GET",
          description: item.description || "",
          resource: item.resource || "",
          action: item.action || "",
          isPublic: item.isPublic ?? false,
          isActive: item.isActive ?? true,
        });
      } else {
        setFormData({
          feature: item.feature || "",
          name: item.name || "",
          description: item.description || "",
          route: item.route || "",
          remoteUrl: item.remoteUrl || "",
          module: item.module || "",
          isActive: item.isActive ?? true,
        });
      }
    }
  }, [isEditing, item, isApi]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      if (isApi) {
        await updateMicroservice(item._id, formData);
      } else {
        await updateMicrofrontend(item._id, formData);
      }
      onSave();
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  if (isEditing) {
    return (
      <div style={{ ...styles.registryCard, border: '2px solid #4f46e5', background: '#fff', boxShadow: '0 8px 30px rgba(79,70,229,0.15)', padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Badge label={isApi ? "API" : "MFE"} bg={isApi ? "#ede9fe" : "#fce7f3"} color={isApi ? "#5b21b6" : "#9d174d"} />
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a' }}>
              Editing {isApi ? item.service : item.name}
            </span>
          </div>
          <button onClick={onCancel} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#64748b', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s' }}>✕ Cancel</button>
        </div>

        {error && <div style={{ color: '#ef4444', fontSize: '13px', marginBottom: '16px', padding: '12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fee2e2', fontWeight: 600 }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {isApi ? (
              <>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px', color: '#94a3b8' }}>Service Name (Locked)</label>
                  <input value={formData.service || ""} disabled style={{ ...styles.input, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px' }}>HTTP Method</label>
                  <select name="method" value={formData.method || "GET"} onChange={handleChange} style={styles.input}>
                    {Object.keys(methodColors).map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px' }}>Base Path</label>
                  <input name="basePath" value={formData.basePath || ""} onChange={handleChange} style={styles.input} required />
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px' }}>Route</label>
                  <input name="route" value={formData.route || ""} onChange={handleChange} style={styles.input} required />
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px', color: '#94a3b8' }}>Resource (Locked)</label>
                  <input value={formData.resource || ""} disabled style={{ ...styles.input, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px', color: '#94a3b8' }}>Action (Locked)</label>
                  <input value={formData.action || ""} disabled style={{ ...styles.input, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} />
                </div>
              </>
            ) : (
              <>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px', color: '#94a3b8' }}>Feature Slug (Locked)</label>
                  <input value={formData.feature || ""} disabled style={{ ...styles.input, background: '#f1f5f9', color: '#94a3b8', cursor: 'not-allowed' }} />
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px' }}>Display Name</label>
                  <input name="name" value={formData.name || ""} onChange={handleChange} style={styles.input} required />
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px' }}>Remote URL</label>
                  <input name="remoteUrl" value={formData.remoteUrl || ""} onChange={handleChange} style={styles.input} required />
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px' }}>Module Name</label>
                  <input name="module" value={formData.module || ""} onChange={handleChange} style={styles.input} required />
                </div>
                <div>
                  <label style={{ ...styles.label, fontSize: '12px' }}>Base Route</label>
                  <input name="route" value={formData.route || ""} onChange={handleChange} style={styles.input} required />
                </div>
              </>
            )}
          </div>

          <div>
            <label style={{ ...styles.label, fontSize: '12px' }}>Description</label>
            <textarea name="description" value={formData.description || ""} onChange={handleChange} style={{ ...styles.input, minHeight: '80px', resize: 'vertical' }} />
          </div>

          <div style={{ display: 'flex', gap: '24px', padding: '12px', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
            {isApi && (
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
                <input type="checkbox" name="isPublic" checked={formData.isPublic || false} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#4f46e5' }} /> Is Public Route
              </label>
            )}
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px', fontWeight: 600, color: '#475569', cursor: 'pointer' }}>
              <input type="checkbox" name="isActive" checked={formData.isActive ?? true} onChange={handleChange} style={{ width: '18px', height: '18px', accentColor: '#10b981' }} /> Is Active
            </label>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button type="submit" disabled={saving} style={{ ...styles.button, flex: 2, marginTop: 0, height: '48px', background: '#4f46e5', boxShadow: '0 4px 12px rgba(79,70,229,0.2)' }}>
              {saving ? "Saving Changes..." : "Save Registry Entry"}
            </button>
            <button type="button" onClick={onCancel} style={{ ...styles.button, flex: 1, marginTop: 0, height: '48px', background: '#64748b' }}>Cancel</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ ...styles.registryCard, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <Badge
            label={isApi ? "API" : "MFE"}
            bg={isApi ? "#ede9fe" : "#fce7f3"}
            color={isApi ? "#5b21b6" : "#9d174d"}
            border={isApi ? "#ddd6fe" : "#fbcfe8"}
          />
          {isApi && mc && <Badge label={item.method} bg={mc.bg} color={mc.text} border={mc.border} />}
          <span style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>
            {isApi ? item.service : item.name}
          </span>
          {!item.isActive && <Badge label="Inactive" bg="#fef2f2" color="#b91c1c" border="#fecaca" />}
        </div>

        {isApi ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Route</span>
              <code style={styles.registryCode}>{item.basePath}{item.route}</code>
            </div>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Permission</span>
              <code style={styles.registryCode}>{item.permissionKey}</code>
            </div>
            {item.description && (
              <div style={styles.registryDetail}>
                <span style={styles.registryDetailLabel}>Description</span>
                <span style={{ color: "#475569", fontSize: "13px" }}>{item.description}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Feature</span>
              <code style={styles.registryCode}>{item.feature}</code>
            </div>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Route</span>
              <code style={styles.registryCode}>{item.route}</code>
            </div>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Module</span>
              <code style={styles.registryCode}>{item.module}</code>
            </div>
            {item.description && (
              <div style={styles.registryDetail}>
                <span style={styles.registryDetailLabel}>Description</span>
                <span style={{ color: "#475569", fontSize: "13px" }}>{item.description}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onEdit(item)}
        style={{
          padding: "6px 12px",
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          color: "#475569",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
      >
        Edit
      </button>
    </div>
  );
};

export default RegistryCard;
