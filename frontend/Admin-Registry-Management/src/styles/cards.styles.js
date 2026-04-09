// ── Search Bar ────────────────────────────────────────────────────────────────
export const search = {
  searchWrapper: {
    position: "relative",
    display: "flex",
    alignItems: "center",
  },

  searchIcon: {
    position: "absolute",
    left: "18px",
    color: "#94a3b8",
    pointerEvents: "none",
    zIndex: 1,
  },

  searchInput: {
    width: "100%",
    padding: "14px 44px 14px 46px",
    borderRadius: "14px",
    background: "rgba(255, 255, 255, 0.8)",
    border: "1px solid rgba(203, 213, 225, 0.7)",
    color: "#0f172a",
    outline: "none",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease",
    boxShadow:
      "inset 0 2px 6px rgba(15, 23, 42, 0.02), 0 1px 3px rgba(15,23,42,0.04)",
  },

  searchClear: {
    position: "absolute",
    right: "12px",
    background: "rgba(15, 23, 42, 0.06)",
    border: "none",
    borderRadius: "7px",
    width: "26px",
    height: "26px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: 700,
    transition: "all 0.15s",
    flexShrink: 0,
  },

  resultCount: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "8px",
    marginLeft: "2px",
    fontWeight: 500,
    letterSpacing: "0.1px",
  },
};

// ── Registry Cards ────────────────────────────────────────────────────────────
export const cards = {
  registryCard: {
    padding: "20px 22px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.7)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(226, 232, 240, 0.7)",
    boxShadow:
      "0 2px 12px rgba(15, 23, 42, 0.04), inset 0 1px 0 rgba(255, 255, 255, 0.9)",
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },

  registryDetail: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    padding: "3px 0",
  },

  registryDetailLabel: {
    fontSize: "10.5px",
    fontWeight: 700,
    color: "#cbd5e1",
    textTransform: "uppercase",
    letterSpacing: "0.7px",
    minWidth: "84px",
    flexShrink: 0,
  },

  registryCode: {
    fontSize: "12.5px",
    fontFamily: "'DM Mono', monospace",
    color: "#475569",
    background: "rgba(15, 23, 42, 0.04)",
    padding: "1px 7px",
    borderRadius: "5px",
    wordBreak: "break-all",
  },

  // State boxes (loading / error / empty)
  stateBox: {
    textAlign: "center",
    padding: "56px 48px",
    background: "rgba(248,250,252,0.6)",
    borderRadius: "16px",
    border: "1px solid rgba(226,232,240,0.7)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },

  spinner: {
    width: "28px",
    height: "28px",
    border: "2.5px solid #e2e8f0",
    borderTopColor: "#818cf8",
    borderRadius: "50%",
    animation: "spin 0.75s linear infinite",
  },
};
