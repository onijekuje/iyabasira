import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
  },
  first_name: {
    type: String,
  },
  telegramUsername: {
    type: String,
  },
  language_code: {
    type: String,
  },
});
