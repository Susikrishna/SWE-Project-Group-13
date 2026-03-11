import { useNavigate, useLocation } from "react-router-dom";

const routes = [
    { id: "", path: "/", label: "Home", icon: "⌂" },
    { id: "newRole", path: "/newRole", label: "Create Role", icon: "✦" },
    { id: "role", path: "/role", label: "All Roles", icon: "◈" },
    
];

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    return (
        <>
            <style>{navStyles}</style>
            <nav className="top-navbar">
                <div className="navbar-logo">Admin<span>.</span>Panel</div>
                <div className="navbar-divider" />
                {routes.map((route) => (
                    <button
                        key={route.id}
                        className={`nav-link ${location.pathname === route.path ? "active" : ""}`}
                        onClick={() => navigate(route.path)}
                    >
                        <span className="nav-icon">{route.icon}</span>
                        {route.label}
                    </button>
                ))}
            </nav>
        </>
    );
}

export default Navbar;

const navStyles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

.top-navbar {
    width: 100%;
    background: #ffffff;
    border-bottom: 1px solid #e4e7f0;
    box-shadow: 0 1px 4px rgba(79,70,229,0.06);
    display: flex;
    align-items: center;
    padding: 0 32px;
    height: 56px;
    gap: 8px;
    position: sticky;
    top: 0;
    z-index: 100;
    font-family: 'DM Sans', sans-serif;
    box-sizing: border-box;
}

.navbar-logo {
    font-size: 15px;
    font-weight: 700;
    color: #0d0a41;
    letter-spacing: -0.3px;
    margin-right: 24px;
    white-space: nowrap;
}

.navbar-logo span { color: #4f46e5; }

.navbar-divider {
    width: 1px;
    height: 20px;
    background: #e4e7f0;
    margin-right: 16px;
    flex-shrink: 0;
}

.nav-link {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 14px;
    border-radius: 7px;
    font-size: 13.5px;
    font-weight: 500;
    color: #6b7280;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    border: none;
    background: none;
    white-space: nowrap;
}

.nav-link:hover {
    background: #eef0fd;
    color: #0d0a41;
}

.nav-link.active {
    background: #eef2ff;
    color: #0d0a41;
    font-weight: 600;
}

.nav-icon { font-size: 14px; }

.navbar-right {
    margin-left: auto;
    display: flex;
    align-items: center;
}

.navbar-avatar {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: linear-gradient(135deg, #0d0a41 0%, #4f46e5 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 12px;
    font-weight: 700;

}
`;