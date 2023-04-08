import { Configuration, OpenAIApi } from "openai";
import source from "../misc/sourceOfTruth.json" assert { type: "json" };
import {
  compressedExtractionPrompt,
  fullExtractionPrompt,
  compressedSingleSentenceExtrationPrompt,
  completionsPrompt,
  recommendationsPrompt,
} from "../util/constants.js";
import dotenv from "dotenv";
dotenv.config({ path: "../config.env" });
import { PineconeClient } from "@pinecone-database/pinecone";
import { OpenAIEmbeddings } from "langchain/embeddings";
import { PineconeStore } from "langchain/vectorstores";

// export const extractRecommendationTagsFromMessage = async (message) => {
//   console.log("extract recommendation tags called ....");
//   console.log(process.env.OPEN_AI_KEY);
//   const configuration = new Configuration({
//     apiKey: process.env.OPEN_AI_KEY,
//   });
//   try {
//     console.log("open api key is ", configuration.apiKey);
//     const openai = new OpenAIApi(configuration);
//     const chatCompletion = await openai.createChatCompletion({
//       model: "gpt-3.5-turbo",
//       messages: [
//         { role: "system", content: "You are a helpful assistant." },
//         {
//           role: "user",
//           content: `${compressedSingleSentenceExtrationPrompt} Message :  ${message}
//         `,
//         },
//       ],
//     });
//     const response = chatCompletion.data.choices[0].message;
//     console.log("response is ", response);
//     const extractedTags = response.content;
//     return extractedTags;
//   } catch (err) {
//     console.log(
//       "-------------------------------------------------------------------------------"
//     );
//     console.log(err.response);
//   }
// };

export const extractRecommendationTagsFromMessage = async (message) => {
  console.log("extract recommendation tags called ....");
  console.log(process.env.OPEN_AI_KEY);
  const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
  });
  try {
    console.log("open api key is ", configuration.apiKey);
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${completionsPrompt} \n You: ${message}`,
      temperature: 0.5,
      max_tokens: 60,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    // const response = chatCompletion.data.choices[0].message;
    console.log("response is ", response.data.choices[0].text);
    const extractedTag = response.data.choices[0].text.split(":")[1];
    const tagBreakDown = extractedTag.split("==");
    if (tagBreakDown.length === 1) {
      return {
        message: tagBreakDown[0],
        requiresFurtherProcessing: true,
      };
    } else {
      return {
        message: tagBreakDown[0],
        requiresFurtherProcessing: false,
      };
    }
  } catch (err) {
    console.log(
      "-------------------------------------------------------------------------------"
    );
    console.log(err);
  }
};

export const getContextForRecommendations = async (query, contentType) => {
  const client = new PineconeClient();
  await client.init({
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT,
  });
  const pineconeIndex = client.Index(process.env.PINECONE_INDEX);
  const vectorStore = await PineconeStore.fromExistingIndex(
    new OpenAIEmbeddings(),
    { pineconeIndex }
  );
  const results = await vectorStore.similaritySearch(query, 10, {
    contentType,
  });
  return results;
};

export const generateAnswerBasedOnContext = async (question, documents) => {
  const x = [];
  for (var doc of documents) {
    const s = doc.pageContent;
    x.push(s);
  }
  const context = x.join(",");
  // console.log(context);
  const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
  });

  const openai = new OpenAIApi(configuration);
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt: `${recommendationsPrompt}\n
    You: A person is looking for ${question},,   based on the following context only, provide recommendations.
    Include all of the context in your recommendation. 
    In your recommendations you should give priority to restaurants that match the location specified 
    as well as the budget specified relative to the amount of people.
    context : ${context}`,
    max_tokens: 1024,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
  });
  console.log(response.data.choices[0].text);
  const recommendation = response.data.choices[0].text.split(":")[1];
  return recommendation;
};

// const question =
//   "Looking for a place to have Friday night drinks for my girls and I. A group of 4. Unlimited budget";
// const tag = await extractRecommendationTagsFromMessage(question);
// const contextDocs = await getContextForRecommendations(tag, "restaurantTag");
// const recommendation = await generateAnswerBasedOnContext(tag, contextDocs);
