import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Navbar.css";

export default function Navbar() {
    const { user, roles, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const navLinks = [
        { path: "/home", label: "Home", icon: "⬡" },
        { path: "/api-tester", label: "API Tester", icon: "⚡" },
    ];

    return (
        <nav className="navbar">
            <div className="navbar-inner">
                <div className="navbar-brand">
                    <span className="navbar-logo">🔐</span>
                    <span className="navbar-title">AuthZ Demo</span>
                </div>

                <div className="navbar-links">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={`navbar-link ${location.pathname === link.path ? "active" : ""}`}
                        >
                            <span className="navbar-link-icon">{link.icon}</span>
                            {link.label}
                        </Link>
                    ))}
                </div>

                <div className="navbar-user">
                    <div className="navbar-user-info">
                        <div className="navbar-avatar">
                            {user?.name?.charAt(0) || "?"}
                        </div>
                        <div className="navbar-user-text">
                            <span className="navbar-username">{user?.name || "Unknown"}</span>
                            <div className="navbar-roles">
                                {roles?.map((role, i) => (
                                    <span key={i} className="navbar-role-badge">
                                        {role.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                    <button className="btn btn-outline btn-sm" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </nav>
    );
}
