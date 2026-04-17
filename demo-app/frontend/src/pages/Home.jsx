import { useAuth } from "../context/AuthContext";
import MfeCard from "../components/MfeCard";
import Navbar from "../components/Navbar";
import PermissionBadge from "../components/PermissionBadge";
import "./Home.css";

export default function Home() {
    const { user, microfrontends, permissions, roles } = useAuth();

    // Group permissions by service for the explorer
    const groupedPerms = permissions.reduce((acc, perm) => {
        const service = perm.split(":")[0] || "unknown";
        if (!acc[service]) acc[service] = [];
        acc[service].push(perm);
        return acc;
    }, {});

    return (
        <div className="app-layout">
            <Navbar />
            <div className="app-content">
                <div className="home-page animate-fade-in">
                    {/* Header */}
                    <div className="page-header">
                        <h1>Welcome, {user?.name?.split(" ")[0]}</h1>
                        <p>
                            You have access to{" "}
                            <strong>{microfrontends.length} of 3</strong> microfrontends and{" "}
                            <strong>{permissions.length} of 24</strong> API permissions
                        </p>
                    </div>

                    {/* Role Info */}
                    <div className="home-role-info card">
                        <div className="home-role-header">
                            <span className="home-role-label">Active Role(s)</span>
                        </div>
                        <div className="home-role-list">
                            {roles?.map((role, i) => (
                                <div key={i} className="home-role-item">
                                    <span className="home-role-name">{role.name}</span>
                                    <span className="home-role-desc">{role.description}</span>
                                    {role.isTemp && (
                                        <span className="badge badge-warning">Temporary</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* MFE Grid */}
                    <div className="section">
                        <h2 className="section-title">
                            <span>⬡</span> Your Microfrontends
                        </h2>
                        {microfrontends.length === 0 ? (
                            <div className="home-empty card">
                                <p>🔒 Your role does not grant access to any microfrontends.</p>
                            </div>
                        ) : (
                            <div className="grid-3 stagger-children">
                                {microfrontends.map((mfe) => (
                                    <MfeCard key={mfe._id || mfe.feature} mfe={mfe} />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Permission Explorer */}
                    <div className="section">
                        <h2 className="section-title">
                            <span>🔑</span> Permission Explorer
                        </h2>
                        <div className="home-perm-grid">
                            {Object.entries(groupedPerms).map(([service, perms]) => (
                                <div key={service} className="home-perm-group card">
                                    <h3 className="home-perm-service">{service}</h3>
                                    <div className="home-perm-list">
                                        {perms.map((p, i) => (
                                            <PermissionBadge key={i} permission={p} granted={true} />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
