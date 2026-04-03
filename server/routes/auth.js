import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import auth from "../middleware/auth.js";
import { serializeUserProfile } from "../utils/profile.js";
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password, firstName, lastName } = req.body;

    //check if username exists
    if (!username || !password || !firstName || !lastName) {
      return res
        .status(400)
        .json({ error: "please fill out the missing field" });
    }
    //must be longer than 8 characters
    if (password.length < 1) {
      return res
        .status(400)
        .json({ error: "password must be as least 8 characters" });
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({ error: "username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const hasExistingUsers = (await User.estimatedDocumentCount()) > 0;
    const newUser = await User.create({
      username: username.toLowerCase(),
      hashedPassword,
      firstName,
      lastName,
      role: hasExistingUsers ? "member" : "super_admin",
    });
    console.log(`new user created: ${newUser}`);

    const token = jwt.sign(
      { userId: newUser._id, username: newUser.username },
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
    const { username, password } = req.body;
    const normalizedUsername = username.toLowerCase()
    // validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "please provide a username or password" });
    }
    const user = await User.findOne({ username:normalizedUsername });
    // validation
    if (!user) return res.status(404).json({ error: "no such user exists" });
    if (user.status === "suspended") {
      return res.status(403).json({ error: "account is suspended" });
    }

    // validation
    const passwordMatches = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatches)
      return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign(
      { userId: user._id, username: user.username },
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
