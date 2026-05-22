const app = require("./app");
const { connectDB } = require("./config/db");
const { connectRedis } = require("./config/redis");
const { startAnalyticsWorker } = require("./workers/analyticsWorker"); // <-- ADDED THIS

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectRedis();
    await connectDB();
    
    startAnalyticsWorker(); // <-- ADDED THIS: Wake up the worker!

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();