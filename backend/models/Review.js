import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      required: true,
    },
    title: { type: String, required: true },
    content: { type: String, required: true },
    rating: { type: Number, min: 0, max: 5, required: true },
    hoursAtReview: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Review", reviewSchema);
