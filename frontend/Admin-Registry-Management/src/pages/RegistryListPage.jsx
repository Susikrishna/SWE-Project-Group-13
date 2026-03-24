import React from "react";
import { styles } from "../styles/registryTheme";

const RegistryListPage = () => {
  return (
    <div style={styles.page}>
      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>

      <div style={styles.glassCard}>
        <h1 style={styles.heading}>Registered Components</h1>
        <p style={styles.subHeading}>View all active APIs and MFEs in the ecosystem.</p>
        
        <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.5)', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <p style={{ color: '#64748b', fontSize: '14px' }}>Registry table loading...</p>
        </div>
      </div>
    </div>
  );
};

export default RegistryListPage;