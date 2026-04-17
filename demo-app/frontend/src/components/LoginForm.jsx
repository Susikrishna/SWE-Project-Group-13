import { useState } from "react";
import axios from "axios"
import {useNavigate} from "react-router-dom"
export default function LoginForm() {
    const [form, setForm] = useState({
        username: "",
        password: ""
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();
        const res = await axios.post("http://localhost:3007/user/login", {
            username: form.username,
            password: form.password
        });
        localStorage.setItem("token", res.data.token);
        
        navigate("/dashboard");
    };

    return (
        <div style={styles.container}>
            <form onSubmit={handleSubmit} style={styles.form}>
                <h2>Login</h2>

                <input
                    type="username"
                    name="username"
                    placeholder="Enter username"
                    value={form.username}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <input
                    type="password"
                    name="password"
                    placeholder="Enter password"
                    value={form.password}
                    onChange={handleChange}
                    style={styles.input}
                    required
                />

                <button type="submit" style={styles.button}>
                    Login
                </button>
            </form>
        </div>
    );
}

const styles = {
    container: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "#f5f5f5"
    },
    form: {
        display: "flex",
        flexDirection: "column",
        padding: "20px",
        background: "#fff",
        borderRadius: "8px",
        width: "300px",
        gap: "10px",
        boxShadow: "0 0 10px rgba(0,0,0,0.1)"
    },
    input: {
        padding: "10px",
        borderRadius: "5px",
        border: "1px solid #ccc"
    },
    button: {
        padding: "10px",
        background: "#007bff",
        color: "#fff",
        border: "none",
        borderRadius: "5px",
        cursor: "pointer"
    }
};