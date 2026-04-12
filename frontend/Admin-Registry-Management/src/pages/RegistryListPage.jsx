import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { fetchMicroservices, fetchMicrofrontends, searchMicroservices, searchMicrofrontends } from "../services/registryApi";
import RegistryCard from "../components/RegistryCard";
import EditRegistryModal from "../components/EditRegistryModal";

const ITEMS_PER_PAGE = 10;

const RegistryListPage = () => {
  const [apiItems, setApiItems] = useState([]);
  const [mfeItems, setMfeItems] = useState([]);
  const [activeTab, setActiveTab] = useState("MFE"); // 'MFE' or 'API'
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1); // Reset page on search
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  // Load data from server
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        let apisRes, mfesRes;

        if (debouncedSearch) {
          const [apis, mfes] = await Promise.all([
            searchMicroservices(debouncedSearch),
            searchMicrofrontends(debouncedSearch),
          ]);
          apisRes = apis;
          mfesRes = mfes;
        } else {
          const [apis, mfes] = await Promise.all([fetchMicroservices(), fetchMicrofrontends()]);
          apisRes = apis;
          mfesRes = mfes;
        }

        if (!isMounted) return;

        const mappedApis = (Array.isArray(apisRes) ? apisRes : apisRes?.data || []).map((a) => ({
          ...a,
          _type: "API",
          _sortKey: (a.service || "").toLowerCase(),
        })).sort((a, b) => a._sortKey.localeCompare(b._sortKey));

        const mappedMfes = (Array.isArray(mfesRes) ? mfesRes : mfesRes?.data || []).map((m) => ({
          ...m,
          _type: "MFE",
          _sortKey: (m.name || m.feature || "").toLowerCase(),
        })).sort((a, b) => a._sortKey.localeCompare(b._sortKey));

        setApiItems(mappedApis);
        setMfeItems(mappedMfes);
      } catch (err) {
        if (isMounted) setError(err.message || "Failed to load registry data");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [debouncedSearch, refreshTrigger]);

  const isSearching = debouncedSearch.length > 0;

  const handleEdit = (item) => setEditingItem(item);

  const handleSave = () => {
    setEditingItem(null);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(1); // Reset page on tab change
  };

  const currentDataset = activeTab === "MFE" ? mfeItems : apiItems;
  const totalItems = currentDataset.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const displayedItems = currentDataset.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div style={styles.page}>
      <div style={styles.wave}></div>
      <div style={styles.wave2}></div>

      <div style={styles.glassCard}>
        <h1 style={styles.heading}>Registered Components</h1>
        <p style={styles.subHeading}>View all active APIs and MFEs in the ecosystem.</p>

        {/* Tab Navigation */}
        <div style={localStyles.tabContainer}>
          <button
            style={activeTab === "MFE" ? localStyles.activeTab : localStyles.inactiveTab}
            onClick={() => handleTabChange("MFE")}
          >
            Microfrontends ({mfeItems.length})
          </button>
          <button
            style={activeTab === "API" ? localStyles.activeTab : localStyles.inactiveTab}
            onClick={() => handleTabChange("API")}
          >
            API Registries ({apiItems.length})
          </button>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative", marginBottom: "32px", marginTop: "16px" }}>
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
              placeholder={`Search ${activeTab === "MFE" ? "Microfrontends" : "APIs"}...`}
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
        </div>

        {/* Content */}
        {loading ? (
          <div style={styles.stateBox}>
            <div style={styles.spinner}></div>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "16px" }}>
              {isSearching ? "Searching registry..." : "Loading registry..."}
            </p>
          </div>
        ) : error ? (
          <div style={{ ...styles.stateBox, borderColor: "#fecaca", background: "rgba(254,226,226,0.3)" }}>
            <p style={{ color: "#dc2626", fontSize: "14px", fontWeight: 600 }}>⚠ {error}</p>
          </div>
        ) : displayedItems.length === 0 ? (
          <div style={styles.stateBox}>
            <p style={{ color: "#94a3b8", fontSize: "15px", fontWeight: 500 }}>
              {isSearching ? "No results match your search query." : `No ${activeTab} components found.`}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {displayedItems.map((item, index) => (
              <RegistryCard
                key={item._id || `${item._type}-${index}`}
                item={item}
                onEdit={handleEdit}
              />
            ))}
            
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={localStyles.paginationContainer}>
                <button
                  style={{ ...localStyles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? "not-allowed" : "pointer" }}
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(p => p - 1)}
                >
                  Prev
                </button>
                <div style={localStyles.pageIndicator}>
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  style={{ ...localStyles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? "not-allowed" : "pointer" }}
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(p => p + 1)}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {editingItem && (
        <EditRegistryModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSave={handleSave}
        />
      )}

      {/* Spinner keyframes */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const localStyles = {
  tabContainer: {
    display: "flex",
    gap: "8px",
    background: "rgba(241, 245, 249, 0.6)",
    padding: "6px",
    borderRadius: "14px",
    marginBottom: "24px",
  },
  activeTab: {
    flex: 1,
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "#fff",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 700,
    boxShadow: "0 2px 4px rgba(15, 23, 42, 0.06)",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  inactiveTab: {
    flex: 1,
    padding: "10px 16px",
    border: "none",
    borderRadius: "10px",
    background: "transparent",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  paginationContainer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    paddingTop: "16px",
    borderTop: "1px solid rgba(226, 232, 240, 0.8)",
  },
  pageBtn: {
    padding: "8px 16px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 600,
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  pageIndicator: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#64748b",
  }
};

export default RegistryListPage;
