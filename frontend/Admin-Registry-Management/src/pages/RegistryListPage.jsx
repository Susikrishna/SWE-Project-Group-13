import React, { useState, useEffect, useMemo } from "react";
import { styles } from "../styles/registryTheme";
import { fetchMicroservices, fetchMicrofrontends } from "../services/registryApi";

const MAX_SEARCH_RESULTS = 10;
const DEFAULT_DISPLAY_COUNT = 10;

// Method badge colors
const methodColors = {
  GET: { bg: "#dcfce7", text: "#166534", border: "#bbf7d0" },
  POST: { bg: "#dbeafe", text: "#1e40af", border: "#bfdbfe" },
  PUT: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  PATCH: { bg: "#fef3c7", text: "#92400e", border: "#fde68a" },
  DELETE: { bg: "#fee2e2", text: "#991b1b", border: "#fecaca" },
};

const Badge = ({ label, color = "#64748b", bg = "#f1f5f9", border = "#e2e8f0" }) => (
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

const RegistryCard = ({ item }) => {
  const isApi = item._type === "API";
  const mc = isApi ? methodColors[item.method] || methodColors.GET : null;

  return (
    <div style={styles.registryCard}>
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
  );
};

const RegistryListPage = () => {
  const [allItems, setAllItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [apis, mfes] = await Promise.all([fetchMicroservices(), fetchMicrofrontends()]);

        const apiItems = (Array.isArray(apis) ? apis : apis?.data || []).map((a) => ({ ...a, _type: "API", _sortKey: (a.service || "").toLowerCase() }));
        const mfeItems = (Array.isArray(mfes) ? mfes : mfes?.data || []).map((m) => ({ ...m, _type: "MFE", _sortKey: (m.name || m.feature || "").toLowerCase() }));

        const combined = [...apiItems, ...mfeItems].sort((a, b) => a._sortKey.localeCompare(b._sortKey));
        setAllItems(combined);
      } catch (err) {
        setError(err.message || "Failed to load registry data");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredItems = useMemo(() => {
    if (!search.trim()) return allItems.slice(0, DEFAULT_DISPLAY_COUNT);

    const query = search.toLowerCase().trim();
    const matched = allItems.filter((item) => {
      if (item._type === "API") {
        return (
          (item.service || "").toLowerCase().includes(query) ||
          (item.basePath || "").toLowerCase().includes(query) ||
          (item.route || "").toLowerCase().includes(query) ||
          (item.method || "").toLowerCase().includes(query) ||
          (item.permissionKey || "").toLowerCase().includes(query) ||
          (item.description || "").toLowerCase().includes(query) ||
          (item.resource || "").toLowerCase().includes(query)
        );
      } else {
        return (
          (item.name || "").toLowerCase().includes(query) ||
          (item.feature || "").toLowerCase().includes(query) ||
          (item.route || "").toLowerCase().includes(query) ||
          (item.module || "").toLowerCase().includes(query) ||
          (item.description || "").toLowerCase().includes(query)
        );
      }
    });

    return matched.slice(0, MAX_SEARCH_RESULTS);
  }, [search, allItems]);

  const isSearching = search.trim().length > 0;

  return (
    <div style={styles.page}>
      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>

      <div style={styles.glassCard}>
        <h1 style={styles.heading}>Registered Components</h1>
        <p style={styles.subHeading}>View all active APIs and MFEs in the ecosystem.</p>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "32px" }}>
          <div style={styles.searchWrapper}>
            <svg
              style={styles.searchIcon}
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              id="registry-search-bar"
              type="text"
              placeholder="Search by name, route, method, permission..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                style={styles.searchClear}
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </div>
          {isSearching && (
            <p style={styles.resultCount}>
              Showing top {filteredItems.length} of {allItems.length} results
            </p>
          )}
          {!isSearching && allItems.length > DEFAULT_DISPLAY_COUNT && (
            <p style={styles.resultCount}>
              Showing {filteredItems.length} of {allItems.length} components — use search to find more
            </p>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.stateBox}>
            <div style={styles.spinner}></div>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "16px" }}>Loading registry...</p>
          </div>
        ) : error ? (
          <div style={{ ...styles.stateBox, borderColor: "#fecaca", background: "rgba(254,226,226,0.3)" }}>
            <p style={{ color: "#dc2626", fontSize: "14px", fontWeight: 600 }}>⚠ {error}</p>
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={styles.stateBox}>
            <p style={{ color: "#94a3b8", fontSize: "15px", fontWeight: 500 }}>
              {isSearching ? "No results match your search." : "No registered services found."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredItems.map((item, index) => (
              <RegistryCard key={item._id || `${item._type}-${index}`} item={item} />
            ))}
          </div>
        )}
      </div>

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default RegistryListPage;