// src/App.jsx
import React from "react";
import { Routes, Route } from "react-router-dom";
import RegistrationPage from "./pages/RegistrationPage";
import RegistryListPage from "./pages/RegistryListPage";
import PermissionSetsPage from "./pages/PermissionSetsPage";
import MfeNavbar from "./components/MfeNavbar";

const App = () => {
  return (
    <div style={{ position: "relative", width: "100%", minHeight: "100vh" }}>
      <MfeNavbar />
      <Routes>
        <Route path="/" element={<RegistrationPage />} />
        <Route path="list" element={<RegistryListPage />} />
        <Route path="permission-sets" element={<PermissionSetsPage />} />
      </Routes>
    </div>
  );
};

export default App;