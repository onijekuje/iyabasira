import express from "express";
import { processMessage } from "../controllers/messagingController.js";

const MessagingRouter = express();

MessagingRouter.route("").post(processMessage);

export default MessagingRouter;
