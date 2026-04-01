import express from "express";
import multer from "multer";
import auth from "../middleware/auth.js";
import User from "../models/User.js";
import { deleteCloudinaryAsset, uploadAvatar } from "../utils/cloudinary.js";
import { serializeUserProfile } from "../utils/profile.js";

const router = express.Router();
const MAX_AVATAR_FILE_SIZE = 5 * 1024 * 1024;

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

router.patch("/me", auth, async (req, res) => {
  try {
    const firstName = req.body.firstName?.trim();
    const lastName = req.body.lastName?.trim();

    if (!firstName || !lastName) {
      return res.status(400).json({
        error: "First name and last name are required.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.userId,
      {
        firstName,
        lastName,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!user) {
      return res.status(404).json({ error: "user not found" });
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
