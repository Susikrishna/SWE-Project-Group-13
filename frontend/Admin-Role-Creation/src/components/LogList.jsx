import React, { useEffect, useState } from "react";
import axios from "axios"
const LogList = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchLogs = async () => {
        try {
            const res = await axios.get("http://localhost:3000/log");
            
            if (!res.data.success) {
                throw new Error(res.data.message);
            }

            setLogs(res.data.data);
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <div className="role-container">
            <style>{styles}</style>

            <div className="role-form">
                <div className="form-header">
                    <h2>System Logs</h2>
                </div>

                {loading && <p className="status-text">Loading logs...</p>}
                {error && <p className="status-text error">{error}</p>}

                {!loading && !error && (
                    <div className="service-list">
                        {logs.map((log, index) => (
                            <div key={index} className="service-card">
                                <div className="service-header">
                                    <div className="service-name">
                                        {log.action || "BULK ACTION"}
                                    </div>
                                    <div className="service-id">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </div>

                                <div className="actions-list">
                                    <div className="actions-grid">

                                        <div className="action-chip">
                                            <span className="action-name">User</span>
                                            <span className="action-desc">{log.userId}</span>
                                        </div>

                                        <div className="action-chip">
                                            <span className="action-name">Role</span>
                                            <span className="action-desc">{log.roleId}</span>
                                        </div>

                                        <div className="action-chip">
                                            <span className="action-name">Permission</span>
                                            <span className="action-desc">{log.permission}</span>
                                        </div>

                                        <div className={`action-chip ${log.decision === "DENY" ? "selected" : ""}`}>
                                            <span className="action-name">Decision</span>
                                            <span className="action-desc">{log.decision}</span>
                                        </div>

                                        <div className="action-chip">
                                            <span className="action-name">Status</span>
                                            <span className="action-desc">{log.statusCode}</span>
                                        </div>

                                        {log.reason && (
                                            <div className="action-chip">
                                                <span className="action-name">Reason</span>
                                                <span className="action-desc">{log.reason}</span>
                                            </div>
                                        )}

                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default LogList;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.role-container {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'DM Sans', sans-serif;
    padding: 20px;
}

.role-form {
    background: #ffffff;
    border: 1px solid #e4e7f0;
    padding: 40px;
    border-radius: 16px;
    width: 60%;
    box-shadow: 0 8px 32px rgba(79,70,229,0.08), 0 1px 3px rgba(0,0,0,0.06);
}

.form-header {
    margin-bottom: 32px;
}

.form-header h2 {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
}

.form-divider {
    height: 1px;
    background: #e9ebf2;
    margin: 28px 0;
}

.form-group {
    margin-bottom: 24px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

.form-group input[type="text"],
.form-group input[type="date"] {
    width: 100%;
    padding: 11px 14px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    color: #111827;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    outline: none;
}

.form-group input:focus {
    border-color: #070441;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
    background: #ffffff;
}

.section-title {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    margin-bottom: 14px;
}

.service-list {
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.service-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    background: #fafafa;
    transition: border 0.2s, background 0.2s;
}

.service-card.checked {
    border-color: #090649;
    background: #f4f6ff;
}

.service-header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    cursor: pointer;
}

.service-header:hover {
    background: #eef0fd;
}

.service-header input {
    appearance: none;
    width: 17px;
    height: 17px;
    border-radius: 5px;
    border: 1.5px solid #d1d5db;
    background: white;
}

.service-header input:checked {
    background: #090649;
    border-color: #040220;
}

.service-name {
    font-weight: 600;
    color: #111827;
}

.service-id {
    margin-left: auto;
    font-size: 12px;
    color: #6b7280;
    font-family: 'DM Mono', monospace;
}

.actions-list {
    padding: 14px 16px 18px 16px;
    border-top: 1px solid #e5e7eb;
}

.actions-title {
    font-size: 12px;
    color: #6b7280;
    margin-bottom: 10px;
    font-weight: 600;
}

.actions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill,minmax(180px,1fr));
    gap: 8px;
}

.action-chip {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 10px;
    border-radius: 7px;
    border: 1px solid #e5e7eb;
    background: #ffffff;
    cursor: pointer;
    font-size: 13px;
    font-family: 'DM Mono', monospace;
    transition: all 0.15s;
}

.action-chip:hover {
    background: #eef0fd;
    border-color: #c7d0fb;
}

.action-chip.selected {
    background: #eef2ff;
    border-color: #090649;
}

.action-chip input {
    appearance: none;
    width: 15px;
    height: 15px;
    border-radius: 4px;
    border: 1.5px solid #d1d5db;
}

.action-chip input:checked {
    background: #090649;
    border-color: #040220;
}

.action-name {
    font-weight: 600;
}

.action-desc {
    color: #6b7280;
}

.status-text {
    font-size: 13px;
    color: #6b7280;
}

.status-text.error {
    color: #dc2626;
}

.permission-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    cursor: pointer;
}

.permission-item.checked {
    background: #eef2ff;
    border-color: #090649;
}

.date-range {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-top: 16px;
}

.submit-btn {
    width: 100%;
    padding: 13px;
    background: #090734;
    color: white;
    border: none;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
}

.submit-btn:hover {
    opacity: 0.92;
}

.submit-btn:active {
    transform: scale(0.99);
}

.submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}
`;