import mongoose from "mongoose";
const {Schema, model} = mongoose

const eventSchema = new Schema(
  {
    source: {
      type: String,
      enum: ["internal", "ticketmaster"],
      default: "internal",
      required: true,
    },
    externalSource: {
      type: String,
      default: null,
      trim: true,
    },
    externalId: {
      type: String,
      default: null,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    locationName: {
      type: String,
      default: "",
      trim: true,
    },
    city: {
      type: String,
      default: "",
      trim: true,
    },
    country: {
      type: String,
      default: "",
      trim: true,
    },
    imageUrl: {
      type: String,
      default: "",
      trim: true,
    },
    externalUrl: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

eventSchema.index(
  { externalSource: 1, externalId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      externalSource: { $type: "string" },
      externalId: { $type: "string" },
    },
  }
);

export default model("Event", eventSchema);
