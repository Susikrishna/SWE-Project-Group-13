import React, { useState } from "react";

const TutorialModal = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("overview");

  const tabs = [
    { id: "overview", label: "RBAC Overview" },
    { id: "mfe", label: "MFE & Components" },
    { id: "api", label: "APIs & Actions" }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div style={localStyles.contentBox}>
            <h3 style={localStyles.tabTitle}>Frontend to Backend Mapping</h3>
            <p style={localStyles.paragraph}>
              The AuzEngine uses a <strong>Role-Based Access Control (RBAC)</strong> model driven by a centralized registry. Instead of hardcoding permissions into code, you register UI modules (Microfrontends) and Backend APIs here.
            </p>
            <p style={localStyles.paragraph}>
              <strong>How it works:</strong>
            </p>
            <ul style={localStyles.list}>
              <li>You register <strong>APIs</strong> (the backend routes).</li>
              <li>You register <strong>Microfrontends (MFEs)</strong> (the UI screens) and map the APIs they need.</li>
              <li>You bundle these MFEs into <strong>Permission Sets</strong>.</li>
              <li>You assign Permission Sets to <strong>Roles</strong>.</li>
            </ul>
            <p style={localStyles.paragraph}>
              When a user logs in, the engine dynamically calculates their access based on this mapping, giving them exactly the UI components and backend API access they need.
            </p>
          </div>
        );
      case "mfe":
        return (
          <div style={localStyles.contentBox}>
            <h3 style={localStyles.tabTitle}>Root vs Component Permissions</h3>
            <p style={localStyles.paragraph}>
              When registering a Microfrontend, you can assign API permissions at two levels: <strong>Root</strong> and <strong>Component</strong>.
            </p>
            <div style={localStyles.cardGroup}>
              <div style={localStyles.infoCard}>
                <h4 style={localStyles.cardTitle}>Root MFE Permissions</h4>
                <p style={localStyles.cardText}>
                  These APIs are <strong>always granted</strong> if a user has access to this Microfrontend. Use this for baseline APIs needed just to load the main app shell or shared data.
                </p>
              </div>
              <div style={localStyles.infoCard}>
                <h4 style={localStyles.cardTitle}>Component Level Permissions</h4>
                <p style={localStyles.cardText}>
                  These APIs are <strong>only granted</strong> if the user is explicitly given access to that specific sub-component (e.g., <code>/settings/billing</code>). 
                </p>
              </div>
            </div>
            <p style={localStyles.importantNote}>
              <strong>Important:</strong> If an API is already granted at the Root level, you do not need to assign it to a sub-component. If root and component permissions are identical, the sub-component serves no distinct security purpose!
            </p>
          </div>
        );
      case "api":
        return (
          <div style={localStyles.contentBox}>
            <h3 style={localStyles.tabTitle}>Understanding Resource + Action</h3>
            <p style={localStyles.paragraph}>
              Every API is identified by a unique <code>permissionKey</code> built from the Service, Resource, and Action.
            </p>
            <div style={localStyles.codeBlock}>
              service-name : <strong>resource</strong> : <strong>action</strong>
            </div>
            <ul style={localStyles.list}>
              <li><strong>Service:</strong> The backend microservice (e.g., <code>user-svc</code>).</li>
              <li><strong>Resource:</strong> The domain entity being accessed (e.g., <code>profile</code>, <code>invoice</code>, <code>report</code>).</li>
              <li><strong>Action:</strong> The operation being performed (e.g., <code>read</code>, <code>create</code>, <code>update</code>, <code>delete</code>).</li>
            </ul>
            <p style={localStyles.paragraph}>
              <strong>Example:</strong> A GET request to <code>/api/v1/users/profile</code> might be mapped to <code>user-svc:profile:read</code>. This structure makes policies readable and scalable.
            </p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={localStyles.overlay} onClick={onClose}>
      <div style={localStyles.modal} onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={localStyles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={localStyles.iconBox}>
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </div>
            <h2 style={localStyles.title}>Registry Tutorial</h2>
          </div>
          <button onClick={onClose} style={localStyles.closeBtn}>✕</button>
        </div>

        {/* Tabs */}
        <div style={localStyles.tabsContainer}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={activeTab === tab.id ? localStyles.activeTab : localStyles.inactiveTab}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div style={localStyles.contentArea}>
          {renderContent()}
        </div>

      </div>
    </div>
  );
};

const localStyles = {
  overlay: {
    position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.4)",
    backdropFilter: "blur(4px)",
    display: "flex", justifyContent: "center", alignItems: "center",
    zIndex: 9999,
    padding: "20px"
  },
  modal: {
    background: "#fff",
    borderRadius: "20px",
    width: "100%", maxWidth: "600px",
    boxShadow: "0 20px 40px rgba(15, 23, 42, 0.15)",
    overflow: "hidden",
    animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)"
  },
  header: {
    padding: "20px 24px",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    display: "flex", justifyContent: "space-between", alignItems: "center"
  },
  iconBox: {
    width: "36px", height: "36px",
    background: "linear-gradient(135deg, #818cf8, #4f46e5)",
    color: "#fff",
    borderRadius: "10px",
    display: "flex", justifyContent: "center", alignItems: "center"
  },
  title: {
    margin: 0, fontSize: "18px", fontWeight: "800", color: "#0f172a"
  },
  closeBtn: {
    background: "transparent", border: "none", color: "#64748b",
    fontSize: "16px", fontWeight: "bold", cursor: "pointer",
    padding: "4px 8px", borderRadius: "6px", transition: "0.2s"
  },
  tabsContainer: {
    display: "flex", padding: "16px 24px 0", gap: "8px",
    borderBottom: "1px solid #e2e8f0", background: "#f8fafc"
  },
  activeTab: {
    padding: "10px 16px", background: "#fff", border: "1px solid #e2e8f0", borderBottom: "none",
    borderRadius: "8px 8px 0 0", color: "#4f46e5", fontWeight: "700", fontSize: "13px",
    cursor: "pointer", transform: "translateY(1px)",
  },
  inactiveTab: {
    padding: "10px 16px", background: "transparent", border: "none",
    color: "#64748b", fontWeight: "600", fontSize: "13px", cursor: "pointer",
  },
  contentArea: {
    padding: "24px",
    background: "#fff",
    minHeight: "280px"
  },
  tabTitle: {
    margin: "0 0 16px 0", fontSize: "16px", fontWeight: "700", color: "#1e293b"
  },
  paragraph: {
    margin: "0 0 12px 0", fontSize: "14px", lineHeight: "1.6", color: "#475569"
  },
  list: {
    margin: "0 0 16px 0", paddingLeft: "24px", color: "#475569", fontSize: "14px", lineHeight: "1.7"
  },
  cardGroup: {
    display: "flex", gap: "16px", marginBottom: "16px", marginTop: "16px"
  },
  infoCard: {
    flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "12px", padding: "16px"
  },
  cardTitle: {
    margin: "0 0 8px 0", fontSize: "13px", fontWeight: "700", color: "#0f172a"
  },
  cardText: {
    margin: 0, fontSize: "13px", color: "#64748b", lineHeight: "1.5"
  },
  importantNote: {
    margin: 0, padding: "12px 16px", background: "#fffbeb", borderLeft: "4px solid #f59e0b",
    color: "#92400e", fontSize: "13px", lineHeight: "1.5", borderRadius: "4px"
  },
  codeBlock: {
    fontFamily: "'DM Mono', monospace", background: "#f1f5f9", padding: "10px 16px",
    borderRadius: "8px", fontSize: "13px", color: "#0f172a", marginBottom: "16px", border: "1px solid #e2e8f0"
  }
};

export default TutorialModal;
