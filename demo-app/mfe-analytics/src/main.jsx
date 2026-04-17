import React from 'react'
import { createRoot } from 'react-dom/client'
import AnalyticsApp from './AnalyticsApp.jsx'

// Dummy data for standalone rendering if someone opens port 5012 manually
const dummyMfe = {
  name: "Analytics App (Standalone Mode)",
  description: "This is running independently of the Shell.",
  feature: "analytics-mfe",
  components: []
};

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AnalyticsApp mfe={dummyMfe} hasPermission={() => true} />
  </React.StrictMode>,
)
