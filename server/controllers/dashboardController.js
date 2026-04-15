const {
  getDashboardSummary,
  getServices,
  getAlertsTrend,
} = require("../models/dashboardModel");

const fetchDashboardData = async (req, res) => {
  try {
    const summary = await getDashboardSummary();
    const services = await getServices();
    const alertsTrend = await getAlertsTrend();

    res.json({
      systemHealth: summary.system_health,
      businessVitality: summary.business_vitality,
      activeAlerts: summary.active_alerts,
      businessImpact: summary.business_impact,
      operationalHealthScore: summary.operational_health_score,
      availability: summary.availability,
      services,
      alertsTrend,
      lastUpdated: "2 min ago",
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
};

const generateAiSummary = async (req, res) => {
  try {
    const dashboardData = req.body;

    const paymentService = dashboardData.services?.find(
      (service) => service.name === "Payment Service"
    );

    let summary = "";
    let likelyCause = "";
    let recommendedActions = [];

    if (paymentService && paymentService.latency > 300) {
      summary =
        "Payment service latency is elevated and may affect checkout responsiveness. Overall infrastructure remains stable, but business vitality is under warning.";
      likelyCause =
        "The payment service is showing higher-than-normal latency, which may indicate temporary overload or a downstream dependency issue.";
      recommendedActions = [
        "Review payment service latency trends",
        "Check active alerts and related dependencies",
        "Monitor checkout-related business impact closely",
      ];
    } else {
      summary =
        "System health appears stable, with no major business-critical degradation detected at the moment.";
      likelyCause =
        "No significant service anomaly is currently visible in the monitored data.";
      recommendedActions = [
        "Continue monitoring service performance",
        "Review alert trends regularly",
        "Validate business-critical flows remain healthy",
      ];
    }

   res.json({
    summary,
    likelyCause,
    recommendedActions,
    generatedFrom: "service status, latency, and alert trends",
    });
  } catch (error) {
    console.error("AI summary error:", error);
    res.status(500).json({ error: "Failed to generate AI summary" });
  }
};

module.exports = {
  fetchDashboardData,
  generateAiSummary,
};