import { useState } from "react";
import ApiExplorer from "./ApiExplorer";

const DeveloperShell = ({ title, description, token, baseUrl, children }) => {
    const [activeTab, setActiveTab] = useState("module");

    return (
        <div className="glass-panel animate-fade-in developer-shell" style={styles.shell}>
            <div style={styles.header}>
                <div>
                    <h2 style={styles.title}>{title}</h2>
                    <p style={styles.description}>{description}</p>
                </div>
                <div style={styles.tabGroup}>
                    <button
                        type="button"
                        onClick={() => setActiveTab("module")}
                        className={activeTab === "module" ? "tab-button active" : "tab-button"}
                    >
                        Module
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("api")}
                        className={activeTab === "api" ? "tab-button active" : "tab-button"}
                    >
                        API Explorer
                    </button>
                </div>
            </div>
            <div style={styles.body}>
                {activeTab === "module" ? (
                    <div style={styles.modulePane}>{children}</div>
                ) : (
                    <ApiExplorer token={token} defaultUrl={baseUrl} />
                )}
            </div>
        </div>
    );
};

const styles = {
    shell: { padding: "22px" },
    header: { display: "flex", justifyContent: "space-between", gap: "20px", alignItems: "center", marginBottom: "20px", flexWrap: "wrap" },
    title: { margin: 0, fontSize: "20px", fontWeight: 700, color: "#fff" },
    description: { margin: "6px 0 0", color: "#cbd5e1", fontSize: "13px", maxWidth: "600px" },
    tabGroup: { display: "flex", gap: "10px", flexWrap: "wrap" },
    body: { display: "flex", flexDirection: "column", gap: "20px" },
    modulePane: { display: "flex", flexDirection: "column", gap: "20px" },
};

export default DeveloperShell;
