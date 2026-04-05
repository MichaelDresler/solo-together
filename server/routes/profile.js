import express from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import Event from "../models/Event.js";
import Favorite from "../models/Favorite.js";
import SoloAttendance from "../models/SoloAttendance.js";
import User from "../models/User.js";
import { attachSoloAttendanceSummary } from "../utils/eventAttendance.js";
import { deleteCloudinaryAsset, uploadAvatar } from "../utils/cloudinary.js";
import { serializeUserProfile } from "../utils/profile.js";

const router = express.Router();
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

function normalizeUsername(value) {
  return value?.trim().toLowerCase() || "";
}

function isValidUsername(value) {
  return /^[a-z0-9._]+$/.test(value);
}

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_AVATAR_FILE_SIZE,
  },
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype?.startsWith("image/")) {
      cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "avatar"));
      return;
    }

    cb(null, true);
  },
});

function handleAvatarUpload(req, res, next) {
  upload.single("avatar")(req, res, (error) => {
    if (!error) {
      next();
      return;
    }

    if (error instanceof multer.MulterError) {
      if (error.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          error: "Avatar must be 5MB or smaller.",
        });
      }

      return res.status(400).json({
        error: "Please upload a valid image file for your avatar.",
      });
    }

    return res.status(400).json({
      error: error.message || "Unable to process avatar upload.",
    });
  });
}

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    return res.json({ user: serializeUserProfile(user) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

router.get("/me/events", auth, async (req, res) => {
  try {
    const [createdEvents, attendances] = await Promise.all([
      Event.find({
        $or: [{ createdBy: req.userId }, { userId: req.userId }],
      })
        .populate("createdBy", "username firstName lastName avatarUrl")
        .populate("userId", "username firstName lastName avatarUrl")
        .sort({ startDate: 1, createdAt: -1 }),
      SoloAttendance.find({
        userId: req.userId,
        status: "going_solo",
      })
        .populate({
          path: "eventId",
          populate: [
            {
              path: "createdBy",
              select: "username firstName lastName avatarUrl",
            },
            {
              path: "userId",
              select: "username firstName lastName avatarUrl",
            },
          ],
        })
        .sort({ createdAt: -1 }),
    ]);

    const rawSoloingEvents = attendances
      .map((attendance) => attendance.eventId)
      .filter(Boolean)
      .filter((event) => {
        const ownerId =
          event.createdBy?._id?.toString() ||
          event.createdBy?.toString() ||
          event.userId?._id?.toString() ||
          event.userId?.toString() ||
          null;

        return ownerId !== req.userId;
      });

    const [createdEventsWithAttendance, soloingEvents] = await Promise.all([
      attachSoloAttendanceSummary(createdEvents),
      attachSoloAttendanceSummary(rawSoloingEvents),
    ]);

    return res.json({
      createdEvents: createdEventsWithAttendance,
      soloingEvents,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

router.get("/me/favorites", auth, async (req, res) => {
  try {
    const favorites = await Favorite.find({ userId: req.userId })
      .populate({
        path: "eventId",
        populate: [
          {
            path: "createdBy",
            select: "username firstName lastName avatarUrl",
          },
          {
            path: "userId",
            select: "username firstName lastName avatarUrl",
          },
        ],
      })
      .sort({ createdAt: -1 });

    const events = favorites
      .map((favorite) => favorite.eventId)
      .filter(Boolean)
      .map((event) => ({
        ...event.toObject(),
        isFavorited: true,
      }));

    const eventsWithAttendance = await attachSoloAttendanceSummary(events);

    return res.json({ favorites: eventsWithAttendance });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

router.patch("/me", auth, async (req, res) => {
  try {
    const firstName = req.body.firstName?.trim();
    const lastName = req.body.lastName?.trim();
    const email = req.body.email?.trim().toLowerCase() || "";
    const username = normalizeUsername(req.body.username);
    const hasAvatarUrl = typeof req.body.avatarUrl === "string";
    const avatarUrl = hasAvatarUrl ? req.body.avatarUrl.trim() : null;

    if (!firstName || !lastName || !email || !username) {
      return res.status(400).json({
        error: "First name, last name, username, and email are required.",
      });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({
        error:
          "Username can only include letters, numbers, periods, and underscores.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const existingUser = await User.findOne({
      email,
      _id: { $ne: req.userId },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email is already in use." });
    }

    const existingUsername = await User.findOne({
      username,
      _id: { $ne: req.userId },
    });

    if (existingUsername) {
      return res.status(409).json({ error: "Username is already in use." });
    }

    const previousAvatarPublicId = user.avatarPublicId;
    const shouldClearManagedAvatar =
      hasAvatarUrl &&
      avatarUrl !== user.avatarUrl &&
      Boolean(previousAvatarPublicId);

    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.username = username;

    if (hasAvatarUrl) {
      user.avatarUrl = avatarUrl;
      user.avatarPublicId = "";
    }

    await user.save();

    if (shouldClearManagedAvatar) {
      try {
        await deleteCloudinaryAsset(previousAvatarPublicId);
      } catch (error) {
        console.log("failed to delete old avatar", error);
      }
    }

    return res.json({ user: serializeUserProfile(user) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "server error" });
  }
});

router.patch("/me/avatar", auth, handleAvatarUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: "Please choose an image to upload.",
      });
    }

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "user not found" });
    }

    const uploadedAvatar = await uploadAvatar(req.file.buffer, user._id);

    if (user.avatarPublicId) {
      try {
        await deleteCloudinaryAsset(user.avatarPublicId);
      } catch (error) {
        console.log("failed to delete old avatar", error);
      }
    }

    user.avatarUrl = uploadedAvatar.avatarUrl;
    user.avatarPublicId = uploadedAvatar.avatarPublicId;
    await user.save();

    return res.json({ user: serializeUserProfile(user) });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Failed to upload avatar." });
  }
});

export default router;
