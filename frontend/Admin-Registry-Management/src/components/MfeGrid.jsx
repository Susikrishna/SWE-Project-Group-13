import React from "react";

/**
 * MfeGrid Component
 * Renders a grid of Microfrontend cards with subcomponent selection logic.
 * Used in PermissionSet creation and editing forms.
 */
const MfeGrid = ({ mfes, mfeSelection, toggleMfe, toggleComponent }) => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', alignItems: 'start' }}>
    {mfes.map(mfe => {
      const rootSel = mfeSelection[mfe._id] !== undefined;
      const compSel = mfeSelection[mfe._id] || new Set();
      const comps = mfe.components || [];
      const selectedCompCount = compSel.size;

      return (
        <div 
          key={mfe._id} 
          style={{ 
            borderRadius: '14px', 
            border: `2px solid ${rootSel ? '#4f46e5' : '#e2e8f0'}`, 
            background: rootSel ? 'rgba(238,242,255,0.4)' : 'rgba(255,255,255,0.8)', 
            transition: 'all 0.2s', 
            boxShadow: rootSel ? '0 4px 16px rgba(79,70,229,0.1)' : '0 1px 4px rgba(0,0,0,0.03)', 
            overflow: 'hidden' 
          }}
        >
          {/* Root MFE Header */}
          <div 
            className="ps-mfe-root" 
            onClick={() => toggleMfe(mfe._id)} 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '14px 16px', cursor: 'pointer', 
              background: rootSel ? 'rgba(79,70,229,0.06)' : 'rgba(248,250,252,0.8)', 
              borderBottom: comps.length > 0 ? `1px solid ${rootSel ? '#c7d2fe' : '#e2e8f0'}` : 'none',
              opacity: mfe.isActive === false ? 0.6 : 1
            }}
          >
            <div style={{ 
              width: '18px', height: '18px', borderRadius: '5px', flexShrink: 0, 
              border: `2px solid ${rootSel ? '#4f46e5' : '#cbd5e1'}`, 
              background: rootSel ? '#4f46e5' : '#fff', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' 
            }}>
              {rootSel && <span style={{ color: '#fff', fontSize: '11px', fontWeight: '800', lineHeight: 1 }}>✓</span>}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ fontWeight: '700', fontSize: '13px', color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{mfe.name}</div>
                {mfe.isActive === false && (
                  <span style={{ fontSize: '9px', color: '#ef4444', background: '#fef2f2', border: '1px solid #fee2e2', borderRadius: '5px', padding: '1px 5px', fontWeight: '800' }}>INACTIVE</span>
                )}
              </div>
              <div style={{ fontSize: '10px', color: '#94a3b8', fontFamily: "'DM Mono', monospace", marginTop: '1px' }}>{mfe.route}</div>
            </div>
            {comps.length > 0 && (
              <span style={{ background: '#f1f5f9', color: '#64748b', borderRadius: '6px', padding: '1px 6px', fontSize: '9px', fontWeight: '600', flexShrink: 0 }}>
                {selectedCompCount}/{comps.length} comps
              </span>
            )}
          </div>

          {/* Subcomponents */}
          {comps.length > 0 && (
            <div style={{ padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
              <div style={{ fontSize: '9px', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.8px', marginBottom: '3px' }}>Subcomponents</div>
              {comps.map(comp => {
                const isSel = compSel.has(comp.route);

                // Check if this component's permissions are already fully covered by the root MFE's permissions
                const rootPerms = new Set((mfe.allowedPermissions || []).map(p => p.toLowerCase()));
                const compPerms = (comp.allowedPermissions || []);
                const isCoveredByRoot = rootSel && compPerms.length > 0 && compPerms.every(p => rootPerms.has(p.toLowerCase()));
                const isLocked = isCoveredByRoot;
                const showAsChecked = isSel || isLocked;

                return (
                  <div 
                    key={comp.route} 
                    className={`ps-comp-chip${showAsChecked ? ' sel' : ''}${isLocked ? ' locked' : ''}`} 
                    onClick={e => { e.stopPropagation(); if (!isLocked) toggleComponent(mfe._id, comp.route); }} 
                    style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', padding: '7px 10px', borderRadius: '8px', 
                      cursor: isLocked ? 'not-allowed' : 'pointer', 
                      background: isLocked ? '#f1f5f9' : (isSel ? '#eef2ff' : '#f8fafc'), 
                      border: `1px solid ${isLocked ? '#cbd5e1' : (isSel ? '#a5b4fc' : '#e2e8f0')}`, 
                      transition: 'all 0.15s',
                      opacity: comp.isActive === false ? 0.6 : (isLocked ? 0.7 : 1)
                    }}
                  >
                    <div style={{ 
                      width: '14px', height: '14px', borderRadius: '4px', flexShrink: 0, 
                      border: `2px solid ${showAsChecked ? (isLocked ? '#94a3b8' : '#4f46e5') : '#cbd5e1'}`, 
                      background: showAsChecked ? (isLocked ? '#94a3b8' : '#4f46e5') : '#fff', 
                      display: 'flex', alignItems: 'center', justifyContent: 'center' 
                    }}>
                      {showAsChecked && <span style={{ color: '#fff', fontSize: '8px', fontWeight: '900', lineHeight: 1 }}>{isLocked ? '🔒' : '✓'}</span>}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: '600', color: isLocked ? '#64748b' : '#1e293b' }}>
                        {comp.name}
                        {comp.isActive === false && <span style={{ marginLeft: '6px', color: '#ef4444', fontSize: '8px', fontWeight: '900' }}>OFF</span>}
                      </div>
                      <div style={{ fontSize: '9px', color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>{comp.route}</div>
                    </div>
                    {isLocked && (
                      <span style={{ fontSize: '8px', color: '#64748b', background: '#e2e8f0', borderRadius: '5px', padding: '1px 6px', fontWeight: '700', flexShrink: 0, whiteSpace: 'nowrap' }}>
                        Covered by root
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      );
    })}
  </div>
);

export default MfeGrid;
