import {
  extractRecommendationTagsFromMessage,
  generateAnswerBasedOnContext,
  getContextForRecommendations,
} from "./openAIController.js";
import dotenv from "dotenv";
import User from "../models/User.js";
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
const welcome = async (chatId, messageSender) => {
  console.log("chatId is ", chatId);
  console.log("message sender is ", messageSender);
  await sendReply(chatId, "Hello there, How can I help you today ?");
  console.log("testtttttt");
  const exists = await User.findOne({ telegramId: messageSender.id });
  if (!exists) {
    console.log("new user --> {}", messageSender);
    await User.create({
      telegramId: messageSender.id,
      first_name: messageSender.first_name,
      telegramUsername: messageSender.username,
      language_code: messageSender.language_code,
    });
  }
  /**
   * Location scoping flow ...
   *const replyMarkup = {
    reply_markup: {
      keyboard: [
        [
          {
            text: "Lagos",
          },
        ],
      ],
      one_time_keyboard: true,
    },
  };
   */
};
const processReservations = async (chatId) => {
  await sendReply(
    chatId,
    "Sorry this feature is not available right now, we're working hard on it and we'd let you know once it's good to go. - The onijekuje team 💕"
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
    "Sorry this feature is not available right now, we're working hard on it and we'd let you know once it's good to go. - The onijekuje team 💕"
  );
};

export const processMessage = async (req, res, next) => {
  //   console.log(req.body);

  try {
    // console.log("process message called ..... ");
    console.log(req.body);
    let chatId = "";
    let messageSender = {};
    let text = "";
    if (req.body.my_chat_member) {
      res.send();
      const payload = req.body.my_chat_member;
      chatId = payload.from.id;
      // console.log("debug --> ", payload.old_chat_member);
      // console.log("debug --> ", payload.new_chat_member);
      return;
    } else {
      if (req.body.message) {
        chatId = req.body.message.chat.id || "undefined";
        messageSender = req.body.message.from;
        text = req.body.message.text;
      } else if (req.body.edited_message) {
        chatId = req.body.edited_message.chat.id;
        messageSender = req.body.edited_message.from;
        text = req.body.edited_message.text;
      }
    }

    // const messageSender = req.body.message.from;
    // const text = req.body.message.text;
    // console.log("chatId is ", chatId);
    // console.log("text for chat Id is ", text);
    res.send();

    if (text === "/reservations") {
      await processReservations(chatId);
    } else if (text === "/start") {
      // console.log("calling welcome method method ........");
      await welcome(chatId, messageSender);
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
          // console.log("process message completed, further processing");
        } else {
          await sendReply(chatId, result.message);
          // console.log("process message completed, no further processing ...");
        }
      } catch (err) {
        console.log("error in process message");
        console.log(err);
      }
    }
    // Will remove this eventually, should only be in welcome, messed up initial implementation of welcome that's why it's here
    const exists = await User.findOne({ telegramId: messageSender.id });
    if (!exists) {
      console.log("new user --> {}", messageSender);
      await User.create({
        telegramId: messageSender.id,
        first_name: messageSender.first_name,
        telegramUsername: messageSender.username,
        language_code: messageSender.language_code,
      });
    }
  } catch (err) {
    console.log("error in process message");
    console.log(err);
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
        ...extras,
      }),
    });
    const y = await x.json();
    // console.log("success", y.result);
  } catch (error) {
    console.log("error in send reply");
    console.log(error);
  }
};
