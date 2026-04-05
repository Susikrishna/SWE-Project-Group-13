import React, { useState, useEffect } from "react";
import { styles } from "../styles/registryTheme";
import { fetchMicroservices, fetchMicrofrontends, searchMicroservices, searchMicrofrontends } from "../services/registryApi";
import RegistryCard from "../components/RegistryCard";
import EditRegistryModal from "../components/EditRegistryModal";

const MAX_SEARCH_RESULTS = 10;
const DEFAULT_DISPLAY_COUNT = 10;

const RegistryListPage = () => {
  const [displayedItems, setDisplayedItems] = useState([]);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Used to force reload after edit

  // Debouncing search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
    }, 400); // 400ms delay
    return () => clearTimeout(handler);
  }, [search]);

  // Loading data from server
  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        let apisRes, mfesRes;

        if (debouncedSearch) {
          // If search active, use the server-side search APIs
          const [apis, mfes] = await Promise.all([
            searchMicroservices(debouncedSearch),
            searchMicrofrontends(debouncedSearch)
          ]);
          apisRes = apis;
          mfesRes = mfes;
        } else {
          // Otherwise, fetch initial set
          const [apis, mfes] = await Promise.all([fetchMicroservices(), fetchMicrofrontends()]);
          apisRes = apis;
          mfesRes = mfes;
        }

        if (!isMounted) return;

        const apiItems = (Array.isArray(apisRes) ? apisRes : apisRes?.data || []).map((a) => ({ ...a, _type: "API", _sortKey: (a.service || "").toLowerCase() }));
        const mfeItems = (Array.isArray(mfesRes) ? mfesRes : mfesRes?.data || []).map((m) => ({ ...m, _type: "MFE", _sortKey: (m.name || m.feature || "").toLowerCase() }));

        let combined = [...apiItems, ...mfeItems].sort((a, b) => a._sortKey.localeCompare(b._sortKey));
        
        // Limit to desired count
        combined = combined.slice(0, debouncedSearch ? MAX_SEARCH_RESULTS : DEFAULT_DISPLAY_COUNT);
        
        setDisplayedItems(combined);
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

  const handleEdit = (item) => {
    setEditingItem(item);
  };

  const handleSave = () => {
    setEditingItem(null);
    setRefreshTrigger(prev => prev + 1); // Triggers the useEffect to fetch fresh data
  };

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
          {isSearching && !loading && (
            <p style={styles.resultCount}>
              Showing top {displayedItems.length} matching results from server
            </p>
          )}
          {!isSearching && !loading && (
            <p style={styles.resultCount}>
              Showing default {displayedItems.length} components — use search to find specific items
            </p>
          )}
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
              {isSearching ? "No results match your search query." : "No registered services found."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {displayedItems.map((item, index) => (
              <RegistryCard key={item._id || `${item._type}-${index}`} item={item} onEdit={handleEdit} />
            ))}
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

export default RegistryListPage;