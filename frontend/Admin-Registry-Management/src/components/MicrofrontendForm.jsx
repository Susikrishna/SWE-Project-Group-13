import React, { useState } from "react";
import { styles } from "../styles/registryTheme";
import { registerService } from "../services/registryApi";
import { LoadingOverlay, SuccessModal, FailureModal } from "./FeedbackModals";

const MicrofrontendForm = () => {
  const initialState = { name: "", description: "", route: "", remoteUrl: "", module: "", isActive: true };
  const [formData, setFormData] = useState(initialState);
  
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

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
      isActive: formData.isActive
    };

    try {
      const data = await registerService(payload, "microfrontend");
      setSuccessData(data);
      setFormData(initialState);
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

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#475569', fontSize: '13px', fontWeight: '500', marginTop: '10px', marginBottom: '10px' }}>
          <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleInputChange} />
          Active (Enable this MFE immediately)
        </label>

        <button type="submit" style={{...styles.button, marginTop: '24px'}}>Register Microfrontend</button>
      </form>
    </>
  );
};

export default MicrofrontendForm;