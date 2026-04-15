import { useState } from "react";

const PRESET_TOKENS_INFO = [
    { roleId: "role_admin",        label: "Admin",        desc: "Full CRUD on all 3 resources", color: "#4f46e5" },
    { roleId: "role_acad-section", label: "Acad-Section", desc: "Gradelist CRD, Room-Booking R", color: "#0891b2" },
    { roleId: "role_student",      label: "Student",      desc: "Gradelist R, Fee-Status R",     color: "#16a34a" },
    { roleId: "role_admin-office", label: "Admin-Office", desc: "Fee-Status CRUD, Room-Booking CRUD", color: "#ea580c" },
];

function Login({ onLogin }) {
    const [token, setToken] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token.trim()) return setError("Token is required");
        setError("");
        setLoading(true);
        try {
            await onLogin(token.trim());
        } catch (err) {
            setError(err.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handlePreset = async (roleId) => {
        setError("");
        setLoading(true);
        try {
            // Generate a quick token client-side is not possible;
            // User must paste a pre-generated token. Show helpful message.
            setError(`Paste the JWT token for "${roleId}" (run: cd tester-app/backend && npm run gen-tokens)`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <style>{loginStyles}</style>
            <div className="login-page">
                <div className="login-card">
                    <div className="login-header">
                        <div className="login-logo">
                            <span className="logo-icon">🔐</span>
                            <span className="logo-text">RBAC <span className="logo-accent">Tester</span></span>
                        </div>
                        <p className="login-subtitle">Paste a JWT token to explore role-based access control in action.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="form-group">
                            <label>JWT Token</label>
                            <textarea
                                id="jwt-token-input"
                                rows={4}
                                value={token}
                                onChange={(e) => setToken(e.target.value)}
                                placeholder="eyJhbGciOiJIUzI1NiIs..."
                                spellCheck={false}
                            />
                        </div>

                        {error && <div className="login-error">{error}</div>}

                        <button
                            id="login-submit-btn"
                            className="login-btn"
                            type="submit"
                            disabled={loading || !token.trim()}
                        >
                            {loading ? "Authenticating…" : "Sign In with Token"}
                        </button>
                    </form>

                    <div className="preset-divider">
                        <span>Available Roles</span>
                    </div>

                    <div className="preset-grid">
                        {PRESET_TOKENS_INFO.map((p) => (
                            <button
                                key={p.roleId}
                                id={`preset-${p.roleId}`}
                                className="preset-card"
                                onClick={() => handlePreset(p.roleId)}
                                style={{ "--accent": p.color }}
                            >
                                <span className="preset-badge" style={{ background: p.color }}>{p.label}</span>
                                <span className="preset-desc">{p.desc}</span>
                            </button>
                        ))}
                    </div>

                    <p className="login-hint">
                        Generate tokens: <code>cd tester-app/backend && npm run gen-tokens</code>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Login;

const loginStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.login-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #0f0b3e 0%, #1a1154 40%, #0d1b3e 100%);
    font-family: 'DM Sans', sans-serif;
    padding: 24px;
}

.login-card {
    background: #ffffff;
    border-radius: 20px;
    padding: 44px 40px;
    width: 100%;
    max-width: 480px;
    box-shadow: 0 24px 80px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.05);
}

.login-header {
    text-align: center;
    margin-bottom: 32px;
}

.login-logo {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 12px;
}

.logo-icon {
    font-size: 28px;
}

.logo-text {
    font-size: 22px;
    font-weight: 700;
    color: #0d0a41;
}

.logo-accent {
    color: #4f46e5;
}

.login-subtitle {
    font-size: 14px;
    color: #6b7280;
    line-height: 1.6;
}

.login-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

.login-form .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.login-form .form-group label {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

.login-form textarea {
    width: 100%;
    padding: 12px 14px;
    border-radius: 10px;
    border: 1.5px solid #e4e7f0;
    background: #f9fafb;
    color: #111827;
    font-family: 'DM Mono', monospace;
    font-size: 13px;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
}

.login-form textarea:focus {
    border-color: #4f46e5;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
    background: #fff;
}

.login-error {
    background: #fef2f2;
    color: #dc2626;
    padding: 10px 14px;
    border-radius: 8px;
    font-size: 13px;
    border: 1px solid #fecaca;
}

.login-btn {
    width: 100%;
    padding: 13px;
    background: #090734;
    color: white;
    border: none;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    transition: opacity 0.2s, transform 0.1s;
}

.login-btn:hover { opacity: 0.92; }
.login-btn:active { transform: scale(0.99); }
.login-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.preset-divider {
    display: flex;
    align-items: center;
    gap: 16px;
    margin: 28px 0 20px;
}

.preset-divider::before,
.preset-divider::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e9ebf2;
}

.preset-divider span {
    font-size: 11px;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    white-space: nowrap;
}

.preset-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 10px;
}

.preset-card {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
    padding: 14px;
    border-radius: 10px;
    border: 1.5px solid #e5e7eb;
    background: #fafafa;
    cursor: pointer;
    transition: all 0.15s;
    text-align: left;
}

.preset-card:hover {
    border-color: var(--accent);
    background: #f8f7ff;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(79,70,229,0.08);
}

.preset-badge {
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    color: #fff;
    letter-spacing: 0.3px;
}

.preset-desc {
    font-size: 11px;
    color: #6b7280;
    line-height: 1.4;
}

.login-hint {
    margin-top: 20px;
    font-size: 12px;
    color: #9ca3af;
    text-align: center;
}

.login-hint code {
    background: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'DM Mono', monospace;
    font-size: 11px;
    color: #4f46e5;
}
`;
