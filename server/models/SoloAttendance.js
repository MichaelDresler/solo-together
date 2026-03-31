import mongoose from "mongoose";

const { Schema, model } = mongoose;

const soloAttendanceSchema = new Schema(
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
    status: {
      type: String,
      enum: ["going_solo"],
      default: "going_solo",
      required: true,
    },
  },
  { timestamps: true }
);

soloAttendanceSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export default model("SoloAttendance", soloAttendanceSchema);
