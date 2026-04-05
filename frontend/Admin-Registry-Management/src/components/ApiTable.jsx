import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { fetchMicroservices } from "../services/registryApi";

const ApiTable = () => {
    const [apis, setApis] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchMicroservices();
            setApis(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) {
        return <div style={styles.loadingOverlay}>Loading...</div>;
    }

    return (
        <div style={styles.glassCard}>
            <h1 style={styles.heading}>API Registry</h1>
            <p style={styles.subHeading}>All registered APIs across microservices.</p>
            {apis.length === 0 ? (
                <p style={styles.subHeading}>No APIs registered yet.</p>
            ) : (
                apis.map((api) => (
                    <div key={api._id} style={styles.permissionRow}>
                        <div style={{ flex: 2 }}>
                            <label style={styles.label}>{api.service}</label>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#475569" }}>
                                {api.permissionKey}
                            </span>
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={styles.label}>Route</label>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#475569" }}>
                                {api.basePath}{api.route}
                            </span>
                        </div>
                        <div style={{ flex: 2 }}>
                            <label style={styles.label}>Method</label>
                            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: "13px", color: "#475569" }}>
                                {api.method}
                            </span>
                        </div>
                        <div style={{ flex: 1 }}>
                            <label style={styles.label}>Status</label>
                            <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: "13px", color: api.isActive ? "#16a34a" : "#dc2626", fontWeight: "600" }}>
                                {api.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                ))
            )}
        </div>
    );
};

export default ApiTable;