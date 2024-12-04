import { createClient } from "redis";

const redis = createClient({
  url: "redis://redis:6379",
});

redis.on("error", (err) => console.error("Redis Client Error", err));
redis.on("connect", () => console.log("Connected to Redis"));

await redis.connect();

export default redis;
