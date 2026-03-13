import React, { useState } from "react";

const RegistryManagement = () => {
  const [formData, setFormData] = useState({
    serviceName: "",
    serviceIdentifier: "",
    serviceType: "microservice",
    baseUrl: "",
    exposedPermissions: [{ resource: "", action: "read" }],
  });

  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [failureMessage, setFailureMessage] = useState(null);

  const actions = ["read", "create", "update", "delete"];

  const slugify = (text) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w\-]+/g, "");

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === "serviceName") {
      setFormData({
        ...formData,
        serviceName: value,
        serviceIdentifier: slugify(value),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handlePermissionChange = (index, field, value) => {
    const updated = [...formData.exposedPermissions];
    updated[index][field] = value;

    setFormData({
      ...formData,
      exposedPermissions: updated,
    });
  };

  const addPermission = () => {
    setFormData({
      ...formData,
      exposedPermissions: [
        ...formData.exposedPermissions,
        { resource: "", action: "read" },
      ],
    });
  };

  const removePermission = (index) => {
    const updated = formData.exposedPermissions.filter((_, i) => i !== index);

    setFormData({
      ...formData,
      exposedPermissions:
        updated.length > 0 ? updated : [{ resource: "", action: "read" }],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setFailureMessage(null);

    const startTime = Date.now();

    const payload = {
      ...formData,
      exposedPermissions: formData.exposedPermissions.filter(
        (p) => p.resource !== "",
      ),
    };

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    try {
      const response = await fetch("http://localhost:6970/registry", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to register service");
      }

      setSuccessData(data);

      setFormData({
        serviceName: "",
        serviceIdentifier: "",
        serviceType: "microservice",
        baseUrl: "",
        exposedPermissions: [{ resource: "", action: "read" }],
      });
    } catch (err) {
      if (err.name === "AbortError") {
        setFailureMessage("Request timed out. Please try again.");
      } else {
        setFailureMessage(err.message);
      }
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = 1000 - elapsed;

      setTimeout(
        () => {
          setLoading(false);
        },
        remaining > 0 ? remaining : 0,
      );
    }
  };

  const styles = {
    wave: {
      position: "absolute",
      width: "650px",
      height: "650px",
      background:
        "radial-gradient(circle at center, rgba(56,189,248,0.55), transparent 70%)",
      filter: "blur(130px)",
      animation: "waveMove 12s ease-in-out infinite",
    },

    wave2: {
      position: "absolute",
      width: "550px",
      height: "550px",
      background:
        "radial-gradient(circle at center, rgba(99,102,241,0.45), transparent 70%)",
      filter: "blur(110px)",
      animation: "waveMove2 16s ease-in-out infinite",
    },

    page: {
      width: "100vw",
      height: "100vh",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "linear-gradient(135deg,#020617,#0f172a,#1e293b)",
      overflow: "hidden",
      position: "relative",
      fontFamily: "system-ui, sans-serif",
      color: "white",
    },

    glassCard: {
      width: "650px",
      padding: "45px",
      borderRadius: "20px",
      backdropFilter: "blur(25px)",
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.18)",
      boxShadow: "0 20px 60px rgba(0,0,0,0.4)",
      color: "white",
    },

    heading: {
      fontSize: "30px",
      fontWeight: "700",
      textAlign: "center",
      marginBottom: "10px",
    },

    subHeading: {
      textAlign: "center",
      opacity: "0.7",
      marginBottom: "35px",
      fontSize: "14px",
    },

    label: {
      fontSize: "13px",
      marginBottom: "6px",
      display: "block",
      opacity: "0.9",
    },

    input: {
      width: "100%",
      padding: "12px 14px",
      marginBottom: "14px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.2)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
      outline: "none",
      fontSize: "14px",
      backdropFilter: "blur(10px)",
    },

    dropdown: {
      width: "100%",
      padding: "12px",
      marginBottom: "14px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.2)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
    },

    permissionRow: {
      display: "flex",
      gap: "10px",
      marginBottom: "10px",
      alignItems: "center",
    },

    resourceInput: {
      flex: 2,
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.2)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
    },

    actionDropdown: {
      flex: 1,
      padding: "12px",
      borderRadius: "10px",
      border: "1px solid rgba(255,255,255,0.2)",
      background: "rgba(255,255,255,0.05)",
      color: "white",
    },

    removeBtn: {
      width: "26px",
      height: "26px",
      borderRadius: "50%",
      border: "none",
      background: "rgba(239,68,68,0.9)",
      color: "white",
      fontSize: "14px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    },

    addPermission: {
      background: "rgba(255,255,255,0.08)",
      border: "1px solid rgba(255,255,255,0.2)",
      padding: "8px 14px",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "13px",
      marginTop: "5px",
      marginBottom: "15px",
      color: "white",
    },

    button: {
      width: "100%",
      padding: "14px",
      borderRadius: "10px",
      border: "none",
      background: "linear-gradient(135deg,#3b82f6,#2563eb)",
      color: "white",
      fontWeight: "600",
      fontSize: "15px",
      cursor: "pointer",
      marginTop: "10px",
    },

    loadingOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      backdropFilter: "blur(10px)",
      background: "rgba(0,0,0,0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontSize: "22px",
      fontWeight: "600",
      zIndex: 1000,
      color: "white",
    },

    modalCard: {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%,-50%)",
      width: "400px",
      padding: "30px",
      borderRadius: "20px",
      backdropFilter: "blur(25px)",
      background: "rgba(255,255,255,0.1)",
      border: "1px solid rgba(255,255,255,0.2)",
      textAlign: "center",
      zIndex: 1000,
      color: "white",
    },
  };

  return (
    <div style={styles.page}>
      <style>
        {`
        @keyframes waveMove {
          0% { transform: translate(-200px,-150px) scale(1); }
          50% { transform: translate(200px,100px) scale(1.2); }
          100% { transform: translate(-200px,-150px) scale(1); }
        }

        @keyframes waveMove2 {
          0% { transform: translate(250px,200px) scale(1); }
          50% { transform: translate(-150px,-200px) scale(1.3); }
          100% { transform: translate(250px,200px) scale(1); }
        }
        `}
      </style>

      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>

      {loading && (
        <div style={styles.loadingOverlay}>Registering Service...</div>
      )}

      {successData && (
        <div style={styles.modalCard}>
          <h2>Service Registered</h2>
          <p>{successData.serviceName}</p>
          <p>{successData.serviceIdentifier}</p>

          <button style={styles.button} onClick={() => setSuccessData(null)}>
            Close
          </button>
        </div>
      )}

      {failureMessage && (
        <div style={styles.modalCard}>
          <h2>Registration Failed</h2>
          <p>{failureMessage}</p>

          <button style={styles.button} onClick={() => setFailureMessage(null)}>
            Close
          </button>
        </div>
      )}

      <div style={styles.glassCard}>
        <h1 style={styles.heading}>Registry Registration</h1>

        <p style={styles.subHeading}>
          Register your microservices and microfrontends
        </p>

        <form onSubmit={handleSubmit}>
          <label style={styles.label}>Service Name</label>
          <input
            name="serviceName"
            value={formData.serviceName}
            onChange={handleInputChange}
            placeholder="e.g. College Management Service"
            style={styles.input}
            required
          />

          <label style={styles.label}>Service Identifier</label>
          <input
            name="serviceIdentifier"
            value={formData.serviceIdentifier}
            onChange={handleInputChange}
            placeholder="e.g. college-service"
            style={styles.input}
            required
          />

          <label style={styles.label}>Service Type</label>
          <select
            name="serviceType"
            value={formData.serviceType}
            onChange={handleInputChange}
            style={styles.dropdown}
          >
            <option value="microservice">Microservice</option>
            <option value="microfrontend">Microfrontend</option>
          </select>

          <label style={styles.label}>Base URL</label>
          <input
            name="baseUrl"
            value={formData.baseUrl}
            onChange={handleInputChange}
            placeholder="e.g. http://localhost:4002"
            style={styles.input}
            required
          />

          <label style={styles.label}>Permissions</label>

          {formData.exposedPermissions.map((perm, index) => (
            <div key={index} style={styles.permissionRow}>
              <input
                placeholder="e.g. college.students"
                value={perm.resource}
                onChange={(e) =>
                  handlePermissionChange(index, "resource", e.target.value)
                }
                style={styles.resourceInput}
              />

              <select
                value={perm.action}
                onChange={(e) =>
                  handlePermissionChange(index, "action", e.target.value)
                }
                style={styles.actionDropdown}
              >
                {actions.map((a) => (
                  <option key={a}>{a}</option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => removePermission(index)}
                style={styles.removeBtn}
              >
                ×
              </button>
            </div>
          ))}

          <button
            type="button"
            style={styles.addPermission}
            onClick={addPermission}
          >
            + Add Permission
          </button>

          <button style={styles.button}>Register Service</button>
        </form>
      </div>
    </div>
  );
};

export default RegistryManagement;
