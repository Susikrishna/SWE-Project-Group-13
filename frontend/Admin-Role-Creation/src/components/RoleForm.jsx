import { useState } from "react";

function RoleForm() {
    const [roleName, setRoleName] = useState("");

    const [microfrontends, setMicrofrontends] = useState([
        { id: "f1", label: "frontend1", checked: false },
        { id: "f2", label: "frontend2", checked: false },
    ]);
    
    const [microservices, setMicroservices] = useState([
        { id: "s1", label: "service1", checked: false },
        { id: "s2", label: "service2", checked: false },
    ]);
    
    const toggleItem = (list, setList, id) => {
        setList(list.map((item) => item.id === id ? { ...item, checked: !item.checked } : item));
    };

    const selectedFrontends = microfrontends.filter((f) => f.checked);
    const selectedServices = microservices.filter((s) => s.checked);

    function handleSubmit(e) {
        e.preventDefault();
        const roleData = {
            name: roleName,
            frontends: selectedFrontends.map((f) => f.id),
            services: selectedServices.map((s) => s.id),
        };
        console.log("Role Created:", roleData);
        alert(`Role "${roleName}" created successfully!`);
    }
    
    return (
        <>
            <style>{styles}</style>
            <div className="role-container">
                <form className="role-form" onSubmit={handleSubmit}>

                    <div className="form-header">
                        <h2>Create Role</h2>
                    </div>

                    <div className="form-group">
                        <label>Role Name</label>
                        <input
                            type="text"
                            value={roleName}
                            placeholder="ex: admin, viewer, editor"
                            onChange={(e) => setRoleName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-divider" />

                    <p className="section-title">Microfrontend Access</p>
                    <div className="permissions">
                        {microfrontends.map((item) => (
                            <div
                                key={item.id}
                                className={`permission-item ${item.checked ? "checked" : ""}`}
                                onClick={() => toggleItem(microfrontends, setMicrofrontends, item.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => { }}
                                />
                                <label>{item.label}</label>
                            </div>
                        ))}
                    </div>

                    <div className="form-divider" />

                    <p className="section-title">Microservice Access</p>
                    <div className="permissions">
                        {microservices.map((item) => (
                            <div
                                key={item.id}
                                className={`permission-item ${item.checked ? "checked" : ""}`}
                                onClick={() => toggleItem(microservices, setMicroservices, item.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={item.checked}
                                    onChange={() => { }}
                                />
                                <label>{item.label}</label>
                            </div>
                        
                        ))}
                    </div>
                    
                    <button
                        className="submit-btn"
                        type="submit"
                        disabled={!roleName.trim()}
                    >
                        Create Role
                    </button>
                
                </form>
            </div>
        </>
    );
}

export default RoleForm;

const styles = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

.role-container {
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: 'DM Sans', sans-serif;
    padding: 20px;
}

.role-form {
    background: #ffffff;
    border: 1px solid #e4e7f0;
    padding: 40px;
    border-radius: 16px;
    width: 60%;
    box-shadow: 0 8px 32px rgba(79,70,229,0.08), 0 1px 3px rgba(0,0,0,0.06);
}

.form-header {
    margin-bottom: 32px;
}

.form-header h2 {
    font-size: 22px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 6px 0;
    letter-spacing: -0.3px;
}

.form-header p {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
}

.form-divider {
    height: 1px;
    background: #e9ebf2;
    margin: 28px 0;
}

.form-group {
    margin-bottom: 24px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.8px;
}

.form-group input[type="text"] {
    width: 100%;
    padding: 11px 14px;
    border-radius: 8px;
    border: 1px solid #d1d5db;
    background: #f9fafb;
    color: #111827;
    font-family: 'DM Mono', monospace;
    font-size: 14px;
    transition: border-color 0.2s, box-shadow 0.2s;
    box-sizing: border-box;
    outline: none;
}

.form-group input[type="text"]:focus {
    border-color: #070441;
    box-shadow: 0 0 0 3px rgba(79,70,229,0.12);
    background: #ffffff;
}

.form-group input[type="text"]::placeholder {
    color: #9ca3af;
}

.section-title {
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    margin: 0 0 14px 0;
}

.permissions {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 28px;
}

.permission-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background: #f9fafb;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;
}

.permission-item:hover {
    background: #eef0fd;
    border-color: #c7d0fb;
}

.permission-item.checked {
    background: #eef2ff;
    border-color: #111c54;
}

.permission-item input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 17px;
    height: 17px;
    border-radius: 5px;
    border: 1.5px solid #d1d5db;
    background: #ffffff;
    cursor: pointer;
    flex-shrink: 0;
    transition: all 0.15s;
    position: relative;
}

.permission-item input[type="checkbox"]:checked {
    background: #090649;
    border-color: #040220;
}

.permission-item label {
    font-size: 13.5px;
    font-weight: 500;
    color: #374151;
    cursor: pointer;
    font-family: 'DM Mono', monospace;
    flex: 1;
}


.submit-btn {
    width: 100%;
    padding: 13px;
    background: #090734;
    color: #ffffff;
    border: none;
    border-radius: 9px;
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 700;
    cursor: pointer;
    letter-spacing: 0.2px;
    transition: opacity 0.2s, transform 0.1s, box-shadow 0.2s;
    box-shadow: 0 4px 16px rgba(79,70,229,0.3);
}

.submit-btn:hover {
    opacity: 0.92;
    box-shadow: 0 6px 20px rgba(20, 16, 83, 0.4);
}

.submit-btn:active {
    transform: scale(0.99);
}

.submit-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.selection-count {
    font-size: 11.5px;
    color: #9ca3af;
    margin-bottom: 10px;
}

.selection-count span {
    color: #1a1666;
    font-weight: 600;
}
`;