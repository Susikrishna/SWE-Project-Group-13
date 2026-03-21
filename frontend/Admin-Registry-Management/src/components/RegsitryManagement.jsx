import React, { useState } from "react";
import { styles } from "./registryStyles";
import { LoadingOverlay, SuccessModal, FailureModal } from "./FeedbackModals";
import MicrofrontendForm from "./MicrofrontendForm";
import MicroserviceForm from "./MicroserviceForm";

const RegistryManagement = () => {
  const initialState = {
    serviceName: "", 
    serviceType: "microservice",
    // Microfrontend Specific
    route: "",
    remoteUrl: "",
    module: "",
    // Microservice Specific
    endpoints: [{ path: "", method: "GET", resource: "", action: "read", isPublic: false }],
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);

  // Utility to auto-generate the identifier slug from the service name
  const slugify = (text) => text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleEndpointChange = (index, field, value) => {
    const updated = [...formData.endpoints];
    updated[index][field] = value;
    setFormData({ ...formData, endpoints: updated });
  };

  const addEndpoint = () => {
    setFormData({ ...formData, endpoints: [...formData.endpoints, { path: "", method: "GET", resource: "", action: "read", isPublic: false }] });
  };

  const removeEndpoint = (index) => {
    const updated = formData.endpoints.filter((_, i) => i !== index);
    setFormData({ ...formData, endpoints: updated.length > 0 ? updated : [{ path: "", method: "GET", resource: "", action: "read", isPublic: false }] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFailureMessage(null);
    const startTime = Date.now();

    let targetUrl = "";
    let finalPayload = {};
    
    // Auto-generate the unique identifier slug in the background
    const generatedIdentifier = slugify(formData.serviceName);

    if (formData.serviceType === "microservice") {
      // UPDATED URL: Removed /api prefix
      targetUrl = "http://localhost:3001/registry/services/bulk";
      finalPayload = {
        service: generatedIdentifier, 
        apis: formData.endpoints.filter((ep) => ep.path !== "" && ep.resource !== "")
      };
    } else {
      // UPDATED URL: Removed /api prefix
      targetUrl = "http://localhost:3001/registry/mfes";
      finalPayload = {
        // UPDATED: Changed from featureId to feature to match MFE DB schema
        feature: generatedIdentifier, 
        name: formData.serviceName,
        route: formData.route,
        remoteUrl: formData.remoteUrl,
        module: formData.module
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(finalPayload),
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
          <label style={styles.label}>Service / Feature Name</label>
          <input name="serviceName" value={formData.serviceName} onChange={handleInputChange} placeholder="e.g. Settings Page" style={styles.input} required />

          <label style={styles.label}>Service Type</label>
          <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} style={styles.dropdown}>
            <option value="microservice">Microservice (API Endpoints)</option>
            <option value="microfrontend">Microfrontend (React App)</option>
          </select>

          {formData.serviceType === "microservice" && (
            <MicroserviceForm 
              formData={formData} 
              handleEndpointChange={handleEndpointChange} 
              addEndpoint={addEndpoint} 
              removeEndpoint={removeEndpoint} 
            />
          )}

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