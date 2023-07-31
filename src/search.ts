import { redis, redisVectorStore } from "./redis-store";

async function search() {
  await redis.connect();

  const response = await redisVectorStore.similaritySearchWithScore(
    "Qual é o conceito de aggregate root",
    5
  );

  console.log(response);

  await redis.disconnect();
}

search();
