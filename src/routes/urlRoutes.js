const express = require("express");
const router = express.Router();

const {
  createShortUrl,
  redirectToLongUrl,
  getUrlStats
} = require("../controllers/urlController");

// Create short URL
router.post("/shorten", createShortUrl);

// Stats endpoint
router.get("/:shortCode/stats", getUrlStats);

module.exports = router;
