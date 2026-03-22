import React from "react";
import { styles } from "./registryStyles";

const MicroserviceForm = ({ formData, handleInputChange, handleEndpointChange, addEndpoint, removeEndpoint }) => {
  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const actions = ["read", "create", "update", "delete"];

  return (
    <>
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
        <div key={index} style={{ ...styles.permissionRow, flexDirection: "column", alignItems: "stretch", gap: "10px", padding: "10px", border: "1px solid #444", borderRadius: "8px", marginBottom: "15px" }}>
          
          {/* Top Row: Core Routing & RBAC */}
          <div style={{ display: "flex", gap: "10px", width: "100%" }}>
            <input 
              placeholder="Route (e.g. /:id)" 
              value={ep.route} 
              onChange={(e) => handleEndpointChange(index, "route", e.target.value)} 
              style={styles.resourceInput} 
              required 
            />
            
            <select 
              value={ep.method} 
              onChange={(e) => handleEndpointChange(index, "method", e.target.value)} 
              style={styles.actionDropdown}
            >
              {methods.map((m) => (<option key={m} value={m}>{m}</option>))}
            </select>

            <input 
              placeholder="Resource (e.g. profile)" 
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
              {actions.map((a) => (<option key={a} value={a}>{a}</option>))}
            </select>
            
            <button type="button" onClick={() => removeEndpoint(index)} style={styles.removeBtn}>×</button>
          </div>

          {/* Bottom Row: Metadata & Toggles */}
          <div style={{ display: "flex", gap: "15px", alignItems: "center", width: "100%" }}>
            <input 
              placeholder="Description (e.g. Fetches user profile data)" 
              value={ep.description} 
              onChange={(e) => handleEndpointChange(index, "description", e.target.value)} 
              style={{ ...styles.resourceInput, flexGrow: 1 }} 
            />

            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'white', fontSize: '0.85rem' }}>
              <input 
                type="checkbox" 
                checked={ep.isPublic} 
                onChange={(e) => handleEndpointChange(index, "isPublic", e.target.checked)} 
              />
              Public
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'white', fontSize: '0.85rem' }}>
              <input 
                type="checkbox" 
                checked={ep.isActive} 
                onChange={(e) => handleEndpointChange(index, "isActive", e.target.checked)} 
              />
              Active
            </label>
          </div>
        </div>
      ))}

      <button type="button" style={styles.addPermission} onClick={addEndpoint}>
        + Add Endpoint
      </button>
    </>
  );
};

export default MicroserviceForm;