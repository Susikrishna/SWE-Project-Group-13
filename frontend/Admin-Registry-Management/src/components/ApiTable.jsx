import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { fetchMicroservices } from "../services/registryApi";

const ApiTable = () => {
    const [apis, setapis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchMicroservices();
            console.log(data)
            setapis(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return <div style={styles.loadingOverlay}>Loading...</div>;
    }

    return (
        <div style={styles.glassCard}>
            <h1 style={styles.heading}>Microservices</h1>
            <p style={styles.subHeading}>All registered microservices in the ecosystem.</p>
            
            {/* {apis.length === 0 ? (
                <p style={styles.subHeading}>No microservices registered yet.</p>
            ) : (
                apis.map((mfe) => (
                    <div key={mfe._id} style={styles.permissionRow}>
                        <div style={{ flex: 2 }}>
                            <label style={styles.label}>{mfe.name}</label>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#475569" }}>{mfe.feature}</span>
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={styles.label}>Route</label>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#475569" }}>{mfe.route}</span>
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={styles.label}>Module</label>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#475569" }}>{mfe.module}</span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Status</label>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: mfe.isActive ? "#16a34a" : "#dc2626", fontWeight: "600" }}>
                                {mfe.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                ))
            )} */}
        </div>
    );
};

export default ApiTable;