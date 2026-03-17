import React from "react";
import { styles } from "./registryStyles";

const MicrofrontendForm = ({ formData, handleInputChange }) => {
  return (
    <>
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
        name="moduleName" 
        value={formData.moduleName} 
        onChange={handleInputChange} 
        placeholder="e.g. AdminDashboard" 
        style={styles.input} 
        required 
      />
    </>
  );
};

export default MicrofrontendForm;