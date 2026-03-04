import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const router = express.Router();

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    //check if username exists
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "username and password are required" });
    }
    //must be longer than 8 characters
    if (password.length < 8) {
      return res
        .status(400)
        .json({ error: "password must be as least 8 characters" });
    }
    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({ error: "username already taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ username, hashedPassword });
    console.log(`new user created: ${newUser}`);

    return res
      .status(201)
      .json({ user: { id: newUser._id, username: newUser.username } });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    // validation
    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "please provide a username or password" });
    }
    const user = await User.findOne({ username });
    // validation
    if (!user) return res.status(404).json({ error: "no such user exists" });

    // validation
    const passwordMatches = await bcrypt.compare(password, user.hashedPassword);
    if (!passwordMatches)
      return res.status(401).json({ error: "invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_TOKEN, {
      expiresIn: "1h",
    });

    res.json({ token, user: { id: user._id, username: user.username } });

  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
