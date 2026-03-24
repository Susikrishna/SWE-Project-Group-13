import React from "react";
import { Link, useLocation } from "react-router-dom";
import { styles } from "../styles/registryTheme";

const MfeNavbar = () => {
  const { pathname } = useLocation();
  
  // Helper to check if a link is active
  const isActive = (path) => pathname.endsWith(path);

  return (
    <div style={styles.rolesTopBar}>
      <div style={styles.barNav}>
        <Link 
          to="" 
          style={{ ...styles.barLink, ...(isActive("/registry") || pathname === "/" ? styles.barLinkActive : {}) }}
        >
          Register Component
        </Link>
        <Link 
          to="list" 
          style={{ ...styles.barLink, ...(isActive("list") ? styles.barLinkActive : {}) }}
        >
          View Registry
        </Link>
      </div>
    </div>
  );
};

export default MfeNavbar;