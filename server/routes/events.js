import express from "express";
import Event from "../models/Event.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// GET all events
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("userId", "username firstName lastName")
      .sort({ createdAt: -1 });

    return res.json(events);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

// POST create new event (protected)
router.post("/", auth, async (req, res) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({ error: "title is required" });
    }

    const newEvent = await Event.create({
      title,
      description,
      userId: req.userId,
    });

    return res.status(201).json(newEvent);
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

// DELETE event by id (protected)
router.delete("/:id", auth, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ error: "event not found" });
    }

    // make sure users can only delete their own events
    if (event.userId.toString() !== req.userId) {
      return res
        .status(403)
        .json({ error: "not authorized to delete this event" });
    }

    await Event.findByIdAndDelete(req.params.id);

    return res.json({ message: "event deleted successfully" });
  } catch (e) {
    console.log(e);
    return res.status(500).json({ error: "server error" });
  }
});

export default router;
