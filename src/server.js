const app = require("./app");
const { connectDB } = require("./config/db");
//const connectRedis = require("./config/redis");
const { connectRedis } = require("./config/redis");

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  try {
    await connectRedis();
    await connectDB();

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
