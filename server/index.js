const express = require("express");
const cors = require("cors");
const dashboardRoutes = require("./routes/dashboardRoutes");
const pool = require("./db/pool");

const app = express();

app.use(cors());
app.use(express.json());

pool.connect()
  .then(() => {
    console.log("Connected to PostgreSQL");
  })
  .catch((err) => {
    console.error("PostgreSQL connection error:", err);
  });

app.use("/api", dashboardRoutes);

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});