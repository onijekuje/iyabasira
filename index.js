import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import MessagingRouter from "./routers/messagingRouter.js";

dotenv.config({ path: "./config.env" });
const { BOT_TOKEN, lOCAL_SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const URI = `/webhook/${BOT_TOKEN}`;
const WEBHOOK_URL = lOCAL_SERVER_URL + URI;

const app = express();
app.use(bodyParser.json());
app.use(URI, MessagingRouter);

const init = async () => {
  const res = await fetch(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  const info = await res.json();
  console.log(info);
};

app.listen(process.env.PORT || 5000, async () => {
  console.log("App running on port", process.env.PORT || 5000);
  await init();
});

process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection, Shutting down....");
  console.log(err.name, err.message);
});
