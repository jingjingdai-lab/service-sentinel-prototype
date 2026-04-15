const pool = require("../db/pool");

const getDashboardSummary = async () => {
  const result = await pool.query(`
    SELECT
      system_health,
      business_vitality,
      active_alerts,
      business_impact,
      operational_health_score,
      availability
    FROM dashboard_summary
    ORDER BY id DESC
    LIMIT 1
  `);

  return result.rows[0];
};

const getServices = async () => {
  const result = await pool.query(`
    SELECT name, status, latency, impact
    FROM services
    ORDER BY id
  `);

  return result.rows;
};

const getAlertsTrend = async () => {
  const result = await pool.query(`
    SELECT day, alerts
    FROM alerts_trend
    ORDER BY id
  `);

  return result.rows;
};

module.exports = {
  getDashboardSummary,
  getServices,
  getAlertsTrend,
};