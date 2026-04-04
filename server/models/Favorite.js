import mongoose from "mongoose";

const { Schema, model } = mongoose;

const favoriteSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },
  },
  { timestamps: true },
);

favoriteSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default model("Favorite", favoriteSchema);
