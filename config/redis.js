const { createClient } = require("redis");

const client = createClient({
  // url: "redis://localhost:6379",
  url: process.env.REDIS_URL
});

client.on("error", (err) => {
  console.log("Redis Error:", err);
});

async function connectRedis() {
  try {
    await client.connect();
    console.log("✅ Redis Connected");
  } catch (err) {
    console.log("Redis Connection Failed:", err);
  }
}

module.exports = {
  client,
  connectRedis,
};