import { RedisVectorStore } from "langchain/vectorstores/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { createClient } from "redis";

export const redis = createClient({
  url: "redis://localhost:6379",
});

export const redisVectorStore = new RedisVectorStore(
  new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  }),
  { indexName: "videos-embeddings", redisClient: redis, keyPrefix: "videos:" }
);
