const express = require("express");
const router = express.Router();
const { pool } = require("../config/db");  
const { redisClient } = require("../config/redis");

router.get("/", async (req, res) => {
  const health = {
    status: "OK",
    services: {
      postgres: "UNKNOWN",
      redis: "UNKNOWN",
    },
    timestamp: new Date().toISOString(),
  };

  try {
    await pool.query("SELECT 1");
    health.services.postgres = "UP";
  } catch (err) {
    health.services.postgres = "DOWN";
    health.status = "DEGRADED";
  }

  try {
    await redisClient.ping();
    health.services.redis = "UP";
  } catch (err) {
    health.services.redis = "DOWN";
    health.status = "DEGRADED";
  }

  const statusCode = health.status === "OK" ? 200 : 503;
  res.status(statusCode).json(health);
});

module.exports = router;
