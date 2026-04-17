import PermissionBadge from "./PermissionBadge";
import { useAuth } from "../context/AuthContext";
import "./ComponentSection.css";

export default function ComponentSection({ component, mfeColor }) {
    const { hasPermission } = useAuth();

    const requiredPerms = component.allowedPermissions || [];
    const userHasAll = requiredPerms.length === 0 || requiredPerms.every(p => hasPermission(p));

    return (
        <div className={`comp-section ${!userHasAll ? "comp-locked" : ""}`}>
            {!userHasAll && <div className="comp-lock-overlay">🔒 Insufficient Permissions</div>}
            
            <div className="comp-header">
                <div className="comp-header-left">
                    <span className="comp-status" style={{ background: userHasAll ? "var(--color-success)" : "var(--color-danger)" }} />
                    <h3 className="comp-name">{component.name}</h3>
                    <span className="comp-route">{component.route}</span>
                </div>
                <span className={`badge ${userHasAll ? "badge-success" : "badge-danger"}`}>
                    {userHasAll ? "Accessible" : "Locked"}
                </span>
            </div>

            {component.description && (
                <p className="comp-description">{component.description}</p>
            )}

            <div className="comp-permissions">
                <span className="comp-perm-label">Required API Permissions:</span>
                <div className="comp-perm-list">
                    {requiredPerms.length === 0 ? (
                        <span className="comp-no-perms">No specific permissions required</span>
                    ) : (
                        requiredPerms.map((perm, i) => (
                            <PermissionBadge
                                key={i}
                                permission={perm}
                                granted={hasPermission(perm)}
                            />
                        ))
                    )}
                </div>
            </div>

            {userHasAll && (
                <div className="comp-demo-content">
                    <div className="comp-demo-placeholder">
                        <span className="comp-demo-icon">✦</span>
                        <span>Simulated {component.name} UI would render here</span>
                    </div>
                </div>
            )}
        </div>
    );
}
