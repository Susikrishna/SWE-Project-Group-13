import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { fetchMicrofrontends } from "../services/registryApi";

const MfeTable = () => {
    const [mfes, setMfes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchMicrofrontends();
            setMfes(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return <div style={styles.loadingOverlay}>Loading...</div>;
    }

    return (
        <div style={styles.glassCard}>
            <h1 style={styles.heading}>Microfrontends</h1>
            <p style={styles.subHeading}>All registered microfrontends in the ecosystem.</p>

            {mfes.length === 0 ? (
                <p style={styles.subHeading}>No microfrontends registered yet.</p>
            ) : (
                mfes.map((mfe) => (
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
            )}
        </div>
    );
};

export default MfeTable;