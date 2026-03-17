import React, { useState } from "react";
import { styles } from "./registryStyles";
import { LoadingOverlay, SuccessModal, FailureModal } from "./FeedbackModals";
import MicrofrontendForm from "./MicrofrontendForm";
import MicroserviceForm from "./MicroserviceForm";

const RegistryManagement = () => {
  const initialState = {
    serviceName: "",
    serviceIdentifier: "",
    serviceType: "microservice",
    baseUrl: "",
    // Microfrontend Specific
    route: "",
    remoteUrl: "",
    moduleName: "",
    // Microservice Specific
    endpoints: [{ path: "", method: "GET", resource: "", action: "read" }],
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);

  const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "serviceName") {
      setFormData({ ...formData, serviceName: value, serviceIdentifier: slugify(value) });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleEndpointChange = (index, field, value) => {
    const updated = [...formData.endpoints];
    updated[index][field] = value;
    setFormData({ ...formData, endpoints: updated });
  };

  const addEndpoint = () => {
    setFormData({ ...formData, endpoints: [...formData.endpoints, { path: "", method: "GET", resource: "", action: "read" }] });
  };

  const removeEndpoint = (index) => {
    const updated = formData.endpoints.filter((_, i) => i !== index);
    setFormData({ ...formData, endpoints: updated.length > 0 ? updated : [{ path: "", method: "GET", resource: "", action: "read" }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFailureMessage(null);
    const startTime = Date.now();

    // Clean up payload before sending to backend
    const payload = { ...formData };
    if (payload.serviceType === "microservice") {
      delete payload.route; 
      delete payload.remoteUrl; 
      delete payload.moduleName; 
      payload.endpoints = payload.endpoints.filter((ep) => ep.path !== "" && ep.resource !== "");
    } else {
      delete payload.baseUrl; // Removed because MFEs don't use a Base URL
      delete payload.endpoints;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch("http://localhost:3001/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Failed to register service");
      setSuccessData(data);
      setFormData(initialState);
    } catch (err) {
      setFailureMessage(err.name === "AbortError" ? "Request timed out. Please try again." : err.message);
    } finally {
      const elapsed = Date.now() - startTime;
      setTimeout(() => setLoading(false), Math.max(0, 1000 - elapsed));
    }
  };

  return (
    <div style={styles.page}>
      <style>
        {`
        @keyframes waveMove { 0% { transform: translate(-200px,-150px) scale(1); } 50% { transform: translate(200px,100px) scale(1.2); } 100% { transform: translate(-200px,-150px) scale(1); } }
        @keyframes waveMove2 { 0% { transform: translate(250px,200px) scale(1); } 50% { transform: translate(-150px,-200px) scale(1.3); } 100% { transform: translate(250px,200px) scale(1); } }
        `}
      </style>

      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>

      {loading && <LoadingOverlay />}
      {successData && <SuccessModal data={successData} onClose={() => setSuccessData(null)} />}
      {failureMessage && <FailureModal message={failureMessage} onClose={() => setFailureMessage(null)} />}

      <div style={styles.glassCard}>
        <h1 style={styles.heading}>Registry Registration</h1>
        <p style={styles.subHeading}>Register your microservices and microfrontends</p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Service Name</label>
          <input name="serviceName" value={formData.serviceName} onChange={handleInputChange} placeholder="e.g. College Management Service" style={styles.input} required />

          <label style={styles.label}>Service Identifier</label>
          <input name="serviceIdentifier" value={formData.serviceIdentifier} onChange={handleInputChange} placeholder="e.g. college-service" style={styles.input} required />

          <label style={styles.label}>Service Type</label>
          <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} style={styles.dropdown}>
            <option value="microservice">Microservice</option>
            <option value="microfrontend">Microfrontend</option>
          </select>

          {/* Render API specific fields only if Microservice is selected */}
          {formData.serviceType === "microservice" && (
            <MicroserviceForm 
              formData={formData} 
              handleInputChange={handleInputChange}
              handleEndpointChange={handleEndpointChange} 
              addEndpoint={addEndpoint} 
              removeEndpoint={removeEndpoint} 
            />
          )}

          {/* Render MFE specific fields only if Microfrontend is selected */}
          {formData.serviceType === "microfrontend" && (
            <MicrofrontendForm formData={formData} handleInputChange={handleInputChange} />
          )}

          <button style={styles.button}>Register Service</button>
        </form>
      </div>
    </div>
  );
};

export default RegistryManagement;