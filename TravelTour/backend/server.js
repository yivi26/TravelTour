import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.js";

dotenv.config();

const app = express();

// fix __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// middleware
app.use(cors());
app.use(express.json());

// serve frontend
app.use(
  express.static(path.join(__dirname, "../frontend"), {
    index: false
  })
);

// route mặc định → login
app.get("/", (req, res) => {
  res.redirect("/pages/login.html");
});

// route login
app.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/login.html"));
});

// route register
app.get("/register", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/pages/register.html"));
});

// test API
app.get("/api/test", (req, res) => {
  res.json({ message: "API OK" });
});

// dùng auth routes
app.use("/api/auth", authRoutes);

// start server
const PORT = Number(process.env.PORT || 3000);
app.listen(PORT, () => {
  console.log(`Server chạy tại http://localhost:${PORT}`);
});