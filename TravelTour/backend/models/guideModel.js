import db from "../config/db.js";

export async function getGuideDashboardData(guideId) {
  const [[activeToursRow]] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM tours
    WHERE guide_id = ?
      AND status IN ('active', 'paused', 'full')
    `,
    [guideId]
  );

  const [[completedToursRow]] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM tours
    WHERE guide_id = ?
      AND status = 'archived'
    `,
    [guideId]
  );

  const [[customersRow]] = await db.query(
    `
    SELECT COALESCE(SUM(max_capacity), 0) AS total
    FROM tours
    WHERE guide_id = ?
      AND status IN ('active', 'paused', 'full', 'archived')
    `,
    [guideId]
  );

  const [[incomeRow]] = await db.query(
    `
    SELECT COALESCE(SUM(final_price), 0) AS total
    FROM tours
    WHERE guide_id = ?
      AND start_date IS NOT NULL
      AND MONTH(start_date) = MONTH(CURDATE())
      AND YEAR(start_date) = YEAR(CURDATE())
      AND status = 'archived'
    `,
    [guideId]
  );

  const [upcomingTours] = await db.query(
    `
    SELECT
      id,
      title,
      start_date,
      max_capacity,
      status,
      location
    FROM tours
    WHERE guide_id = ?
      AND start_date IS NOT NULL
      AND start_date >= CURDATE()
      AND status IN ('active', 'paused', 'full')
    ORDER BY start_date ASC
    LIMIT 10
    `,
    [guideId]
  );

  return {
    stats: {
      activeTours: Number(activeToursRow?.total || 0),
      totalCustomers: Number(customersRow?.total || 0),
      monthlyIncome: Number(incomeRow?.total || 0),
      completedTours: Number(completedToursRow?.total || 0)
    },
    upcomingTours
  };
}

export async function getGuideSchedules(guideId, filter = "all") {
  let sql = `
    SELECT
      t.id,
      t.title,
      t.location,
      t.start_date,
      t.end_date,
      t.status,
      t.max_capacity
    FROM tours t
    WHERE t.guide_id = ?
  `;

  const params = [guideId];

  if (filter === "upcoming") {
    sql += `
      AND t.start_date IS NOT NULL
      AND DATE(t.start_date) > CURDATE()
      AND t.status IN ('active', 'paused', 'full')
    `;
  }

  if (filter === "running") {
    sql += `
      AND t.start_date IS NOT NULL
      AND t.end_date IS NOT NULL
      AND CURDATE() BETWEEN DATE(t.start_date) AND DATE(t.end_date)
      AND t.status IN ('active', 'paused', 'full')
    `;
  }

  if (filter === "done") {
    sql += `
      AND (
        t.status = 'archived'
        OR (t.end_date IS NOT NULL AND DATE(t.end_date) < CURDATE())
      )
    `;
  }

  sql += `
    ORDER BY
      CASE WHEN t.start_date IS NULL THEN 1 ELSE 0 END,
      t.start_date ASC,
      t.id DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
}

export async function getCurrentToursByGuide(guideId, keyword = "") {
  let sql = `
    SELECT
      t.id,
      t.title,
      t.location,
      t.start_date,
      t.end_date,
      t.duration_text,
      t.max_capacity,
      t.status
    FROM tours t
    WHERE t.guide_id = ?
      AND t.status IN ('active', 'paused', 'full')
  `;

  const params = [guideId];

  if (keyword && String(keyword).trim() !== "") {
    sql += `
      AND (
        t.title LIKE ?
        OR t.location LIKE ?
        OR t.duration_text LIKE ?
      )
    `;
    const likeKeyword = `%${String(keyword).trim()}%`;
    params.push(likeKeyword, likeKeyword, likeKeyword);
  }

  sql += `
    ORDER BY
      CASE WHEN t.start_date IS NULL THEN 1 ELSE 0 END,
      t.start_date ASC,
      t.id DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
}

export async function getGuideCustomers(guideId, keyword = "", tourFilter = "all") {
  let sql = `
    SELECT
      b.id,
      u.full_name AS customer_name,
      u.phone,
      u.email,
      t.title AS tour_name,
      t.start_date AS tour_date
    FROM bookings b
    JOIN tours t ON t.id = b.tour_id
    JOIN users u ON u.id = b.user_id
    WHERE t.guide_id = ?
  `;

  const params = [guideId];

  if (keyword && String(keyword).trim() !== "") {
    sql += `
      AND (
        u.full_name LIKE ?
        OR u.phone LIKE ?
        OR u.email LIKE ?
        OR t.title LIKE ?
      )
    `;
    const likeKeyword = `%${String(keyword).trim()}%`;
    params.push(likeKeyword, likeKeyword, likeKeyword, likeKeyword);
  }

  if (tourFilter && tourFilter !== "all") {
    sql += ` AND t.title LIKE ? `;
    params.push(`%${String(tourFilter).trim()}%`);
  }

  sql += `
    ORDER BY
      CASE WHEN t.start_date IS NULL THEN 1 ELSE 0 END,
      t.start_date ASC,
      b.id DESC
  `;

  const [rows] = await db.query(sql, params);
  return rows;
}

export async function getGuideIncomeData(guideId, monthRange = 6) {
  const safeMonthRange = [3, 6, 12].includes(Number(monthRange))
    ? Number(monthRange)
    : 6;

  const [[totalIncomeRow]] = await db.query(
    `
    SELECT COALESCE(SUM(COALESCE(final_price, 0)), 0) AS total
    FROM tours
    WHERE guide_id = ?
      AND status = 'archived'
    `,
    [guideId]
  );

  const [[monthIncomeRow]] = await db.query(
    `
    SELECT COALESCE(SUM(COALESCE(final_price, 0)), 0) AS total
    FROM tours
    WHERE guide_id = ?
      AND start_date IS NOT NULL
      AND MONTH(start_date) = MONTH(CURDATE())
      AND YEAR(start_date) = YEAR(CURDATE())
      AND status = 'archived'
    `,
    [guideId]
  );

  const [[completedToursRow]] = await db.query(
    `
    SELECT COUNT(*) AS total
    FROM tours
    WHERE guide_id = ?
      AND status = 'archived'
    `,
    [guideId]
  );

  const [[avgIncomeRow]] = await db.query(
    `
    SELECT COALESCE(AVG(COALESCE(final_price, 0)), 0) AS avg_income
    FROM tours
    WHERE guide_id = ?
      AND start_date IS NOT NULL
      AND start_date >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      AND status = 'archived'
    `,
    [guideId]
  );

  const [monthlyRows] = await db.query(
    `
    SELECT
      YEAR(start_date) AS year_number,
      MONTH(start_date) AS month_number,
      CONCAT(
        LPAD(MONTH(start_date), 2, '0'),
        '/',
        YEAR(start_date)
      ) AS month_key,
      COALESCE(SUM(COALESCE(final_price, 0)), 0) AS income
    FROM tours
    WHERE guide_id = ?
      AND start_date IS NOT NULL
      AND start_date >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      AND status = 'archived'
    GROUP BY YEAR(start_date), MONTH(start_date)
    ORDER BY YEAR(start_date) ASC, MONTH(start_date) ASC
    `,
    [guideId, safeMonthRange]
  );

  const [recentTransactions] = await db.query(
    `
    SELECT
      id,
      title,
      start_date,
      final_price,
      status
    FROM tours
    WHERE guide_id = ?
      AND status = 'archived'
    ORDER BY start_date DESC, id DESC
    LIMIT 10
    `,
    [guideId]
  );

  return {
    stats: {
      totalIncome: Number(totalIncomeRow?.total || 0),
      monthlyIncome: Number(monthIncomeRow?.total || 0),
      averageIncomePerTour: Number(avgIncomeRow?.avg_income || 0),
      completedTours: Number(completedToursRow?.total || 0)
    },
    monthlyIncome: monthlyRows.map((row) => ({
      monthKey: row.month_key,
      monthNumber: Number(row.month_number),
      yearNumber: Number(row.year_number),
      income: Number(row.income || 0)
    })),
    recentTransactions: recentTransactions.map((row) => ({
      id: Number(row.id),
      tour: row.title || "Chưa có tên tour",
      date: row.start_date || null,
      amount: Number(row.final_price || 0),
      status: row.status || ""
    }))
  };
}
export async function getGuideProfileData(guideId) {
  const [[guideRow]] = await db.query(
    `
    SELECT
      g.id,
      g.provider_id,
      g.user_id,
      g.experience_years,
      g.languages,
      g.rating_avg,
      g.bio,
      g.certification,
      g.specialty,
      u.full_name,
      u.email,
      u.phone
    FROM guides g
    JOIN users u ON u.id = g.user_id
    WHERE g.id = ?
    LIMIT 1
    `,
    [guideId]
  );

  if (!guideRow) return null;

  const [[tourCountRow]] = await db.query(
    `SELECT COUNT(*) AS total FROM tours WHERE guide_id = ?`,
    [guideId]
  );

  const [[completedRow]] = await db.query(
    `SELECT COUNT(*) AS total FROM tours WHERE guide_id = ? AND status = 'archived'`,
    [guideId]
  );

  // parse languages
  const languages = guideRow.languages
    ? guideRow.languages.split(",").map((l) => ({
        name: l.trim(),
        level: "Chưa cập nhật"
      }))
    : [];

  // parse specialties
  const specialties = guideRow.specialty
    ? guideRow.specialty.split(",").map((s) => s.trim())
    : [];

  // parse certificates
  const certificates = guideRow.certification
    ? guideRow.certification.split(",").map((c) => c.trim())
    : [];

  return {
    id: guideRow.id,
    fullName: guideRow.full_name,
    email: guideRow.email,
    phone: guideRow.phone,
    address: "Chưa cập nhật",
    birthDate: null,
    avatarUrl: "",
    role: "Hướng dẫn viên du lịch",
    badgeText: "Hướng dẫn viên chuyên nghiệp",
    rating: Number(guideRow.rating_avg || 0),
    reviewCount: guideRow.rating_count || 0,
    experienceYears: Number(guideRow.experience_years || 0),
    bio: guideRow.bio || "",
    certificates,
    specialties,
    languages,
    stats: {
      totalTours: Number(tourCountRow?.total || 0),
      averageRating: Number(guideRow.rating_avg || 0),
      experienceYears: Number(guideRow.experience_years || 0),
      satisfactionRate: 98,
      completedTours: Number(completedRow?.total || 0)
    }
  };
}