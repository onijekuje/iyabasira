import { extractRecommendationTagsFromMessage } from "./openAIController.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const { BOT_TOKEN } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const processMessage = async (req, res, next) => {
  console.log(req.body);

  const chatId = req.body.message.chat.id;
  const text = req.body.message.text;
  console.log("chatId is ", chatId);
  console.log("text for chat Id is ", text);
  const response = await extractRecommendationTagsFromMessage(text);
  try {
    const x = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Here is my understanding of the provided message \n ${response}`,
      }),
    });
    const y = await x.json();
    console.log("success", y.result.text);
  } catch (error) {
    console.log(error);
  }
  return res.status(200);
};
