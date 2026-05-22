const { pool } = require("../config/db");
const { redisClient } = require("../config/redis");

const processClicks = async () => {
  try {
    // 1. Grab up to 50 pending clicks from Redis at a time
    const batchSize = 50;
    const clicksToProcess = [];

    for (let i = 0; i < batchSize; i++) {
      // rPop takes the oldest note out of the queue
      const clickStr = await redisClient.rPop("click_logs");
      if (!clickStr) break; // The queue is empty, stop grabbing
      clicksToProcess.push(JSON.parse(clickStr));
    }

    if (clicksToProcess.length === 0) return;

    console.log(`👷 Worker saving ${clicksToProcess.length} clicks to DB...`);

    // 2. Save them to Postgres one by one in the background
    for (const click of clicksToProcess) {
      const urlRes = await pool.query(
        `SELECT id FROM urls WHERE short_code = $1`, 
        [click.shortCode]
      );
      
      if (urlRes.rows.length > 0) {
        const urlId = urlRes.rows[0].id;
        
        // Update total clicks
        await pool.query(
          `UPDATE urls SET click_count = click_count + 1 WHERE id = $1`, 
          [urlId]
        );
        
        // Save the specific analytics row
        await pool.query(
          `INSERT INTO url_clicks (url_id, ip_address, user_agent, clicked_at) VALUES ($1, $2, $3, $4)`,
          [urlId, click.ip, click.userAgent, click.timestamp]
        );
      }
    }
  } catch (error) {
    console.error("❌ Worker error:", error);
  }
};

// This function tells the worker to wake up and check the queue every 5 seconds
const startAnalyticsWorker = () => {
  console.log("👷 Analytics Worker started in the background");
  setInterval(processClicks, 5000);
};

module.exports = { startAnalyticsWorker };
