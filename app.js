import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoutes from "./routes/userRoute.js";

const app = express();

app.use(express.json());  

dotenv.config(process.env.MONGO_URI);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI)(() =>
      console.log("Connected!")
    );
  } catch (error) {
    console.error(`Error: ${error}`);
  }
};

connectDB();

app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Express test");
});

const PORT = process.env.PORT;

app.listen(PORT, () =>
  console.log(`Server is running in http://localhost:${PORT}`)
);
