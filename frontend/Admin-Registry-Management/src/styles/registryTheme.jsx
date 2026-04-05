export const styles = {
  // Soft, subtle background blobs for depth
  wave: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    background:
      "radial-gradient(circle at center, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 60%)",
    animation: "waveMove 15s ease-in-out infinite",
    willChange: "transform",
    transform: "translateZ(0)",
    zIndex: 0,
  },
  wave2: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100vh",
    background:
      "radial-gradient(circle at center, rgba(226, 232, 240, 0.6) 0%, rgba(226, 232, 240, 0) 60%)",
    animation: "waveMove2 20s ease-in-out infinite",
    willChange: "transform",
    transform: "translateZ(0)",
    zIndex: 0,
  },

  // MAIN LAYOUT
  page: {
    width: "100%",
    minHeight: "100vh", // Allows the page to grow infinitely
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start", // 🟢 CRITICAL: Starts the card at the top, not the middle
    background: "#f8fafc",
    overflowX: "hidden", // Prevents horizontal scroll from waves
    position: "relative",
    fontFamily: "'DM Sans', system-ui, sans-serif",
    color: "#0f172a",
  },

  // THE GLASS CARD
  // THE GLASS CARD
  // THE GLASS CARD
  glassCard: {
    width: "75%",
    maxWidth: "1400px",
    minWidth: "600px",
    marginTop: "120px",
    marginBottom: "100px",
    padding: "56px", // Slightly more breathing room for a premium feel
    borderRadius: "32px", // Increased to an Apple-style "squircle"
    
    // 🌟 1. Directional Light Background
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.4) 100%)", 
    
    // 🌟 2. Heavier Frosting
    backdropFilter: "blur(16px)", // Reduced from 40px to improve framerate
    WebkitBackdropFilter: "blur(16px)",
    transform: "translateZ(0)", // Force hardware acceleration
    
    // Delicate physical border
    border: "1px solid rgba(255, 255, 255, 0.5)",
    
    // 🌟 3. Multi-Layered Shadows & Edge Highlights
    boxShadow: `
      0 30px 60px rgba(15, 23, 42, 0.08),  /* Huge, soft ambient shadow */
      0 4px 12px rgba(15, 23, 42, 0.03),   /* Sharp, close physical shadow */
      inset 0 1px 1px rgba(255, 255, 255, 0.9), /* Pure white rim light on top edge */
      inset 0 -1px 1px rgba(255, 255, 255, 0.3) /* Soft reflection on bottom edge */
    `,
    
    zIndex: 10,
    boxSizing: "border-box",
  },

  // TYPOGRAPHY
  heading: {
    fontSize: "32px", // Slightly larger since there's no box constraining it
    fontWeight: "700",
    textAlign: "center",
    marginBottom: "8px",
    letterSpacing: "-0.5px",
    color: "#0f172a",
  },
  subHeading: {
    textAlign: "center",
    color: "#64748b",
    marginBottom: "48px", // More breathing room
    fontSize: "15px",
  },
  label: {
    fontSize: "12px",
    fontWeight: "700",
    marginBottom: "8px",
    display: "block",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: "0.8px",
  },

  // FORMS & INPUTS (Made pure white with tiny shadows to pop off the grey page)
  input: {
    width: "100%",
    padding: "16px 18px",
    marginBottom: "24px",
    borderRadius: "14px", // Smoother corners
    
    // Slightly translucent white to blend with the card
    background: "rgba(255, 255, 255, 0.7)", 
    border: "1px solid rgba(203, 213, 225, 0.6)",
    
    color: "#0f172a",
    outline: "none",
    fontSize: "14px",
    fontFamily: "'DM Mono', monospace",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    
    // Soft inner shadow to make it look "carved" into the glass
    boxShadow: "inset 0 2px 6px rgba(15, 23, 42, 0.02), 0 1px 0 rgba(255, 255, 255, 0.8)",
  },
  dropdown: {
    width: "100%",
    padding: "16px 18px",
    marginBottom: "24px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    outline: "none",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(0,0,0,0.02)",
  },
  permissionRow: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
    alignItems: "center",
    background: "rgba(255, 255, 255, 0.6)", // Glassy white row
    backdropFilter: "blur(10px)",
    padding: "16px",
    borderRadius: "14px",
    border: "1px solid #cbd5e1",
    flexWrap: "wrap",
  },
  resourceInput: {
    flex: 2,
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontFamily: "'DM Mono', monospace",
    minWidth: "120px",
    outline: "none",
    fontSize: "13px",
  },
  actionDropdown: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: "10px",
    border: "1px solid #cbd5e1",
    background: "#ffffff",
    color: "#0f172a",
    fontFamily: "'DM Mono', monospace",
    minWidth: "90px",
    outline: "none",
    fontSize: "13px",
  },
  removeBtn: {
    width: "36px",
    height: "36px",
    borderRadius: "10px",
    border: "1px solid #fecaca",
    background: "#fef2f2",
    color: "#ef4444",
    fontSize: "18px",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  addPermission: {
    background: "transparent",
    border: "1px dashed #94a3b8",
    padding: "14px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    marginTop: "8px",
    marginBottom: "24px",
    color: "#475569",
    width: "100%",
    fontFamily: "'DM Sans', sans-serif",
    transition: "all 0.2s",
  },
  button: {
    width: "100%",
    padding: "18px",
    borderRadius: "12px",
    border: "none",
    background: "#0f172a",
    color: "white",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    marginTop: "16px",
    boxShadow: "0 4px 12px rgba(15, 23, 42, 0.2)",
    fontFamily: "'DM Sans', sans-serif",
  },

  // MODALS & OVERLAYS
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backdropFilter: "blur(8px)",
    WebkitBackdropFilter: "blur(8px)",
    background: "rgba(255,255,255,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "22px",
    fontWeight: "600",
    zIndex: 1000,
    color: "#0f172a",
  },
  modalCard: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%,-50%)",
    width: "400px",
    padding: "40px",
    borderRadius: "24px",
    background: "#ffffff",
    border: "1px solid rgba(226, 232, 240, 0.8)",
    boxShadow: "0 20px 60px rgba(0,0,0,0.08)",
    textAlign: "center",
    zIndex: 1000,
    color: "#0f172a",
  },

  // THE FLOATING GLASS BAR
  rolesTopBar: {
    position: "fixed",
    top: "24px",
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    
    // Matching Directional Light
    background: "linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.3) 100%)",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "20px",
    
    // Matching Edge Highlights
    boxShadow: `
      0 12px 32px rgba(15, 23, 42, 0.06), 
      inset 0 1px 1px rgba(255, 255, 255, 0.9)
    `,
  },

  barNav: {
    display: "flex",
    gap: "4px",
    background: "rgba(15, 23, 42, 0.04)",
    padding: "6px",
    borderRadius: "14px",
  },
  barLink: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#64748b",
    textDecoration: "none",
    padding: "8px 20px",
    borderRadius: "10px",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    cursor: "pointer",
    border: "none",
    background: "transparent",
    fontFamily: "'DM Sans', sans-serif",
  },
  barLinkActive: {
    background: "#ffffff",
    color: "#0f172a",
    boxShadow: "0 2px 10px rgba(0, 0, 0, 0.06)",
  },

  // SEARCH BAR
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
    padding: "16px 48px 16px 48px",
    borderRadius: "16px",
    background: "rgba(255, 255, 255, 0.7)",
    border: "1px solid rgba(203, 213, 225, 0.6)",
    color: "#0f172a",
    outline: "none",
    fontSize: "14px",
    fontFamily: "'DM Sans', sans-serif",
    boxSizing: "border-box",
    transition: "all 0.3s ease",
    boxShadow:
      "inset 0 2px 6px rgba(15, 23, 42, 0.02), 0 1px 0 rgba(255, 255, 255, 0.8)",
  },
  searchClear: {
    position: "absolute",
    right: "14px",
    background: "rgba(15, 23, 42, 0.06)",
    border: "none",
    borderRadius: "8px",
    width: "28px",
    height: "28px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 700,
    transition: "all 0.2s",
  },
  resultCount: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "10px",
    marginLeft: "4px",
    fontWeight: 500,
  },

  // REGISTRY CARDS
  registryCard: {
    padding: "22px 26px",
    borderRadius: "18px",
    background: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(12px)",
    border: "1px solid rgba(226, 232, 240, 0.7)",
    boxShadow: `
      0 4px 16px rgba(15, 23, 42, 0.04),
      inset 0 1px 0 rgba(255, 255, 255, 0.8)
    `,
    transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  registryDetail: {
    display: "flex",
    alignItems: "baseline",
    gap: "10px",
    padding: "4px 0",
  },
  registryDetailLabel: {
    fontSize: "11px",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.6px",
    minWidth: "90px",
    flexShrink: 0,
  },
  registryCode: {
    fontSize: "13px",
    fontFamily: "'DM Mono', monospace",
    color: "#334155",
    background: "rgba(15, 23, 42, 0.04)",
    padding: "2px 8px",
    borderRadius: "6px",
    wordBreak: "break-all",
  },

  // STATE BOXES
  stateBox: {
    textAlign: "center",
    padding: "48px",
    background: "rgba(255,255,255,0.5)",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  spinner: {
    width: "32px",
    height: "32px",
    border: "3px solid #e2e8f0",
    borderTopColor: "#0f172a",
    borderRadius: "50%",
    animation: "spin 0.8s linear infinite",
  },
};
