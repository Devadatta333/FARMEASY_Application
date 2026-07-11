import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/dbConnect.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import cors from "cors";

dotenv.config();

connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users",userRoutes);
// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`The app is running on port ${PORT}`);
});