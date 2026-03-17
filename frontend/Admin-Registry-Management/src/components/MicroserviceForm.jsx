import React from "react";
import { styles } from "./registryStyles";

const MicroserviceForm = ({ formData, handleInputChange, handleEndpointChange, addEndpoint, removeEndpoint }) => {
  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const actions = ["read", "create", "update", "delete"];

  return (
    <>
      <label style={styles.label}>Base URL</label>
      <input 
        name="baseUrl" 
        value={formData.baseUrl} 
        onChange={handleInputChange} 
        placeholder="e.g. http://localhost:4002" 
        style={styles.input} 
        required 
      />

      <label style={styles.label}>Endpoints & Permissions Mapping</label>
      {formData.endpoints.map((ep, index) => (
        <div key={index} style={styles.permissionRow}>
          <input 
            placeholder="Path (e.g. /api/users)" 
            value={ep.path} 
            onChange={(e) => handleEndpointChange(index, "path", e.target.value)} 
            style={styles.resourceInput} 
            required 
          />
          
          <select 
            value={ep.method} 
            onChange={(e) => handleEndpointChange(index, "method", e.target.value)} 
            style={styles.actionDropdown}
          >
            {methods.map((m) => (<option key={m}>{m}</option>))}
          </select>

          <input 
            placeholder="Resource (e.g. user)" 
            value={ep.resource} 
            onChange={(e) => handleEndpointChange(index, "resource", e.target.value)} 
            style={styles.resourceInput} 
            required 
          />
          
          <select 
            value={ep.action} 
            onChange={(e) => handleEndpointChange(index, "action", e.target.value)} 
            style={styles.actionDropdown}
          >
            {actions.map((a) => (<option key={a}>{a}</option>))}
          </select>

          <button type="button" onClick={() => removeEndpoint(index)} style={styles.removeBtn}>×</button>
        </div>
      ))}

      <button type="button" style={styles.addPermission} onClick={addEndpoint}>
        + Add Endpoint
      </button>
    </>
  );
};

export default MicroserviceForm;