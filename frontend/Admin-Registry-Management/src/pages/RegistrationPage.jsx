import React, { useState } from "react";
import { styles } from "../styles/registryTheme";
import MicrofrontendForm from "../components/MicrofrontendForm";
import MicroserviceForm from "../components/MicroserviceForm";

const RegistrationPage = () => {
  const [serviceType, setServiceType] = useState("microservice");

  return (
    <div style={styles.page}>
      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>

      <div style={styles.glassCard}>
        <h1 style={styles.heading}>Service Registration</h1>
        <p style={styles.subHeading}>Onboard new components into the AuthZ ecosystem</p>

        <label style={styles.label}>Component Type</label>
        <select 
          value={serviceType} 
          onChange={(e) => setServiceType(e.target.value)} 
          style={{...styles.dropdown, marginBottom: '24px'}}
        >
          <option value="microservice">Backend Microservice (APIs)</option>
          <option value="microfrontend">Frontend Microfrontend (UI)</option>
        </select>

        {serviceType === "microservice" ? <MicroserviceForm /> : <MicrofrontendForm />}
      </div>
    </div>
  );
};

export default RegistrationPage;