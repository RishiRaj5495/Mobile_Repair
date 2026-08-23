// const { createClient } = require("redis");

// const client = createClient({
//   // url: "redis://localhost:6379",
//   url: process.env.REDIS_URL,
//     socket: {
//     tls: true,
//   },
// });

// client.on("error", (err) => {
//   console.log("Redis Error:", err);
// });



// async function connectRedis() {
//   try {
//     await client.connect();
//     console.log("✅ Redis Connected");
//   } catch (err) {
//     console.log("Redis Connection Failed:", err);
//   }
// }

// module.exports = {
//   client,
//   connectRedis,
// };

const { createClient } = require("redis");

const redisUrl = process.env.REDIS_URL;

const client = createClient({
  url: redisUrl,
  socket: redisUrl.startsWith("rediss://")
    ? { tls: true }
    : {},
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

