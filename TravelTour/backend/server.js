import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

// Load .env 1 lần duy nhất cho toàn bộ backend
import "./config/env.js";

import authRoutes from "./routes/auth.js";
import providerRoutes from "./routes/provider.js";
import { ensureDefaultAdmin } from "./models/userModel.js";
import chatbotRoutes from "./routes/chatbot.js";
import guideRoutes from "./routes/guide.js";
import settingsRoutes from "./routes/settings.js";
import adminDashboardRoutes from "./routes/adminDashboard.js";

// 👉 giữ debug của bạn
console.log("=== ENV DEBUG ===");
console.log("KEY EXISTS:", !!process.env.OPENROUTER_API_KEY);
console.log("=================");

const app = express();
// Tắt ETag để tránh 304 lấy cache sai theo user
app.set("etag", false);

// Debug: đánh dấu response từ server này
app.use((req, res, next) => {
  res.setHeader("X-TravelTour-Server", "backend");
  return next();
});

/* =========================
   FIX __dirname CHO ESM
========================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =========================
   MIDDLEWARE
========================= */
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Tránh log lỗi 404 favicon trong trình duyệt
app.get("/favicon.ico", (req, res) => res.status(204).end());

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
// Chặn cache cho các API có dữ liệu theo user (tránh 304 trả về data cũ)
app.use("/api/provider", (req, res, next) => {
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  res.setHeader("Surrogate-Control", "no-store");
  return next();
});
app.use("/api/provider", providerRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/guide", guideRoutes);

// 👉 thêm admin + settings
app.use("/api/settings", settingsRoutes);
app.use("/api/admin", adminDashboardRoutes);

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
  console.error("❌ SQL MESSAGE:", err?.sqlMessage);
  console.error("❌ SQL CODE:", err?.code);
  console.error("❌ SQL ERRNO:", err?.errno);

  return res.status(500).json({
    message: "Lỗi server nội bộ",
    error: err?.sqlMessage || err?.message || "Unknown error"
  });
});

/* =========================
   START SERVER
========================= */
const PORT = Number(process.env.PORT || 3000);

(async () => {
  try {
    await ensureDefaultAdmin();
  } catch (err) {
    console.warn("⚠️ Không seed được admin:", err?.message || err);
  }

  app.listen(PORT, () => {
    console.log(`✅ Server chạy tại: http://localhost:${PORT}`);
  });
})();