import { useEffect } from "react";
import { useState } from "react";
import axios from "axios"
const metrics = [
    { label: "Total Students", value: "1,240", delta: "+8.2% this term", up: true },
    { label: "Avg Score", value: "74.3%", delta: "+3.1% this term", up: true },
    { label: "Failed Exams", value: "38", delta: "+5 this term", up: false },
    { label: "Pass Rate", value: "96.9%", delta: "+1.2% this term", up: true },
];

const students = [
    { name: "Priya M.", subject: "Mathematics", score: 92, grade: "A" },
    { name: "Arjun K.", subject: "Physics", score: 85, grade: "B" },
    { name: "Sara L.", subject: "Chemistry", score: 61, grade: "C" },
    { name: "John D.", subject: "Biology", score: 45, grade: "F" },
    { name: "Meena R.", subject: "Mathematics", score: 78, grade: "B" },
];

const styles = {
    wrapper: { padding: "24px", fontFamily: "sans-serif" },
    heading: { fontSize: "20px", fontWeight: "600", marginBottom: "20px", color: "#111827" },
    grid: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px", marginBottom: "24px" },
    card: { background: "#f3f4f6", borderRadius: "10px", padding: "16px" },
    cardLabel: { fontSize: "13px", color: "#6b7280", marginBottom: "6px" },
    cardValue: { fontSize: "22px", fontWeight: "500", marginBottom: "4px" },
    deltaUp: { fontSize: "12px", color: "#16a34a" },
    deltaDown: { fontSize: "12px", color: "#dc2626" },
    tableWrapper: { border: "1px solid #e5e7eb", borderRadius: "12px", padding: "16px" },
    tableTitle: { fontSize: "15px", fontWeight: "500", marginBottom: "12px" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: "13px" },
    th: { textAlign: "left", color: "#6b7280", paddingBottom: "8px", borderBottom: "1px solid #e5e7eb", fontWeight: "500" },
    td: { padding: "10px 0", borderBottom: "1px solid #f3f4f6", color: "#111827" },
    gradeA: { background: "#dcfce7", color: "#15803d", padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "600" },
    gradeB: { background: "#dbeafe", color: "#1d4ed8", padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "600" },
    gradeC: { background: "#fef9c3", color: "#a16207", padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "600" },
    gradeF: { background: "#fee2e2", color: "#dc2626", padding: "2px 10px", borderRadius: "99px", fontSize: "11px", fontWeight: "600" },
    scoreBar: { display: "flex", alignItems: "center", gap: "8px" },
    barTrack: { flex: 1, height: "6px", background: "#e5e7eb", borderRadius: "99px", overflow: "hidden" },
};

const getGradeStyle = (grade) => {
    if (grade === "A") return styles.gradeA;
    if (grade === "B") return styles.gradeB;
    if (grade === "C") return styles.gradeC;
    return styles.gradeF;
};

const getBarColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 60) return "#2563eb";
    if (score >= 45) return "#d97706";
    return "#dc2626";
};

const Dashboard = () => {
    const [token] = useState(`${import.meta.env.VITE_TOKEN}`);
    const [perms,setPerms] = useState({})
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get("http://localhost:4000/auth/authorize", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = response.data;
                setPerms(data);
            } catch (err) {
                console.log(err)
            } 
        };
        
        fetchData();
    }, []); 

    return (
        <div style={styles.wrapper}>
            <h1 style={styles.heading}>Dashboard</h1>
            <div style={styles.grid}>
                {metrics.map((m) => (
                    <div key={m.label} style={styles.card}>
                        <p style={styles.cardLabel}>{m.label}</p>
                        <p style={styles.cardValue}>{m.value}</p>
                        <p style={m.up ? styles.deltaUp : styles.deltaDown}>{m.delta}</p>
                    </div>
                ))}
            </div>

            {/* Students Table */}
            <div style={styles.tableWrapper}>
                <h2 style={styles.tableTitle}>Student Marks</h2>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Name</th>
                            <th style={styles.th}>Subject</th>
                            <th style={styles.th}>Score</th>
                            <th style={styles.th}>Grade</th>
                        </tr>
                    </thead>
                    <tbody>
                        {students.map((s) => (
                            <tr key={s.name}>
                                <td style={styles.td}>{s.name}</td>
                                <td style={{ ...styles.td, color: "#6b7280" }}>{s.subject}</td>
                                <td style={styles.td}>
                                    <div style={styles.scoreBar}>
                                        <div style={styles.barTrack}>
                                            <div style={{ height: "100%", width: `${s.score}%`, background: getBarColor(s.score), borderRadius: "99px" }} />
                                        </div>
                                        <span style={{ fontSize: "12px", minWidth: "32px" }}>{s.score}%</span>
                                    </div>
                                </td>
                                <td style={styles.td}>
                                    <span style={getGradeStyle(s.grade)}>{s.grade}</span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;