import Navbar from "../components/Navbar";
import RoleForm from "../components/RoleForm";
import { useNavigate, useLocation } from "react-router-dom";

function CreateRolePage() {
    const navigate = useNavigate();
    const location = useLocation();
    return (
        <div style={{ minHeight: "120vh" }}>
            <Navbar />
            <RoleForm />
        </div>
    );
}

export default CreateRolePage;