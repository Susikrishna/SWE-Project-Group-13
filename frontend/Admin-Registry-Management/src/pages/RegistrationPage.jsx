import React, { useState } from "react";
import { styles } from "../styles/registryTheme";
import MicrofrontendForm from "../components/MicrofrontendForm";
import MicroserviceForm from "../components/MicroserviceForm";
import TutorialModal from "../components/TutorialModal";

const RegistrationPage = () => {
  const [serviceType, setServiceType] = useState("microservice");
  const [showTutorial, setShowTutorial] = useState(false);

  return (
    <div style={styles.page}>
      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>

      {showTutorial && <TutorialModal onClose={() => setShowTutorial(false)} />}

      <div style={styles.glassCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h1 style={{ ...styles.heading, margin: 0 }}>Service Registration</h1>
          <button 
            onClick={() => setShowTutorial(true)}
            style={{
              background: 'linear-gradient(135deg, #818cf8, #4f46e5)', border: 'none', color: '#fff',
              width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(79,70,229,0.3)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            title="How does this work?"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </button>
        </div>
        <p style={{ ...styles.subHeading, marginTop: 0 }}>Onboard new components into the AuthZ ecosystem</p>

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