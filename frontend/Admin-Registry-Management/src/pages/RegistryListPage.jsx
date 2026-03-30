import React from "react";
import { styles } from "../styles/registryTheme";
import MfeTable from "../components/MfeTable";
import ApiTable from "../components/ApiTable";

const RegistryListPage = () => {
  return (
    <div style={styles.page}>
      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>
      <div style={styles.glassCard}>
        <h1 style={styles.heading}>Registered Components</h1>
        <p style={styles.subHeading}>View all active APIs and MFEs in the ecosystem.</p>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <MfeTable />
        </div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <ApiTable />
        </div>
      </div>
    </div>
  );
};

export default RegistryListPage;