import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import UserAttributesPanel from "../components/UserAttributesPanel";
import axios from "axios";

const userServiceUrl = import.meta.env.VITE_USER_SERVICE_URL || 'http://localhost:3003';
const roleServiceUrl = import.meta.env.VITE_ROLE_SERVICE_URL || 'http://localhost:3002';

export default function UserRoleManager() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

    // ── NEW: ABAC attributes panel ────────────────────────────────────────────
    const [attrUser, setAttrUser] = useState(null); // user whose attributes we're editing

    const operations = { ASSIGN: 1, REMOVE: 2, NONE: 0 };
    const [operType, setOperType] = useState(operations.NONE);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`${userServiceUrl}/user`);
            const data = await res.json();
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        } catch { setUsers([]); }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const res = await fetch(`${roleServiceUrl}/roles`);
            const data = await res.json();
            setRoles(data.roles || data || []);
        } catch { setRoles([]); }
    }, []);

    useEffect(() => { fetchRoles(); fetchUsers(); }, []);

    const openModal = (user) => {
        setSelectedUser(user);
        setSelectedRoles([]);
        setStatusMsg({ text: "", type: "" });
    };

    const closeModal = () => {
        setSelectedUser(null);
        setSelectedRoles([]);
        setStatusMsg({ text: "", type: "" });
    };

    const toggleRole = (roleId) => {
        const userRoleIds = (selectedUser?.roles || []).map(r => typeof r === "object" ? r._id : r);
        if (userRoleIds.includes(roleId) && operType === operations.ASSIGN) return;
        setSelectedRoles(prev => prev.includes(roleId) ? prev.filter(r => r !== roleId) : [...prev, roleId]);
    };

    const handleSubmit = async () => {
        if (selectedRoles.length === 0) return;
        setStatusMsg({ text: "", type: "" });
        try {
            if (operType === operations.ASSIGN) {
                await axios.post(`${userServiceUrl}/user/addRole`, { username: selectedUser.username, roleArr: selectedRoles });
                setStatusMsg({ text: "Roles assigned successfully!", type: "success" });
            } else if (operType === operations.REMOVE) {
                await axios.delete(`${userServiceUrl}/user/clear`, { data: { username: selectedUser.username, roleArr: selectedRoles } });
                setStatusMsg({ text: "Roles removed successfully!", type: "success" });
            }
            fetchUsers();
            closeModal();
        } catch (err) {
            setStatusMsg({ text: err.response?.data?.message || err.message || "Something went wrong.", type: "error" });
        }
    };

    const clearRoles = async () => {
        try {
            await axios.delete(`${userServiceUrl}/user/clearAll`);
            fetchUsers();
        } catch (err) {
            setStatusMsg({ text: err.response?.data?.message || err.message, type: "error" });
        }
    };

    return (
        <div style={{ background: "#f0f2f9", minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
            <Navbar />
            <style>{styles}</style>

            <div className="urm-container">
                <div className="urm-header">
                    <div>
                        <h1 className="urm-title">User → Role Manager</h1>
                        <p className="urm-sub">Assign roles (RBAC) and set user attributes (ABAC)</p>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                        <button className="urm-refresh-btn" onClick={() => { fetchUsers(); fetchRoles(); }}>↻ Refresh</button>
                        <button className="urm-danger-btn" onClick={clearRoles}>Clear All Roles</button>
                    </div>
                </div>

                {/* ── User cards ── */}
                <div className="urm-grid">
                    {users.map(user => {
                        const userRoles = user.roles || [];
                        const attrs = user.attributes || {};
                        const hasAttrs = Object.values(attrs).some(v => v && (Array.isArray(v) ? v.length > 0 : true));

                        return (
                            <div key={user._id} className="urm-card">
                                <div className="urm-card-header">
                                    <div className="urm-avatar">{user.name?.[0]?.toUpperCase() ?? "U"}</div>
                                    <div className="urm-card-info">
                                        <span className="urm-card-name">{user.name}</span>
                                        <span className="urm-card-username">@{user.username}</span>
                                    </div>
                                </div>

                                {/* Roles */}
                                <div className="urm-roles-wrap">
                                    {userRoles.length === 0
                                        ? <span className="urm-empty">No roles assigned</span>
                                        : userRoles.map(r => <span key={r} className="urm-role-chip">{r}</span>)
                                    }
                                </div>

                                {/* ABAC attribute preview */}
                                {hasAttrs && (
                                    <div className="urm-attrs-preview">
                                        {attrs.department && <span className="urm-attr-chip dept">{attrs.department}</span>}
                                        {attrs.clearance && <span className="urm-attr-chip clear">{attrs.clearance}</span>}
                                        {attrs.location && <span className="urm-attr-chip loc">{attrs.location}</span>}
                                        {attrs.employeeType && <span className="urm-attr-chip emp">{attrs.employeeType}</span>}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="urm-card-actions">
                                    <button className="urm-assign-btn" onClick={() => { setOperType(operations.ASSIGN); openModal(user); }}>+ Assign Role</button>
                                    <button className="urm-remove-btn" onClick={() => { setOperType(operations.REMOVE); openModal(user); }}>− Remove Role</button>
                                    {/* ── NEW: ABAC attributes button ── */}
                                    <button className="urm-attrs-btn" onClick={() => setAttrUser(user)}>⚙ Attributes</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Role assign/remove modal (unchanged logic) ── */}
            {selectedUser && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>{operType === operations.ASSIGN ? "Assign Roles" : "Remove Roles"} — {selectedUser.name}</h2>
                            <button className="modal-close" onClick={closeModal}>✕</button>
                        </div>

                        <p className="modal-hint">
                            {operType === operations.ASSIGN
                                ? "Select roles to assign. Already-assigned roles are greyed out."
                                : "Select roles to remove from this user."}
                        </p>

                        <div className="role-pick-list">
                            {(() => {
                                const userRoleIds = (selectedUser.roles || []).map(r => typeof r === "object" ? r._id : r);
                                const visibleRoles = operType === operations.REMOVE
                                    ? roles.filter(role => userRoleIds.includes(role._id))
                                    : roles;

                                if (visibleRoles.length === 0) {
                                    return <p style={{ color: "#9ca3af", fontSize: 13, fontStyle: "italic", margin: 0 }}>No roles to show.</p>;
                                }

                                return visibleRoles.map(role => {
                                    const alreadyHas = userRoleIds.includes(role._id);
                                    const isSelected = selectedRoles.includes(role._id);
                                    const disabled = operType === operations.ASSIGN && alreadyHas;
                                    return (
                                        <div
                                            key={role._id}
                                            className={`role-pick-chip ${isSelected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                                            onClick={() => !disabled && toggleRole(role._id)}
                                        >
                                            <span>{role.name}</span>
                                            {alreadyHas && operType === operations.ASSIGN && <span className="has-badge">assigned</span>}
                                            {role.abacPolicies?.length > 0 && <span className="abac-badge">ABAC</span>}
                                        </div>
                                    );
                                });
                            })()}
                        </div>

                        {statusMsg.text && (
                            <div className={`modal-msg ${statusMsg.type}`}>{statusMsg.text}</div>
                        )}

                        <div className="modal-footer">
                            <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                                disabled={selectedRoles.length === 0}
                            >
                                {operType === operations.ASSIGN ? "Assign Selected" : "Remove Selected"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── NEW: ABAC Attributes Panel ── */}
            {attrUser && (
                <UserAttributesPanel
                    user={attrUser}
                    onSaved={fetchUsers}
                    onClose={() => setAttrUser(null)}
                />
            )}
        </div>
    );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.urm-container { padding: 32px; max-width: 1100px; margin: 0 auto; }
.urm-header    { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
.urm-title     { font-size: 22px; font-weight: 700; color: #0d0a41; margin: 0; }
.urm-sub       { font-size: 14px; color: #6b7280; margin: 4px 0 0; }
.urm-refresh-btn { padding: 7px 16px; border-radius: 8px; border: 1px solid #e4e7f0; background: #fff; color: #4f46e5; font-size: 13px; font-weight: 600; cursor: pointer; }
.urm-refresh-btn:hover { background: #eef2ff; }
.urm-danger-btn { padding: 7px 16px; border-radius: 8px; border: 1px solid #fecaca; background: #fff; color: #dc2626; font-size: 13px; font-weight: 600; cursor: pointer; }
.urm-danger-btn:hover { background: #fef2f2; }

.urm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 16px; }

.urm-card { background: #fff; border-radius: 12px; border: 1px solid #e4e7f0; padding: 20px; display: flex; flex-direction: column; gap: 14px; box-shadow: 0 1px 4px rgba(79,70,229,0.06); transition: box-shadow 0.15s; }
.urm-card:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.10); }

.urm-card-header { display: flex; align-items: center; gap: 12px; }
.urm-avatar     { width: 40px; height: 40px; border-radius: 8px; background: #4f46e5; display: flex; align-items: center; justify-content: center; color: #fff; font-size: 16px; font-weight: 700; flex-shrink: 0; }
.urm-card-info  { display: flex; flex-direction: column; }
.urm-card-name  { font-size: 16px; font-weight: 700; color: #0d0a41; }
.urm-card-username { font-size: 13px; color: #6b7280; font-family: 'DM Mono', monospace; }

.urm-roles-wrap { display: flex; flex-wrap: wrap; gap: 6px; min-height: 24px; }
.urm-role-chip  { font-size: 12px; background: #eef2ff; color: #4f46e5; border-radius: 6px; padding: 3px 8px; font-weight: 600; }
.urm-empty      { font-size: 13px; color: #9ca3af; font-style: italic; }

.urm-attrs-preview { display: flex; flex-wrap: wrap; gap: 6px; padding-top: 8px; border-top: 1px solid #e4e7f0; }
.urm-attr-chip  { font-size: 11px; font-weight: 600; border-radius: 6px; padding: 2px 6px; }
.urm-attr-chip.dept  { background: #e0f2fe; color: #0369a1; }
.urm-attr-chip.clear { background: #fef3c7; color: #b45309; }
.urm-attr-chip.loc   { background: #dcfce7; color: #15803d; }
.urm-attr-chip.emp   { background: #f3e8ff; color: #7e22ce; }

.urm-card-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px; }
.urm-assign-btn { flex: 1; padding: 6px 10px; background: #4f46e5; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.urm-assign-btn:hover { background: #4338ca; }
.urm-remove-btn { flex: 1; padding: 6px 10px; background: #fff; color: #ef4444; border: 1px solid #fecaca; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.urm-remove-btn:hover { background: #fef2f2; }
.urm-attrs-btn  { padding: 6px 10px; background: #fff; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
.urm-attrs-btn:hover { background: #f0fdf4; }

.modal-overlay  { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal          { background: #fff; border-radius: 12px; padding: 28px; width: 480px; max-width: 92vw; max-height: 87vh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
.modal-header   { display: flex; align-items: center; justify-content: space-between; }
.modal-header h2 { font-size: 18px; font-weight: 700; color: #0d0a41; margin: 0; }
.modal-close    { background: none; border: none; font-size: 16px; cursor: pointer; color: #6b7280; }
.modal-close:hover { color: #d01d1d; }
.modal-hint     { font-size: 13px; color: #6b7280; margin: 0; }

.role-pick-list { display: flex; flex-direction: column; gap: 8px; }
.role-pick-chip { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; border: 1px solid #e4e7f0; cursor: pointer; font-size: 14px; font-weight: 600; color: #374151; background: #fff; }
.role-pick-chip:hover:not(.disabled) { border-color: #cbd5e1; background: #f9fafb; }
.role-pick-chip.selected { background: #f5f3ff; border-color: #4f46e5; color: #4f46e5; }
.role-pick-chip.disabled { opacity: 0.5; cursor: not-allowed; background: #f9fafb; }
.has-badge  { margin-left: auto; font-size: 10px; background: #f3f4f6; color: #6b7280; border-radius: 6px; padding: 2px 6px; text-transform: uppercase; }
.abac-badge { font-size: 10px; background: #f0fdf4; color: #16a34a; border-radius: 6px; padding: 2px 6px; border: 1px solid #bbf7d0; text-transform: uppercase; }

.modal-msg    { font-size: 13px; border-radius: 8px; padding: 10px 14px; font-weight: 500; }
.modal-msg.success { background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; }
.modal-msg.error   { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; margin-top: 8px; }
.cancel-btn   { padding: 8px 18px; border-radius: 8px; border: 1px solid #e4e7f0; background: #fff; color: #6b7280; font-size: 14px; cursor: pointer; }
.cancel-btn:hover { background: #f9fafb; }
.submit-btn   { padding: 8px 18px; border-radius: 8px; border: none; background: #4f46e5; color: #fff; font-size: 14px; font-weight: 600; cursor: pointer; }
.submit-btn:hover:not(:disabled) { background: #4338ca; }
.submit-btn:disabled { opacity: 0.5; cursor: not-allowed; background: #9ca3af; }
`;
