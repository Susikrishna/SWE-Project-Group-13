// src/App.jsx
// ⚠ MFE RULE: NO BrowserRouter here!
// The host shell provides the router. We only use <Routes> so this
// component works both as a standalone (main.jsx wraps it) and as a
// remote federated module consumed by the shell.
import './App.css';
import { Routes, Route } from 'react-router-dom';
import CreateRolePage from './pages/CreateRole';
import Roles from './pages/Roles';
import Home from './pages/Home';
import UserRoleManager from './pages/UserRoleManager';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/newRole" element={<CreateRolePage />} />
      <Route path="/role" element={<Roles />} />
      <Route path="/userToRole" element={<UserRoleManager />} />
    </Routes>
  );
}

export default App;
