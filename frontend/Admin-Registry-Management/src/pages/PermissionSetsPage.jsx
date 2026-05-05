import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { createPermissionSet } from "../services/permissionSetApi";
import { fetchMicrofrontends } from "../services/registryApi";
import MfeGrid from "../components/MfeGrid";

const PermissionSetsPage = () => {
  const [mfes, setMfes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [mfeSelection, setMfeSelection] = useState({});
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await fetchMicrofrontends();
        setMfes(Array.isArray(res) ? res : (res?.data || []));
      } catch { showToast("Failed to load MFEs", "error"); }
      finally { setLoading(false); }
    })();
  }, []);

  const filteredMfes = mfes.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.feature.toLowerCase().includes(search.toLowerCase()) ||
    m.route.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredMfes.length / ITEMS_PER_PAGE);
  const displayedMfes = filteredMfes.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const toggleMfe = (mfeId) => {
    setMfeSelection(prev => {
      const n = { ...prev }; n[mfeId] !== undefined ? delete n[mfeId] : (n[mfeId] = new Set()); return n;
    });
  };

  const toggleComponent = (mfeId, route) => {
    setMfeSelection(prev => {
      const n = { ...prev }; if (n[mfeId] === undefined) n[mfeId] = new Set();
      const c = new Set(n[mfeId]); c.has(route) ? c.delete(route) : c.add(route); n[mfeId] = c; return n;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formName.trim()) { showToast("Name is required", "error"); return; }
    if (Object.keys(mfeSelection).length === 0) { showToast("Select at least one MFE", "error"); return; }
    setSaving(true);
    try {
      await createPermissionSet({
        name: formName.trim(), description: formDesc.trim(),
        mfes: Object.entries(mfeSelection).map(([mfeId, cs]) => ({ mfeId, components: Array.from(cs) })),
      });
      showToast(`"${formName}" created!`);
      setFormName(""); setFormDesc(""); setMfeSelection({});
    } catch (err) { showToast(err.message || "Failed to create", "error"); }
    finally { setSaving(false); }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes waveMove  { 0%,100%{transform:scale(1) translate(0,0);}  50%{transform:scale(1.15) translate(3%,2%);} }
        @keyframes waveMove2 { 0%,100%{transform:scale(1.1) translate(0,0);} 50%{transform:scale(1) translate(-3%,-2%);} }
        .ps-mfe-root:hover { background: rgba(255, 255, 255, 0.05) !important; }
        .ps-comp-chip:hover { border-color: rgba(255, 255, 255, 0.3) !important; background: rgba(255, 255, 255, 0.05) !important; }
        .ps-comp-chip.sel { background: rgba(51, 65, 85, 0.5) !important; border-color: #475569 !important; }
      `}</style>
      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>

      <div style={{ ...styles.glassCard, marginTop: '120px' }}>
        <h1 style={styles.heading}>Create Permission Set</h1>
        <p style={{ ...styles.subHeading, marginBottom: '32px' }}>
          Bundle MFEs and their specific subcomponents. Backend API access is derived automatically.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.label}>Set Name *</label>
            <input style={styles.input} value={formName} onChange={e => setFormName(e.target.value)} placeholder="e.g. Analytics Viewer" />
          </div>
          <div>
            <label style={styles.label}>Description</label>
            <input style={styles.input} value={formDesc} onChange={e => setFormDesc(e.target.value)} placeholder="What is this bundle for?" />
          </div>
          <div>
            <label style={styles.label}>Select Microfrontends &amp; Components</label>
            
            {/* MFE Search Bar */}
            <div style={{ position: "relative", marginBottom: "20px" }}>
              <div style={{ ...styles.searchWrapper, background: 'rgba(0, 0, 0, 0.2)' }}>
                <svg style={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <input 
                  type="text" 
                  placeholder="Search microfrontends by name or slug..." 
                  value={search} 
                  onChange={e => setSearch(e.target.value)} 
                  style={{ ...styles.searchInput, padding: '10px 40px', height: '42px', fontSize: '13px' }} 
                />
                {search && (
                  <button onClick={() => setSearch("")} style={styles.searchClear}>✕</button>
                )}
              </div>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', marginTop: 0, marginBottom: '20px', lineHeight: 1.6 }}>
              Check the <strong>root MFE</strong> to grant base access. Pick individual <strong>subcomponents</strong> for fine-grained control.
            </p>
            {loading ? (
              <div style={{ color: '#94a3b8', fontSize: '14px' }}>Loading MFEs…</div>
            ) : filteredMfes.length === 0 ? (
              <div style={{ color: '#fbbf24', fontSize: '14px', padding: '16px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                {search ? "No MFEs match your search." : "No MFEs registered yet."}
              </div>
            ) : (
              <>
                <MfeGrid 
                  mfes={displayedMfes} 
                  mfeSelection={mfeSelection} 
                  toggleMfe={toggleMfe} 
                  toggleComponent={toggleComponent} 
                />
                
                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '24px', padding: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <button 
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(p => p - 1)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(0, 0, 0, 0.2)', color: '#f8fafc', fontSize: '13px', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                      Prev
                    </button>
                    <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Page {currentPage} of {totalPages}</span>
                    <button 
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(p => p + 1)}
                      style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.2)', background: 'rgba(0, 0, 0, 0.2)', color: '#f8fafc', fontSize: '13px', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
          <button type="submit" disabled={saving || loading} style={{ ...styles.button, marginTop: '8px' }}>
            {saving ? "Creating…" : "Create Permission Set"}
          </button>
        </form>
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: toast.type === 'error' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)', color: toast.type === 'error' ? '#f87171' : '#4ade80', padding: '16px 24px', borderRadius: '12px', border: `1px solid ${toast.type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`, fontWeight: '600', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default PermissionSetsPage;
