import React, { useState, useEffect, useCallback } from "react";
import {
  fetchPermissionSets,
  createPermissionSet,
  updatePermissionSet,
  deletePermissionSet,
} from "../services/permissionSetApi";
import { fetchMicrofrontends, fetchMicroservices } from "../services/registryApi";


/* ─────────────────────────────────────────────
   Tiny helpers
───────────────────────────────────────────── */
const Badge = ({ label, color = "#4f46e5", bg = "#eef2ff" }) => (
  <span
    style={{
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 9px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 600,
      background: bg,
      color,
      fontFamily: "'DM Mono', monospace",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </span>
);

const Toast = ({ msg, type }) => (
  <div
    style={{
      position: "fixed",
      bottom: 28,
      right: 28,
      zIndex: 9999,
      padding: "12px 20px",
      borderRadius: 10,
      background: type === "error" ? "#fef2f2" : "#f0fdf4",
      color: type === "error" ? "#dc2626" : "#16a34a",
      border: `1px solid ${type === "error" ? "#fecaca" : "#bbf7d0"}`,
      fontWeight: 600,
      fontSize: 13,
      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
      animation: "fadeIn 0.2s ease",
    }}
  >
    {type === "error" ? "⚠ " : "✓ "}
    {msg}
  </div>
);

/* ─────────────────────────────────────────────
   Main component
───────────────────────────────────────────── */
export default function PermissionSetManager() {
  const [sets, setSets] = useState([]);
  const [mfes, setMfes] = useState([]);
  const [apis, setApis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSet, setEditingSet] = useState(null); // null = creating

  // ── Form state ───────────────────────────────
  const [formName, setFormName] = useState("");
  const [formDesc, setFormDesc] = useState("");
  const [formMfeIds, setFormMfeIds] = useState(new Set());
  const [formApiIds, setFormApiIds] = useState(new Set());
  const [formSaving, setFormSaving] = useState(false);

  // ── Search ───────────────────────────────────
  const [search, setSearch] = useState("");

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const [setsRes, mfesRes, apisRes] = await Promise.all([
        fetchPermissionSets(),          // native fetch → plain array
        fetchMicrofrontends(),           // Axios → { data: [...] }
        fetchMicroservices(),            // Axios → { data: [...] }
      ]);
      setSets(Array.isArray(setsRes) ? setsRes : []);
      // Unwrap Axios response envelope
      const mfeData = Array.isArray(mfesRes) ? mfesRes : (mfesRes?.data || []);
      const apiData = Array.isArray(apisRes) ? apisRes : (apisRes?.data || []);
      setMfes(mfeData);
      setApis(apiData);
    } catch (e) {
      showToast(e.message || "Failed to load data", "error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // ── Coupling: APIs selectable are only those whose permissionKey
  //    is listed in at least one of the currently selected MFEs
  const coupledApiIds = (() => {
    if (formMfeIds.size === 0) return new Set();
    const allowed = new Set();
    mfes
      .filter((m) => formMfeIds.has(m._id))
      .forEach((m) => {
        (m.allowedPermissions || []).forEach((k) => allowed.add(k));
        (m.components || []).forEach((c) =>
          (c.allowedPermissions || []).forEach((k) => allowed.add(k))
        );
      });
    return new Set(
      apis.filter((a) => allowed.has(a.permissionKey)).map((a) => a._id)
    );
  })();

  // When an MFE is deselected, purge any APIs that no longer have coverage
  const toggleMfe = (id) => {
    setFormMfeIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    // Will auto-clean APIs via effect below
  };

  useEffect(() => {
    // Remove API selections that are no longer covered by selected MFEs
    setFormApiIds((prev) => {
      const next = new Set();
      prev.forEach((id) => {
        if (coupledApiIds.has(id)) next.add(id);
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMfeIds]);

  const toggleApi = (id) => {
    if (!coupledApiIds.has(id)) return; // guard
    setFormApiIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditingSet(null);
    setFormName("");
    setFormDesc("");
    setFormMfeIds(new Set());
    setFormApiIds(new Set());
    setShowForm(true);
  };

  const openEdit = (set) => {
    setEditingSet(set);
    setFormName(set.name);
    setFormDesc(set.description || "");
    setFormMfeIds(new Set(set.mfes.map((m) => m._id || m)));
    setFormApiIds(new Set(set.apis.map((a) => a._id || a)));
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSet(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formName.trim()) {
      showToast("Name is required", "error");
      return;
    }
    if (formApiIds.size > 0 && formMfeIds.size === 0) {
      showToast("Every API needs at least one MFE", "error");
      return;
    }
    setFormSaving(true);
    const payload = {
      name: formName.trim(),
      description: formDesc.trim(),
      mfes: Array.from(formMfeIds),
      apis: Array.from(formApiIds),
    };
    try {
      if (editingSet) {
        await updatePermissionSet(editingSet._id, payload);
        showToast(`"${payload.name}" updated`);
      } else {
        await createPermissionSet(payload);
        showToast(`"${payload.name}" created`);
      }
      closeForm();
      loadAll();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setFormSaving(false);
    }
  };

  const handleDelete = async (set) => {
    if (!window.confirm(`Delete "${set.name}"? This will remove it from any roles that reference it.`)) return;
    try {
      await deletePermissionSet(set._id);
      showToast(`"${set.name}" deleted`);
      loadAll();
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  // Filter sets by search
  const displayed = sets.filter((s) =>
    !search.trim() ||
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || "").toLowerCase().includes(search.toLowerCase())
  );

  /* ── Render ─────────────────────────────────── */
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .ps-card { border: 1px solid #e2e8f0; border-radius: 14px; padding: 18px 20px; background: #fff; transition: box-shadow 0.15s, border-color 0.15s; }
        .ps-card:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.08); border-color: #c7d2fe; }
        .ps-check { appearance:none; width:17px; height:17px; border-radius:5px; border:2px solid #cbd5e1; background:#fff; cursor:pointer; flex-shrink:0; transition:all 0.15s; position:relative; }
        .ps-check:checked { background:#4f46e5; border-color:#4f46e5; }
        .ps-check:checked::after { content:''; position:absolute; top:2px; left:5px; width:4px; height:7px; border:solid #fff; border-width:0 2px 2px 0; transform:rotate(45deg); }
        .ps-check:disabled { opacity:0.35; cursor:not-allowed; }
        .ps-mfe-row { display:flex; align-items:center; gap:10px; padding:9px 12px; border-radius:8px; border:1px solid #e2e8f0; cursor:pointer; transition:background 0.12s, border-color 0.12s; margin-bottom:6px; }
        .ps-mfe-row:hover { background:#f8faff; border-color:#c7d2fe; }
        .ps-mfe-row.selected { background:#eef2ff; border-color:#4f46e5; }
        .ps-api-chip { display:inline-flex; align-items:center; gap:6px; padding:6px 10px; border-radius:8px; border:1px solid #e2e8f0; cursor:pointer; font-size:12px; transition:all 0.12s; margin:4px; }
        .ps-api-chip.available:hover { background:#f5f3ff; border-color:#a5b4fc; }
        .ps-api-chip.selected { background:#eef2ff; border-color:#4f46e5; color:#4f46e5; }
        .ps-api-chip.locked { opacity:0.4; cursor:not-allowed; }
      `}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>
            Permission Sets
            <span style={{ marginLeft: 8, background: "#eef2ff", color: "#4f46e5", borderRadius: 12, padding: "2px 9px", fontSize: 12, fontWeight: 700 }}>
              {sets.length}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            Reusable bundles of MFEs + APIs that can be attached to Roles.
          </div>
        </div>
        <button
          id="ps-create-btn"
          onClick={openCreate}
          style={{ padding: "9px 18px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#4f46e5,#7c3aed)", color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", boxShadow: "0 2px 8px rgba(79,70,229,0.3)" }}
        >
          + Create Set
        </button>
      </div>

      {/* ── Search ── */}
      <div style={{ position: "relative", marginBottom: 20 }}>
        <input
          id="ps-search"
          type="text"
          placeholder="Search permission sets…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: "100%", boxSizing: "border-box", padding: "9px 14px 9px 36px", borderRadius: 10, border: "1px solid #e2e8f0", fontSize: 13, fontFamily: "'DM Sans', sans-serif", outline: "none" }}
        />
        <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#94a3b8" }}>🔍</span>
        {search && (
          <button onClick={() => setSearch("")} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94a3b8", fontSize: 15 }}>✕</button>
        )}
      </div>

      {/* ── List ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 48, color: "#94a3b8" }}>
          <div style={{ width: 28, height: 28, border: "3px solid #e2e8f0", borderTopColor: "#4f46e5", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          Loading permission sets…
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ textAlign: "center", padding: 48, border: "1px dashed #e2e8f0", borderRadius: 14, color: "#94a3b8", fontSize: 14 }}>
          {search ? "No sets match your search." : "No permission sets yet. Create one to get started."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {displayed.map((set) => (
            <div key={set._id} className="ps-card">
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14, color: "#0f172a" }}>{set.name}</span>
                    {!set.isActive && <Badge label="inactive" color="#92400e" bg="#fef9c3" />}
                  </div>
                  {set.description && (
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 3 }}>{set.description}</div>
                  )}

                  {/* MFE badges */}
                  {set.mfes?.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 4 }}>MFEs</span>
                      {set.mfes.map((m) => (
                        <Badge key={m._id} label={m.name || m.feature} color="#6d28d9" bg="#f5f3ff" />
                      ))}
                    </div>
                  )}

                  {/* API badges */}
                  {set.apis?.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.5px", marginRight: 4 }}>APIs</span>
                      {set.apis.map((a) => (
                        <Badge key={a._id} label={a.permissionKey} color="#0369a1" bg="#e0f2fe" />
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button
                    onClick={() => openEdit(set)}
                    style={{ padding: "5px 12px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#f8fafc", color: "#4f46e5", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(set)}
                    style={{ padding: "5px 12px", borderRadius: 7, border: "none", background: "#fef2f2", color: "#dc2626", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Create / Edit Modal ── */}
      {showForm && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}
          onClick={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <div style={{ background: "#fff", borderRadius: 16, padding: 32, width: 580, maxWidth: "94vw", maxHeight: "90vh", overflowY: "auto", boxShadow: "0 16px 48px rgba(0,0,0,0.18)", animation: "fadeIn 0.2s ease", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 800, color: "#0f172a" }}>
                {editingSet ? `Edit — ${editingSet.name}` : "Create Permission Set"}
              </h2>
              <button onClick={closeForm} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#94a3b8" }}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Set Name *</label>
                <input
                  id="ps-form-name"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Analytics Bundle"
                  required
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <input
                  id="ps-form-desc"
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="Optional description…"
                  style={inputStyle}
                />
              </div>

              {/* MFE selection */}
              <div>
                <label style={labelStyle}>
                  Microfrontends{" "}
                  <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none" }}>
                    — selecting an MFE unlocks its APIs below
                  </span>
                </label>
                <div style={{ maxHeight: 200, overflowY: "auto", paddingRight: 4 }}>
                  {mfes.length === 0 ? (
                    <div style={{ color: "#94a3b8", fontSize: 13 }}>No MFEs registered.</div>
                  ) : (
                    mfes.map((m) => {
                      const sel = formMfeIds.has(m._id);
                      return (
                        <div
                          key={m._id}
                          className={`ps-mfe-row ${sel ? "selected" : ""}`}
                          onClick={() => toggleMfe(m._id)}
                        >
                          <input type="checkbox" className="ps-check" checked={sel} readOnly />
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>{m.name}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{m.feature} · {m.route}</div>
                          </div>
                          {sel && m.allowedPermissions?.length > 0 && (
                            <span style={{ fontSize: 11, color: "#4f46e5", background: "#eef2ff", borderRadius: 10, padding: "2px 7px", fontWeight: 600 }}>
                              {m.allowedPermissions.length} APIs
                            </span>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* API selection */}
              <div>
                <label style={labelStyle}>
                  APIs{" "}
                  <span style={{ color: "#94a3b8", fontWeight: 400, textTransform: "none" }}>
                    — only APIs covered by selected MFEs are selectable
                  </span>
                </label>
                {formMfeIds.size === 0 ? (
                  <div style={{ color: "#f59e0b", fontSize: 13, padding: "10px 14px", background: "#fffbeb", borderRadius: 8, border: "1px solid #fde68a" }}>
                    Select at least one MFE to unlock APIs.
                  </div>
                ) : apis.filter((a) => coupledApiIds.has(a._id)).length === 0 ? (
                  <div style={{ color: "#94a3b8", fontSize: 13 }}>
                    No APIs are mapped to the selected MFEs.
                  </div>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", maxHeight: 180, overflowY: "auto" }}>
                    {apis.map((a) => {
                      const available = coupledApiIds.has(a._id);
                      const sel = formApiIds.has(a._id);
                      return (
                        <div
                          key={a._id}
                          className={`ps-api-chip ${!available ? "locked" : sel ? "selected" : "available"}`}
                          onClick={() => toggleApi(a._id)}
                          title={available ? a.permissionKey : "Not covered by selected MFEs"}
                        >
                          <input type="checkbox" className="ps-check" checked={sel} readOnly disabled={!available} style={{ width: 13, height: 13 }} />
                          <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 11 }}>{a.permissionKey}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Coupling summary */}
              {(formMfeIds.size > 0 || formApiIds.size > 0) && (
                <div style={{ background: "#f8fafc", borderRadius: 10, padding: "12px 14px", border: "1px solid #e2e8f0", fontSize: 12, color: "#475569" }}>
                  <strong>Summary: </strong>
                  {formMfeIds.size} MFE{formMfeIds.size !== 1 ? "s" : ""} · {formApiIds.size} API{formApiIds.size !== 1 ? "s" : ""}
                  {formApiIds.size > 0 && formMfeIds.size === 0 && (
                    <span style={{ color: "#dc2626", marginLeft: 8 }}>⚠ APIs require at least one MFE</span>
                  )}
                </div>
              )}

              {/* Footer */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={closeForm} style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: 13, cursor: "pointer" }}>
                  Cancel
                </button>
                <button
                  id="ps-form-submit"
                  type="submit"
                  disabled={formSaving}
                  style={{ padding: "8px 20px", borderRadius: 8, border: "none", background: formSaving ? "#c7d2fe" : "#4f46e5", color: "#fff", fontSize: 13, fontWeight: 700, cursor: formSaving ? "not-allowed" : "pointer" }}
                >
                  {formSaving ? "Saving…" : editingSet ? "Update Set" : "Create Set"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} />}
    </div>
  );
}

const labelStyle = {
  display: "block",
  marginBottom: 7,
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
};
const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 14px",
  borderRadius: 9,
  border: "1px solid #e2e8f0",
  fontSize: 14,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  background: "#f8fafc",
};
