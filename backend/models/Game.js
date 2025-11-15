import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    platform: { type: String, default: "PC" },
    genre: { type: String, default: "" },
    coverUrl: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pendiente", "jugando", "completado"],
      default: "pendiente",
    },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    hoursPlayed: { type: Number, min: 0 },
    favorite: { type: Boolean, default: false },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Game", gameSchema);
