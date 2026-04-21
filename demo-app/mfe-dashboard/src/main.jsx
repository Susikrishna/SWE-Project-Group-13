import React from 'react'
import { createRoot } from 'react-dom/client'
import DashboardApp from './DashboardApp.jsx'

// Dummy data for standalone rendering if someone opens port 5010 manually
const dummyMfe = {
  name: "Dashboard App (Standalone Mode)",
  description: "This is running independently of the Shell.",
  feature: "dashboard-mfe",
  components: []
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <DashboardApp mfe={dummyMfe} hasPermission={() => true} />
  </React.StrictMode>,
)
