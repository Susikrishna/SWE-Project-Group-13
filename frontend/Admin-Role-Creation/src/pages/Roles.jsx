import Navbar from "../components/Navbar";
import axios from "axios";
import { useState, useEffect } from "react";

function Roles() {
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null);

    const getRoles = async () => {
        try {
            const response = await axios.get("http://localhost:6969/roles");
            setRoles(response.data);
        } catch (err) {
            setError("Failed to fetch roles.");
        }
    };

    useEffect(() => {
        getRoles();
    }, []);

    return (
        <div style={{ minHeight: "120vh", background: "#f0f2f9" }}>
            <Navbar />
            <style>{styles}</style>
            <div className="roles-container">
                <div className="roles-header">
                    <h1 className="roles-title">All Roles</h1>
                    <button className="refresh-btn" onClick={getRoles}>↻ Refresh</button>
                </div>

                {error && <div className="status-msg error">{error}</div>}
                {!error && roles.length === 0 && (
                    <div className="status-msg">No roles found.</div>
                )}

                <div className="roles-grid">
                    {roles.map((role) => (
                        <div key={role._id} className="role-card">
                            <div className="role-card-header">
                                <span className="role-name">{role.name}</span>
                            </div>

                            <div className="role-section">
                                <div className="section-label">Microfrontends</div>
                                <div className="tag-list">
                                    {role.microfrontends.length > 0
                                        ? role.microfrontends.map((mf) => (
                                            <span key={mf} className="tag tag-blue">{mf}</span>
                                        ))
                                        : <span className="empty-tag">None</span>}
                                </div>
                            </div>

                            <div className="role-section">
                                <div className="section-label">Microservices</div>
                                <div className="tag-list">
                                    {role.microservices.length > 0
                                        ? role.microservices.map((ms) => (
                                            <span key={ms} className="tag tag-purple">{ms}</span>
                                        ))
                                        : <span className="empty-tag">None</span>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Roles;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
.roles-container {
  padding: 32px;
  font-family: 'DM Sans', sans-serif;
  max-width: 1100px;
  margin: 0 auto;
}
.roles-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}
.roles-title {
  font-size: 22px;
  font-weight: 700;
  color: #0d0a41;
  margin: 0;
}
.refresh-btn {
  padding: 7px 16px;
  border-radius: 8px;
  border: 1px solid #e4e7f0;
  background: #fff;
  color: #4f46e5;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  font-family: 'DM Sans', sans-serif;
  transition: background 0.15s;
}
.refresh-btn:hover { background: #eef2ff; }
.status-msg {
  text-align: center;
  color: #6b7280;
  font-size: 14px;
  padding: 48px 0;
}
.status-msg.error { color: #ef4444; }
.roles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}
.role-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e4e7f0;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(79,70,229,0.06);
  display: flex;
  flex-direction: column;
  gap: 14px;
  transition: box-shadow 0.15s;
}
.role-card:hover { box-shadow: 0 4px 16px rgba(79,70,229,0.10); }
.role-card-header { display: flex; align-items: center; gap: 10px; }
.role-icon { font-size: 18px; }
.role-name {
  font-size: 16px;
  font-weight: 700;
  color: #0d0a41;
  text-transform: capitalize;
}
.role-section { display: flex; flex-direction: column; gap: 6px; }
.section-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: #9ca3af;
}
.tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.tag-blue  { background: #eff6ff; color: #3b82f6; }
.tag-purple { background: #eef2ff; color: #4f46e5; }
.empty-tag { font-size: 12px; color: #d1d5db; }
.role-footer {
  font-size: 11.5px;
  color: #9ca3af;
  border-top: 1px solid #f3f4f6;
  padding-top: 12px;
  margin-top: auto;
}
`;