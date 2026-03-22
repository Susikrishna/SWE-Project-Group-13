import React, { useState } from "react";
import { styles } from "./registryStyles";
import { LoadingOverlay, SuccessModal, FailureModal } from "./FeedbackModals";
import MicrofrontendForm from "./MicrofrontendForm";
import MicroserviceForm from "./MicroserviceForm";

const RegistryManagement = () => {
  // 1. Updated Initial State
  const emptyEndpoint = { route: "", method: "GET", description: "", resource: "", action: "read", isPublic: false, isActive: true };

  const initialState = {
    serviceName: "", 
    description: "", 
    serviceType: "microservice",
    isActive: true,
    // Microfrontend Specific
    route: "",
    remoteUrl: "",
    module: "",
    // Microservice Specific
    basePath: "", 
    endpoints: [{ ...emptyEndpoint }],
  };

  const [formData, setFormData] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);

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
    const startTime = Date.now();

    let targetUrl = "";
    let finalPayload = {};
    
    const generatedIdentifier = slugify(formData.serviceName);

    // 2. Updated Payload generation
    if (formData.serviceType === "microservice") {
      targetUrl = "http://localhost:3001/registry/services/bulk";
      finalPayload = {
        service: generatedIdentifier, 
        basePath: formData.basePath,
        // Filter out empty endpoints using 'route' instead of 'path'
        apis: formData.endpoints.filter((ep) => ep.route !== "" && ep.resource !== "")
      };
    } else {
      targetUrl = "http://localhost:3001/registry/mfes";
      finalPayload = {
        feature: generatedIdentifier, 
        name: formData.serviceName,
        description: formData.description,
        route: formData.route,
        remoteUrl: formData.remoteUrl,
        module: formData.module,
        isActive: formData.isActive
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
          <select name="serviceType" value={formData.serviceType} onChange={handleInputChange} style={{...styles.dropdown, marginBottom: '20px'}}>
            <option value="microservice">Microservice (API Endpoints)</option>
            <option value="microfrontend">Microfrontend (React App)</option>
          </select>

          {formData.serviceType === "microservice" && (
            <MicroserviceForm 
              formData={formData} 
              handleInputChange={handleInputChange}
              handleEndpointChange={handleEndpointChange} 
              addEndpoint={addEndpoint} 
              removeEndpoint={removeEndpoint} 
            />
          )}

          {formData.serviceType === "microfrontend" && (
            <MicrofrontendForm formData={formData} handleInputChange={handleInputChange} />
          )}

          <button style={{...styles.button, marginTop: '20px'}}>Register Service</button>
        </form>
      </div>
    </div>
  );
};

export default RegistryManagement;