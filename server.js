import mongoose from "mongoose";
import dotenv from "dotenv";
import app from "./app.js";

dotenv.config({ path: "./config.env" });
const { BOT_TOKEN, lOCAL_SERVER_URL } = process.env;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const URI = `/webhook/${BOT_TOKEN}`;
const WEBHOOK_URL = lOCAL_SERVER_URL + URI;

const init = async () => {
  const res = await fetch(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
  const info = await res.json();
  console.log(info);
};

mongoose
  .connect(process.env.DATABASE_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("DB connection successful"));

const port = process.env.PORT || 5000;

const server = app.listen(port, async () => {
  console.log("App running on port", port);
  await init();
});

process.on("unhandledRejection", (err) => {
  console.log("unhandled rejection, Shutting down....");
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
