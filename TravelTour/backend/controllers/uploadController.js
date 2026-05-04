import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const UPLOAD_DIR = path.join(__dirname, "../../uploads");

function safeExt(originalName = "") {
  const ext = path.extname(originalName).toLowerCase();
  // allow common image extensions
  if ([".png", ".jpg", ".jpeg", ".webp", ".gif"].includes(ext)) return ext;
  return ".jpg";
}

function makeFileName(originalName = "") {
  const ext = safeExt(originalName);
  const rand = crypto.randomBytes(6).toString("hex");
  return `${Date.now()}-${rand}${ext}`;
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => cb(null, makeFileName(file.originalname))
});

function fileFilter(_req, file, cb) {
  const ok = String(file.mimetype || "").startsWith("image/");
  cb(ok ? null : new Error("Chỉ hỗ trợ upload file ảnh"), ok);
}

export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
}).single("file");

export const uploadMultiple = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }
}).array("files", 10);

export function uploadSingleController(req, res) {
  const f = req.file;
  if (!f) return res.status(400).json({ message: "Không có file upload" });
  return res.json({
    file: {
      filename: f.filename,
      originalname: f.originalname,
      url: `/uploads/${f.filename}`
    }
  });
}

export function uploadMultipleController(req, res) {
  const files = Array.isArray(req.files) ? req.files : [];
  if (files.length === 0) return res.status(400).json({ message: "Không có file upload" });
  return res.json({
    files: files.map((f) => ({
      filename: f.filename,
      originalname: f.originalname,
      url: `/uploads/${f.filename}`
    }))
  });
}

