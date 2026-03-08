import Navbar from "../components/Navbar";
import RoleForm from "../components/RoleForm";

function CreateRolePage() {
    return (
        <div style={{ minHeight: "120vh", background: "#f0f2f9" }}>
            <Navbar />
            <RoleForm />
        </div>
    );
}

export default CreateRolePage;