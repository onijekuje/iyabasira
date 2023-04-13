import { Configuration, OpenAIApi } from "openai";
import RecommendationLog from "../models/RecommendationLog.js";
import { completionsPrompt } from "../util/constants.js";
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
  const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
  });
  try {
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: `${completionsPrompt} \n You: ${message}?`,
      temperature: 0.5,
      max_tokens: 60,
      top_p: 0.3,
      frequency_penalty: 0.5,
      presence_penalty: 0,
    });
    // const response = chatCompletion.data.choices[0].message;
    const result = response.data.choices[0].text;
    console.log(response.data.choices[0].text);
    console.log("response is ", response.data.choices[0].text);
    console.log(
      "-----------------------------------------------------------------"
    );
    if (result.length === 0) {
      return {
        message:
          "I'm sorry, something seems to be wrong with your message can you please check that your message is correct and try again",
        requiresContext: false,
      };
    }
    const extractedTag = result.split(":")[1];
    const tagBreakDown = extractedTag.split("==");
    if (tagBreakDown.length === 1) {
      return {
        message: tagBreakDown[0],
        requiresContext: true,
      };
    } else {
      return {
        message: tagBreakDown[0],
        requiresContext: false,
      };
    }
  } catch (err) {
    console.log("Error occured when extracting tags from message ...");
    console.log(err);
  }
};

export const getContextForRecommendations = async (query, contentType) => {
  try {
    console.log(`get context called for query ${query}`);
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

    const test = await vectorStore.similaritySearchWithScore(query, 3, {
      contentType,
    });
    console.log("------------------------------------------------------");
    console.log(test);
    const results = await vectorStore.similaritySearch(query, 3, {
      contentType,
    });
    return results;
  } catch (err) {
    console.log("error in get context");
    console.log(err);
  }
};

export const generateAnswerBasedOnContext = async (
  question,
  extractedTag,
  documents
) => {
  let context = "";
  for (var doc of documents) {
    context += doc.pageContent;
    context += "\n";
  }
  console.log("context is ", context);
  const configuration = new Configuration({
    apiKey: process.env.OPEN_AI_KEY,
  });
  try {
    const prompt = `A user is searching for: ${extractedTag} \n context : """${context}"""
    using the context above, provide recommendations for restaurants that match the location and budget specified by the user relative
    to the amount of people.
    Ensure that the prices are within the specified budget per person and ensure that the location of each restaurant are included the recommendation and include all of the restaurants mentioned in the context in your recommendation.
    the result should be written in a conversational manner, as if it was a human that was giving the response.
  `;
    const openai = new OpenAIApi(configuration);
    const response = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: prompt,
      max_tokens: 1024,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    console.log(response.data.choices[0].text);
    const recommendation = response.data.choices[0].text;
    const debug = `"prompt": "<${prompt}>", "completion":" <${recommendation}>"`;
    await RecommendationLog.create({
      question: question,
      context: context,
      prompt: prompt,
      tag: extractedTag,
      recommendation: recommendation.trim(),
      trainingData: debug,
    });
    return recommendation;
  } catch (err) {
    console.log("error in generate recommendation");
    console.log(err);
  }
};

// const question =
//   "I need a place located on the mainland to have dinner with friends";
// const tag = await extractRecommendationTagsFromMessage(question);
// const contextDocs = await getContextForRecommendations(
//   tag.message,
//   "restaurantTag"
// );
// let context = "";
// for (var doc of contextDocs) {
//   context += doc.pageContent;
//   context += "\n";
// }
// console.log(context);
// const recommendation = await generateAnswerBasedOnContext(tag, contextDocs);
