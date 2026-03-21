import React from "react";
import { styles } from "./registryStyles";

const MicroserviceForm = ({ formData, handleEndpointChange, addEndpoint, removeEndpoint }) => {
  const methods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
  const actions = ["read", "create", "update", "delete"];

  return (
    <>
      <label style={styles.label}>Endpoints & Permissions Mapping</label>
      {formData.endpoints.map((ep, index) => (
        <div key={index} style={styles.permissionRow}>
          <input 
            placeholder="Path (e.g. /api/users/:id)" 
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
            {/* Added explicit value attributes here */}
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
            {/* Added explicit value attributes here */}
            {actions.map((a) => (<option key={a} value={a}>{a}</option>))}
          </select>

          <label style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'white', fontSize: '0.85rem' }}>
            <input 
              type="checkbox" 
              checked={ep.isPublic} 
              onChange={(e) => handleEndpointChange(index, "isPublic", e.target.checked)} 
            />
            Public
          </label>

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