import React from "react";
import { styles } from "./registryStyles";

export const LoadingOverlay = () => (
  <div style={styles.loadingOverlay}>Registering Service...</div>
);

export const SuccessModal = ({ data, onClose }) => (
  <div style={styles.modalCard}>
    <h2>Service Registered</h2>
    <p>{data.serviceName}</p>
    <p>{data.serviceIdentifier}</p>
    <button type="button" style={styles.button} onClick={onClose}>Close</button>
  </div>
);

export const FailureModal = ({ message, onClose }) => (
  <div style={styles.modalCard}>
    <h2>Registration Failed</h2>
    <p>{message}</p>
    <button type="button" style={styles.button} onClick={onClose}>Close</button>
  </div>
);