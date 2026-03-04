import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import "dotenv/config";

const app = express();
const PORT = 5001;
const uri = process.env.MONGO_URI;
const clientOptions = {
  serverApi: { version: "1", strict: true, deprecationErrors: true },
};
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

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
