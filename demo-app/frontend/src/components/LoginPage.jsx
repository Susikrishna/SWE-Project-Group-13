import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

const QUICK_USERS = [
    { username: "alice_admin", name: "Alice Johnson", role: "super-admin", icon: "👑", description: "Full access to everything" },
    { username: "bob_user", name: "Bob Smith", role: "user", icon: "👤", description: "Standard user — Dashboard only" },
    { username: "carol_support", name: "Carol White", role: "support-agent", icon: "🎧", description: "Dashboard + Admin panel" },
    { username: "david_finance", name: "David Brown", role: "finance-manager", icon: "💰", description: "Dashboard + Analytics" },
    { username: "eva_analyst", name: "Eva Martinez", role: "analyst", icon: "📊", description: "Analytics only" },
];

export default function LoginPage() {
    const [form, setForm] = useState({ username: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [activeQuick, setActiveQuick] = useState(null);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError("");
    };

    const doLogin = async (username, password) => {
        setLoading(true);
        setError("");
        try {
            await login(username, password);
            navigate("/home");
        } catch (err) {
            setError(err.response?.data?.message || "Login failed");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        doLogin(form.username, form.password);
    };

    const handleQuickLogin = (user) => {
        setActiveQuick(user.username);
        doLogin(user.username, "password");
    };

    return (
        <div className="login-page">
            <div className="login-bg-effects">
                <div className="login-bg-orb orb-1"></div>
                <div className="login-bg-orb orb-2"></div>
                <div className="login-bg-orb orb-3"></div>
            </div>

            <div className="login-container animate-fade-in">
                <div className="login-header">
                    <span className="login-logo">🔐</span>
                    <h1 className="login-title">AuthZ Demo</h1>
                    <p className="login-subtitle">
                        Role-Based Access Control Showcase
                    </p>
                </div>

                <div className="login-sections">
                    {/* Quick Login */}
                    <div className="quick-login-section">
                        <h2 className="quick-login-title">Quick Login</h2>
                        <p className="quick-login-hint">Click a user to log in instantly (password: "password")</p>
                        <div className="quick-login-grid stagger-children">
                            {QUICK_USERS.map((user) => (
                                <button
                                    key={user.username}
                                    className={`quick-user-card ${activeQuick === user.username ? "active" : ""}`}
                                    onClick={() => handleQuickLogin(user)}
                                    disabled={loading}
                                >
                                    <span className="quick-user-icon">{user.icon}</span>
                                    <div className="quick-user-info">
                                        <span className="quick-user-name">{user.name}</span>
                                        <span className="quick-user-role">{user.role}</span>
                                        <span className="quick-user-desc">{user.description}</span>
                                    </div>
                                    {activeQuick === user.username && loading && (
                                        <div className="quick-user-spinner"></div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Divider */}
                    <div className="login-divider">
                        <span>or sign in manually</span>
                    </div>

                    {/* Manual Login */}
                    <form className="login-form" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={form.username}
                            onChange={handleChange}
                            className="input"
                            required
                            disabled={loading}
                        />
                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={form.password}
                            onChange={handleChange}
                            className="input"
                            required
                            disabled={loading}
                        />
                        {error && <div className="login-error">{error}</div>}
                        <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
                            {loading ? "Signing in..." : "Sign In"}
                        </button>
                    </form>
                </div>

                <div className="login-footer">
                    <p>Powered by <strong>AUZ Engine</strong> • Registry Service • Role Service</p>
                </div>
            </div>
        </div>
    );
}
