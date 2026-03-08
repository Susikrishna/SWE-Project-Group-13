import { useState } from "react";

const users = [
    { name: "Alice Johnson", email: "alice@company.com", role: "admin", status: "active", joined: "Jan 12, 2025" },
    { name: "Bob Martin", email: "bob@company.com", role: "editor", status: "active", joined: "Feb 3, 2025" },
    { name: "Carol White", email: "carol@company.com", role: "viewer", status: "inactive", joined: "Mar 1, 2025" },
    { name: "Dan Lee", email: "dan@company.com", role: "editor", status: "active", joined: "Mar 5, 2025" },
    { name: "Eva Stone", email: "eva@company.com", role: "viewer", status: "active", joined: "Mar 7, 2025" },
];

const navItems = [
    { icon: "⊞", label: "Dashboard", id: "dashboard" },
    { icon: "👥", label: "Users", id: "users" },
    { icon: "🔐", label: "Roles", id: "roles" },
    { icon: "⚙️", label: "Settings", id: "settings" },
];

function Dashboard() {
    const [activeNav, setActiveNav] = useState("dashboard");

    return (
        <>
            <style>{styles}</style>
            <div className="dash-container">

                {/* Sidebar */}
                <aside className="dash-sidebar">
                    <div className="dash-logo">Admin<span>.</span>Panel</div>
                    <span className="sidebar-section-label">Menu</span>
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`nav-item ${activeNav === item.id ? "active" : ""}`}
                            onClick={() => setActiveNav(item.id)}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </aside>

                {/* Main */}
                <main className="dash-main">
                    <div className="dash-topbar">
                        <div>
                            <h1>Dashboard</h1>
                            <p>Welcome back — here's what's happening.</p>
                        </div>
                        <div className="topbar-avatar">AD</div>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-label">Total Users</div>
                            <div className="stat-value">128</div>
                            <div className="stat-change up">↑ 12% this month</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Active Roles</div>
                            <div className="stat-value">6</div>
                            <div className="stat-change">No change</div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-label">Services</div>
                            <div className="stat-value">14</div>
                            <div className="stat-change down">↓ 2 offline</div>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="table-card">
                        <div className="table-header">
                            <h3>Recent Users</h3>
                            <button className="add-btn">+ Add User</button>
                        </div>
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Email</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((u) => (
                                    <tr key={u.email}>
                                        <td style={{ fontWeight: 600, color: "#111827" }}>{u.name}</td>
                                        <td style={{ fontFamily: "'DM Mono', monospace", fontSize: "12.5px" }}>{u.email}</td>
                                        <td><span className={`role-pill ${u.role}`}>{u.role}</span></td>
                                        <td><span className={`status-dot ${u.status}`}>{u.status}</span></td>
                                        <td style={{ color: "#9ca3af", fontSize: "12.5px" }}>{u.joined}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </main>

            </div>
        </>
    );
}

export default Dashboard;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.dash-container {
    display: flex;
    min-height: 100vh;
    background: #f0f2f9;
    font-family: 'DM Sans', sans-serif;
    color: #111827;
}

.dash-sidebar {
    width: 220px;
    background: #ffffff;
    border-right: 1px solid #e4e7f0;
    display: flex;
    flex-direction: column;
    padding: 28px 16px;
    gap: 4px;
    flex-shrink: 0;
}

  .dash-logo {
    font-size: 16px;
    font-weight: 700;
    color: #0d0a41;
    padding: 0 10px 24px;
    letter-spacing: -0.3px;
    border-bottom: 1px solid #e9ebf2;
    margin-bottom: 12px;
  }

  .dash-logo span {
    color: #4f46e5;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 9px 12px;
    border-radius: 8px;
    font-size: 13.5px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
  }
  
  .nav-item:hover {
    background: #eef0fd;
    color: #0d0a41;
  }
  
  .nav-item.active {
    background: #eef2ff;
    color: #0d0a41;
    font-weight: 600;
  }

  .nav-icon {
    font-size: 15px;
    width: 18px;
    text-align: center;
  }

  .sidebar-section-label {
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    padding: 16px 12px 6px;
  }
  
  /* Main content */
  .dash-main {
    flex: 1;
    padding: 32px;
    overflow-y: auto;
  }
  
  .dash-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
  }

  .dash-topbar h1 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    letter-spacing: -0.3px;
  }

  .dash-topbar p {
    font-size: 13px;
    color: #6b7280;
    margin-top: 2px;
  }

  .topbar-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0d0a41 0%, #4f46e5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
  }

  /* Stats cards */
  .stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  .stat-card {
    background: #ffffff;
    border: 1px solid #e4e7f0;
    border-radius: 12px;
    padding: 20px 22px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  }

  .stat-label {
    font-size: 11.5px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-bottom: 10px;
  }

  .stat-value {
    font-size: 28px;
    font-weight: 700;
    color: #0d0a41;
    font-family: 'DM Mono', monospace;
    letter-spacing: -0.5px;
  }
  
  .stat-change {
    font-size: 12px;
    color: #6b7280;
    margin-top: 6px;
  }
  
  .stat-change.up { color: #16a34a; }
  .stat-change.down { color: #dc2626; }

  /* Table card */
  .table-card {
    background: #ffffff;
    border: 1px solid #e4e7f0;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    overflow: hidden;
  }
  
  .table-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 18px 22px;
    border-bottom: 1px solid #e9ebf2;
  }
  
  .table-header h3 {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
  }

  .table-header span {
    font-size: 12px;
    color: #6b7280;
  }

  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  thead th {
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.7px;
    padding: 10px 22px;
    text-align: left;
    background: #f9fafb;
    border-bottom: 1px solid #e9ebf2;
  }
  
  tbody tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background 0.12s;
    cursor: pointer;
  }

  tbody tr:last-child { border-bottom: none; }
  
  tbody tr:hover { background: #f5f6ff; }
  
  tbody td {
    padding: 13px 22px;
    font-size: 13.5px;
    color: #374151;
  }
  
  .role-pill {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 600;
    font-family: 'DM Mono', monospace;
  }

  .role-pill.admin {
    background: #eef2ff;
    color: #0d0a41;
  }

  .role-pill.viewer {
    background: #f0fdf4;
    color: #166534;
  }

  .role-pill.editor {
    background: #fff7ed;
    color: #9a3412;
  }

  .status-dot {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #374151;
  }

  .status-dot::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #d1d5db;
  }

  .status-dot.active::before { background: #22c55e; }
  .status-dot.inactive::before { background: #e5e7eb; }

  .add-btn {
    padding: 8px 16px;
    background: #0d0a41;
    background-image: linear-gradient(135deg, #0d0a41 0%, #0c0d3f 100%);
    color: #ffffff;
    border: none;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: opacity 0.2s, box-shadow 0.2s;
    box-shadow: 0 2px 8px rgba(79,70,229,0.25);
  }

  .add-btn:hover {
    opacity: 0.88;
    box-shadow: 0 4px 12px rgba(20,16,83,0.35);
  }
`;