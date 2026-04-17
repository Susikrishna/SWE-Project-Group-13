import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [mfes, setMfes] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchAuthData = async () => {
            try {
                const token = localStorage.getItem("token");

                if (!token) {
                    navigate("/login");
                    return;
                }

                const res = await axios.get("http://localhost:3000/auth/authorize", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setMfes(res.data.microfrontends || []);
            } catch (err) {
                console.error("Auth error:", err.response?.data || err.message);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchAuthData();
    }, []);

    if (loading) {
        return (
            <div style={styles.center}>
                <div style={styles.loader}></div>
                <p>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Dashboard</h1>
            <p style={styles.subtitle}>Available Applications</p>

            <div style={styles.grid}>
                {mfes.map((mfe) => (
                    <div key={mfe._id} style={styles.card}>
                        <h3>{mfe.name}</h3>
                        <p style={styles.desc}>{mfe.description}</p>

                        <button
                            style={styles.button}
                            onClick={() => navigate(mfe.route)}
                        >
                            Open
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: "40px",
        background: "#f4f6f8",
        minHeight: "100vh",
        fontFamily: "Arial, sans-serif"
    },
    title: {
        fontSize: "32px",
        marginBottom: "5px"
    },
    subtitle: {
        color: "#666",
        marginBottom: "30px"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "20px"
    },
    card: {
        background: "#fff",
        padding: "20px",
        borderRadius: "10px",
        boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
        transition: "transform 0.2s ease"
    },
    desc: {
        fontSize: "14px",
        color: "#555",
        marginBottom: "15px"
    },
    button: {
        padding: "10px 15px",
        background: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    },
    center: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh"
    },
    loader: {
        width: "40px",
        height: "40px",
        border: "5px solid #ddd",
        borderTop: "5px solid #007bff",
        borderRadius: "50%",
        animation: "spin 1s linear infinite"
    }
};

export default Dashboard;