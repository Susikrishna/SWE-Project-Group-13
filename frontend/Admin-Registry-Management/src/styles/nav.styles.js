// ── Floating Navigation Bar ───────────────────────────────────────────────────
export const nav = {
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
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.3) 100%)",
    backdropFilter: "blur(32px)",
    WebkitBackdropFilter: "blur(32px)",
    border: "1px solid rgba(255, 255, 255, 0.5)",
    borderRadius: "20px",
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
};
