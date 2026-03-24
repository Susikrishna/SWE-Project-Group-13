import React from "react";
import { styles } from "../styles/registryTheme";

export const LoadingOverlay = () => (
  <div style={styles.loadingOverlay}>Registering...</div>
);

export const SuccessModal = ({ data, onClose }) => (
  <div style={styles.modalCard}>
    <h2 style={{ ...styles.heading, fontSize: '22px' }}>Registration Successful</h2>
    <p style={{ color: '#475569', marginTop: '10px', fontWeight: '600' }}>{data.serviceName}</p>
    <button type="button" style={styles.button} onClick={onClose}>Continue</button>
  </div>
);

export const FailureModal = ({ message, onClose }) => (
  <div style={styles.modalCard}>
    <h2 style={{ ...styles.heading, fontSize: '22px' }}>Registration Failed</h2>
    <p style={{ color: '#ef4444', marginTop: '10px', fontSize: '14px', marginBottom: '20px' }}>{message}</p>
    <button type="button" style={styles.button} onClick={onClose}>Try Again</button>
  </div>
);