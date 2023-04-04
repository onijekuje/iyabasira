require("dotenv").config({ path: "./config.env" });
const express = require("express");
const bodyParser = require("body-parser");

const { BOT_TOKEN, lOCAL_SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const URI = `/webhook/${BOT_TOKEN}`;
const WEBHOOK_URL = lOCAL_SERVER_URL + URI;

const app = express();
app.use(bodyParser.json());

const init = async () => {
  const res = await fetch(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  const info = await res.json();
  console.log(info);
};

app.post(URI, async (req, res, next) => {
  console.log(req.body);

  const chatId = req.body.message.chat.id;
  const text = req.body.message.text;
  console.log(chatId);
  console.log(text);
  try {
    const x = await fetch(`${TELEGRAM_API}/sendMessage`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: `onijekuje way !!!!!! ${text}`,
      }),
    });
    const y = await x.json();
    console.log("success", y);
  } catch (error) {
    console.log(error);
  }

  res.send();
});

app.listen(process.env.PORT || 5000, async () => {
  console.log("App running on port", process.env.PORT || 5000);
  await init();
});
