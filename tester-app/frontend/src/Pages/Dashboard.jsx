import { useEffect, useState, Suspense, lazy } from "react";
import axios from "axios";

const AUZ_URL = "http://localhost:3000";

const GradelistMFE = lazy(() => import("../mfes/GradelistMFE.jsx"));
const FeeStatusMFE = lazy(() => import("../mfes/FeeStatusMFE.jsx"));
const RoomBookingMFE = lazy(() => import("../mfes/RoomBookingMFE.jsx"));

const Dashboard = ({ token, onLogout }) => {
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAuth = async () => {
            try {
                const { data } = await axios.get(`${AUZ_URL}/auth/authorize`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProfile(data);
            } catch (err) {
                setError(err.response?.data?.error || "Auth completely failed. Invalid or expired token.");
                setTimeout(onLogout, 5000);
            } finally {
                setLoading(false);
            }
        };
        fetchAuth();
    }, [token, onLogout]);

    const primaryFeatures = ["gradelist-mfe", "fee-status-mfe", "room-booking-mfe"];

    const hasMFE = (featureSlug) => {
        if (!profile || !profile.microfrontends) return false;
        return profile.microfrontends.some((m) => m.feature === featureSlug);
    };

    const permissionGroups = (profile?.permissions || []).reduce((acc, value) => {
        const service = value.split(":")[0] || "unknown";
        acc[service] = acc[service] || [];
        acc[service].push(value);
        return acc;
    }, {});

    const supportedMFEs = profile?.microfrontends?.filter((m) => primaryFeatures.includes(m.feature)) || [];
    const additionalMFEs = profile?.microfrontends?.filter((m) => !primaryFeatures.includes(m.feature)) || [];

    if (loading) return <div style={styles.center}>Loading Access Profile...</div>;
    if (error) return <div style={styles.center}><p style={{ color: "red" }}>{error}</p></div>;

    return (
        <div style={styles.wrapper}>
            <div style={styles.header} className="glass-panel animate-fade-in">
                <div>
                    <h1 style={styles.title}>Tester Workspace</h1>
                    <p style={styles.subtitle}>
                        Signed in as <span style={styles.highlight}>{profile.userId}</span> • Role: {(profile.roles?.map((r) => r.name) || []).join(", ")} • {profile.permissions?.length || 0} permissions
                    </p>
                </div>
                <button className="btn btn-danger" onClick={onLogout}>Sign Out</button>
            </div>

            <div style={styles.grid}>
                <div style={styles.sidebar}>
                    <div style={styles.card} className="glass-panel animate-fade-in">
                        <div style={styles.sidebarHeader}>
                            <h3 style={styles.cardTitle}>System Transparency Hub</h3>
                            <span style={styles.summaryBadge}>{profile.microfrontends?.length || 0} MFEs • {profile.permissions?.length || 0} permissions</span>
                        </div>

                        <div style={styles.section}>
                            <h4 style={styles.sectionTitle}>Authorized MFE Inventory</h4>
                            <div style={styles.mfeList}>
                                {supportedMFEs.map((mfe) => (
                                    <div key={mfe.feature} style={styles.mfeItem}>
                                        <div style={styles.mfeHeader}>
                                            <strong>{mfe.name || mfe.feature}</strong>
                                            <span style={styles.mfeBadge}>primary</span>
                                        </div>
                                        <p style={styles.mfeText}>{mfe.description || "No description available."}</p>
                                        <div style={styles.mfeMeta}>
                                            <span>{mfe.route || "N/A route"}</span>
                                            <code style={styles.mfeCode}>{mfe.remoteUrl || "No remote URL"}</code>
                                        </div>
                                    </div>
                                ))}

                                {additionalMFEs.length > 0 && (
                                    <div style={styles.additionalSection}>
                                        <div style={styles.additionalTag}>Additional Modules</div>
                                        {additionalMFEs.map((mfe) => (
                                            <div key={mfe.feature} style={styles.mfeItem}>
                                                <div style={styles.mfeHeader}>
                                                    <strong>{mfe.name || mfe.feature}</strong>
                                                    <span style={{ ...styles.mfeBadge, background: "rgba(59, 130, 246, 0.12)", color: "#60a5fa" }}>extra</span>
                                                </div>
                                                <p style={styles.mfeText}>{mfe.description || "Listed for visibility only."}</p>
                                                <div style={styles.mfeMeta}>
                                                    <span>{mfe.route || "N/A route"}</span>
                                                    <code style={styles.mfeCode}>{mfe.remoteUrl || "No remote URL"}</code>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {profile.microfrontends?.length === 0 && (
                                    <div className="empty-state">No MFEs were returned for this profile.</div>
                                )}
                            </div>
                        </div>

                        <div style={styles.section}>
                            <h4 style={styles.sectionTitle}>API Permissions Matrix</h4>
                            <div style={styles.permissionsPanel}>
                                {Object.entries(permissionGroups).map(([service, permissions]) => (
                                    <div key={service} style={styles.serviceBlock}>
                                        <div style={styles.serviceHeader}>
                                            <span>{service}</span>
                                            <strong>{permissions.length}</strong>
                                        </div>
                                        <div style={styles.permGrid}>
                                            {permissions.map((permission) => (
                                                <span key={permission} style={styles.permBadge}>{permission}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}

                                {Object.keys(permissionGroups).length === 0 && (
                                    <div className="empty-state">No API permissions available for this profile.</div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* MFE Render Area */}
                <div style={styles.main}>
                    <Suspense fallback={<div style={styles.loader}>Initializing Secure Modules...</div>}>
                        <div style={styles.mfeContainer}>
                            {hasMFE("gradelist-mfe") && <GradelistMFE token={token} profile={profile} />}
                            {hasMFE("fee-status-mfe") && <FeeStatusMFE token={token} profile={profile} />}
                            {hasMFE("room-booking-mfe") && <RoomBookingMFE token={token} profile={profile} />}
                            
                            {!hasMFE("gradelist-mfe") && !hasMFE("fee-status-mfe") && !hasMFE("room-booking-mfe") && (
                                <div className="empty-state">
                                    No interactive UI modules assigned to your profile.
                                </div>
                            )}
                        </div>
                    </Suspense>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

const styles = {
    wrapper: { padding: "30px", minHeight: "100vh" },
    header: {
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "24px 32px", marginBottom: "30px"
    },
    title: { margin: 0, fontSize: "24px", fontWeight: "700", color: "#fff", letterSpacing: "-0.5px" },
    subtitle: { margin: "4px 0 0 0", color: "#94a3b8", fontSize: "14px" },
    highlight: { color: "#6366f1", fontWeight: "600" },
    center: { display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", fontSize: "16px", color: "#6b7280" },
    sidebarHeader: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "18px" },
    summaryBadge: { fontSize: "11px", color: "#e0f2fe", background: "rgba(59, 130, 246, 0.14)", borderRadius: "999px", padding: "6px 10px", textTransform: "uppercase", letterSpacing: "0.08em" },
    grid: { display: "grid", gridTemplateColumns: "360px 1fr", gap: "30px", maxWidth: "1600px", margin: "0 auto" },
    permissionsPanel: { display: "flex", flexDirection: "column", gap: "14px" },
    serviceBlock: { padding: "14px", background: "rgba(255,255,255,0.03)", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.08)" },
    serviceHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", marginBottom: "10px", color: "#e2e8f0", fontSize: "13px" },
    mfeMeta: { display: "flex", flexDirection: "column", gap: "4px", fontSize: "11px", color: "#94a3b8" },
    additionalSection: { marginTop: "16px", paddingTop: "14px", borderTop: "1px dashed rgba(255,255,255,0.08)" },
    additionalTag: { marginBottom: "12px", fontSize: "12px", color: "#a5b4fc", letterSpacing: "0.08em", textTransform: "uppercase" },
    grid: { display: "grid", gridTemplateColumns: "360px 1fr", gap: "30px", maxWidth: "1600px", margin: "0 auto" },
    sidebar: { display: "flex", flexDirection: "column", gap: "20px" },
    card: { padding: "24px" },
    cardTitle: { margin: "0 0 20px 0", fontSize: "16px", color: "#fff", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "12px" },
    section: { marginBottom: "24px" },
    sectionTitle: { fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px", color: "#6366f1", marginBottom: "12px" },
    mfeList: { display: "flex", flexDirection: "column", gap: "12px" },
    mfeItem: { padding: "12px", background: "rgba(255,255,255,0.03)", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.05)" },
    mfeHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" },
    mfeBadge: { fontSize: "9px", background: "rgba(16, 185, 129, 0.1)", color: "#10b981", padding: "2px 6px", borderRadius: "4px", textTransform: "uppercase" },
    mfeText: { margin: "0 0 8px 0", fontSize: "12px", color: "#94a3b8", lineHeight: "1.4" },
    mfeCode: { fontSize: "10px", color: "#6366f1", display: "block", overflow: "hidden", textOverflow: "ellipsis" },
    permGrid: { display: "flex", flexWrap: "wrap", gap: "6px" },
    permBadge: { fontSize: "10px", padding: "4px 8px", background: "rgba(99, 102, 241, 0.1)", border: "1px solid rgba(99, 102, 241, 0.2)", borderRadius: "6px", color: "#a5b4fc" },
    main: { minWidth: 0 },
    mfeContainer: { display: "flex", flexDirection: "column", gap: "30px" },
    loader: { display: "flex", justifyContent: "center", padding: "100px", color: "#94a3b8" }
};