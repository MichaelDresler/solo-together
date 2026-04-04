import express from "express";
import auth from "../middleware/auth.js";
import Event from "../models/Event.js";
import SoloAttendance from "../models/SoloAttendance.js";
import User from "../models/User.js";
import { deleteCloudinaryAsset } from "../utils/cloudinary.js";
import { serializeUserProfile } from "../utils/profile.js";

const router = express.Router();

function requireAdmin(req, res, next) {
  if (!req.user || !["admin", "super_admin"].includes(req.user.role)) {
    return res.status(403).json({ error: "admin access required" });
  }

  return next();
}

function requireSuperAdmin(req, res, next) {
  if (req.user?.role !== "super_admin") {
    return res.status(403).json({ error: "super admin access required" });
  }

  return next();
}

router.get("/members", auth, requireAdmin, async (_req, res) => {
  try {
    const users = await User.find()
      .select("username firstName lastName avatarUrl role status createdAt")
      .sort({ createdAt: -1 });

    return res.json({
      members: users.map((user) => serializeUserProfile(user)),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

router.patch("/members/:id/role", auth, requireSuperAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    if (!["member", "admin"].includes(role)) {
      return res.status(400).json({ error: "invalid role" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (user.role === "super_admin") {
      return res.status(400).json({ error: "cannot change super admin role" });
    }

    user.role = role;
    await user.save();

    return res.json({ user: serializeUserProfile(user) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

router.patch("/members/:id/status", auth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!["active", "suspended"].includes(status)) {
      return res.status(400).json({ error: "invalid status" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (user.role === "super_admin") {
      return res.status(400).json({ error: "cannot suspend super admin" });
    }

    if (user._id.toString() === req.userId) {
      return res.status(400).json({ error: "cannot change your own account status" });
    }

    user.status = status;
    await user.save();

    return res.json({ user: serializeUserProfile(user) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

router.delete("/members/:id", auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    if (user.role === "super_admin") {
      return res.status(400).json({ error: "cannot delete super admin" });
    }

    if (user._id.toString() === req.userId) {
      return res.status(400).json({ error: "cannot delete your own account" });
    }

    const ownedEvents = await Event.find({
      $or: [{ createdBy: user._id }, { userId: user._id }],
      source: "internal",
    }).select("_id");
    const ownedEventIds = ownedEvents.map((event) => event._id);

    await Event.deleteMany({
      _id: { $in: ownedEventIds },
    });
    await SoloAttendance.deleteMany({
      $or: [{ userId: user._id }, { eventId: { $in: ownedEventIds } }],
    });
    await User.findByIdAndDelete(user._id);

    return res.json({ message: "member deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

router.delete("/events", auth, async (req, res) => {
  try {
    if (process.env.NODE_ENV === "production") {
      return res.status(403).json({ error: "event reset is disabled in production" });
    }

    const eventsWithImages = await Event.find({
      imagePublicId: { $type: "string", $ne: "" },
    }).select("imagePublicId");

    for (const event of eventsWithImages) {
      try {
        await deleteCloudinaryAsset(event.imagePublicId);
      } catch (error) {
        console.log("failed to delete event image during bulk reset", {
          eventId: event._id?.toString(),
          imagePublicId: event.imagePublicId,
          error: error.message,
        });
      }
    }

    const [eventResult, soloResult] = await Promise.all([
      Event.deleteMany({}),
      SoloAttendance.deleteMany({}),
    ]);

    return res.json({
      message: "all events deleted successfully",
      deletedEvents: eventResult.deletedCount || 0,
      deletedSoloAttendance: soloResult.deletedCount || 0,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
