import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { fetchPermissionSets, updatePermissionSet, deletePermissionSet } from "../services/permissionSetApi";
import { fetchMicrofrontends } from "../services/registryApi";
import MfeGrid from "../components/MfeGrid";

// ── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 8;

const ManagePermissionSetsPage = () => {
  const [sets, setSets] = useState([]);
  const [mfes, setMfes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Search & Pagination
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Inline edit state
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editMfeSelection, setEditMfeSelection] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Debounce search
  useEffect(() => {
    const h = setTimeout(() => { setDebouncedSearch(search.trim()); setCurrentPage(1); }, 350);
    return () => clearTimeout(h);
  }, [search]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [setsRes, mfesRes] = await Promise.all([fetchPermissionSets(), fetchMicrofrontends()]);
      setSets(Array.isArray(setsRes) ? setsRes : []);
      setMfes(Array.isArray(mfesRes) ? mfesRes : (mfesRes?.data || []));
    } catch (err) {
      showToast("Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  // ── Filtered + paginated sets ──
  const filteredSets = debouncedSearch
    ? sets.filter(s => {
        const q = debouncedSearch.toLowerCase();
        return s.name?.toLowerCase().includes(q) || s.description?.toLowerCase().includes(q);
      })
    : sets;
  const totalPages = Math.ceil(filteredSets.length / ITEMS_PER_PAGE);
  const displayedSets = filteredSets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  // ── Toggle helpers ──
  const makeToggle = (setter) => (mfeId) => {
    setter(prev => { const n = { ...prev }; n[mfeId] !== undefined ? delete n[mfeId] : (n[mfeId] = new Set()); return n; });
  };
  const makeToggleComp = (setter) => (mfeId, route) => {
    setter(prev => { const n = { ...prev }; if (n[mfeId] === undefined) n[mfeId] = new Set(); const c = new Set(n[mfeId]); c.has(route) ? c.delete(route) : c.add(route); n[mfeId] = c; return n; });
  };

  // ── Edit handlers ──
  const startEditing = (set) => {
    setEditingId(set._id);
    setEditName(set.name || "");
    setEditDesc(set.description || "");
    const sel = {};
    for (const e of set.mfes || []) { const id = e.mfeId?._id || e.mfeId; if (id) sel[id] = new Set(e.components || []); }
    setEditMfeSelection(sel);
  };

  const cancelEditing = () => { setEditingId(null); setEditName(""); setEditDesc(""); setEditMfeSelection({}); };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editName.trim()) { showToast("Name is required", "error"); return; }
    if (Object.keys(editMfeSelection).length === 0) { showToast("Select at least one MFE", "error"); return; }
    setSaving(true);
    try {
      await updatePermissionSet(editingId, {
        name: editName.trim(), description: editDesc.trim(),
        mfes: Object.entries(editMfeSelection).map(([mfeId, cs]) => ({ mfeId, components: Array.from(cs) })),
      });
      showToast(`"${editName}" updated!`);
      cancelEditing(); loadData();
    } catch (err) { showToast(err.message || "Update failed", "error"); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this permission set?")) return;
    try { await deletePermissionSet(id); showToast("Deleted"); if (editingId === id) cancelEditing(); loadData(); }
    catch (err) { showToast(err.message, "error"); }
  };

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes waveMove  { 0%,100%{transform:scale(1) translate(0,0);}  50%{transform:scale(1.15) translate(3%,2%);} }
        @keyframes waveMove2 { 0%,100%{transform:scale(1.1) translate(0,0);} 50%{transform:scale(1) translate(-3%,-2%);} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ps-mfe-root:hover { background: rgba(238,242,255,0.6) !important; }
        .ps-comp-chip:hover { border-color: #a5b4fc !important; background: #f5f3ff !important; }
        .ps-comp-chip.sel { background: #eef2ff !important; border-color: #4f46e5 !important; }
      `}</style>
      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>

      <div style={{ ...styles.glassCard, marginTop: '120px' }}>
        <h1 style={styles.heading}>Manage Permission Sets</h1>
        <p style={styles.subHeading}>Search, edit, and delete your established bundles.</p>

        {/* ── Search Bar ── */}
        <div style={{ position: 'relative', marginTop: '24px', marginBottom: '28px' }}>
          <div style={styles.searchWrapper}>
            <svg style={styles.searchIcon} xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
            <input
              type="text" placeholder="Search permission sets by name or description…"
              value={search} onChange={e => setSearch(e.target.value)} style={styles.searchInput}
            />
            {search && (
              <button onClick={() => setSearch("")} style={styles.searchClear} aria-label="Clear search">✕</button>
            )}
          </div>
          {debouncedSearch && (
            <div style={styles.resultCount}>
              {filteredSets.length} result{filteredSets.length !== 1 ? 's' : ''} for "{debouncedSearch}"
            </div>
          )}
        </div>

        {/* ── List ── */}
        {loading ? (
          <div style={styles.stateBox}>
            <div style={styles.spinner}></div>
            <p style={{ color: '#64748b', fontSize: '14px', marginTop: '16px' }}>Loading permission sets…</p>
          </div>
        ) : filteredSets.length === 0 ? (
          <div style={styles.stateBox}>
            <p style={{ color: '#94a3b8', fontSize: '15px', fontWeight: 500 }}>
              {debouncedSearch ? "No permission sets match your search." : "No permission sets found. Create one first!"}
            </p>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {displayedSets.map(set => {
                const isBeingEdited = editingId === set._id;

                /* ── Inline Edit ── */
                if (isBeingEdited) {
                  return (
                    <div key={set._id} style={{ background: '#fff', borderRadius: '16px', border: '2px solid #4f46e5', boxShadow: '0 4px 20px rgba(79,70,229,0.1)', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: 'rgba(238,242,255,0.3)' }}>
                        <div>
                          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1e293b' }}>Editing: {set.name}</div>
                          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>Modify and save</div>
                        </div>
                        <button type="button" onClick={cancelEditing} style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>✕ Cancel</button>
                      </div>
                      <form onSubmit={handleUpdate} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                          <div><label style={styles.label}>Set Name *</label><input style={styles.input} value={editName} onChange={e => setEditName(e.target.value)} /></div>
                          <div><label style={styles.label}>Description</label><input style={styles.input} value={editDesc} onChange={e => setEditDesc(e.target.value)} /></div>
                        </div>
                        <div>
                          <label style={styles.label}>Microfrontends &amp; Components</label>
                          <MfeGrid mfes={mfes} mfeSelection={editMfeSelection} toggleMfe={makeToggle(setEditMfeSelection)} toggleComponent={makeToggleComp(setEditMfeSelection)} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          <button type="submit" disabled={saving} style={{ ...styles.button, flex: 1, background: '#4f46e5', marginTop: 0 }}>{saving ? "Saving…" : "Save Changes"}</button>
                          <button type="button" onClick={cancelEditing} style={{ ...styles.button, flex: 'none', width: '110px', background: '#64748b', marginTop: 0 }}>Cancel</button>
                        </div>
                      </form>
                    </div>
                  );
                }

                /* ── Read-only Card ── */
                return (
                  <div key={set._id} style={{ ...styles.registryCard }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#0f172a' }}>{set.name}</h3>
                        {set.description && <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>{set.description}</p>}
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                        <button onClick={() => startEditing(set)} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.15s' }}>Edit</button>
                        <button onClick={() => handleDelete(set._id)} style={{ background: '#fef2f2', border: 'none', color: '#ef4444', padding: '6px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: '700', cursor: 'pointer' }}>Delete</button>
                      </div>
                    </div>
                    <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {(set.mfes || []).map((entry, idx) => {
                        const mfe = entry.mfeId;
                        if (!mfe) return null;
                        const hasFilter = entry.components?.length > 0;
                        return (
                          <div key={idx} style={{ background: '#f8fafc', borderRadius: '10px', padding: '10px 14px', border: '1px solid #e2e8f0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <span style={{ fontWeight: '700', fontSize: '14px', color: '#1e293b' }}>{mfe.name || mfe.feature}</span>
                              {!hasFilter && <span style={{ background: '#f5f3ff', color: '#7c3aed', padding: '2px 8px', borderRadius: '8px', fontSize: '11px', fontWeight: '600' }}>Root Only</span>}
                            </div>
                            {hasFilter && (
                              <div style={{ marginTop: '6px', display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                                {entry.components.map(route => (
                                  <span key={route} style={{ background: '#fff7ed', color: '#ea580c', padding: '3px 7px', borderRadius: '7px', fontSize: '11px', fontWeight: '600', fontFamily: "'DM Mono', monospace" }}>{route}</span>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(226,232,240,0.8)' }}>
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, fontFamily: "'DM Sans', sans-serif" }}>Prev</button>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Page {currentPage} of {totalPages}</div>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#fff', color: '#475569', fontSize: '13px', fontWeight: 600, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, fontFamily: "'DM Sans', sans-serif" }}>Next</button>
              </div>
            )}
          </>
        )}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', background: toast.type === 'error' ? '#fef2f2' : '#f0fdf4', color: toast.type === 'error' ? '#dc2626' : '#16a34a', padding: '16px 24px', borderRadius: '12px', border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`, fontWeight: '600', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 9999 }}>
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default ManagePermissionSetsPage;
