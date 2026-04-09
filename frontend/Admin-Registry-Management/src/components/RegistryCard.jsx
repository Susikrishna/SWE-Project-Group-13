import React from "react";
import { styles } from "../styles/registryTheme";

// Method badge colors
const methodColors = {
  GET: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  POST: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  PUT: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  PATCH: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  DELETE: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
};

export const Badge = ({ label, color = "#64748b", bg = "#f1f5f9", border = "#e2e8f0" }) => (
  <span
    style={{
      display: "inline-block",
      padding: "3px 10px",
      fontSize: "11px",
      fontWeight: 700,
      letterSpacing: "0.5px",
      borderRadius: "8px",
      background: bg,
      color,
      border: `1px solid ${border}`,
      textTransform: "uppercase",
      fontFamily: "'DM Mono', monospace",
    }}
  >
    {label}
  </span>
);

const RegistryCard = ({ item, onEdit }) => {
  const isApi = item._type === "API";
  const mc = isApi ? methodColors[item.method] || methodColors.GET : null;

  return (
    <div style={{ ...styles.registryCard, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px", flexWrap: "wrap" }}>
          <Badge
            label={isApi ? "API" : "MFE"}
            bg={isApi ? "#ede9fe" : "#fce7f3"}
            color={isApi ? "#5b21b6" : "#9d174d"}
            border={isApi ? "#ddd6fe" : "#fbcfe8"}
          />
          {isApi && mc && <Badge label={item.method} bg={mc.bg} color={mc.text} border={mc.border} />}
          <span style={{ fontSize: "17px", fontWeight: 700, color: "#0f172a", letterSpacing: "-0.3px" }}>
            {isApi ? item.service : item.name}
          </span>
          {!item.isActive && <Badge label="Inactive" bg="#fef2f2" color="#b91c1c" border="#fecaca" />}
        </div>

        {isApi ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Route</span>
              <code style={styles.registryCode}>{item.basePath}{item.route}</code>
            </div>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Permission</span>
              <code style={styles.registryCode}>{item.permissionKey}</code>
            </div>
            {item.description && (
              <div style={styles.registryDetail}>
                <span style={styles.registryDetailLabel}>Description</span>
                <span style={{ color: "#475569", fontSize: "13px" }}>{item.description}</span>
              </div>
            )}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Feature</span>
              <code style={styles.registryCode}>{item.feature}</code>
            </div>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Route</span>
              <code style={styles.registryCode}>{item.route}</code>
            </div>
            <div style={styles.registryDetail}>
              <span style={styles.registryDetailLabel}>Module</span>
              <code style={styles.registryCode}>{item.module}</code>
            </div>
            {item.description && (
              <div style={styles.registryDetail}>
                <span style={styles.registryDetailLabel}>Description</span>
                <span style={{ color: "#475569", fontSize: "13px" }}>{item.description}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <button
        onClick={() => onEdit(item)}
        style={{
          padding: "6px 12px",
          background: "#f1f5f9",
          border: "1px solid #e2e8f0",
          borderRadius: "6px",
          color: "#475569",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          transition: "all 0.2s ease"
        }}
        onMouseOver={e => {
            e.target.style.background = "#e2e8f0";
            e.target.style.color = "#0f172a";
        }}
        onMouseOut={e => {
            e.target.style.background = "#f1f5f9";
            e.target.style.color = "#475569";
        }}
      >
        Edit
      </button>
    </div>
  );
};

export default RegistryCard;
