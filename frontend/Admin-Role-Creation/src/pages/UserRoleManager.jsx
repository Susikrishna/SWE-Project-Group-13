import { useState, useEffect, useCallback } from "react";
import Navbar from "../components/Navbar";
import axios from "axios"
export default function UserRoleManager() {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);

    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [statusMsg, setStatusMsg] = useState({ text: "", type: "" });

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(
                `http://localhost:3003/user`
            );
            const data = await res.json();
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        } catch {
            setUsers([]);
        }
    }, []);
    
    const fetchRoles = useCallback(async () => {
        try {
            const res = await fetch("http://localhost:3002/roles");
            const data = await res.json();
            setRoles(data.roles || data || []);
        } catch {
            setRoles([]);
        }
    }, []);
    
    useEffect(() => { 
        fetchRoles();
        fetchUsers();
    }, []);
    
    
    const openModal = (user) => {
        setSelectedUser(user);
        setSelectedRoles([]);
        setStatusMsg({ text: "", type: "" });
    };
    
    const closeModal = () => {
        if (submitting) return;
        setSelectedUser(null);
        setSelectedRoles([]);
        setStatusMsg({ text: "", type: "" });
    };
    
    const toggleRole = (roleId) => {
        const userRoleIds = (selectedUser?.roles || []).map((r) =>
            typeof r === "object" ? r._id : r
        );
        if (userRoleIds.includes(roleId)) return;
        setSelectedRoles((prev) =>
            prev.includes(roleId) ? prev.filter((r) => r !== roleId) : [...prev, roleId]
        );
    };
    
    const handleSubmit = async () => {
        if (selectedRoles.length === 0) return;
        setSubmitting(true);
        setStatusMsg({ text: "", type: "" });
        try {
            await axios.post("http://localhost:3003/user/addRole", {
                username: selectedUser.username,
                roleArr: selectedRoles,
            });
            setStatusMsg({ text: "Roles assigned successfully!", type: "success" });
            fetchUsers();
            setTimeout(() => closeModal(), 1200);
        } catch (err) {
            setStatusMsg({
                text: err.response?.data?.message || err.message || "Something went wrong.",
                type: "error",
            });
        } finally {
            setSubmitting(false);
        }
    };

    const handleClear = async ()=>{
        try{
            await axios.delete("http://localhost:3003/user/clearAll");
            fetchUsers()
        }
        catch(err){
            console.log(err)
        }
    }

    const getUserRoleIds = (user) =>
        (user?.roles || []).map((r) => (typeof r === "object" ? r._id : r));

    return (
        <>
            <style>{styles}</style>
            <Navbar />
            <div className="role-container">
                <div className="role-form">
                    <div className="form-header">
                        <h2>User Management</h2>
                        <p>{totalUsers} total users</p>
                    </div>
                    <div className="clear-btn" onClick={handleClear}>
                        Clear all roles
                    </div>
                    
                    <div className="form-divider" />
                    
                    
                    {users.length === 0 ? (
                        <div className="state-box">No users found.</div>
                    ) : (
                        <table className="user-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Username</th>
                                    <th>Roles</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user) => (
                                    <tr key={user._id}>
                                        <td className="user-name">{user.name}</td>
                                        <td className="user-username">{user.username}</td>
                                        <td>
                                            {getUserRoleIds(user).length > 0 ? (
                                                <div className="role-chips">
                                                    {getUserRoleIds(user).map((rid) => (
                                                        <span key={rid} className="role-chip">
                                                            {rid}
                                                        </span>
                                                    ))}
                                                </div>
                                            ) : (
                                                <span className="no-roles">No roles</span>
                                            )}
                                        </td>
                                        <td>
                                            <button
                                                className="assign-btn"
                                                onClick={() => openModal(user)}
                                            >
                                                + Assign Role
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            
            {selectedUser && (
                <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && closeModal()}>
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Assign Roles</h3>
                            <p className="modal-subtitle">
                                Adding roles to <span>{selectedUser.username}</span>
                            </p>
                        </div>

                        <div className="form-divider" />
                        

                        <div className="service-list">
                            {roles.map((role) => {
                                const alreadyAssigned = getUserRoleIds(selectedUser).includes(role._id);
                                const isSelected = selectedRoles.includes(role._id);
                                return (
                                    <div
                                        key={role._id}
                                        className={`service-card ${isSelected ? "checked" : ""} ${alreadyAssigned ? "already-assigned" : ""}`}
                                        onClick={() => !alreadyAssigned && toggleRole(role._id)}
                                    >
                                        <div className="service-header">
                                            <input
                                                type="checkbox"
                                                checked={isSelected || alreadyAssigned}
                                                readOnly
                                                disabled={alreadyAssigned}
                                            />
                                            <div>
                                                <div className="service-name">{role.name}</div>
                                                {role.description && (
                                                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                                                        {role.description}
                                                    </div>
                                                )}
                                            </div>
                                            {alreadyAssigned ? (
                                                <span className="already-tag">Assigned</span>
                                            ) : (
                                                <span className="service-id">{role._id}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>


                        {statusMsg.text && (
                            <p className={`status-text ${statusMsg.type}`}>{statusMsg.text}</p>
                        )}

                        <div className="modal-actions">
                            <button className="cancel-btn" onClick={closeModal} disabled={submitting}>
                                Cancel
                            </button>
                            <button
                                className="submit-btn"
                                onClick={handleSubmit}
                                disabled={submitting || selectedRoles.length === 0}
                            >
                                {submitting
                                    ? "Assigning..."
                                    : `Assign ${selectedRoles.length || ""} Role${selectedRoles.length !== 1 ? "s" : ""}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }
.clear-btn {
    background-color: #181a38;
    color: white;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
}
.role-container {
    display: flex;
    justify-content: center;
    font-family: 'DM Sans', sans-serif;
    padding: 40px 20px;
    min-height: 100vh;
    background: #f4f5f9;
}

.role-form {
    background: #ffffff;
    border: 1px solid #e4e7f0;
    padding: 40px;
    border-radius: 16px;
    width: 100%;
    max-width: 860px;
    box-shadow: 0 8px 32px rgba(79,70,229,0.08), 0 1px 3px rgba(0,0,0,0.06);
    height: fit-content;
}

.form-header {
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}
.form-header h2 { font-size: 22px; font-weight: 700; color: #111827; }
.form-header p { font-size: 13px; color: #6b7280; margin-top: 4px; }
.form-divider { height: 1px; background: #e9ebf2; margin: 24px 0; }

.search-bar {
    width: 100%;
    padding: 11px 14px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    color: #111827;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    outline: none;
    margin-bottom: 20px;
}

.search-bar:focus {
    border-color: #070441;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
    background: #ffffff;
}

.user-table { width: 100%; border-collapse: collapse; }
.user-table thead tr { background: #f4f5f9; }
.user-table th {
    font-size: 11px; font-weight: 700; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.8px;
    padding: 10px 14px; text-align: left;
}
.user-table th:first-child { border-radius: 8px 0 0 8px; }
.user-table th:last-child  { border-radius: 0 8px 8px 0; }
.user-table tbody tr { border-bottom: 1px solid #f0f0f5; transition: background 0.15s; }
.user-table tbody tr:hover { background: #f9faff; }
.user-table td { padding: 14px; font-size: 14px; color: #111827; vertical-align: middle; }

.user-name { font-weight: 600; }
.user-username { font-family: 'DM Mono', monospace; font-size: 13px; color: #6b7280; }

.role-chips { display: flex; flex-wrap: wrap; gap: 6px; }
.role-chip {
    font-size: 11px; font-family: 'DM Mono', monospace; font-weight: 500;
    padding: 3px 9px; border-radius: 20px;
    background: #eef2ff; color: #090649; border: 1px solid #c7d2fe;
}
.no-roles { font-size: 12px; color: #9ca3af; font-style: italic; }

.assign-btn {
    padding: 7px 14px; background: #07060d; color: white;
    border: none; border-radius: 7px; font-family: 'DM Sans', sans-serif;
    font-size: 12px; font-weight: 600; cursor: pointer;
    transition: opacity 0.2s; white-space: nowrap;
}
.assign-btn:hover { opacity: 0.85; }

.state-box { padding: 48px 0; text-align: center; color: #9ca3af; font-size: 14px; }
.spinner {
    width: 28px; height: 28px; border: 3px solid #e5e7eb;
    border-top-color: #090649; border-radius: 50%;
    animation: spin 0.7s linear infinite; margin: 0 auto 12px;
}
@keyframes spin { to { transform: rotate(360deg); } }

.modal-overlay {
    position: fixed; inset: 0; background: rgba(9,7,52,0.45);
    display: flex; align-items: center; justify-content: center;
    z-index: 100; padding: 20px; backdrop-filter: blur(2px);
}

.modal {
    background: #ffffff; border-radius: 16px; padding: 36px;
    width: 100%; max-width: 520px;
    box-shadow: 0 24px 64px rgba(9,7,52,0.18);
    animation: modalIn 0.2s ease;
}
@keyframes modalIn {
    from { opacity: 0; transform: translateY(12px) scale(0.98); }
    to   { opacity: 1; transform: none; }
}

.modal-header h3 { font-size: 18px; font-weight: 700; color: #111827; }
.modal-subtitle { font-size: 13px; color: #6b7280; margin-top: 3px; }
.modal-subtitle span { font-family: 'DM Mono', monospace; color: #090649; font-weight: 500; }

.section-title {
    font-size: 11px; font-weight: 700; color: #6b7280;
    text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 12px;
}

.service-list {
    display: flex; flex-direction: column; gap: 8px;
    max-height: 320px; overflow-y: auto; padding-right: 4px;
}
.service-list::-webkit-scrollbar { width: 4px; }
.service-list::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 4px; }

.service-card {
    border: 1px solid #e5e7eb; border-radius: 10px;
    background: #fafafa; transition: border 0.15s, background 0.15s; cursor: pointer;
}
.service-card.checked { border-color: #090649; background: #f4f6ff; }
.service-card.already-assigned { opacity: 0.5; cursor: not-allowed; }

.service-header { display: flex; align-items: center; gap: 12px; padding: 13px 16px; }
.service-header input[type="checkbox"] {
    appearance: none; width: 17px; height: 17px;
    border-radius: 5px; border: 1.5px solid #d1d5db;
    background: white; flex-shrink: 0; cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}
.service-header input:checked { background: #090649; border-color: #040220; }

.service-name { font-weight: 600; color: #111827; font-size: 14px; }
.service-id { margin-left: auto; font-size: 12px; color: #9ca3af; font-family: 'DM Mono', monospace; }
.already-tag {
    margin-left: auto; font-size: 11px; background: #e5e7eb;
    color: #6b7280; padding: 2px 8px; border-radius: 20px; font-weight: 600;
}

.modal-actions { display: flex; gap: 10px; margin-top: 24px; }

.submit-btn {
    flex: 1; padding: 13px; background: #090734; color: white;
    border: none; border-radius: 9px; font-family: 'DM Sans', sans-serif;
    font-size: 14px; font-weight: 700; cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
}
.submit-btn:hover { opacity: 0.92; }
.submit-btn:active { transform: scale(0.99); }
.submit-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.cancel-btn {
    padding: 13px 20px; background: transparent; color: #374151;
    border: 1px solid #e5e7eb; border-radius: 9px;
    font-family: 'DM Sans', sans-serif; font-size: 14px;
    font-weight: 600; cursor: pointer; transition: background 0.15s;
}
.cancel-btn:hover { background: #f4f5f9; }

.status-text { 
font-size: 13px; color: #6b7280; margin-top: 10px; text-align: center; 

.status-text.error {
    color: #dc2626; 
}
.status-text.success {
    color: #16a34a; 
}
`;