import React, { useState } from "react";
import { styles } from "../styles/registryTheme";
import { registerService } from "../services/registryApi";
import { LoadingOverlay, SuccessModal, FailureModal } from "./FeedbackModals";

const MicroserviceForm = () => {
  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const actions = ["read", "create", "update", "delete"];
  const emptyEndpoint = { route: "", method: "GET", description: "", resource: "", action: "read", isPublic: false, isActive: true };

  const [formData, setFormData] = useState({
    serviceName: "",
    basePath: "",
    endpoints: [{ ...emptyEndpoint }]
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);

  const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEndpointChange = (index, field, value) => {
    const updated = [...formData.endpoints];
    updated[index][field] = value;
    setFormData({ ...formData, endpoints: updated });
  };

  const addEndpoint = () => {
    setFormData({ ...formData, endpoints: [...formData.endpoints, { ...emptyEndpoint }] });
  };

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
      apis: formData.endpoints.filter((ep) => ep.route !== "" && ep.resource !== "")
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
      {loading && <LoadingOverlay />}
      {successData && <SuccessModal data={successData} onClose={() => setSuccessData(null)} />}
      {failureMessage && <FailureModal message={failureMessage} onClose={() => setFailureMessage(null)} />}

      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Service Name</label>
        <input 
          name="serviceName" 
          value={formData.serviceName} 
          onChange={handleInputChange} 
          placeholder="e.g. User API" 
          style={styles.input} 
          required 
        />

        <label style={styles.label}>Service Base Path (Gateway Prefix)</label>
        <input 
          name="basePath" 
          value={formData.basePath} 
          onChange={handleInputChange} 
          placeholder="e.g. /api/v1/users" 
          style={{ ...styles.input, marginBottom: "20px" }} 
          required 
        />

        <label style={styles.label}>Endpoints & Permissions Mapping</label>
        {formData.endpoints.map((ep, index) => (
          <div key={index} style={{ ...styles.permissionRow, flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
            
            <div style={{ display: "flex", gap: "10px", width: "100%" }}>
              <input placeholder="Route (e.g. /:id)" value={ep.route} onChange={(e) => handleEndpointChange(index, "route", e.target.value)} style={styles.resourceInput} required />
              <select value={ep.method} onChange={(e) => handleEndpointChange(index, "method", e.target.value)} style={styles.actionDropdown}>
                {methods.map((m) => (<option key={m} value={m}>{m}</option>))}
              </select>
              <input placeholder="Resource (e.g. profile)" value={ep.resource} onChange={(e) => handleEndpointChange(index, "resource", e.target.value)} style={styles.resourceInput} required />
              <select value={ep.action} onChange={(e) => handleEndpointChange(index, "action", e.target.value)} style={styles.actionDropdown}>
                {actions.map((a) => (<option key={a} value={a}>{a}</option>))}
              </select>
              <button type="button" onClick={() => removeEndpoint(index)} style={styles.removeBtn}>×</button>
            </div>

            <div style={{ display: "flex", gap: "15px", alignItems: "center", width: "100%" }}>
              <input placeholder="Description (e.g. Fetches user profile data)" value={ep.description} onChange={(e) => handleEndpointChange(index, "description", e.target.value)} style={{ ...styles.resourceInput, flexGrow: 1 }} />
              
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px', fontWeight: '500' }}>
                <input type="checkbox" checked={ep.isPublic} onChange={(e) => handleEndpointChange(index, "isPublic", e.target.checked)} />
                Public
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', fontSize: '13px', fontWeight: '500' }}>
                <input type="checkbox" checked={ep.isActive} onChange={(e) => handleEndpointChange(index, "isActive", e.target.checked)} />
                Active
              </label>
            </div>
          </div>
        ))}

        <button type="button" style={styles.addPermission} onClick={addEndpoint}>
          + Add Another Endpoint
        </button>

        <button type="submit" style={{...styles.button, marginTop: '10px'}}>Register Microservice</button>
      </form>
    </>
  );
};

export default MicroserviceForm;