import { PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";
import source from "../misc/sourceOfTruth.json" assert { type: "json" };
import dotenv from "dotenv";
dotenv.config({ path: "../config.env" });

const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});

const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

const docs = [];
for (var item of source) {
  const documentFromSourceItemTag = new Document({
    metadata: { contentType: "restaurantTag" },
    pageContent: item.tag,
  });
  const documentFromSourceItemSummary = new Document({
    metadata: { contentType: "restaurantSummary" },
    pageContent: `name>${item.restaurantName}> ${item.summary}`,
  });
  docs.push(documentFromSourceItemSummary, documentFromSourceItemTag);
}

/**
 * Note: If getting [Error: OpenAI API key not found]
 * make sure the config variable OPENAI_API_KEY is set
 * env variable must be in that specific format, else will not find key
 */
try {
  await PineconeStore.fromDocuments(docs, new OpenAIEmbeddings(), {
    pineconeIndex,
  })
    .then(console.log)
    .then(() => {
      console.log("vector upload complete......");
    });
} catch (err) {
  console.log("error.......");
  console.log(err);
}

// console.log(source[0]);
