const { pool } = require("../config/db");
const base62 = require("../utils/base62");
const { redisClient } = require("../config/redis");

/**
 * Create a short URL (Collision-safe)
 */
const createShortUrl = async (longUrl) => {
  const insertQuery = `
    INSERT INTO urls (long_url)
    VALUES ($1)
    RETURNING id
  `;

  const result = await pool.query(insertQuery, [longUrl]);
  const id = result.rows[0].id;

  let shortCode;
  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    shortCode = base62.encode(id + attempts);

    try {
      const updateQuery = `
        UPDATE urls
        SET short_code = $1
        WHERE id = $2
      `;

      await pool.query(updateQuery, [shortCode, id]);

      return {
        shortUrl: `http://localhost:${process.env.PORT}/${shortCode}`,
        shortCode,
      };

    } catch (error) {
      if (error.code === "23505") {
        console.log("⚠️ Collision detected. Retrying...");
        attempts++;
      } else {
        throw error;
      }
    }
  }

  throw new Error("Failed to generate unique short code after retries");
};


const getLongUrl = async (shortCode, ip, userAgent) => {
  // 1. Try to get the URL from the Redis cache first
  let longUrl = await redisClient.get(shortCode);

  if (!longUrl) {
    console.log("🐢 Cache MISS — hitting DB");
    
    // 2. If it's not in Redis, find it in Postgres
    const result = await pool.query(
      `SELECT * FROM urls WHERE short_code = $1`,
      [shortCode]
    );

    if (result.rows.length === 0) {
      return null;
    }

    longUrl = result.rows[0].long_url;

    // 3. Save it to Redis for the next person (expires in 1 hour)
    await redisClient.set(shortCode, longUrl, { EX: 3600 });
  } else {
    console.log("⚡ Cache HIT");
  }

  // 4. Drop a quick note in a Redis List about the click.
  // We do NOT wait for Postgres here!
  const clickData = {
    shortCode,
    ip,
    userAgent,
    timestamp: new Date().toISOString()
  };
  
  // lPush adds this note to a queue named "click_logs"
  await redisClient.lPush("click_logs", JSON.stringify(clickData));

  // 5. Send the user to their destination instantly
  return longUrl;
};

/**
 * Get analytics / stats
 */
  const getUrlStats = async (shortCode) => {

    const result = await pool.query(
      `SELECT * FROM urls WHERE short_code = $1`,
      [shortCode]
    );
  
    if (result.rows.length === 0) return null;
  
    const url = result.rows[0];
  
    const uniqueVisitors = await pool.query(
      `SELECT COUNT(DISTINCT ip_address) FROM url_clicks WHERE url_id = $1`,
      [url.id]
    );
  
    const recentClicks = await pool.query(
      `SELECT ip_address, user_agent, clicked_at
       FROM url_clicks
       WHERE url_id = $1
       ORDER BY clicked_at DESC
       LIMIT 5`,
      [url.id]
    );
  
    return {
      shortCode,
      longUrl: url.long_url,
      totalClicks: url.click_count,
      uniqueVisitors: uniqueVisitors.rows[0].count,
      createdAt: url.created_at,
      recentClicks: recentClicks.rows
    };
  };
  
 module.exports = { createShortUrl, getLongUrl, getUrlStats };

