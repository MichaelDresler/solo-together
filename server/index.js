import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";
import authRoutes from "./routes/auth.js"
import adminRoutes from "./routes/admin.js";
import eventRoutes from "./routes/events.js";
import profileRoutes from "./routes/profile.js";
import ticketmasterRoutes from "./routes/ticketmaster.js";

const app = express();
const PORT = 5001;
const uri = process.env.MONGO_URI;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());
app.use("/api/auth", authRoutes)
app.use("/api/admin", adminRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/ticketmaster", ticketmasterRoutes);

async function connectDB() {
  try {
    await mongoose.connect(uri, clientOptions);
    await mongoose.connection.db.admin().command({ ping: 1 });
    
    app.listen(PORT, () => {
      console.log(`server is running on port ${PORT}`);
    });

  } catch (e) {
    console.log(e);
  }
}

connectDB();
