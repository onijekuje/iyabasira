import dotenv from "dotenv";
import express from "express";
import bodyParser from "body-parser";
import MessagingRouter from "./routers/messagingRouter.js";

dotenv.config({ path: "./config.env" });
const { BOT_TOKEN } = process.env;

const URI = `/webhook/${BOT_TOKEN}`;

const app = express();
app.use(bodyParser.json());
app.use(URI, MessagingRouter);

export default app;
