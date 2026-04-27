import React, { useState, useEffect, useCallback } from "react";
import {
  fetchPermissionSets,
  createPermissionSet,
  updatePermissionSet,
  deletePermissionSet,
} from "../services/permissionSetApi";
import { fetchMicroservices } from "../services/registryApi";

// ──────────────────────────────────────────────────────────────────────────────
// Permission Sets Page
// Allows admins to create, view, edit and delete named permission groups.
// Each set shows its full list of component permissions (the "what it contains").
// ──────────────────────────────────────────────────────────────────────────────

const EMPTY_FORM = { name: "", description: "", permissions: [] };

const PermissionSetsPage = () => {
  const [sets, setSets] = useState([]);
  const [allPerms, setAllPerms] = useState([]); // flat list of all API permissionKeys
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null); // null = create mode
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);

  // Delete confirm
  const [deletingId, setDeletingId] = useState(null);

  // Expanded card state
  const [expandedId, setExpandedId] = useState(null);

  // ── Data loading ────────────────────────────────────────────────────────────
  const loadSets = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPermissionSets();
      setSets(Array.isArray(data) ? data : data?.data ?? []);
    } catch (e) {
      setError(e.message || "Failed to load permission sets");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSets();
    // Load all API permissions for the picker
    fetchMicroservices()
      .then((apis) => {
        const raw = Array.isArray(apis) ? apis : apis?.data ?? [];
        const keys = [...new Set(raw.map((a) => a.permissionKey).filter(Boolean))].sort();
        setAllPerms(keys);
      })
      .catch(() => {});
  }, [loadSets]);

  // ── Modal helpers ───────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditingSet(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (set) => {
    setEditingSet(set);
    setForm({ name: set.name, description: set.description ?? "", permissions: [...(set.permissions ?? [])] });
    setFormError(null);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingSet(null);
  };

  const togglePermInForm = (key) => {
    setForm((f) => {
      const next = new Set(f.permissions);
      next.has(key) ? next.delete(key) : next.add(key);
      return { ...f, permissions: [...next] };
    });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSaving(true);
    setFormError(null);
    try {
      if (editingSet) {
        await updatePermissionSet(editingSet._id, {
          name: form.name.trim(),
          description: form.description.trim(),
          permissions: form.permissions,
        });
      } else {
        await createPermissionSet({
          name: form.name.trim(),
          description: form.description.trim(),
          permissions: form.permissions,
        });
      }
      closeModal();
      loadSets();
    } catch (e) {
      setFormError(e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deletePermissionSet(id);
      setDeletingId(null);
      loadSets();
    } catch (e) {
      setError(e.message || "Delete failed");
      setDeletingId(null);
    }
  };

  // Group perms by service prefix for the picker
  const groupedPerms = allPerms.reduce((acc, key) => {
    const svc = key.split(":")[0] ?? "other";
    if (!acc[svc]) acc[svc] = [];
    acc[svc].push(key);
    return acc;
  }, {});

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Permission Sets</h1>
          <p style={s.subtitle}>
            Named, reusable groups of API permissions. Assign a set to a role for
            automatic, cascading permission management.
          </p>
        </div>
        <button style={s.createBtn} onClick={openCreate}>
          + New Permission Set
        </button>
      </div>

      {/* Error state */}
      {error && <div style={s.errorBox}>{error}</div>}

      {/* Loading */}
      {loading ? (
        <div style={s.emptyBox}>Loading permission sets…</div>
      ) : sets.length === 0 ? (
        <div style={s.emptyBox}>
          No permission sets yet.{" "}
          <span
            style={{ color: "#4f46e5", cursor: "pointer", fontWeight: 600 }}
            onClick={openCreate}
          >
            Create the first one.
          </span>
        </div>
      ) : (
        <div style={s.grid}>
          {sets.map((set) => {
            const isExpanded = expandedId === set._id;
            return (
              <div key={set._id} style={s.card}>
                {/* Card header */}
                <div style={s.cardHeader}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={s.cardName}>{set.name}</div>
                    {set.description && (
                      <div style={s.cardDesc}>{set.description}</div>
                    )}
                  </div>
                  <div style={s.cardActions}>
                    <button style={s.editBtn} onClick={() => openEdit(set)}>
                      Edit
                    </button>
                    <button
                      style={s.delBtn}
                      onClick={() => setDeletingId(set._id)}
                    >
                      ✕
                    </button>
                  </div>
                </div>

                {/* Permission count pill + expand toggle */}
                <div
                  style={s.permCount}
                  onClick={() => setExpandedId(isExpanded ? null : set._id)}
                >
                  <span style={s.permCountBadge}>
                    {set.permissions?.length ?? 0} permissions
                  </span>
                  <span style={s.expandChevron}>{isExpanded ? "▲" : "▼"}</span>
                </div>

                {/* Expanded: show all component permission keys */}
                {isExpanded && (
                  <div style={s.permList}>
                    {(set.permissions ?? []).length === 0 ? (
                      <span style={s.emptyPerms}>No permissions in this set.</span>
                    ) : (
                      set.permissions.map((p) => (
                        <span key={p} style={s.permChip}>
                          {p}
                        </span>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────────────────── */}
      {modalOpen && (
        <div style={s.overlay} onClick={closeModal}>
          <div style={s.modal} onClick={(e) => e.stopPropagation()}>
            <div style={s.modalHeader}>
              <h2 style={s.modalTitle}>
                {editingSet ? `Edit — ${editingSet.name}` : "New Permission Set"}
              </h2>
              <button style={s.modalClose} onClick={closeModal}>
                ✕
              </button>
            </div>

            {formError && <div style={s.formError}>{formError}</div>}

            {/* Name */}
            <div style={s.field}>
              <label style={s.label}>Name *</label>
              <input
                style={s.input}
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Billing Read-Only"
              />
            </div>

            {/* Description */}
            <div style={s.field}>
              <label style={s.label}>Description</label>
              <input
                style={s.input}
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
                placeholder="Optional — what is this set for?"
              />
            </div>

            {/* Permission Picker */}
            <div style={s.field}>
              <label style={s.label}>
                Permissions ({form.permissions.length} selected)
              </label>
              <div style={s.pickerBox}>
                {Object.entries(groupedPerms).map(([svc, keys]) => (
                  <div key={svc} style={s.pickerGroup}>
                    <div style={s.pickerGroupLabel}>{svc.toUpperCase()}</div>
                    {keys.map((key) => {
                      const checked = form.permissions.includes(key);
                      return (
                        <label key={key} style={s.pickerRow(checked)}>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => togglePermInForm(key)}
                            style={{ accentColor: "#4f46e5", flexShrink: 0 }}
                          />
                          <span style={s.pickerKey}>{key}</span>
                        </label>
                      );
                    })}
                  </div>
                ))}
                {allPerms.length === 0 && (
                  <p style={{ color: "#94a3b8", fontSize: 13 }}>
                    No API permissions found in registry.
                  </p>
                )}
              </div>
            </div>

            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={closeModal}>
                Cancel
              </button>
              <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation ───────────────────────────────────────────── */}
      {deletingId && (
        <div style={s.overlay} onClick={() => setDeletingId(null)}>
          <div style={{ ...s.modal, maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px", color: "#0f172a" }}>Delete Permission Set?</h3>
            <p style={{ color: "#64748b", fontSize: 14, margin: "0 0 24px" }}>
              This won't automatically update roles that reference this set. Any
              role still holding this ID will simply no longer resolve those permissions.
            </p>
            <div style={s.modalFooter}>
              <button style={s.cancelBtn} onClick={() => setDeletingId(null)}>
                Cancel
              </button>
              <button
                style={{ ...s.saveBtn, background: "#dc2626" }}
                onClick={() => handleDelete(deletingId)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PermissionSetsPage;

// ── Styles ────────────────────────────────────────────────────────────────────
const s = {
  page: {
    padding: "40px 48px",
    fontFamily: "'DM Sans', sans-serif",
    maxWidth: 1100,
    margin: "0 auto",
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 32,
    gap: 16,
    flexWrap: "wrap",
  },
  title: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
    margin: "0 0 6px",
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    margin: 0,
    maxWidth: 560,
  },
  createBtn: {
    padding: "10px 20px",
    borderRadius: 10,
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    cursor: "pointer",
    whiteSpace: "nowrap",
    fontFamily: "'DM Sans', sans-serif",
  },
  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: "12px 16px",
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 20,
  },
  emptyBox: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#94a3b8",
    fontSize: 15,
    background: "#f8fafc",
    borderRadius: 16,
    border: "1px dashed #e2e8f0",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
    gap: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    borderRadius: 14,
    padding: "18px 20px",
    boxShadow: "0 1px 4px rgba(15,23,42,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  cardHeader: {
    display: "flex",
    alignItems: "flex-start",
    gap: 12,
    justifyContent: "space-between",
  },
  cardName: {
    fontSize: 15,
    fontWeight: 700,
    color: "#0f172a",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  cardDesc: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },
  cardActions: {
    display: "flex",
    gap: 6,
    flexShrink: 0,
  },
  editBtn: {
    padding: "4px 12px",
    borderRadius: 8,
    border: "1px solid #e2e8f0",
    background: "#f1f5f9",
    color: "#4f46e5",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  delBtn: {
    padding: "4px 10px",
    borderRadius: 8,
    border: "none",
    background: "#dc2626",
    color: "#fff",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
  },
  permCount: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
    userSelect: "none",
  },
  permCountBadge: {
    display: "inline-block",
    background: "#eef2ff",
    color: "#4f46e5",
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 12,
    fontWeight: 600,
  },
  expandChevron: {
    fontSize: 11,
    color: "#94a3b8",
  },
  permList: {
    display: "flex",
    flexWrap: "wrap",
    gap: 6,
    paddingTop: 6,
    borderTop: "1px dashed #e2e8f0",
  },
  permChip: {
    background: "#f1f5f9",
    color: "#334155",
    fontSize: 11,
    fontFamily: "'JetBrains Mono', monospace",
    padding: "3px 8px",
    borderRadius: 6,
    border: "1px solid #e2e8f0",
  },
  emptyPerms: {
    fontSize: 13,
    color: "#9ca3af",
    fontStyle: "italic",
  },
  // Modal
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.45)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  modal: {
    background: "#fff",
    borderRadius: 14,
    padding: 28,
    width: "100%",
    maxWidth: 560,
    maxHeight: "88vh",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 12px 40px rgba(0,0,0,0.18)",
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: 700,
    color: "#0f172a",
    margin: 0,
  },
  modalClose: {
    background: "none",
    border: "none",
    fontSize: 16,
    cursor: "pointer",
    color: "#6b7280",
    fontFamily: "'DM Sans', sans-serif",
  },
  formError: {
    background: "#fef2f2",
    border: "1px solid #fecaca",
    borderRadius: 8,
    padding: "8px 12px",
    color: "#dc2626",
    fontSize: 13,
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
  },
  input: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    outline: "none",
    color: "#0f172a",
  },
  pickerBox: {
    border: "1px solid #e2e8f0",
    borderRadius: 10,
    padding: "12px 14px",
    maxHeight: 280,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  pickerGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  pickerGroupLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: "#94a3b8",
    letterSpacing: "1px",
    marginBottom: 4,
  },
  pickerRow: (checked) => ({
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "5px 8px",
    borderRadius: 7,
    cursor: "pointer",
    background: checked ? "#eef2ff" : "transparent",
    border: `1px solid ${checked ? "#c7d2fe" : "transparent"}`,
  }),
  pickerKey: {
    fontSize: 12,
    fontFamily: "'JetBrains Mono', monospace",
    color: "#334155",
  },
  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 10,
    paddingTop: 4,
  },
  cancelBtn: {
    padding: "8px 18px",
    borderRadius: 9,
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#6b7280",
    fontSize: 14,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
  saveBtn: {
    padding: "8px 18px",
    borderRadius: 9,
    border: "none",
    background: "#4f46e5",
    color: "#fff",
    fontSize: 14,
    fontWeight: 700,
    fontFamily: "'DM Sans', sans-serif",
    cursor: "pointer",
  },
};
