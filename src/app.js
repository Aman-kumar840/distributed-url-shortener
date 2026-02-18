const express = require("express");
const urlRoutes = require("./routes/urlRoutes");
const { redirectToLongUrl } = require("./controllers/urlController");

const healthRoutes = require("./routes/healthRoutes");

const app = express();

app.use(express.json());



// Request logger
app.use((req, res, next) => {
  console.log("Incoming request:", req.method, req.url);
  next();
});
app.use("/health", healthRoutes);
// Health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// API routes
app.use("/api/url", urlRoutes);

// 🔥 TEST ENDPOINT (must be BEFORE redirect route)
app.get("/test/:shortCode", async (req, res) => {
  try {
    const urlService = require("./services/urlService");
    const longUrl = await urlService.getLongUrl(req.params.shortCode);

    if (!longUrl) {
      return res.status(404).json({ error: "Not found" });
    }

    return res.status(200).json({ longUrl });

  } catch (error) {
    console.error("Test endpoint error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// 🔥 Redirect route MUST be last
app.get("/:shortCode", redirectToLongUrl);

module.exports = app;
