import path from "node:path";

import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { JSONLoader } from "langchain/document_loaders/fs/json";
import { TokenTextSplitter } from "langchain/dist/text_splitter";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";

import { createClient } from "redis";

const loader = new DirectoryLoader(path.resolve(__dirname, "../tmp"), {
  ".json": (path) => new JSONLoader(path, "/text"),
});

export async function loadDocument() {
  const docs = await loader.load();

  const splitter = new TokenTextSplitter({
    encodingName: "cl100k_base",
    chunkSize: 600,
    chunkOverlap: 0,
  });

  const splitedDocuments = await splitter.splitDocuments(docs);

  const redis = createClient({
    url: "redis://localhost:6379",
  });

  await redis.connect();

  await RedisVectorStore.fromDocuments(
    splitedDocuments,
    new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
    }),
    { indexName: "videos-embeddings", redisClient: redis, keyPrefix: "videos:" }
  );
  await redis.disconnect();

  return
}
