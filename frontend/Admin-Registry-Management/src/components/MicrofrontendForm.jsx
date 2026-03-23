import React from "react";
import { styles } from "./registryStyles";

const MicrofrontendForm = ({ formData, handleInputChange }) => {
  return (
    <>
      <label style={styles.label}>Description (Optional)</label>
      <input 
        name="description" 
        value={formData.description} 
        onChange={handleInputChange} 
        placeholder="e.g. User settings and preferences dashboard" 
        style={styles.input} 
      />

      <label style={styles.label}>Base Route</label>
      <input 
        name="route" 
        value={formData.route} 
        onChange={handleInputChange} 
        placeholder="e.g. /admin" 
        style={styles.input} 
        required 
      />

      <label style={styles.label}>Remote URL</label>
      <input 
        name="remoteUrl" 
        value={formData.remoteUrl} 
        onChange={handleInputChange} 
        placeholder="e.g. https://cdn.app.com/remoteEntry.js" 
        style={styles.input} 
        required 
      />

      <label style={styles.label}>Module Name</label>
      <input 
        name="module" 
        value={formData.module} 
        onChange={handleInputChange} 
        placeholder="e.g. AdminDashboard" 
        style={styles.input} 
        required 
      />

      {/* Checkbox for isActive status */}
      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '0.9rem', marginTop: '10px', marginBottom: '10px' }}>
        <input 
          type="checkbox" 
          name="isActive"
          checked={formData.isActive} 
          onChange={(e) => handleInputChange({ target: { name: 'isActive', value: e.target.checked } })} 
        />
        Active (Enable this MFE immediately)
      </label>
    </>
  );
};

export default MicrofrontendForm;