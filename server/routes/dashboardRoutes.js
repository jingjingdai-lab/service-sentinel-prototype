const express = require("express");
const router = express.Router();

const {
  fetchDashboardData,
  generateAiSummary,
} = require("../controllers/dashboardController");

router.get("/dashboard", fetchDashboardData);
router.post("/ai-summary", generateAiSummary);

module.exports = router;