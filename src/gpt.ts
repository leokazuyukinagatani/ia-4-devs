import { ChatOpenAI } from "langchain/chat_models/openai";
import { RetrievalQAChain } from "langchain/chains";
import { PromptTemplate } from "langchain/prompts";
import { redis, redisVectorStore } from "./redis-store";

const openAIChat = new ChatOpenAI({
  openAIApiKey: process.env.OPENAI_API_KEY,
  modelName: "gt",
  temperature: 0.3,
});

const prompt = new PromptTemplate({
  template: `
    Você responde perguntas sobre programação.
    O usuário está assistindo um curso com várias aulas.
    Use o conteúdo das transcrições das aulas abaixo para responder as perguntas do usuário.
    Se a resposta não for encontrada nas transcrições, responda que você não sabe, não tente inventar uma resposta.
    Se possivel, inclua exemplos de código.

    Transcrições:
    {context}
  
    Pergunta:
    {question}
    `.trim(),
  inputVariables: ["context", "question"],
});

const chain = RetrievalQAChain.fromLLM(
  openAIChat,
  redisVectorStore.asRetriever(),
  { prompt, returnSourceDocuments: true, verbose: true }
);

async function main() {
  await redis.connect();

  const response = await chain.call({
    query: "Me explique o conceito de Aggregate Root no DDD",
  });
  console.log(response);

  await redis.disconnect();
}
