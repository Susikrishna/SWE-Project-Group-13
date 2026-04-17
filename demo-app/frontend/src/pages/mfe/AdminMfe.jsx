import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Navbar from "../../components/Navbar";
import ComponentSection from "../../components/ComponentSection";
import "./MfePage.css";

export default function AdminMfe() {
    const { microfrontends } = useAuth();
    const mfe = microfrontends.find((m) => m.feature === "admin-mfe");

    if (!mfe) {
        return (
            <div className="app-layout">
                <Navbar />
                <div className="app-content">
                    <div className="mfe-no-access">
                        <span className="mfe-no-access-icon">🔒</span>
                        <h2>Access Denied</h2>
                        <p>Your role does not grant access to the Admin Panel MFE.</p>
                        <Link to="/home" className="btn btn-primary">Back to Home</Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="app-layout">
            <Navbar />
            <div className="app-content">
                <div className="mfe-page animate-fade-in">
                    <div className="mfe-breadcrumb">
                        <Link to="/home">Home</Link>
                        <span className="mfe-breadcrumb-sep">/</span>
                        <span>{mfe.name}</span>
                    </div>

                    <div className="mfe-page-header">
                        <div className="mfe-page-icon">⚙️</div>
                        <div>
                            <h1 className="mfe-page-title">{mfe.name}</h1>
                            <p className="mfe-page-desc">{mfe.description}</p>
                            <span className="mfe-page-feature">{mfe.feature}</span>
                        </div>
                    </div>

                    <div className="mfe-info-bar">
                        <div className="mfe-info-item">
                            <span className="mfe-info-label">Route</span>
                            <span className="mfe-info-value">{mfe.route}</span>
                        </div>
                        <div className="mfe-info-item">
                            <span className="mfe-info-label">Module</span>
                            <span className="mfe-info-value">{mfe.module}</span>
                        </div>
                        <div className="mfe-info-item">
                            <span className="mfe-info-label">Remote URL</span>
                            <span className="mfe-info-value mfe-info-truncate">{mfe.remoteUrl}</span>
                        </div>
                    </div>

                    <h2 className="section-title"><span>📦</span> Components</h2>
                    <div className="mfe-components stagger-children">
                        {(mfe.components || []).filter(c => c.isActive !== false).map((comp, i) => (
                            <ComponentSection key={i} component={comp} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
