import { createContext, useContext, useState, useEffect, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:3007";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("token"));
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [microfrontends, setMicrofrontends] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(true);

    const authHeaders = useCallback(
        () => ({ Authorization: `Bearer ${token}` }),
        [token]
    );

    const hydrate = useCallback(async (jwt) => {
        try {
            setLoading(true);
            const [meRes, authRes] = await Promise.all([
                axios.get(`${API_BASE}/user/me`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                }),
                axios.get(`${API_BASE}/proxy/authorize`, {
                    headers: { Authorization: `Bearer ${jwt}` },
                }),
            ]);

            setUser(meRes.data);
            setPermissions(authRes.data.permissions || []);
            setMicrofrontends(authRes.data.microfrontends || []);
            setRoles(authRes.data.roles || []);
        } catch (err) {
            console.error("Hydration failed:", err);
            // Clear everything on failure
            localStorage.removeItem("token");
            setToken(null);
            setUser(null);
            setPermissions([]);
            setMicrofrontends([]);
            setRoles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Hydrate on mount if we have a token
    useEffect(() => {
        if (token) {
            hydrate(token);
        } else {
            setLoading(false);
        }
    }, [token,hydrate]);

    const login = async (username, password) => {
        const res = await axios.post(`${API_BASE}/user/login`, {
            username,
            password,
        });
        const jwt = res.data.token;
        localStorage.setItem("token", jwt);
        setToken(jwt);
        await hydrate(jwt);
        return jwt;
    };

    const logout = () => {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
        setPermissions([]);
        setMicrofrontends([]);
        setRoles([]);
    };

    const hasPermission = (key) => {
        const normalized = key.trim().toLowerCase();
        return permissions.includes(normalized);
    };

    const hasMfeAccess = (featureSlug) => {
        return microfrontends.some(
            (mfe) => mfe.feature?.toLowerCase() === featureSlug.toLowerCase()
        );
    };

    return (
        <AuthContext.Provider
            value={{
                token,
                user,
                permissions,
                microfrontends,
                roles,
                loading,
                login,
                logout,
                hasPermission,
                hasMfeAccess,
                authHeaders,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

export default AuthContext;
