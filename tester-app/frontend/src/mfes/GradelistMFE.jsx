import { useEffect, useState } from "react";
import axios from "axios";
import DeveloperShell from "../components/DeveloperShell";

const API_URL = "http://localhost:5050/api";

const GradelistMFE = ({ token, profile }) => {
    const [gradelists, setGradelists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ course: "", rollNumber: "", grade: "", semester: "" });

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
            if (!hasPerm("gradelist-service:gradelist:read")) {
                setLoading(false);
                return;
            }
            try {
                const data = await apiCall("GET", "/gradelist");
                setGradelists(data);
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
            const data = await apiCall("POST", "/gradelist", {
                course: "New Course",
                rollNumber: "123",
                grade: "B",
                semester: "Fall",
            });
            setGradelists([data, ...gradelists]);
        } catch (err) {
            window.alert(err.response?.data?.error || err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this record?")) return;
        try {
            await apiCall("DELETE", `/gradelist/${id}`);
            setGradelists(gradelists.filter((item) => item._id !== id));
        } catch (err) {
            window.alert(err.response?.data?.error || err.message);
        }
    };

    const handleSave = async (id) => {
        try {
            const data = await apiCall("PUT", `/gradelist/${id}`, editData);
            setGradelists(gradelists.map((item) => (item._id === id ? data : item)));
            setEditId(null);
        } catch (err) {
            window.alert(err.response?.data?.error || err.message);
        }
    };

    if (loading) {
        return <div className="glass-panel animate-fade-in" style={styles.panel}>Loading Gradelist...</div>;
    }

    if (!hasPerm("gradelist-service:gradelist:read")) {
        return <div className="glass-panel animate-fade-in" style={styles.panel}><p className="empty-state">You do not have Read permissions for Gradelist.</p></div>;
    }

    return (
        <DeveloperShell title="Gradelist Manager" description="Manage student grades and course records." token={token} baseUrl={API_URL}>
            <div style={styles.panelHeader}>
                <div style={styles.headerInfo}>
                    <p style={styles.description}>Use the module view for core record management, or switch to API Explorer for raw backend diagnostics.</p>
                </div>
                {hasPerm("gradelist-service:gradelist:create") && (
                    <button className="btn btn-primary" onClick={handleCreate}>+ Add Record</button>
                )}
            </div>
            {error && <div className="empty-state">{error}</div>}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Course</th>
                            <th>Roll #</th>
                            <th>Grade</th>
                            <th>Semester</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {gradelists.map((item) => (
                            editId === item._id ? (
                                <tr key={item._id} className="editing">
                                    <td><input className="edit-input" value={editData.course} onChange={(e) => setEditData({ ...editData, course: e.target.value })} /></td>
                                    <td><input className="edit-input" value={editData.rollNumber} onChange={(e) => setEditData({ ...editData, rollNumber: e.target.value })} /></td>
                                    <td><input className="edit-input" value={editData.grade} onChange={(e) => setEditData({ ...editData, grade: e.target.value })} /></td>
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
                                    <td>{item.course}</td>
                                    <td>{item.rollNumber}</td>
                                    <td><span style={styles.gradeBadge}>{item.grade}</span></td>
                                    <td>{item.semester}</td>
                                    <td>
                                        <div style={styles.actionBtns}>
                                            {hasPerm("gradelist-service:gradelist:update") && (
                                                <button className="btn btn-outline" onClick={() => { setEditData(item); setEditId(item._id); }}>Edit</button>
                                            )}
                                            {hasPerm("gradelist-service:gradelist:delete") && (
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
    gradeBadge: { 
        background: "rgba(99, 102, 241, 0.15)", 
        color: "#a5b4fc", 
        padding: "2px 8px", 
        borderRadius: "4px", 
        fontWeight: "600",
        fontSize: "12px"
    }
};

export default GradelistMFE;
