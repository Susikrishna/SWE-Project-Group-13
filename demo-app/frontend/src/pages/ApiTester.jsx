import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import PermissionBadge from "../components/PermissionBadge";
import "./ApiTester.css";

const API_BASE = "http://localhost:3007";

const PRESET_REQUESTS = [
    { label: "List Users", url: "/api/v1/users", method: "GET", endpoint: "/demo-api/users", category: "User Service" },
    { label: "Get User by ID", url: "/api/v1/users/123", method: "GET", endpoint: "/demo-api/users/123", category: "User Service" },
    { label: "Create User", url: "/api/v1/users", method: "POST", endpoint: "/demo-api/users", category: "User Service" },
    { label: "Delete User", url: "/api/v1/users/123", method: "DELETE", endpoint: "/demo-api/users/123", category: "User Service" },
    { label: "Read Invoice", url: "/api/v1/billing/invoices/1", method: "GET", endpoint: "/demo-api/invoices", category: "Billing Service" },
    { label: "Generate Report", url: "/api/v1/reports/generate", method: "POST", endpoint: "/demo-api/reports/generate", category: "Report Service" },
];

const METHOD_COLORS = {
    GET: "#48bb78",
    POST: "#4299e1",
    PUT: "#ed8936",
    DELETE: "#f56565",
};

export default function ApiTester() {
    const { token, hasPermission, roles } = useAuth();
    const [selectedPreset, setSelectedPreset] = useState(null);
    const [customUrl, setCustomUrl] = useState("");
    const [customMethod, setCustomMethod] = useState("GET");
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [useCustom, setUseCustom] = useState(false);

    const handlePresetClick = (preset) => {
        setSelectedPreset(preset);
        setUseCustom(false);
        setResult(null);
    };

    const handleSendRequest = async () => {
        setLoading(true);
        setResult(null);

        try {
            let response;
            const startTime = performance.now();

            if (useCustom) {
                // Custom URL uses the proxy check-access endpoint
                response = await axios.post(
                    `${API_BASE}/proxy/check-access`,
                    { url: customUrl, method: customMethod },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const duration = Math.round(performance.now() - startTime);
                setResult({
                    status: 200,
                    allowed: response.data.allowed,
                    data: response.data,
                    duration,
                    request: { url: customUrl, method: customMethod },
                    mode: "check-access",
                });
            } else if (selectedPreset) {
                // Preset uses the demo-api endpoint which gates through auz-engine
                try {
                    const config = {
                        method: selectedPreset.method.toLowerCase(),
                        url: `${API_BASE}${selectedPreset.endpoint}`,
                        headers: { Authorization: `Bearer ${token}` },
                    };
                    response = await axios(config);
                    const duration = Math.round(performance.now() - startTime);
                    setResult({
                        status: response.status,
                        allowed: true,
                        data: response.data,
                        duration,
                        request: { url: selectedPreset.url, method: selectedPreset.method },
                        mode: "demo-api",
                    });
                } catch (err) {
                    const duration = Math.round(performance.now() - startTime);
                    if (err.response?.status === 403) {
                        setResult({
                            status: 403,
                            allowed: false,
                            data: err.response.data,
                            duration,
                            request: { url: selectedPreset.url, method: selectedPreset.method },
                            mode: "demo-api",
                        });
                    } else {
                        setResult({
                            status: err.response?.status || 500,
                            allowed: false,
                            data: err.response?.data || { error: err.message },
                            duration,
                            request: { url: selectedPreset.url, method: selectedPreset.method },
                            mode: "demo-api",
                        });
                    }
                }
            }
        } catch (err) {
            setResult({
                status: err.response?.status || 500,
                allowed: err.response?.data?.allowed ?? false,
                data: err.response?.data || { error: err.message },
                duration: 0,
                request: useCustom
                    ? { url: customUrl, method: customMethod }
                    : { url: selectedPreset?.url, method: selectedPreset?.method },
                mode: useCustom ? "check-access" : "demo-api",
            });
        } finally {
            setLoading(false);
        }
    };

    const canSend = useCustom ? customUrl.trim() !== "" : selectedPreset !== null;

    return (
        <div className="app-layout">
            <Navbar />
            <div className="app-content">
                <div className="api-tester animate-fade-in">
                    <div className="page-header">
                        <h1>⚡ API Tester</h1>
                        <p>
                            Test RBAC in real-time. Every request flows through the AUZ Engine for authorization.
                        </p>
                    </div>

                    <div className="api-tester-layout">
                        {/* Left: Request Builder */}
                        <div className="api-panel api-request-panel">
                            <h2 className="api-panel-title">Request Builder</h2>

                            {/* Preset Endpoints */}
                            <div className="api-presets">
                                <h3 className="api-presets-title">Pre-built Endpoints</h3>
                                <div className="api-preset-list">
                                    {PRESET_REQUESTS.map((preset, i) => (
                                        <button
                                            key={i}
                                            className={`api-preset-btn ${selectedPreset === preset && !useCustom ? "active" : ""}`}
                                            onClick={() => handlePresetClick(preset)}
                                        >
                                            <span
                                                className="api-method-tag"
                                                style={{ background: METHOD_COLORS[preset.method] }}
                                            >
                                                {preset.method}
                                            </span>
                                            <div className="api-preset-info">
                                                <span className="api-preset-label">{preset.label}</span>
                                                <span className="api-preset-url">{preset.url}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom URL */}
                            <div className="api-custom">
                                <h3 className="api-presets-title">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={useCustom}
                                            onChange={(e) => {
                                                setUseCustom(e.target.checked);
                                                setResult(null);
                                            }}
                                        />
                                        {" "}Custom URL (check-access only)
                                    </label>
                                </h3>
                                {useCustom && (
                                    <div className="api-custom-form">
                                        <select
                                            className="input api-method-select"
                                            value={customMethod}
                                            onChange={(e) => setCustomMethod(e.target.value)}
                                        >
                                            <option value="GET">GET</option>
                                            <option value="POST">POST</option>
                                            <option value="PUT">PUT</option>
                                            <option value="DELETE">DELETE</option>
                                        </select>
                                        <input
                                            type="text"
                                            className="input"
                                            placeholder="/api/v1/users/123"
                                            value={customUrl}
                                            onChange={(e) => setCustomUrl(e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>

                            <button
                                className="btn btn-primary api-send-btn"
                                onClick={handleSendRequest}
                                disabled={!canSend || loading}
                            >
                                {loading ? (
                                    <><span className="api-send-spinner"></span> Sending...</>
                                ) : (
                                    "⚡ Send Request"
                                )}
                            </button>
                        </div>

                        {/* Right: Response Viewer */}
                        <div className="api-panel api-response-panel">
                            <h2 className="api-panel-title">Response</h2>

                            {!result && !loading && (
                                <div className="api-empty-state">
                                    <span className="api-empty-icon">📡</span>
                                    <p>Select an endpoint and send a request to see the RBAC result.</p>
                                </div>
                            )}

                            {loading && (
                                <div className="api-loading">
                                    <div className="loader"></div>
                                    <p>Calling AUZ Engine...</p>
                                </div>
                            )}

                            {result && (
                                <div className="api-result animate-slide-up">
                                    {/* Status Banner */}
                                    <div className={`api-status-banner ${result.allowed ? "api-status-allowed" : "api-status-denied"}`}>
                                        <span className="api-status-icon">{result.allowed ? "✅" : "🚫"}</span>
                                        <div className="api-status-text">
                                            <span className="api-status-label">
                                                {result.allowed ? "ACCESS GRANTED" : "ACCESS DENIED"}
                                            </span>
                                            <span className="api-status-code">HTTP {result.status} • {result.duration}ms</span>
                                        </div>
                                    </div>

                                    {/* Resolved Permission */}
                                    {result.data?.resolvedPermission && (
                                        <div className="api-resolved-perm">
                                            <span className="api-resolved-label">Resolved Permission:</span>
                                            <PermissionBadge
                                                permission={result.data.resolvedPermission}
                                                granted={hasPermission(result.data.resolvedPermission)}
                                            />
                                            <span className={`badge ${hasPermission(result.data.resolvedPermission) ? "badge-success" : "badge-danger"}`}>
                                                {hasPermission(result.data.resolvedPermission) ? "You have this" : "You lack this"}
                                            </span>
                                        </div>
                                    )}

                                    {/* Response Body */}
                                    <div className="api-response-body">
                                        <span className="api-response-label">Response Body:</span>
                                        <pre className="api-response-json">
                                            {JSON.stringify(result.data, null, 2)}
                                        </pre>
                                    </div>

                                    {/* Flow Visualization */}
                                    <div className="api-flow">
                                        <span className="api-flow-title">Authorization Flow:</span>
                                        <div className="api-flow-steps">
                                            <div className="api-flow-step">
                                                <span className="api-flow-num">1</span>
                                                <span>Your JWT was sent to <strong>Demo Backend</strong></span>
                                            </div>
                                            <div className="api-flow-arrow">↓</div>
                                            <div className="api-flow-step">
                                                <span className="api-flow-num">2</span>
                                                <span>
                                                    Demo Backend forwarded to <strong>AUZ Engine</strong>{" "}
                                                    {result.mode === "demo-api" ? "/auth/check-access" : "/auth/check-access"}
                                                </span>
                                            </div>
                                            <div className="api-flow-arrow">↓</div>
                                            <div className="api-flow-step">
                                                <span className="api-flow-num">3</span>
                                                <span>
                                                    AUZ Engine matched URL <code>{result.request?.url}</code> in <strong>API Registry</strong>
                                                    {result.data?.resolvedPermission && (
                                                        <> → <code>{result.data.resolvedPermission}</code></>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="api-flow-arrow">↓</div>
                                            <div className="api-flow-step">
                                                <span className="api-flow-num">4</span>
                                                <span>
                                                    AUZ Engine checked your role{" "}
                                                    <strong>{roles?.[0]?.name || "unknown"}</strong> →{" "}
                                                    {result.allowed ? (
                                                        <span style={{ color: "var(--color-success)" }}>✅ ALLOWED</span>
                                                    ) : (
                                                        <span style={{ color: "var(--color-danger)" }}>❌ DENIED</span>
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
