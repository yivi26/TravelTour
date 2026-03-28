import express from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import authRoutes from "./routes/auth.js";
import providerRoutes from "./routes/provider.js";

dotenv.config();

const app = express();

/* =========================
   FIX __dirname CHO ESM
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =========================
   SERVE FILE TĨNH FRONTEND
========================= */
app.use(
  express.static(path.join(__dirname, "../frontend"), {
    index: false
  })
);

/* =========================
   SERVE FILE ẢNH UPLOAD
========================= */
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/* =========================
   ROUTE PAGE FRONTEND
========================= */
app.get("/", (req, res) => {
  return res.redirect("/login");
});

app.get("/login", (req, res) => {
  return res.sendFile(
    path.join(__dirname, "../frontend/pages/dangnhap/login.html")
  );
});

app.get("/register", (req, res) => {
  return res.sendFile(
    path.join(__dirname, "../frontend/pages/dangnhap/register.html")
  );
});

/* =========================
   API TEST
========================= */
app.get("/api/test", (req, res) => {
  return res.status(200).json({
    message: "API OK"
  });
});

/* =========================
   API ROUTES
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/provider", providerRoutes);

/* =========================
   404 API
========================= */
app.use("/api", (req, res) => {
  return res.status(404).json({
    message: "API không tồn tại"
  });
});

/* =========================
   404 PAGE
========================= */
app.use((req, res) => {
  return res.status(404).send("Không tìm thấy trang");
});

/* =========================
   GLOBAL ERROR HANDLER
========================= */
app.use((err, req, res, next) => {
  console.error("❌ SERVER ERROR:", err);

  return res.status(500).json({
    message: "Lỗi server nội bộ",
    error: err.message
  });
});

/* =========================
   START SERVER
========================= */
const PORT = Number(process.env.PORT || 3000);

app.listen(PORT, () => {
  console.log(`✅ Server chạy tại: http://localhost:${PORT}`);
});