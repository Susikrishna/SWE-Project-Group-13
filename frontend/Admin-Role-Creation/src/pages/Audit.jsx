import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";

const API_BASE = import.meta.env.VITE_AUZ_ENGINE_URL || "http://localhost:3000";

// ─── colour constants (hardcoded for Chart.js canvas) ───────────────────────
const C = {
  indigo:      "#4338ca",
  indigoLight: "#818cf8",
  indigoFaint: "rgba(67,56,202,0.10)",
  teal:        "#0d9488",
  tealLight:   "#5eead4",
  rose:        "#e11d48",
  roseLight:   "#fda4af",
  amber:       "#d97706",
  amberLight:  "#fcd34d",
  slate:       "#64748b",
  slateLight:  "#cbd5e1",
  green:       "#16a34a",
  purple:      "#7c3aed",
  sky:         "#0284c7",
  grid:        "rgba(255,255,255,0.12)",
  text:        "#ffffff",
  textMuted:   "#cbd5e1",
};

const DECISION_COLORS = { ALLOW: C.teal, DENY: C.rose, BULK: C.amber };

// ─── tiny helpers ────────────────────────────────────────────────────────────
function fmt(n, dec = 0) {
  if (n == null) return "—";
  return Number(n).toLocaleString(undefined, {
    minimumFractionDigits: dec,
    maximumFractionDigits: dec,
  });
}
function ms(n) { return n == null ? "—" : `${fmt(n, 1)} ms`; }
function pad2(n) { return String(n).padStart(2, "0"); }
function isoDate(d) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

// ─── Chart.js lazy loader ────────────────────────────────────────────────────
let chartJsReady = false;
let chartJsQueue = [];
function withChart(cb) {
  if (chartJsReady) { cb(); return; }
  chartJsQueue.push(cb);
  if (chartJsQueue.length > 1) return;
  const s = document.createElement("script");
  s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
  s.onload = () => {
    chartJsReady = true;
    chartJsQueue.forEach(fn => fn());
    chartJsQueue = [];
  };
  document.head.appendChild(s);
}

// ─── Reusable chart wrapper ──────────────────────────────────────────────────
function ChartCanvas({ id, height = 260, builder, deps }) {
  const ref = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    withChart(() => {
      if (!ref.current) return;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = builder(ref.current);
    });
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return (
    <div style={{ position: "relative", width: "100%", height }}>
      <canvas id={id} ref={ref} role="img" aria-label="Chart" />
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div className="audit-stat" style={{
      border: `1px solid #e2e8f0`,
      borderRadius: 12,
      padding: "20px 22px",
      borderTop: `3px solid ${accent || C.indigo}`,
      display: "flex",
      flexDirection: "column",
      gap: 4,
    }}>
      <span style={{ fontSize: 11, fontWeight: 700, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.8px" }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 800, color: C.text, lineHeight: 1.1, fontFamily: "'DM Mono', monospace" }}>{value}</span>
      {sub && <span style={{ fontSize: 12, color: C.textMuted, marginTop: 2 }}>{sub}</span>}
    </div>
  );
}

// ─── Section card ────────────────────────────────────────────────────────────
function Card({ title, badge, children, style }) {
  return (
    <div className="audit-card" style={{
      border: "1px solid #e2e8f0",
      borderRadius: 14,
      padding: "24px 26px",
      ...style,
    }}>
      {title && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: "-0.2px" }}>{title}</span>
          {badge && (
            <span style={{ fontSize: 11, fontWeight: 700, background: "#f1f5f9", color: C.textMuted, borderRadius: 6, padding: "2px 8px" }}>
              {badge}
            </span>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

// ─── Decision pill ───────────────────────────────────────────────────────────
function DecisionPill({ d }) {
  const map = {
    ALLOW: { bg: "#dcfce7", color: "#15803d" },
    DENY:  { bg: "#ffe4e6", color: "#be123c" },
    BULK:  { bg: "#fef9c3", color: "#a16207" },
  };
  const s = map[d] || { bg: "#f1f5f9", color: C.textMuted };
  return (
    <span style={{ fontSize: 11, fontWeight: 700, borderRadius: 5, padding: "2px 8px", background: s.bg, color: s.color, fontFamily: "'DM Mono', monospace" }}>
      {d}
    </span>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
const AuditDashboard = () => {
  const today   = new Date();
  const weekAgo = new Date(today); weekAgo.setDate(today.getDate() - 7);

  const [analytics, setAnalytics] = useState(null);
  const [logs,      setLogs]      = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [error,     setError]     = useState(null);
  const [from,      setFrom]      = useState(isoDate(weekAgo));
  const [to,        setTo]        = useState(isoDate(today));
  const [tab,       setTab]       = useState("overview");   // overview | logs
  const [logSearch, setLogSearch] = useState("");
  const [decFilter, setDecFilter] = useState("ALL");
  const [page,      setPage]      = useState(1);
  const PER_PAGE = 15;

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { from: from ? `${from}T00:00:00.000Z` : undefined, to: to ? `${to}T23:59:59.999Z` : undefined };
      const [aRes, lRes] = await Promise.all([
        axios.get(`${API_BASE}/log/analytics`, { params }),
        axios.get(`${API_BASE}/log`, { params }),
      ]);
      if (!aRes.data.success) throw new Error(aRes.data.message);
      if (!lRes.data.success) throw new Error(lRes.data.message);
      setAnalytics(aRes.data.data);
      setLogs(lRes.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── derived stats ──────────────────────────────────────────────────────────
  const totalRequests = logs.length;
  const allowCount = logs.filter(l => l.decision === "ALLOW").length;
  const denyCount  = logs.filter(l => l.decision === "DENY").length;
  const avgRt = analytics?.avgResponseByAction?.length
    ? (analytics.avgResponseByAction.reduce((s, r) => s + r.avgResponseTime, 0) / analytics.avgResponseByAction.length)
    : null;

  // ── filtered logs ──────────────────────────────────────────────────────────
  const filteredLogs = logs.filter(l => {
    const matchDec  = decFilter === "ALL" || l.decision === decFilter;
    const matchSearch = logSearch.trim() === "" ? true :
      [l.userId, l.roleId, l.action, l.permission].some(f =>
        (f || "").toLowerCase().includes(logSearch.toLowerCase())
      );
    return matchDec && matchSearch;
  });
  const totalPages  = Math.max(1, Math.ceil(filteredLogs.length / PER_PAGE));
  const pagedLogs   = filteredLogs.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  // ── Chart builders ─────────────────────────────────────────────────────────
  const buildApiFreq = (canvas) => {
    const data = analytics?.apiFrequency || [];
    return new window.Chart(canvas, {
      type: "bar",
      data: {
        labels: data.map(d => d._id || "(unknown)"),
        datasets: [{
          label: "Calls",
          data: data.map(d => d.count),
          backgroundColor: data.map((_, i) =>
            [C.indigo, C.teal, C.rose, C.amber, C.purple, C.sky, C.green, C.indigoLight, C.tealLight, C.roseLight][i % 10]
          ),
          borderRadius: 6,
          borderSkipped: false,
        }],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: ctx => ` ${fmt(ctx.parsed.x)} calls`,
        }}},
        scales: {
          x: { grid: { color: C.grid }, ticks: { color: C.textMuted, font: { size: 11 } } },
          y: { grid: { display: false }, ticks: { color: C.text, font: { size: 11, weight: "600" } } },
        },
      },
    });
  };

  const buildDecision = (canvas) => {
    const data = analytics?.decisionBreakdown || [];
    const map  = {};
    data.forEach(d => { map[d._id] = d.count; });
    const labels = ["ALLOW", "DENY", "BULK"].filter(k => map[k]);
    return new window.Chart(canvas, {
      type: "doughnut",
      data: {
        labels,
        datasets: [{
          data: labels.map(k => map[k] || 0),
          backgroundColor: labels.map(k => DECISION_COLORS[k]),
          borderWidth: 2,
          borderColor: "#fff",
          hoverOffset: 6,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "68%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: {
            label: ctx => ` ${ctx.label}: ${fmt(ctx.parsed)} (${fmt(ctx.parsed / (ctx.dataset.data.reduce((a,b)=>a+b,0) || 1) * 100, 1)}%)`,
          }},
        },
      },
    });
  };

  const buildTraffic = (canvas) => {
    const data = analytics?.trafficOverTime || [];
    const labels = data.map(d => {
      const { year, month, day, hour } = d._id;
      return `${pad2(month)}/${pad2(day)} ${pad2(hour)}:00`;
    });
    return new window.Chart(canvas, {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: "Requests",
          data: data.map(d => d.count),
          borderColor: C.indigo,
          backgroundColor: C.indigoFaint,
          borderWidth: 2,
          pointRadius: data.length > 48 ? 0 : 3,
          pointHoverRadius: 5,
          tension: 0.35,
          fill: true,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { callbacks: {
          label: ctx => ` ${fmt(ctx.parsed.y)} requests`,
        }}},
        scales: {
          x: { grid: { color: C.grid }, ticks: { color: C.textMuted, font: { size: 10 }, maxTicksLimit: 12, maxRotation: 30 } },
          y: { grid: { color: C.grid }, ticks: { color: C.textMuted, font: { size: 11 } }, beginAtZero: true },
        },
      },
    });
  };

  const buildResponseTime = (canvas) => {
    const data = analytics?.avgResponseByAction || [];
    return new window.Chart(canvas, {
      type: "bar",
      data: {
        labels: data.map(d => d._id || "(unknown)"),
        datasets: [
          {
            label: "Avg (ms)",
            data: data.map(d => Math.round(d.avgResponseTime)),
            backgroundColor: C.teal,
            borderRadius: 5,
            borderSkipped: false,
          },
          {
            label: "Max (ms)",
            data: data.map(d => Math.round(d.maxResponseTime)),
            backgroundColor: C.amber,
            borderRadius: 5,
            borderSkipped: false,
          },
        ],
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${fmt(ctx.parsed.x)} ms` } },
        },
        scales: {
          x: { grid: { color: C.grid }, ticks: { color: C.textMuted, font: { size: 11 }, callback: v => `${v} ms` } },
          y: { grid: { display: false }, ticks: { color: C.text, font: { size: 11, weight: "600" } } },
        },
      },
    });
  };

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", minHeight: "100vh", padding: "28px 32px" }}>
      <style>{css}</style>

      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 28 }}>
        <div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>
            Audit Dashboard
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: 13, color: C.textMuted }}>
            API activity, traffic patterns &amp; access decisions
          </p>
        </div>

        {/* Date range + refresh */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <div className="date-wrap">
            <label className="date-label">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="date-input" />
          </div>
          <div className="date-wrap">
            <label className="date-label">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="date-input" />
          </div>
          <button onClick={fetchAll} className="refresh-btn" disabled={loading}>
            {loading ? "Loading…" : "↻ Refresh"}
          </button>
        </div>
      </div>

      {/* ── Error banner ── */}
      {error && (
        <div style={{ background: "#ffe4e6", border: "1px solid #fecdd3", borderRadius: 10, padding: "12px 16px", color: "#be123c", fontSize: 13, marginBottom: 24, fontWeight: 500 }}>
          ⚠ {error}
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, borderBottom: "1px solid #e2e8f0", paddingBottom: 0 }}>
        {[["overview", "Overview"], ["logs", "Raw Logs"]].map(([id, label]) => (
          <button key={id} onClick={() => setTab(id)} className={`tab-btn ${tab === id ? "tab-active" : ""}`}>
            {label}
          </button>
        ))}
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "60px 0", color: C.textMuted, fontSize: 14 }}>
          <div className="spinner" />
          <p style={{ marginTop: 16 }}>Fetching analytics…</p>
        </div>
      )}

      {/* ══════════ OVERVIEW TAB ══════════ */}
      {!loading && tab === "overview" && (
        <>
          {/* ── Stat row ── */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 14, marginBottom: 24 }}>
            <StatCard label="Total Requests" value={fmt(totalRequests)} accent={C.indigo} />
            <StatCard label="Allowed"  value={fmt(allowCount)} sub={`${totalRequests ? fmt(allowCount / totalRequests * 100, 1) : 0}% of total`} accent={C.teal} />
            <StatCard label="Denied"   value={fmt(denyCount)}  sub={`${totalRequests ? fmt(denyCount  / totalRequests * 100, 1) : 0}% of total`} accent={C.rose} />
            <StatCard label="Avg Response" value={ms(avgRt)} sub="across all endpoints" accent={C.amber} />
            <StatCard label="Unique Roles" value={fmt(analytics?.roleActivity?.length)} accent={C.purple} />
            <StatCard label="Unique Users" value={fmt(analytics?.topUsers?.length)} accent={C.sky} />
          </div>

          {/* ── Row 1: Traffic + Decision ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16, marginBottom: 16 }}>
            <Card title="Traffic Over Time" badge="requests / hour">
              <ChartCanvas
                id="trafficChart"
                height={240}
                builder={buildTraffic}
                deps={[analytics?.trafficOverTime]}
              />
            </Card>

            <Card title="Decision Breakdown">
              <ChartCanvas
                id="decisionChart"
                height={180}
                builder={buildDecision}
                deps={[analytics?.decisionBreakdown]}
              />
              {/* custom legend */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}>
                {(analytics?.decisionBreakdown || []).map(d => (
                  <div key={d._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: DECISION_COLORS[d._id] || C.slate }} />
                      <span style={{ color: C.text, fontWeight: 600 }}>{d._id}</span>
                    </span>
                    <span style={{ color: C.textMuted, fontFamily: "'DM Mono', monospace" }}>
                      {fmt(d.count)} ({totalRequests ? fmt(d.count / totalRequests * 100, 1) : 0}%)
                    </span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* ── Row 2: API Frequency + Response Time ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <Card title="API Call Frequency" badge="top 10 endpoints">
              <ChartCanvas
                id="apiFreqChart"
                height={Math.max(220, (analytics?.apiFrequency?.length || 5) * 36 + 40)}
                builder={buildApiFreq}
                deps={[analytics?.apiFrequency]}
              />
            </Card>

            <Card title="Response Time by Endpoint" badge="avg vs max (ms)">
              <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textMuted }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: C.teal }} /> Avg
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: C.textMuted }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: C.amber }} /> Max
                </span>
              </div>
              <ChartCanvas
                id="rtChart"
                height={Math.max(220, (analytics?.avgResponseByAction?.length || 5) * 36 + 40)}
                builder={buildResponseTime}
                deps={[analytics?.avgResponseByAction]}
              />
            </Card>
          </div>

          {/* ── Row 3: Role activity + Top users ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <Card title="Role Activity" badge="top 10">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr>
                    {["Role", "Total", "Allow", "Deny"].map(h => (
                      <th key={h} style={{ textAlign: h === "Role" ? "left" : "right", padding: "6px 8px", color: C.textMuted, fontWeight: 700, borderBottom: "1px solid #e2e8f0", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.6px" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(analytics?.roleActivity || []).map((r, i) => (
                    <tr key={r._id} style={{ background: i % 2 ? "#f8fafc" : "#fff" }}>
                      <td style={{ padding: "7px 8px", fontFamily: "'DM Mono', monospace", color: C.text, fontWeight: 600, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r._id}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: C.textMuted, fontFamily: "'DM Mono', monospace" }}>{fmt(r.total)}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: "#15803d", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmt(r.allowed)}</td>
                      <td style={{ padding: "7px 8px", textAlign: "right", color: "#be123c", fontFamily: "'DM Mono', monospace", fontWeight: 600 }}>{fmt(r.denied)}</td>
                    </tr>
                  ))}
                  {!analytics?.roleActivity?.length && (
                    <tr><td colSpan={4} style={{ padding: 20, textAlign: "center", color: C.textMuted }}>No data</td></tr>
                  )}
                </tbody>
              </table>
            </Card>

            <Card title="Top Users by Request Volume" badge="top 10">
              {(analytics?.topUsers || []).map((u, i) => {
                const maxCount = analytics.topUsers[0]?.count || 1;
                const pct = (u.count / maxCount) * 100;
                return (
                  <div key={u._id} style={{ marginBottom: 10 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 12, fontFamily: "'DM Mono', monospace", color: C.text, fontWeight: 600, maxWidth: 220, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        #{i + 1} {u._id}
                      </span>
                      <span style={{ fontSize: 12, color: C.textMuted, fontFamily: "'DM Mono', monospace" }}>{fmt(u.count)}</span>
                    </div>
                    <div style={{ height: 5, background: "#e2e8f0", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ width: `${pct}%`, height: "100%", background: C.indigo, borderRadius: 3, transition: "width 0.5s ease" }} />
                    </div>
                  </div>
                );
              })}
              {!analytics?.topUsers?.length && (
                <p style={{ textAlign: "center", color: C.textMuted, fontSize: 13 }}>No data</p>
              )}
            </Card>
          </div>
        </>
      )}

      {/* ══════════ LOGS TAB ══════════ */}
      {!loading && tab === "logs" && (
        <Card title="Raw Access Logs" badge={`${filteredLogs.length} entries`}>
          {/* Filters */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "flex-end" }}>
            <div style={{ flex: "1 1 220px" }}>
              <label className="fl-label">Search (user / role / action / permission)</label>
              <input
                type="text"
                value={logSearch}
                onChange={e => { setLogSearch(e.target.value); setPage(1); }}
                placeholder="Type to filter…"
                className="fl-input"
              />
            </div>
            <div>
              <label className="fl-label">Decision</label>
              <select value={decFilter} onChange={e => { setDecFilter(e.target.value); setPage(1); }} className="fl-input" style={{ minWidth: 130 }}>
                <option value="ALL">All</option>
                <option value="ALLOW">ALLOW</option>
                <option value="DENY">DENY</option>
                <option value="BULK">BULK</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e2e8f0" }}>
                  {["Timestamp", "User", "Role", "Action", "Permission", "Decision", "Status", "Resp. Time", "Reason"].map(h => (
                    <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 700, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.6px", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pagedLogs.map((log, i) => (
                  <tr key={log._id || i} className="audit-row" style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "8px 10px", whiteSpace: "nowrap", color: C.textMuted, fontFamily: "'DM Mono', monospace", fontSize: 11 }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td style={{ padding: "8px 10px", fontFamily: "'DM Mono', monospace", color: C.text, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.userId}</td>
                    <td style={{ padding: "8px 10px", fontFamily: "'DM Mono', monospace", color: C.text, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.roleId || "—"}</td>
                    <td style={{ padding: "8px 10px", color: C.indigo, fontWeight: 600, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.action || "—"}</td>
                    <td style={{ padding: "8px 10px", fontFamily: "'DM Mono', monospace", color: C.textMuted, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.permission || "—"}</td>
                    <td style={{ padding: "8px 10px" }}><DecisionPill d={log.decision} /></td>
                    <td style={{ padding: "8px 10px", fontFamily: "'DM Mono', monospace", color: log.statusCode >= 400 ? "#be123c" : C.text, fontWeight: 600 }}>{log.statusCode}</td>
                    <td style={{ padding: "8px 10px", fontFamily: "'DM Mono', monospace", color: C.textMuted, whiteSpace: "nowrap" }}>
                      {log.responseTime != null ? `${log.responseTime} ms` : "—"}
                    </td>
                    <td style={{ padding: "8px 10px", color: "#be123c", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{log.reason || ""}</td>
                  </tr>
                ))}
                {pagedLogs.length === 0 && (
                  <tr><td colSpan={9} style={{ padding: "32px 0", textAlign: "center", color: C.textMuted }}>No logs match your filters.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 18 }}>
              <span style={{ fontSize: 12, color: C.textMuted }}>
                Showing {((page - 1) * PER_PAGE) + 1}–{Math.min(page * PER_PAGE, filteredLogs.length)} of {fmt(filteredLogs.length)}
              </span>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="page-btn">← Prev</button>
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  const p = totalPages <= 7 ? i + 1 : (page <= 4 ? i + 1 : page - 3 + i);
                  if (p < 1 || p > totalPages) return null;
                  return (
                    <button key={p} onClick={() => setPage(p)} className={`page-btn ${p === page ? "page-active" : ""}`}>{p}</button>
                  );
                })}
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="page-btn">Next →</button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AuditDashboard;

// ─── Styles ───────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');

.date-wrap { display: flex; flex-direction: column; gap: 4px; }
.date-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.7px; }
.date-input {
  padding: 7px 11px; border-radius: 8px; border: 1px solid #d1d5db;
  background: #f9fafb; color: #1e293b; font-family: 'DM Mono', monospace;
  font-size: 13px; outline: none; cursor: pointer; transition: border-color 0.2s;
}
.date-input:focus { border-color: #4338ca; box-shadow: 0 0 0 3px rgba(67,56,202,0.1); background: #fff; }

.refresh-btn {
  padding: 8px 18px; background: #4338ca; color: #fff; border: none; border-radius: 8px;
  font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer;
  transition: opacity 0.2s; align-self: flex-end;
}
.refresh-btn:hover { opacity: 0.88; }
.refresh-btn:disabled { opacity: 0.45; cursor: not-allowed; }

.tab-btn {
  padding: 8px 18px; border: none; background: none; font-family: 'DM Sans', sans-serif;
  font-size: 13.5px; font-weight: 500; color: #64748b; cursor: pointer; border-radius: 8px 8px 0 0;
  border-bottom: 2px solid transparent; transition: color 0.15s; margin-bottom: -1px;
}
.tab-btn:hover { color: #1e293b; background: #f1f5f9; }
.tab-active { color: #4338ca !important; border-bottom-color: #4338ca !important; font-weight: 700 !important; background: none !important; }

.fl-label { display: block; font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.7px; margin-bottom: 5px; }
.fl-input {
  width: 100%; padding: 8px 12px; border-radius: 8px; border: 1px solid #d1d5db;
  background: #f9fafb; color: #1e293b; font-family: 'DM Sans', sans-serif; font-size: 13px;
  outline: none; box-sizing: border-box; transition: border-color 0.2s;
}
.fl-input:focus { border-color: #4338ca; box-shadow: 0 0 0 3px rgba(67,56,202,0.1); background: #fff; }

.page-btn {
  padding: 5px 11px; border: 1px solid #e2e8f0; border-radius: 6px;
  background: #fff; color: #64748b; font-size: 12px; cursor: pointer;
  font-family: 'DM Sans', sans-serif; transition: all 0.15s;
}
.page-btn:hover:not(:disabled) { background: #f1f5f9; color: #1e293b; }
.page-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.page-active { background: #4338ca !important; color: #fff !important; border-color: #4338ca !important; font-weight: 700; }

.spinner {
  width: 28px; height: 28px; border: 3px solid #e2e8f0; border-top-color: #4338ca;
  border-radius: 50%; animation: spin 0.75s linear infinite; margin: 0 auto;
}
@keyframes spin { to { transform: rotate(360deg); } }
`;