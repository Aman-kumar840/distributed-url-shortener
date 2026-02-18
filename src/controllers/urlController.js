const urlService = require("../services/urlService");

const createShortUrl = async (req, res) => {
  try {
    const { longUrl } = req.body;

    if (!longUrl) {
      return res.status(400).json({ error: "Long URL is required" });
    }

    const result = await urlService.createShortUrl(longUrl);

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating short URL:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const redirectToLongUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const ip = req.ip;
    const userAgent = req.headers["user-agent"];

    const longUrl = await urlService.getLongUrl(shortCode, ip, userAgent);

    if (!longUrl) {
      return res.status(404).json({ error: "URL not found" });
    }

    return res.redirect(longUrl);

  } catch (error) {
    console.error("Redirect error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




const getUrlStats = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const stats = await urlService.getUrlStats(shortCode);

    if (!stats) {
      return res.status(404).json({ error: "URL not found" });
    }

    res.json(stats);

  } catch (error) {
    console.error("Stats error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

  
  module.exports = { createShortUrl, redirectToLongUrl, getUrlStats };

