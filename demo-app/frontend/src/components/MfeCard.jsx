import { useNavigate } from "react-router-dom";
import "./MfeCard.css";

const MFE_THEMES = {
    "dashboard-mfe": {
        color: "var(--mfe-dashboard)",
        bg: "var(--mfe-dashboard-bg)",
        icon: "📊",
    },
    "admin-mfe": {
        color: "var(--mfe-admin)",
        bg: "var(--mfe-admin-bg)",
        icon: "⚙️",
    },
    "analytics-mfe": {
        color: "var(--mfe-analytics)",
        bg: "var(--mfe-analytics-bg)",
        icon: "📈",
    },
};

export default function MfeCard({ mfe }) {
    const navigate = useNavigate();
    const theme = MFE_THEMES[mfe.feature] || {
        color: "var(--accent-primary)",
        bg: "var(--bg-glass)",
        icon: "📦",
    };

    const activeComponents = (mfe.components || []).filter(c => c.isActive !== false);

    return (
        <div
            className="mfe-card"
            style={{
                "--mfe-color": theme.color,
                "--mfe-bg": theme.bg,
            }}
            onClick={() => navigate(mfe.route)}
        >
            <div className="mfe-card-header">
                <span className="mfe-card-icon">{theme.icon}</span>
                <div className="mfe-card-meta">
                    <h3 className="mfe-card-title">{mfe.name}</h3>
                    <span className="mfe-card-feature">{mfe.feature}</span>
                </div>
            </div>

            <p className="mfe-card-description">{mfe.description}</p>

            <div className="mfe-card-components">
                <span className="mfe-card-label">Components</span>
                <div className="mfe-card-component-list">
                    {activeComponents.map((comp, i) => (
                        <span key={i} className="mfe-card-component">
                            {comp.name}
                        </span>
                    ))}
                </div>
            </div>

            <div className="mfe-card-footer">
                <span className="mfe-card-route">{mfe.route}</span>
                <span className="mfe-card-perms">
                    {(mfe.allowedPermissions || []).length} permissions
                </span>
            </div>

            <div className="mfe-card-arrow">→</div>
        </div>
    );
}
