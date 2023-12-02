import mongoose from "mongoose";

const RestaurantProfileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true],
    unique: [true, "This name is already taken, please try another"],
  },
  summary: {
    type: String,
    required: [true],
  },
  tag: {
    type: String,
    required: [true],
  },
  address: {
    type: String,
  },
  mainland: {
    type: Boolean,
  },
  score: {
    type: Number,
  },
});

const RestaurantProfile = mongoose.model(
  "RestaurantProfile",
  RestaurantProfileSchema
);

export default RestaurantProfile;
