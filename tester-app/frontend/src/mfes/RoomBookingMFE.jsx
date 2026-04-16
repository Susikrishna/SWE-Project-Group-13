import { useEffect, useState } from "react";
import axios from "axios";
import DeveloperShell from "../components/DeveloperShell";

const API_URL = "http://localhost:5050/api";

const RoomBookingMFE = ({ token, profile }) => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [editId, setEditId] = useState(null);
    const [editData, setEditData] = useState({ room: "", date: "", timeSlot: "", purpose: "", bookedBy: "" });

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
            if (!hasPerm("room-service:room-booking:read")) {
                setLoading(false);
                return;
            }
            try {
                const data = await apiCall("GET", "/room-booking");
                setRooms(data);
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
            const data = await apiCall("POST", "/room-booking", {
                room: "Test Room",
                date: "2024-01-01",
                timeSlot: "10:00",
                purpose: "Test",
                bookedBy: "Tester",
            });
            setRooms([data, ...rooms]);
        } catch (err) {
            window.alert(err.response?.data?.error || err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this booking?")) return;
        try {
            await apiCall("DELETE", `/room-booking/${id}`);
            setRooms(rooms.filter((item) => item._id !== id));
        } catch (err) {
            window.alert(err.response?.data?.error || err.message);
        }
    };

    const handleSave = async (id) => {
        try {
            const data = await apiCall("PUT", `/room-booking/${id}`, editData);
            setRooms(rooms.map((item) => (item._id === id ? data : item)));
            setEditId(null);
        } catch (err) {
            window.alert(err.response?.data?.error || err.message);
        }
    };

    if (loading) {
        return <div className="glass-panel animate-fade-in" style={styles.panel}>Loading Room Booking...</div>;
    }

    if (!hasPerm("room-service:room-booking:read")) {
        return <div className="glass-panel animate-fade-in" style={styles.panel}><p className="empty-state">You do not have Read permissions for Room Booking.</p></div>;
    }

    return (
        <DeveloperShell title="Room Booking System" description="Manage shared spaces and meeting schedules." token={token} baseUrl={API_URL}>
            <div style={styles.panelHeader}>
                <div style={styles.headerInfo}>
                    <p style={styles.description}>Operate bookings inside the module or switch to the explorer for direct endpoint validation.</p>
                </div>
                {hasPerm("room-service:room-booking:create") && (
                    <button className="btn btn-primary" onClick={handleCreate}>+ New Booking</button>
                )}
            </div>
            {error && <div className="empty-state">{error}</div>}
            <div className="table-wrapper">
                <table>
                    <thead>
                        <tr>
                            <th>Room</th>
                            <th>Date</th>
                            <th>Time Slot</th>
                            <th>Purpose</th>
                            <th>Booked By</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rooms.map((item) => (
                            editId === item._id ? (
                                <tr key={item._id} className="editing">
                                    <td><input className="edit-input" value={editData.room} onChange={(e) => setEditData({ ...editData, room: e.target.value })} /></td>
                                    <td><input className="edit-input" type="date" value={editData.date} onChange={(e) => setEditData({ ...editData, date: e.target.value })} /></td>
                                    <td><input className="edit-input" type="time" value={editData.timeSlot} onChange={(e) => setEditData({ ...editData, timeSlot: e.target.value })} /></td>
                                    <td><input className="edit-input" value={editData.purpose} onChange={(e) => setEditData({ ...editData, purpose: e.target.value })} /></td>
                                    <td><input className="edit-input" value={editData.bookedBy} onChange={(e) => setEditData({ ...editData, bookedBy: e.target.value })} /></td>
                                    <td>
                                        <div style={styles.actionBtns}>
                                            <button className="btn btn-success" onClick={() => handleSave(item._id)}>Save</button>
                                            <button className="btn btn-outline" onClick={() => setEditId(null)}>Cancel</button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                <tr key={item._id}>
                                    <td><strong style={{ color: "#fff" }}>{item.room}</strong></td>
                                    <td>{item.date}</td>
                                    <td><span style={styles.timeBadge}>{item.timeSlot}</span></td>
                                    <td>{item.purpose}</td>
                                    <td>{item.bookedBy}</td>
                                    <td>
                                        <div style={styles.actionBtns}>
                                            {hasPerm("room-service:room-booking:update") && (
                                                <button className="btn btn-outline" onClick={() => { setEditData(item); setEditId(item._id); }}>Edit</button>
                                            )}
                                            {hasPerm("room-service:room-booking:delete") && (
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
    timeBadge: { 
        background: "rgba(255, 255, 255, 0.05)", 
        padding: "2px 6px", 
        borderRadius: "4px", 
        fontSize: "12px",
        color: "#cbd5e1"
    }
};

export default RoomBookingMFE;
