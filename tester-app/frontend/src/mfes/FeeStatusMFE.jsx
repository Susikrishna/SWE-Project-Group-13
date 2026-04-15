import { useEffect, useState } from "react";
import axios from "axios";
import DeveloperShell from "../components/DeveloperShell";

const API_URL = "http://localhost:5050/api";

const FeeStatusMFE = ({ token, profile }) => {
    const [fees, setFees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ studentName: "", rollNumber: "", amount: 0, semester: "", status: "Pending" });

    const hasPerm = (permKey) => profile?.permissions?.includes(permKey);

    const apiCall = async (method, url, body = null) => {
        const response = await axios({
            method,
            url: `${API_URL}${url}`,
            data: body,
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    };

    useEffect(() => {
        const load = async () => {
            if (!hasPerm("fee-service:fee-status:read")) {
                setLoading(false);
                return;
            }
            try {
                const data = await apiCall("GET", "/fee-status");
                setFees(data);
            } catch (err) {
                setError(err.response?.data?.error || err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [profile]);

    const handleCreate = async () => {
        try {
            const data = await apiCall("POST", "/fee-status", {
                studentName: "Test Student",
                rollNumber: "123",
                amount: 1000,
                semester: "Fall",
                status: "Pending",
            });
            setFees([data, ...fees]);
        } catch (err) {
            window.alert(err.response?.data?.error || err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this fee record?")) return;
        try {
            await apiCall("DELETE", `/fee-status/${id}`);
            setFees(fees.filter((item) => item._id !== id));
        } catch (err) {
            window.alert(err.response?.data?.error || err.message);
        }
    };

    const handleSave = async (id) => {
        try {
            const data = await apiCall("PUT", `/fee-status/${id}`, editData);
            setFees(fees.map((item) => (item._id === id ? data : item)));
            setEditId(null);
        } catch (err) {
            window.alert(err.response?.data?.error || err.message);
        }
    };

    if (loading) {
        return <div className="glass-panel animate-fade-in" style={styles.panel}>Loading Fee Status...</div>;
    }

    if (!hasPerm("fee-service:fee-status:read")) {
        return <div className="glass-panel animate-fade-in" style={styles.panel}><p className="empty-state">You do not have Read permissions for Fee Status.</p></div>;
    }

    return (
        <DeveloperShell title="Fee Payment Management" description="Monitor and update student financial records." token={token} baseUrl={API_URL}>
            <div style={styles.panelHeader}>
                <div style={styles.headerInfo}>
                    <p style={styles.description}>View payment data here or use the API Explorer when you need full backend diagnostics.</p>
                </div>
                {hasPerm("fee-service:fee-status:create") && (
                    <button className="btn btn-primary" onClick={handleCreate}>+ Add Record</button>
                )}
            </div>
            {error && <div className="empty-state">{error}</div>}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Student Name</th>
                            <th>Roll #</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Semester</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fees.map((item) => (
                            editId === item._id ? (
                                <tr key={item._id} className="editing">
                                    <td><input className="edit-input" value={editData.studentName} onChange={(e) => setEditData({ ...editData, studentName: e.target.value })} /></td>
                                    <td><input className="edit-input" value={editData.rollNumber} onChange={(e) => setEditData({ ...editData, rollNumber: e.target.value })} /></td>
                                    <td><input className="edit-input" type="number" value={editData.amount} onChange={(e) => setEditData({ ...editData, amount: Number(e.target.value) })} /></td>
                                    <td>
                                        <select className="edit-select" value={editData.status} onChange={(e) => setEditData({ ...editData, status: e.target.value })}>
                                            <option value="Paid">Paid</option>
                                            <option value="Pending">Pending</option>
                                            <option value="Overdue">Overdue</option>
                                        </select>
                                    </td>
                                    <td><input className="edit-input" value={editData.semester} onChange={(e) => setEditData({ ...editData, semester: e.target.value })} /></td>
                                    <td>
                                        <div style={styles.actionBtns}>
                                            <button className="btn btn-success" onClick={() => handleSave(item._id)}>Save</button>
                                            <button className="btn btn-outline" onClick={() => setEditId(null)}>Cancel</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={item._id}>
                                    <td>{item.studentName}</td>
                                    <td>{item.rollNumber}</td>
                                    <td><strong style={{ color: "#fff" }}>${item.amount?.toLocaleString()}</strong></td>
                                    <td>
                                        <span style={{ 
                                            ...styles.statusBadge, 
                                            background: item.status === "Paid" ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                            color: item.status === "Paid" ? "#10b981" : "#ef4444"
                                        }}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td>{item.semester}</td>
                                    <td>
                                        <div style={styles.actionBtns}>
                                            {hasPerm("fee-service:fee-status:update") && (
                                                <button className="btn btn-outline" onClick={() => { setEditData(item); setEditId(item._id); }}>Edit</button>
                                            )}
                                            {hasPerm("fee-service:fee-status:delete") && (
                                                <button className="btn btn-danger" onClick={() => handleDelete(item._id)}>Delete</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        ))}
                    </tbody>
                </table>
            </div>
        </DeveloperShell>
    );
};

const styles = {
    panel: { padding: "24px" },
    panelHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" },
    headerInfo: { display: "flex", flexDirection: "column", gap: "4px" },
    title: { margin: 0, fontSize: "18px", color: "#fff" },
    description: { margin: 0, fontSize: "13px", color: "#94a3b8" },
    actionBtns: { display: "flex", gap: "8px" },
    statusBadge: { 
        padding: "2px 8px", 
        borderRadius: "4px", 
        fontSize: "12px", 
        fontWeight: "600",
        textTransform: "uppercase"
    }
};

export default FeeStatusMFE;
