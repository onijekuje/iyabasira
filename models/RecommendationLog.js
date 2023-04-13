import mongoose from "mongoose";

const RecommendationLogSchema = new mongoose.Schema({
  question: {
    type: String,
    required: [true, "Please provide conversation question"],
  },
  prompt: {
    type: String,
    required: [true, "Please provide conversation prompt"],
  },
  context: {
    type: String,
    required: [true, "Please provide conversation context"],
  },
  tag: {
    type: String,
    required: [true, "Please provide conversation tag"],
  },
  recommendation: {
    type: String,
    required: [true, "Please provide conversation recommendation"],
  },
  trainingData: {
    type: String,
  },
});

const RecommendationLog = mongoose.model(
  "RecommendationLog",
  RecommendationLogSchema
);

export default RecommendationLog;
