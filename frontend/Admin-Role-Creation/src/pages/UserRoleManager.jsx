import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import UserAttributesPanel from "../components/UserAttributesPanel";
import axios from "axios";

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
            const res = await fetch("http://localhost:3004/user");
            const data = await res.json();
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        } catch { setUsers([]); }
    }, []);

    const fetchRoles = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:3002/roles");
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
                await axios.post("http://localhost:3004/user/addRole", { username: selectedUser.username, roleArr: selectedRoles });
                setStatusMsg({ text: "Roles assigned successfully!", type: "success" });
            } else if (operType === operations.REMOVE) {
                await axios.delete("http://localhost:3004/user/clear", { data: { username: selectedUser.username, roleArr: selectedRoles } });
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
            await axios.delete("http://localhost:3004/user/clearAll");
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
                            {roles.map(role => {
                                const alreadyHas = (selectedUser.roles || []).map(r => typeof r === "object" ? r._id : r).includes(role._id);
                                const isSelected = selectedRoles.includes(role._id);
                                const disabled = operType === operations.ASSIGN && alreadyHas;
                                return (
                                    <div
                                        key={role._id}
                                        className={`role-pick-chip ${isSelected ? "selected" : ""} ${disabled ? "disabled" : ""}`}
                                        onClick={() => !disabled && toggleRole(role._id)}
                                    >
                                        <span>{role.name}</span>
                                        {alreadyHas && <span className="has-badge">assigned</span>}
                                        {role.abacPolicies?.length > 0 && <span className="abac-badge">ABAC</span>}
                                    </div>
                                );
                            })}
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
.urm-header    { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 28px; flex-wrap: wrap; gap: 12px; }
.urm-title     { font-size: 22px; font-weight: 700; color: #0d0a41; margin: 0; }
.urm-sub       { font-size: 13px; color: #6b7280; margin: 4px 0 0; }
.urm-refresh-btn { padding: 7px 16px; border-radius: 8px; border: 1px solid #e4e7f0; background: #fff; color: #4f46e5; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.urm-refresh-btn:hover { background: #eef2ff; }
.urm-danger-btn { padding: 7px 16px; border-radius: 8px; border: none; background: #fef2f2; color: #dc2626; font-size: 13px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.urm-danger-btn:hover { background: #fee2e2; }

.urm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

.urm-card { background: #fff; border-radius: 12px; border: 1px solid #e4e7f0; padding: 20px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 1px 4px rgba(79,70,229,0.05); transition: box-shadow 0.15s; }
.urm-card:hover { box-shadow: 0 4px 14px rgba(79,70,229,0.09); }
.urm-card-header { display: flex; align-items: center; gap: 12px; }
.urm-avatar     { width: 38px; height: 38px; border-radius: 50%; background: linear-gradient(135deg, #0d0a41 0%, #4f46e5 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-size: 15px; font-weight: 700; flex-shrink: 0; }
.urm-card-info  { display: flex; flex-direction: column; }
.urm-card-name  { font-size: 15px; font-weight: 700; color: #0d0a41; }
.urm-card-username { font-size: 12px; color: #9ca3af; font-family: 'DM Mono', monospace; }

.urm-roles-wrap { display: flex; flex-wrap: wrap; gap: 6px; min-height: 24px; }
.urm-role-chip  { font-size: 11px; background: #eef2ff; color: #4338ca; border-radius: 5px; padding: 2px 9px; font-weight: 600; }
.urm-empty      { font-size: 12px; color: #d1d5db; }

.urm-attrs-preview { display: flex; flex-wrap: wrap; gap: 5px; }
.urm-attr-chip  { font-size: 10px; font-weight: 600; border-radius: 4px; padding: 2px 7px; }
.urm-attr-chip.dept  { background: #f0f9ff; color: #0369a1; }
.urm-attr-chip.clear { background: #fef9c3; color: #92400e; }
.urm-attr-chip.loc   { background: #f0fdf4; color: #166534; }
.urm-attr-chip.emp   { background: #fdf4ff; color: #7e22ce; }

.urm-card-actions { display: flex; gap: 6px; flex-wrap: wrap; }
.urm-assign-btn { flex: 1; padding: 6px 10px; background: #4f46e5; color: #fff; border: none; border-radius: 7px; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
.urm-assign-btn:hover { background: #4338ca; }
.urm-remove-btn { flex: 1; padding: 6px 10px; background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; border-radius: 7px; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
.urm-remove-btn:hover { background: #fee2e2; }
.urm-attrs-btn  { padding: 6px 10px; background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; border-radius: 7px; font-size: 12px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; transition: background 0.15s; }
.urm-attrs-btn:hover { background: #dcfce7; }

.modal-overlay  { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.modal          { background: #fff; border-radius: 12px; padding: 28px; width: 460px; max-width: 92vw; max-height: 85vh; overflow-y: auto; display: flex; flex-direction: column; gap: 16px; box-shadow: 0 8px 32px rgba(0,0,0,0.15); }
.modal-header   { display: flex; align-items: center; justify-content: space-between; }
.modal-header h2 { font-size: 17px; font-weight: 700; color: #0d0a41; margin: 0; }
.modal-close    { background: none; border: none; font-size: 16px; cursor: pointer; color: #6b7280; }
.modal-close:hover { color: #d01d1d; }
.modal-hint     { font-size: 13px; color: #9ca3af; margin: 0; }

.role-pick-list { display: flex; flex-direction: column; gap: 8px; }
.role-pick-chip { display: flex; align-items: center; gap: 8px; padding: 10px 14px; border-radius: 8px; border: 1px solid #e4e7f0; cursor: pointer; font-size: 13px; font-weight: 600; color: #374151; transition: all 0.15s; }
.role-pick-chip:hover:not(.disabled) { background: #eef2ff; border-color: #a5b4fc; }
.role-pick-chip.selected { background: #eef2ff; border-color: #4f46e5; color: #4338ca; }
.role-pick-chip.disabled { opacity: 0.45; cursor: not-allowed; }
.has-badge  { margin-left: auto; font-size: 10px; background: #f3f4f6; color: #9ca3af; border-radius: 4px; padding: 1px 6px; }
.abac-badge { font-size: 10px; background: #f0fdf4; color: #16a34a; border-radius: 4px; padding: 1px 6px; border: 1px solid #bbf7d0; }

.modal-msg    { font-size: 13px; border-radius: 8px; padding: 10px 13px; font-weight: 500; }
.modal-msg.success { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }
.modal-msg.error   { background: #fef2f2; color: #dc2626; border: 1px solid #fecaca; }

.modal-footer { display: flex; justify-content: flex-end; gap: 10px; }
.cancel-btn   { padding: 8px 18px; border-radius: 8px; border: 1px solid #e4e7f0; background: #fff; color: #6b7280; font-size: 14px; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.cancel-btn:hover { background: #f9fafb; }
.submit-btn   { padding: 8px 18px; border-radius: 8px; border: none; background: #4f46e5; color: #fff; font-size: 14px; font-weight: 600; font-family: 'DM Sans', sans-serif; cursor: pointer; }
.submit-btn:hover:not(:disabled) { background: #4338ca; }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }
`;
