import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "./Navbar";
import DynamicMfeLoader from "./DynamicMfeLoader";

export default function GenericMfePage() {
  const { microfrontends, hasPermission } = useAuth();
  const location = useLocation();

  // Find the MFE configuration matching the current route
  const mfe = microfrontends.find((m) => m.route === location.pathname);

  if (!mfe) {
    return (
      <div className="app-layout">
        <Navbar />
        <div className="app-content">
          <div className="mfe-no-access" style={{ textAlign: 'center', marginTop: '10vh' }}>
            <span style={{ fontSize: '4rem' }}>🔒</span>
            <h2>Access Denied</h2>
            <p>Your role does not grant access to this Microfrontend or it does not exist.</p>
            <Link to="/home" className="btn btn-primary" style={{ marginTop: '16px' }}>Back to Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-content">
        <div className="mfe-breadcrumb" style={{ marginBottom: '24px', display: 'flex', gap: '8px', fontSize: '0.8rem', color: '#a0a0b8' }}>
          <Link to="/home" style={{ color: '#667eea', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span>{mfe.name}</span>
        </div>

        {/* This takes the securely-fetched MFE config and dynamically loads the UI code across the network */}
        <DynamicMfeLoader mfe={mfe} hasPermission={hasPermission} />
      </div>
    </div>
  );
}
