import {
  extractRecommendationTagsFromMessage,
  generateAnswerBasedOnContext,
  getContextForRecommendations,
} from "./openAIController.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const { BOT_TOKEN } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const processMessage = async (req, res, next) => {
  //   console.log(req.body);
  console.log("process message called ..... ");
  const chatId = req.body.message.chat.id;
  const text = req.body.message.text;
  console.log("chatId is ", chatId);
  console.log("text for chat Id is ", text);
  res.send();
  const result = await extractRecommendationTagsFromMessage(text);
  if (result.requiresFurtherProcessing) {
    const tag = result.message;
    const contextDocs = await getContextForRecommendations(
      tag,
      "restaurantTag"
    );
    const recommendation = await generateAnswerBasedOnContext(tag, contextDocs);
    await sendReply(chatId, recommendation);
    console.log("process message completed, further processing");
  } else {
    await sendReply(chatId, result.message);
    console.log("process message completed, no further processing ...");
  }
};

const sendReply = async (chatId, response) => {
  try {
    const x = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `${response}`,
      }),
    });
    const y = await x.json();
    console.log("success", y.result.text);
  } catch (error) {
    console.log(error);
  }
};
