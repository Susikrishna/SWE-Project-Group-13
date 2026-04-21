import React from 'react'
import { createRoot } from 'react-dom/client'
import AdminApp from './AdminApp.jsx'

// Dummy data for standalone rendering if someone opens port 5011 manually
const dummyMfe = {
  name: "Admin App (Standalone Mode)",
  description: "This is running independently of the Shell.",
  feature: "admin-mfe",
  components: []
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AdminApp mfe={dummyMfe} hasPermission={() => true} />
  </React.StrictMode>,
)
