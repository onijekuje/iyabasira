import {
  extractRecommendationTagsFromMessage,
  generateAnswerBasedOnContext,
  getContextForRecommendations,
} from "./openAIController.js";
import dotenv from "dotenv";
dotenv.config({ path: "./config.env" });

const { BOT_TOKEN } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;

export const sendChatAction = async (chatId, action) => {
  try {
    const x = await fetch(`${TELEGRAM_API}/sendChatAction`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        action: `${action}`,
      }),
    });
  } catch (error) {
    console.error("error in send chat action");
    console.log(error);
  }
};
const welcome = async (chatId) => {
  await sendReply(chatId, "Welcome my pikin, How can I help you today ?");
};
const processReservations = async (chatId) => {
  await sendReply(
    chatId,
    "Sorry this feature is not available right now, we're working hard on it and we'd let you know once it's good to go. \n 💕 The onijekuje team"
  );
};

const assistedMode = async (chatId) => {
  const replyMarkup = {
    reply_markup: {
      keyboard: [
        [
          {
            text: "testing 111 ",
          },
        ],
        [
          {
            text: "testing 222",
          },
        ],
      ],
      one_time_keyboard: true,
    },
  };
  // const res = await sendReply(chatId, "testing", replyMarkup);
  await sendReply(
    chatId,
    "Sorry this feature is not available right now, we're working hard on it and we'd let you know once it's good to go. \n 💕 The onijekuje team"
  );
};

export const processMessage = async (req, res, next) => {
  //   console.log(req.body);
  console.log("process message called ..... ");
  const chatId = req.body.message.chat.id;
  const text = req.body.message.text;
  console.log("chatId is ", chatId);
  console.log("text for chat Id is ", text);
  res.send();
  if (text === "/reservations") {
    await processReservations(chatId);
  } else if (text === "/start") {
    await welcome();
  } else if (text === "/assisted") {
    await assistedMode(chatId);
  } else {
    sendChatAction(chatId, "typing");
    try {
      const result = await extractRecommendationTagsFromMessage(text);
      if (result.requiresContext) {
        const tag = result.message;
        const contextDocs = await getContextForRecommendations(
          text,
          process.env.PINECONE_META_FILTER || "restaurantTagAddress3"
        );
        const recommendation = await generateAnswerBasedOnContext(
          text,
          tag,
          contextDocs
        );
        await sendReply(chatId, recommendation);
        console.log("process message completed, further processing");
      } else {
        await sendReply(chatId, result.message);
        console.log("process message completed, no further processing ...");
      }
    } catch (err) {
      console.log("error in process message");
      console.log(err);
    }
  }
};

const sendReply = async (chatId, response, extras = {}) => {
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
    console.log("success", y.result);
  } catch (error) {
    console.log("error in send reply");
    console.log(error);
  }
};
