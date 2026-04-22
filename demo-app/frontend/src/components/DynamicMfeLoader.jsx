import React, { lazy, Suspense } from "react";

// Standard Vite Module Federation lazy loading
const remoteComponents = {
  "dashboard-mfe": lazy(() => import("dashboardRemote/DashboardApp")),
  "admin-mfe": lazy(() => import("adminRemote/AdminApp")),
  "analytics-mfe": lazy(() => import("analyticsRemote/AnalyticsApp"))
};

export default function DynamicMfeLoader({ mfe, hasPermission }) {
  if (!mfe || !mfe.feature) return null;

  const Component = remoteComponents[mfe.feature];

  if (!Component) {
    return (
      <div className="card" style={{ borderLeft: '4px solid #f56565' }}>
        <h3 style={{ color: '#f56565' }}>Remote Loading Error</h3>
        <p style={{ color: '#a0a0b8' }}>Failed to map Microfrontend: {mfe.feature}</p>
      </div>
    );
  }

  return (
    <Suspense fallback={
      <div className="loading-screen" style={{ minHeight: '30vh' }}>
        <div className="loader"></div>
        <p>Fetching Remote MFE ({mfe.name})...</p>
      </div>
    }>
      <Component mfe={mfe} hasPermission={hasPermission} />
    </Suspense>
  );
}
