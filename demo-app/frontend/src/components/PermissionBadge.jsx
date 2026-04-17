import "./PermissionBadge.css";

const SERVICE_COLORS = {
    "auth-service": { color: "var(--svc-auth)", bg: "var(--svc-auth-bg)" },
    "user-service": { color: "var(--svc-user)", bg: "var(--svc-user-bg)" },
    "billing-service": { color: "var(--svc-billing)", bg: "var(--svc-billing-bg)" },
    "notification-service": { color: "var(--svc-notification)", bg: "var(--svc-notification-bg)" },
    "report-service": { color: "var(--svc-report)", bg: "var(--svc-report-bg)" },
};

function getServiceFromKey(key) {
    const parts = key.split(":");
    return parts[0] || "unknown";
}

export default function PermissionBadge({ permission, granted = true }) {
    const service = getServiceFromKey(permission);
    const colors = SERVICE_COLORS[service] || { color: "var(--text-secondary)", bg: "var(--bg-glass)" };

    return (
        <span
            className={`permission-badge ${!granted ? "permission-denied" : ""}`}
            style={{
                "--badge-color": colors.color,
                "--badge-bg": colors.bg,
            }}
        >
            <span className="permission-icon">{granted ? "✓" : "✕"}</span>
            <span className="permission-key">{permission}</span>
        </span>
    );
}
