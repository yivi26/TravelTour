import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env đúng file backend/.env (1 lần duy nhất).
dotenv.config({ path: path.join(__dirname, "../.env") });

function requireEnv(key) {
  const v = process.env[key];
  if (v == null || String(v).trim() === "") {
    throw new Error(`Thiếu biến môi trường bắt buộc: ${key}`);
  }
}

// Validate tối thiểu cho DB để fail-fast.
requireEnv("DB_HOST");
requireEnv("DB_USER");
requireEnv("DB_PASSWORD");
requireEnv("DB_NAME");

