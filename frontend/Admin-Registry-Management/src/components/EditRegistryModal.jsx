import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { updateMicroservice, updateMicrofrontend } from "../services/registryApi";
import { Badge } from "./RegistryCard";

const EditRegistryModal = ({ item, onClose, onSave }) => {
  const isApi = item._type === "API";
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Only load the editable fields
    if (isApi) {
      setFormData({
        description: item.description || "",
        isPublic: item.isPublic ?? false,
        isActive: item.isActive ?? true,
      });
    } else {
      setFormData({
        name: item.name || "",
        description: item.description || "",
        remoteUrl: item.remoteUrl || "",
        isActive: item.isActive ?? true,
      });
    }
  }, [item, isApi]);

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
      onSave(); // Refresh list on success
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Failed to update entry");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = {
    ...styles.input,
    background: "rgba(255, 255, 255, 0.4)",
    borderColor: "rgba(255, 255, 255, 0.2)"
  };

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(4px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <div style={{
        ...styles.glassCard,
        width: "100%",
        maxWidth: "500px",
        position: "relative",
        animation: "slideUp 0.3s ease-out"
      }}>
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            background: "transparent",
            border: "none",
            fontSize: "20px",
            color: "#64748b",
            cursor: "pointer"
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: "20px" }}>
          <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#0f172a", marginBottom: "8px" }}>
            Edit {isApi ? "API" : "MFE"} Entry
          </h2>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
             <Badge label={isApi ? item.service : item.feature} bg="#f1f5f9" color="#475569" />
             {isApi && <Badge label={item.method} bg="#fef3c7" color="#92400e" border="#fde68a" />}
          </div>
        </div>

        {error && (
            <div style={{ padding: "10px", background: "#fef2f2", color: "#b91c1c", borderRadius: "8px", marginBottom: "16px", fontSize: "14px" }}>
                {error}
            </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          
          {!isApi && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Display Name</label>
              <input
                type="text"
                name="name"
                value={formData.name || ""}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
          )}

          {!isApi && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Remote URL</label>
              <input
                type="text"
                name="remoteUrl"
                value={formData.remoteUrl || ""}
                onChange={handleChange}
                style={inputStyle}
                required
              />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Description</label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
            {isApi && (
              <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  name="isPublic"
                  checked={formData.isPublic || false}
                  onChange={handleChange}
                  style={{ width: "16px", height: "16px", accentColor: "#6366f1" }}
                />
                Is Public Route
              </label>
            )}

            <label style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#334155", cursor: "pointer" }}>
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive ?? true}
                onChange={handleChange}
                style={{ width: "16px", height: "16px", accentColor: "#10b981" }}
              />
              Is Active
            </label>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "16px" }}>
            <button
              type="button"
              onClick={onClose}
              style={{ padding: "10px 16px", background: "transparent", border: "1px solid #cbd5e1", borderRadius: "8px", color: "#475569", fontWeight: 600, cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{ padding: "10px 20px", background: "linear-gradient(135deg, #6366f1, #4f46e5)", border: "none", borderRadius: "8px", color: "white", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.7 : 1 }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default EditRegistryModal;
