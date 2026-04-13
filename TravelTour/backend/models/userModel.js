import db from "../config/db.js";

export async function findUserByEmail(email) {
  const [rows] = await db.query(
    `
    SELECT 
      id, email, password_hash, full_name, phone, avatar_url, role,
      is_active, email_verified, last_login_at, created_at
    FROM users
    WHERE email = ?
    LIMIT 1
    `,
    [email]
  );

  return rows[0];
}

export async function createLocalUser(
  fullName,
  email,
  passwordHash,
  phone = null,
  role = "customer"
) {
  const allowedRoles = ["customer", "provider", "guide", "admin"];
  const finalRole = allowedRoles.includes(role) ? role : "customer";

  const [result] = await db.query(
    `
    INSERT INTO users (
      email,
      password_hash,
      full_name,
      phone,
      role,
      is_active,
      email_verified,
      last_login_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL)
    `,
    [email, passwordHash, fullName, phone, finalRole, true, false]
  );

  const [rows] = await db.query(
    `
    SELECT
      id, email, full_name, phone, avatar_url, role,
      is_active, email_verified, last_login_at, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0];
}

export async function createGoogleUser(fullName, email, avatarUrl) {
  const fakePassword = "GOOGLE_NO_PASSWORD";

  const [result] = await db.query(
    `
    INSERT INTO users (
      email,
      password_hash,
      full_name,
      avatar_url,
      role,
      is_active,
      email_verified,
      last_login_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, NOW())
    `,
    [email, fakePassword, fullName, avatarUrl, "customer", true, true]
  );

  const [rows] = await db.query(
    `
    SELECT
      id, email, full_name, phone, avatar_url, role,
      is_active, email_verified, last_login_at, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [result.insertId]
  );

  return rows[0];
}

export async function updateGoogleUser(id, fullName, avatarUrl) {
  await db.query(
    `
    UPDATE users
    SET
      full_name = ?,
      avatar_url = ?,
      email_verified = TRUE,
      last_login_at = NOW()
    WHERE id = ?
    `,
    [fullName, avatarUrl, id]
  );

  const [rows] = await db.query(
    `
    SELECT
      id, email, full_name, phone, avatar_url, role,
      is_active, email_verified, last_login_at, created_at
    FROM users
    WHERE id = ?
    LIMIT 1
    `,
    [id]
  );

  return rows[0];
}

export async function updateLastLogin(id) {
  await db.query(
    `
    UPDATE users
    SET last_login_at = NOW()
    WHERE id = ?
    `,
    [id]
  );
}