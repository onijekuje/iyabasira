import { PineconeClient } from "@pinecone-database/pinecone";
import { Document } from "langchain/document";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import RestaurantProfile from "../models/RestaurantProfile.js";
import mongoose from "mongoose";
// import source from "../misc/sourceOfTruth.json" assert { type: "json" };
import source2 from "../misc/test.json" assert { type: "json" };
import dotenv from "dotenv";
dotenv.config({ path: "../config.env" });

const client = new PineconeClient();
await client.init({
  apiKey: process.env.PINECONE_API_KEY,
  environment: process.env.PINECONE_ENVIRONMENT,
});

console.log("testing.......");
console.log(process.env.OPENAI_API_KEY);

const pineconeIndex = client.Index(process.env.PINECONE_INDEX);

const docs = [];
// for (var item of source) {
//   const documentFromSourceItemTag = new Document({
//     metadata: {
//       contentType: "restaurantTag",
//       restaurantName: item.restaurantName,
//     },
//     pageContent: item.tag,
//   });
//   const documentFromSourceItemSummary = new Document({
//     metadata: {
//       contentType: "restaurantSummary",
//       restaurantName: item.restaurantName,
//     },
//     pageContent: `${item.summary}`,
//   });
//   const combinedDoc = new Document({
//     metadata: {
//       contentType: "restaurantCombined",
//       restaurantName: item.restaurantName,
//     },
//     pageContent: `${item.tag} ${item.summary}`,
//   });
//   docs.push(
//     documentFromSourceItemSummary,
//     documentFromSourceItemTag,
//     combinedDoc
//   );
// }

const loadIntoDB = async () => {
  mongoose
    .connect(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => console.log("DB connection successful"));
  const entries = [];
  for (var item of source2) {
    const y = {
      name: item.restaurantName,
      summary: item.summary,
      tag: item.tag,
      address: item.address,
      mainland: item.mainland,
      score: item.score,
    };
    entries.push(y);
  }
  for await (var entry of entries) {
    const exists = await RestaurantProfile.findOne({ name: entry.name });
    if (!exists) {
      await RestaurantProfile.create({
        name: entry.name,
        mainland: entry.mainland,
        address: entry.address,
        tag: entry.tag,
        summary: entry.summary,
        score: entry.score,
      });
    }
  }
  await mongoose.disconnect();
};

loadIntoDB();

for (var item of source2) {
  const documentFromSourceItemTag = new Document({
    metadata: {
      contentType: "restaurantTag4",
      restaurantName: item.restaurantName,
    },
    pageContent: item.tag,
  });
  const combinedDoc = new Document({
    metadata: {
      contentType: "restaurantTagAddress4",
      restaurantName: item.restaurantName,
    },
    pageContent: `${item.tag}, ${item.address}`,
  });
  docs.push(documentFromSourceItemTag, combinedDoc);
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
