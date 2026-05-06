import db from "../config/db.js";
import { buildPages, normalizeKeyword, toNumber } from "../utils/modelHelpers.js";
import bcrypt from "bcryptjs";

function mapRole(role) {
  const r = String(role || "").toLowerCase();
  if (r === "provider") return { label: "Nhà cung cấp", key: "supplier" };
  if (r === "guide") return { label: "Hướng dẫn viên", key: "guide" };
  if (r === "admin") return { label: "Admin", key: "admin" };
  return { label: "Khách hàng", key: "customer" };
}

function mapStatus(isActive) {
  const active = Boolean(isActive);
  return active
    ? { label: "Hoạt động", key: "active" }
    : { label: "Đã khóa", key: "locked" };
}

export async function getUserStats() {
  const [[totalRow]] = await db.query(`SELECT COUNT(*) AS total FROM users`);
  const [[customerRow]] = await db.query(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'customer'`
  );
  const [[providerRow]] = await db.query(
    `SELECT COUNT(*) AS total FROM users WHERE role = 'provider'`
  );
  const [[guideRow]] = await db.query(`SELECT COUNT(*) AS total FROM users WHERE role = 'guide'`);

  return [
    { label: "Tổng người dùng", value: toNumber(totalRow?.total).toLocaleString("vi-VN") },
    {
      label: "Khách hàng",
      value: toNumber(customerRow?.total).toLocaleString("vi-VN"),
      badge: "customer"
    },
    {
      label: "Nhà cung cấp",
      value: toNumber(providerRow?.total).toLocaleString("vi-VN"),
      badge: "supplier"
    },
    {
      label: "Hướng dẫn viên",
      value: toNumber(guideRow?.total).toLocaleString("vi-VN"),
      badge: "guide"
    }
  ];
}

export async function listUsers({ page = 1, pageSize = 8, q = "" } = {}) {
  const safePageSize = Math.max(5, Math.min(50, toNumber(pageSize, 8)));
  const safePage = Math.max(1, toNumber(page, 1));
  const keyword = normalizeKeyword(q);

  let where = "";
  const params = [];

  if (keyword) {
    where = `WHERE (u.full_name LIKE ? OR u.email LIKE ? OR u.phone LIKE ?)`;
    const like = `%${keyword}%`;
    params.push(like, like, like);
  }

  const [[countRow]] = await db.query(
    `SELECT COUNT(*) AS total FROM users u ${where}`,
    params
  );
  const total = toNumber(countRow?.total);
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const currentPage = Math.min(safePage, totalPages);
  const offset = (currentPage - 1) * safePageSize;

  const [rows] = await db.query(
    `
    SELECT
      u.id,
      u.full_name,
      u.email,
      u.phone,
      u.role,
      u.is_active,
      u.created_at
    FROM users u
    ${where}
    ORDER BY u.created_at DESC, u.id DESC
    LIMIT ? OFFSET ?
    `,
    [...params, safePageSize, offset]
  );

  const items = (rows || []).map((row) => {
    const role = mapRole(row.role);
    const status = mapStatus(row.is_active);
    return {
      id: toNumber(row.id),
      name: row.full_name || "Chưa có tên",
      email: row.email || "",
      role: role.label,
      roleKey: role.key,
      status: status.label,
      statusKey: status.key,
      is_active: Boolean(row.is_active)
    };
  });

  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + safePageSize, total);

  return {
    users: items,
    paging: {
      page: currentPage,
      pageSize: safePageSize,
      total,
      totalPages,
      text: `Hiển thị ${from}-${to} trong ${total.toLocaleString("vi-VN")} người dùng`,
      pages: buildPages(currentPage, totalPages)
    }
  };
}

export async function setUserActive(userId, isActive) {
  const id = toNumber(userId, 0);
  if (!id) {
    const err = new Error("ID người dùng không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const active = Boolean(isActive);

  await db.query(`UPDATE users SET is_active = ? WHERE id = ?`, [active ? 1 : 0, id]);

  const [[row]] = await db.query(
    `
    SELECT id, full_name, email, role, is_active
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  if (!row) {
    const err = new Error("Không tìm thấy người dùng");
    err.statusCode = 404;
    throw err;
  }

  const role = mapRole(row.role);
  const status = mapStatus(row.is_active);

  return {
    id: toNumber(row.id),
    name: row.full_name || "Chưa có tên",
    email: row.email || "",
    role: role.label,
    roleKey: role.key,
    status: status.label,
    statusKey: status.key,
    is_active: Boolean(row.is_active)
  };
}

export async function createPartnerUser({ full_name, email, password, role } = {}) {
  const name = String(full_name || "").trim();
  let mail = String(email || "").trim();
  // Trim để tránh case user nhập dư khoảng trắng (login.js cũng trim)
  const pass = String(password || "").trim();
  const r = String(role || "").toLowerCase();

  if (!name) {
    const err = new Error("Vui lòng nhập họ tên");
    err.statusCode = 400;
    throw err;
  }
  if (!mail) {
    const err = new Error("Vui lòng nhập email / tên đăng nhập");
    err.statusCode = 400;
    throw err;
  }
  const lowMail = mail.toLowerCase();
  let suffixLen = 0;
  if (lowMail.endsWith("@traveltour.vn")) suffixLen = "@traveltour.vn".length;
  else if (lowMail.endsWith("@gmail.com")) suffixLen = "@gmail.com".length;
  else {
    const err = new Error("Email / tên đăng nhập chỉ được dùng đuôi @gmail.com hoặc @traveltour.vn");
    err.statusCode = 400;
    throw err;
  }
  const localPart = lowMail.slice(0, lowMail.length - suffixLen);
  if (!localPart || localPart.includes("@")) {
    const err = new Error("Email / tên đăng nhập không hợp lệ");
    err.statusCode = 400;
    throw err;
  }
  mail = lowMail;

  if (!pass || pass.length < 4) {
    const err = new Error("Mật khẩu tối thiểu 4 ký tự");
    err.statusCode = 400;
    throw err;
  }
  if (r !== "provider" && r !== "guide") {
    const err = new Error("Role không hợp lệ (chỉ Provider/Guide)");
    err.statusCode = 400;
    throw err;
  }

  const [[exists]] = await db.query(`SELECT id FROM users WHERE email = ? LIMIT 1`, [mail]);
  if (exists?.id) {
    const err = new Error("Tài khoản đã tồn tại");
    err.statusCode = 409;
    throw err;
  }

  const password_hash = await bcrypt.hash(pass, 10);
  const [result] = await db.query(
    `
    INSERT INTO users (email, password_hash, full_name, phone, role, is_active, email_verified, last_login_at)
    VALUES (?, ?, ?, NULL, ?, 1, 1, NULL)
    `,
    [mail, password_hash, name, r]
  );

  // Tạo hồ sơ domain tương ứng để provider/guide không dùng nhầm dữ liệu cũ.
  // Provider: tạo record trong bảng providers gắn với users.id
  if (r === "provider") {
    // best-effort: chỉ insert các field phổ biến; DB có thể tự set created_at/updated_at
    try {
      await db.query(
        `
        INSERT INTO providers (user_id, company_name, email, status)
        VALUES (?, ?, ?, 'approved')
        `,
        [result.insertId, name, mail]
      );
    } catch (e) {
      if (String(e?.sqlMessage || e?.message || "").includes("Unknown column 'email'")) {
        await db.query(
          `
          INSERT INTO providers (user_id, company_name, status)
          VALUES (?, ?, 'approved')
          `,
          [result.insertId, name]
        );
      } else {
        throw e;
      }
    }
  }

  const [[row]] = await db.query(
    `SELECT id, full_name, email, role, is_active, created_at FROM users WHERE id = ? LIMIT 1`,
    [result.insertId]
  );

  return {
    id: toNumber(row?.id),
    name: row?.full_name || name,
    email: row?.email || mail,
    role: row?.role || r,
    is_active: Boolean(row?.is_active)
  };
}

