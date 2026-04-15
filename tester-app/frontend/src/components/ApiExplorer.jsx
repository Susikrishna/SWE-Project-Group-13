import { useState } from "react";
import axios from "axios";

const ApiExplorer = ({ token, defaultUrl = "http://localhost:5050/api" }) => {
    const [method, setMethod] = useState("GET");
    const [endpoint, setEndpoint] = useState("");
    const [body, setBody] = useState("{}");
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleCall = async () => {
        setLoading(true);
        setResponse(null);

        let parsedBody = null;
        if (["POST", "PUT", "PATCH"].includes(method) && body) {
            try {
                parsedBody = JSON.parse(body);
            } catch (err) {
                setResponse({
                    status: "Invalid JSON",
                    data: err.message,
                    headers: {}
                });
                setLoading(false);
                return;
            }
        }

        try {
            const config = {
                method,
                url: `${defaultUrl}${endpoint}`,
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                data: parsedBody
            };
            const res = await axios(config);
            setResponse({
                status: res.status,
                data: res.data,
                headers: res.headers
            });
        } catch (err) {
            setResponse({
                status: err.response?.status || "Error",
                data: err.response?.data || err.message,
                headers: err.response?.headers || {}
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <div style={styles.label}>Direct Backend API Explorer</div>
                    <div style={styles.meta}>Base URL: <code style={styles.baseUrl}>{defaultUrl}</code></div>
                </div>
                <div style={styles.status}>Authorization header auto-injected</div>
            </div>

            <div style={styles.content} className="animate-fade-in">
                <div style={styles.row}>
                    <select
                        className="console-input"
                        style={styles.methodSelect}
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                    >
                        <option>GET</option>
                        <option>POST</option>
                        <option>PUT</option>
                        <option>DELETE</option>
                    </select>
                    <input
                        className="console-input"
                        placeholder="/endpoint"
                        value={endpoint}
                        onChange={(e) => setEndpoint(e.target.value)}
                        style={styles.endpointInput}
                    />
                    <button
                        className="btn btn-primary"
                        onClick={handleCall}
                        disabled={loading}
                    >
                        {loading ? "Executing..." : "Execute"}
                    </button>
                </div>

                {['POST', 'PUT', 'PATCH'].includes(method) && (
                    <textarea
                        className="console-input"
                        placeholder='{"key": "value"}'
                        style={styles.textarea}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                    />
                )}

                {response && (
                    <div style={styles.responseContainer}>
                        <div style={styles.responseHeader}>
                            <span>Status:</span>
                            <strong style={{ color: response.status < 400 ? "#10b981" : "#ef4444", marginLeft: "8px" }}>
                                {response.status}
                            </strong>
                        </div>
                        <div style={styles.responseBody}>
                            <div style={styles.responseSection}>
                                <div style={styles.responseSectionTitle}>Body</div>
                                <pre style={styles.pre}>{JSON.stringify(response.data, null, 2)}</pre>
                            </div>
                            <div style={styles.responseSection}>
                                <div style={styles.responseSectionTitle}>Headers</div>
                                <pre style={styles.pre}>{JSON.stringify(response.headers || {}, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const styles = {
    container: {
        width: "100%",
        background: "rgba(15, 23, 42, 0.55)",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        overflow: "hidden",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.22)"
    },
    header: {
        padding: "18px 22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        background: "rgba(255, 255, 255, 0.05)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.08)"
    },
    label: { fontSize: "14px", fontWeight: 700, color: "#f8fafc" },
    meta: { fontSize: "12px", color: "#94a3b8", marginTop: "6px" },
    baseUrl: { color: "#a5b4fc", background: "rgba(99, 102, 241, 0.1)", padding: "2px 6px", borderRadius: "6px" },
    status: { fontSize: "12px", color: "#60a5fa", textTransform: "uppercase", letterSpacing: "0.08em" },
    content: { padding: "20px" },
    row: { display: "grid", gridTemplateColumns: "120px 1fr auto", gap: "12px", alignItems: "center", marginBottom: "12px" },
    methodSelect: { width: "100%", maxWidth: "160px" },
    endpointInput: { flex: 1 },
    textarea: { width: "100%", minHeight: "100px", fontFamily: "monospace", resize: "vertical" },
    responseContainer: { marginTop: "18px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.08)", background: "rgba(15,23,42,0.65)" },
    responseHeader: { padding: "14px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "10px", color: "#c7d2fe" },
    responseBody: { display: "grid", gap: "14px", padding: "16px" },
    responseSection: { background: "rgba(255,255,255,0.04)", borderRadius: "12px", padding: "12px" },
    responseSectionTitle: { marginBottom: "10px", fontSize: "12px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" },
    pre: { margin: 0, overflowX: "auto", fontSize: "12px", color: "#e2e8f0", whiteSpace: "pre-wrap", wordBreak: "break-word" }
};

export default ApiExplorer;
