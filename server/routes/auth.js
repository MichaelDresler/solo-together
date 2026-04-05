import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
import { serializeUserProfile } from "../utils/profile.js";
const router = express.Router();

function normalizeEmail(value) {
  return value?.trim().toLowerCase() || "";
}

function normalizeUsername(value) {
  return value?.trim().toLowerCase() || "";
}

function isValidUsername(value) {
  return /^[a-z0-9._]+$/.test(value);
}

router.post("/register", async (req, res) => {
  try {
    const { password } = req.body;
    const firstName = req.body.firstName?.trim() || "";
    const lastName = req.body.lastName?.trim() || "";
    const email = normalizeEmail(req.body.email);
    const username = normalizeUsername(req.body.username);

    if (!email || !password || !firstName || !lastName || !username) {
      return res
        .status(400)
        .json({ error: "please fill out the missing field" });
    }

    if (!isValidUsername(username)) {
      return res.status(400).json({
        error:
          "username can only include letters, numbers, periods, and underscores",
      });
    }

    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "password must be as least 8 characters" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ error: "email already in use" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({ error: "username already in use" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hasExistingUsers = (await User.estimatedDocumentCount()) > 0;
    const newUser = await User.create({
      email,
      username,
      hashedPassword,
      firstName,
      lastName,
      role: hasExistingUsers ? "member" : "super_admin",
    });
    console.log(`new user created: ${newUser}`);

    const token = jwt.sign(
      { userId: newUser._id, email: newUser.email },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1h" },
    );

    return res.status(201).json({
      token,
      user: serializeUserProfile(newUser),
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const identifier =
      req.body.identifier?.trim().toLowerCase() ||
      normalizeEmail(req.body.email) ||
      req.body.username?.trim().toLowerCase() ||
      "";
    const { password } = req.body;

    if (!identifier || !password) {
      return res
        .status(400)
        .json({ error: "please provide an email or username and password" });
    }

    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (!user) return res.status(404).json({ error: "no such user exists" });
    if (user.status === "suspended") {
      return res.status(403).json({ error: "account is suspended" });
    }

    const passwordMatches = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatches)
      return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, email: user.email || "" },
      process.env.JWT_SECRET_TOKEN,
      { expiresIn: "1h" },
    );

    res.status(200).json({
      token,
      user: serializeUserProfile(user),
    });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "user not found" });

    return res.json({ user: serializeUserProfile(user) });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
