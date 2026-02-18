const pool = require("../config/db");
const base62 = require("../utils/base62");
const redisClient = require("../config/redis");

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

  const cachedUrl = await redisClient.get(shortCode);

  if (cachedUrl) {
    console.log("⚡ Cache HIT");
  } else {
    console.log("🐢 Cache MISS — hitting DB");
  }

  // Get full row
  const result = await pool.query(
    `SELECT * FROM urls WHERE short_code = $1`,
    [shortCode]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const url = result.rows[0];

  // 🔥 Increment click_count atomically
  await pool.query(
    `UPDATE urls SET click_count = click_count + 1 WHERE id = $1`,
    [url.id]
  );

  // 🔥 Store analytics row
  await pool.query(
    `INSERT INTO url_clicks (url_id, ip_address, user_agent)
     VALUES ($1, $2, $3)`,
    [url.id, ip, userAgent]
  );

  // Cache if needed
  if (!cachedUrl) {
    await redisClient.set(shortCode, url.long_url, { EX: 3600 });
  }

  return url.long_url;
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

