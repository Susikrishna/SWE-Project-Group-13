import React, { useState } from "react";
import { styles } from "../styles/registryTheme";
import { registerService } from "../services/registryApi";
import { LoadingOverlay, SuccessModal, FailureModal } from "./FeedbackModals";

const emptyComponent = { name: "", route: "", isActive: true };

const MicrofrontendForm = () => {
  const initialState = { name: "", description: "", route: "", remoteUrl: "", module: "", isActive: true };
  const [formData, setFormData] = useState(initialState);
  const [components, setComponents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);

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

  const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

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
      comps:components,
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
      {failureMessage && <FailureModal message={failureMessage} onClose={() => setFailureMessage(null)} />}

      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Feature Name</label>
        <input name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g. User Dashboard" style={styles.input} required />

        <label style={styles.label}>Description (Optional)</label>
        <input name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g. User settings dashboard" style={styles.input} />

        <label style={styles.label}>Base Route</label>
        <input name="route" value={formData.route} onChange={handleInputChange} placeholder="e.g. /admin" style={styles.input} required />

        <label style={styles.label}>Remote URL</label>
        <input name="remoteUrl" value={formData.remoteUrl} onChange={handleInputChange} placeholder="e.g. http://localhost:5001/assets/remoteEntry.js" style={styles.input} required />

        <label style={styles.label}>Module Name</label>
        <input name="module" value={formData.module} onChange={handleInputChange} placeholder="e.g. ./App" style={styles.input} required />

        <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "13px", fontWeight: "500", marginTop: "10px", marginBottom: "10px" }}>
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
          Active (Enable this MFE immediately)
        </label>
        
        <div style={{ marginTop: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <label style={styles.label}>Components ({components.length})</label>
            <button type="button" onClick={addComponent} style={{ ...styles.button, marginTop: 0, padding: "6px 14px", fontSize: "12px", background: "#3b82f6" }}>
              + Add Component
            </button>
          </div>

          {components.length === 0 && (
            <div style={{ fontSize: "13px", color: "#94a3b8", padding: "12px", border: "1px dashed #cbd5e1", borderRadius: "8px", textAlign: "center" }}>
              No components added. Click "+ Add Component" to add sub-routes.
            </div>
          )}

          {components.map((comp, index) => (
            <div key={index} style={{ border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px", marginBottom: "10px", background: "#f8fafc" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#64748b" }}>COMPONENT {index + 1}</span>
                <button type="button" onClick={() => removeComponent(index)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: "600" }}>
                  ✕ Remove
                </button>
              </div>

              <label style={styles.label}>Component Name</label>
              <input name="name" value={comp.name} onChange={(e) => handleComponentChange(index, e)} placeholder="e.g. User List" style={styles.input} required />

              <label style={styles.label}>Component Route</label>
              <input name="route" value={comp.route} onChange={(e) => handleComponentChange(index, e)} placeholder="e.g. /admin/users/list" style={styles.input} required />

              <label style={{ display: "flex", alignItems: "center", gap: "8px", color: "#475569", fontSize: "13px", fontWeight: "500", marginTop: "10px" }}>
                <input type="checkbox" name="isActive" checked={comp.isActive} onChange={(e) => handleComponentChange(index, e)} />
                Active
              </label>
            </div>
          ))}
        </div>

        <button type="submit" style={{ ...styles.button, marginTop: "24px" }}>
          Register Microfrontend
        </button>
      </form>
    </>
  );
};

export default MicrofrontendForm;