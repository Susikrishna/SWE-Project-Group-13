import Navbar from "../components/Navbar";
import axios from "axios";
import { useState, useEffect } from "react";
const serverUrl = import.meta.env.VITE_SERVER_URL
function Roles() {
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null);
    
    const getRoles = async () => {
        try {
            const response = await axios.get(`${serverUrl}/roles`);
            setRoles(response.data);
        } catch (err) {
            setError("Failed to fetch roles.");
        }
    };
    
    useEffect(() => {
        getRoles();
    }, []);
    
    const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString();

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
                                {role.isTemp && <span className="badge badge-temp">Temporary</span>}
                            </div>
                            
                            {role.description && (
                                <div className="role-description">{role.description}</div>
                            )}

                            {role.isTemp && role.startDate && role.endDate && (
                                <div className="role-dates">
                                    <span>📅 {formatDate(role.startDate)}</span>
                                    <span className="date-arrow">→</span>
                                    <span>{formatDate(role.endDate)}</span>
                                </div>
                            )}

                            <div className="role-section">
                                <div className="section-label">Allowed Services</div>
                                {role.allowedServices.length > 0 ? (
                                    role.allowedServices.map((svc, idx) => (
                                        <div key={idx} className="service-block">
                                            {/* <div className="service-id">
                                                {svc.serviceId?.serviceIdentifier || svc.serviceId?.serviceName || svc.serviceId}
                                            </div> */}
                                            <div className="tag-list">
                                                {svc.actions.map((action) => (
                                                    <span key={action} className="tag tag-green">{action}</span>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <span className="empty-tag">No services assigned</span>
                                )}
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
font-family: 'DM Sans', sans-serif;
}
.refresh-btn:hover { background: #eef2ff; }
.status-msg {
text-align: center;
color: #6b7280;
font-size: 14px;
padding: 48px 0;
}
.status-msg.error { 
color: #ef4444; 
}

.roles-grid {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
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
.role-card-header {
display: flex;
align-items: center;
gap: 10px;
flex-wrap: wrap;
}
.role-name {
font-size: 16px;
font-weight: 700;
color: #0d0a41;
}
.badge {
padding: 2px 10px;
border-radius: 20px;
font-size: 11px;
font-weight: 600;
}
.badge-temp { background: #fff7ed; color: #f97316; border: 1px solid #fed7aa; }
.role-description {
font-size: 13px;
color: #6b7280;
line-height: 1.5;
}
.role-dates {
display: flex;
align-items: center;
gap: 8px;
font-size: 12px;
color: #f97316;
background: #fff7ed;
padding: 6px 10px;
border-radius: 8px;
}
.date-arrow { color: #9ca3af; }
.role-section { display: flex; flex-direction: column; gap: 8px; }
.section-label {
font-size: 11px;
font-weight: 600;
text-transform: uppercase;
letter-spacing: 0.6px;
color: #9ca3af;
}
.service-block {
background: #f9fafb;
border: 1px solid #f3f4f6;
border-radius: 8px;
padding: 10px 12px;
display: flex;
flex-direction: column;
gap: 6px;
}
.service-id {
font-size: 13px;
font-weight: 600;
color: #374151;
text-transform: capitalize;
}
.tag-list { display: flex; flex-wrap: wrap; gap: 6px; }
.tag { padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500; }
.tag-blue   { background: #eff6ff; color: #3b82f6; }
.tag-purple { background: #eef2ff; color: #4f46e5; }
.tag-green  { background: #f0fdf4; color: #16a34a; }
.empty-tag { font-size: 12px; color: #d1d5db; }
`;