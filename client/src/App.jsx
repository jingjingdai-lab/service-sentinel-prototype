import "./App.css";
import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

function App() {
  const [data, setData] = useState(null);
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiError, setAiError] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    fetch("http://localhost:5000/api/dashboard")
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const generateAiSummary = async () => {
    if (!data) return;

    setLoadingAi(true);
    setAiError("");
    setAiInsight(null);

    try {
      const response = await fetch("http://localhost:5000/api/ai-summary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Failed to generate AI summary");
      }

      const result = await response.json();
      setAiInsight(result);
    } catch (error) {
      console.error("AI summary error:", error);
      setAiError("Failed to generate AI summary.");
    } finally {
      setLoadingAi(false);
    }
  };

  if (!data) {
    return (
      <div className="app loading-screen">
        <p>Loading...</p>
      </div>
    );
  }

  const latencyData = data.services.map((service) => ({
    name: service.name,
    latency: service.latency,
  }));

  const scoreData = [
    { name: "Score", value: data.operationalHealthScore },
    { name: "Remaining", value: 100 - data.operationalHealthScore },
  ];

  const availabilityData = [
    { name: "Available", value: data.availability },
    { name: "Remaining", value: 100 - data.availability },
  ];

  const filteredServices =
    statusFilter === "All"
      ? data.services
      : data.services.filter((service) => service.status === statusFilter);

  const getStatusBadgeClass = (value) => {
    if (!value) return "badge";
    const lower = value.toLowerCase();

    if (lower === "healthy") return "badge badge-healthy";
    if (lower === "warning") return "badge badge-warning";
    if (lower === "critical") return "badge badge-critical";
    if (lower === "medium") return "badge badge-medium";
    if (lower === "low") return "badge badge-low";
    if (lower === "high") return "badge badge-high";

    return "badge";
  };

  return (
    <div className="app">
      <div className="page-header">
        <h1>Service Sentinel Dashboard</h1>
        <p className="last-updated">Last updated: {data.lastUpdated}</p>
      </div>

      <section className="top-cards">
        <div className="card">
          <h3>System Health</h3>
          <p className="status-healthy">{data.systemHealth}</p>
        </div>

        <div className="card">
          <h3>Business Vitality</h3>
          <p className="status-warning">{data.businessVitality}</p>
        </div>

        <div className="card">
          <h3>Active Alerts</h3>
          <p className="metric-number">{data.activeAlerts}</p>
        </div>

        <div className="card">
          <h3>Business Impact</h3>
          <p className="status-medium">{data.businessImpact}</p>
        </div>
      </section>

      <section className="middle-grid">
        <div className="panel big-panel">
          <h2>Operational Health Score</h2>

          <div className="chart-wrapper big-donut-wrapper">
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={scoreData}
                  dataKey="value"
                  innerRadius={42}
                  outerRadius={64}
                  startAngle={90}
                  endAngle={-270}
                  stroke="#dbeafe"
                  strokeWidth={1}
                >
                  <Cell fill="#60a5fa" />
                  <Cell fill="#22345f" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="center-label big-center-label">
              <span>{data.operationalHealthScore}%</span>
            </div>
          </div>

          <p className="summary-text">
            Payment service latency is elevated and may affect checkout flow.
            Overall system health remains stable, but business vitality is under
            warning due to service degradation.
          </p>
        </div>
      </section>

      <section className="ai-section">
        <div className="panel ai-panel">
          <div className="ai-header">
            <h2>AI Executive Summary</h2>
            <button onClick={generateAiSummary} disabled={loadingAi}>
              {loadingAi ? "Generating..." : "Generate AI Summary"}
            </button>
          </div>

          {!aiInsight && !loadingAi && !aiError && (
            <p className="ai-placeholder">
              Click the button to generate a business-oriented interpretation of
              the current system signals.
            </p>
          )}

          {aiError && <p className="error-text">{aiError}</p>}

          {aiInsight && (
            <div className="ai-content">
              <p>
                <strong>Summary:</strong> {aiInsight.summary}
              </p>

              <p>
                <strong>Likely Cause:</strong> {aiInsight.likelyCause}
              </p>

              <div>
                <strong>Recommended Actions:</strong>
                <ul>
                  {aiInsight.recommendedActions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>

              <p className="generated-from">
                AI-generated from {aiInsight.generatedFrom}
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bottom-grid">
        <div className="panel">
          <h2>Service Latency</h2>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={latencyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5d87" />
              <XAxis dataKey="name" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Bar dataKey="latency" fill="#60a5fa" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel">
          <h2>Alerts Trend</h2>
          <ResponsiveContainer width="100%" height={170}>
            <LineChart data={data.alertsTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4b5d87" />
              <XAxis dataKey="day" stroke="#cbd5e1" />
              <YAxis stroke="#cbd5e1" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="alerts"
                stroke="#38bdf8"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="panel availability-panel">
          <h2>Availability</h2>

          <div className="chart-wrapper small-donut-wrapper">
            <ResponsiveContainer width="100%" height={150}>
              <PieChart>
                <Pie
                  data={availabilityData}
                  dataKey="value"
                  innerRadius={32}
                  outerRadius={50}
                  startAngle={90}
                  endAngle={-270}
                  stroke="#dbeafe"
                  strokeWidth={1}
                >
                  <Cell fill="#22c55e" />
                  <Cell fill="#22345f" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>

            <div className="center-label small-center-label">
              <span>{data.availability}%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="table-grid">
        <div className="panel">
          <div className="table-header">
            <h2>Service Overview</h2>

            <div className="filter-box">
              <label htmlFor="statusFilter">Filter by status:</label>
              <select
                id="statusFilter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="All">All</option>
                <option value="Healthy">Healthy</option>
                <option value="Warning">Warning</option>
              </select>
            </div>
          </div>

          <table className="service-table">
            <thead>
              <tr>
                <th>Service</th>
                <th>Status</th>
                <th>Latency</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service, index) => (
                <tr key={index}>
                  <td>{service.name}</td>
                  <td>
                    <span className={getStatusBadgeClass(service.status)}>
                      {service.status}
                    </span>
                  </td>
                  <td>{service.latency} ms</td>
                  <td>
                    <span className={getStatusBadgeClass(service.impact)}>
                      {service.impact}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default App;