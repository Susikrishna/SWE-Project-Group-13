import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [mfes, setMfes] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchAuthData = async () => {
            try {
                console.log("Fetching auth data...");
                const token = localStorage.getItem("token");

                const res = await axios.get("http://localhost:3000/auth/authorize", {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                console.log("Auth response:", res);
                setMfes(res.data.microfrontends);
            } catch (err) {
                console.error("Auth error:", err);
                navigate("/login");
            } finally {
                setLoading(false);
            }
        };

        fetchAuthData();
    }, []);

    if (loading) return <div>Loading...</div>;

    return (
        <div>
            <h1>Dashboard</h1>

            <h3>Available Apps</h3>

            {mfes.length === 0 ? (
                <p>No apps available</p>
            ) : (
                <ul>
                    {mfes.map((mfe) => (
                        <li key={mfe.name}>
                            <button onClick={() => navigate(mfe.route)}>
                                {mfe.name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Dashboard;