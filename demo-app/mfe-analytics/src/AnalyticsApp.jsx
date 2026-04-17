import React from "react";
import "./AnalyticsApp.css";

function PermissionBadge({ permission, granted = true }) {
  return (
    <span className={`badge ${granted ? 'badge-success' : 'badge-danger'}`}>
      <span style={{marginRight: '4px'}}>{granted ? "✓" : "✕"}</span>
      {permission}
    </span>
  );
}

function ComponentSection({ component, hasPermission }) {
  const requiredPerms = component.allowedPermissions || [];
  const userHasAll = requiredPerms.length === 0 || requiredPerms.every(p => hasPermission(p));

  return (
    <div className={`comp-section ${!userHasAll ? "comp-locked" : ""}`}>
      {!userHasAll && <div className="comp-lock-overlay">🔒 Insufficient Permissions</div>}
      
      <div className="comp-header">
        <h3 className="comp-name">{component.name}</h3>
        <span className="comp-route">{component.route}</span>
      </div>

      <p className="comp-description">{component.description}</p>

      <div className="comp-permissions">
        <span className="comp-perm-label">Required Perms:</span>
        <div className="comp-perm-list">
          {requiredPerms.length === 0 ? (
            <span className="comp-no-perms">None</span>
          ) : (
            requiredPerms.map((perm, i) => (
              <PermissionBadge key={i} permission={perm} granted={hasPermission(perm)} />
            ))
          )}
        </div>
      </div>
      
      {userHasAll && (
        <div className="comp-demo-content">
          <div className="comp-demo-placeholder">
            <span>✦</span> Simulated {component.name} UI
          </div>
        </div>
      )}
    </div>
  );
}

export default function AnalyticsApp({ mfe, hasPermission }) {
  if (!mfe) return <div>Loading MFE...</div>;
  
  return (
    <div className="mfe-remote-container animate-fade-in">
      <div className="mfe-page-header">
        <div className="mfe-page-icon">📈</div>
        <div>
          <h1 className="mfe-page-title">{mfe.name} (Remote)</h1>
          <p className="mfe-page-desc">{mfe.description}</p>
          <span className="mfe-page-feature">{mfe.feature}</span>
        </div>
      </div>

      <h2 className="section-title"><span>📦</span> Remote Components</h2>
      <div className="mfe-components stagger-children">
        {(mfe.components || []).filter(c => c.isActive !== false).map((comp, i) => (
          <ComponentSection key={i} component={comp} hasPermission={hasPermission} />
        ))}
      </div>
    </div>
  );
}
