import db from "../config/db.js";

export async function getToursByProvider(providerId) {
  const [rows] = await db.query(
    `
    SELECT *
    FROM tours
    WHERE provider_id = ?
    ORDER BY created_at DESC
    `,
    [providerId]
  );
  return rows;
}

export async function createTour(providerId, data) {
  const {
    title,
    slug,
    description,
    location,
    meeting_point,
    latitude,
    longitude,
    base_price,
    duration_days,
    max_capacity,
    thumbnail_url,
    includes,
    excludes,
    status,
    category_id,
    itinerary,
    gallery_images
  } = data;

  const finalStatus = ["draft", "active", "paused", "archived"].includes(status)
    ? status
    : "draft";

  const finalSlug =
    slug ||
    String(title || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-");

  const finalItinerary =
    Array.isArray(itinerary) && itinerary.length > 0
      ? JSON.stringify(itinerary)
      : null;

  const finalIncludes =
    Array.isArray(includes) && includes.length > 0
      ? JSON.stringify(includes)
      : null;

  const finalExcludes =
    Array.isArray(excludes) && excludes.length > 0
      ? JSON.stringify(excludes)
      : null;

  const [result] = await db.query(
    `
    INSERT INTO tours (
      provider_id,
      title,
      slug,
      description,
      itinerary,
      location,
      meeting_point,
      latitude,
      longitude,
      base_price,
      duration_days,
      max_capacity,
      thumbnail_url,
      includes,
      excludes,
      status
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      providerId,
      title || null,
      finalSlug,
      description || null,
      finalItinerary,
      location || null,
      meeting_point || null,
      latitude ?? null,
      longitude ?? null,
      base_price || 0,
      duration_days || 1,
      max_capacity || 1,
      thumbnail_url || null,
      finalIncludes,
      finalExcludes,
      finalStatus
    ]
  );

  const tourId = result.insertId;

  if (category_id) {
    await db.query(
      `INSERT INTO tour_category_map (tour_id, category_id) VALUES (?, ?)`,
      [tourId, category_id]
    );
  }

  const insertedUrls = new Set();

  if (thumbnail_url) {
    await db.query(
      `
      INSERT INTO tour_images (tour_id, image_url, display_order, is_cover)
      VALUES (?, ?, 0, 1)
      `,
      [tourId, thumbnail_url]
    );
    insertedUrls.add(String(thumbnail_url).trim());
  }

  if (Array.isArray(gallery_images) && gallery_images.length > 0) {
    let displayOrder = 1;

    for (const imageUrl of gallery_images) {
      const normalizedUrl = String(imageUrl || "").trim();
      if (!normalizedUrl || insertedUrls.has(normalizedUrl)) {
        continue;
      }

      await db.query(
        `
        INSERT INTO tour_images (tour_id, image_url, display_order, is_cover)
        VALUES (?, ?, ?, 0)
        `,
        [tourId, normalizedUrl, displayOrder]
      );

      insertedUrls.add(normalizedUrl);
      displayOrder += 1;
    }
  }

  return tourId;
}

export async function deleteTour(id) {
  await db.query(`DELETE FROM tours WHERE id = ?`, [id]);
}

export async function updateTourStatus(id, status) {
  await db.query(`UPDATE tours SET status = ? WHERE id = ?`, [status, id]);
}

export async function getBookingsByProvider(providerId) {
  const [rows] = await db.query(
    `
    SELECT b.*
    FROM v_booking_detail b
    JOIN providers p ON b.provider_name = p.company_name
    WHERE p.id = ?
    ORDER BY b.booked_at DESC
    `,
    [providerId]
  );
  return rows;
}

export async function updateBookingStatus(bookingId, status) {
  await db.query(`UPDATE bookings SET status = ? WHERE id = ?`, [status, bookingId]);
}

export async function getGuides(providerId) {
  const [rows] = await db.query(
    `
    SELECT g.*, u.full_name
    FROM guides g
    JOIN users u ON g.user_id = u.id
    WHERE g.provider_id = ?
    `,
    [providerId]
  );
  return rows;
}

export async function assignGuide(bookingId, guideId) {
  await db.query(
    `INSERT INTO guide_assignments (booking_id, guide_id) VALUES (?, ?)`,
    [bookingId, guideId]
  );
}

export async function getProviderProfile(providerId) {
  const [rows] = await db.query(
    `
    SELECT
      p.id,
      p.user_id,
      p.company_name,
      p.description,
      p.address,
      p.website_url,
      p.license_number,
      p.tax_code,
      p.phone,
      p.hotline,
      p.email,
      p.logo_url,
      p.bank_name,
      p.bank_branch,
      p.bank_account_number,
      p.bank_account_name,
      p.status,
      p.created_at,
      p.updated_at,
      u.full_name AS account_name,
      u.email AS account_email
    FROM providers p
    LEFT JOIN users u ON p.user_id = u.id
    WHERE p.id = ?
    LIMIT 1
    `,
    [providerId]
  );

  if (!rows.length) return null;

  const provider = rows[0];

  const [[tourStats]] = await db.query(
    `SELECT COUNT(*) AS total_tours FROM tours WHERE provider_id = ?`,
    [providerId]
  );

  const [[customerStats]] = await db.query(
    `
    SELECT COUNT(DISTINCT b.user_id) AS total_customers
    FROM bookings b
    JOIN tours t ON b.tour_id = t.id
    WHERE t.provider_id = ?
    `,
    [providerId]
  );

  return {
    companyName: provider.company_name || "",
    companyShortName: provider.company_name || "",
    companyDisplayName: provider.company_name || "",
    providerType: "Nhà cung cấp tour du lịch",
    taxCode: provider.tax_code || "",
    businessLicense: provider.license_number || "",
    companyDescription: provider.description || "",
    phone: provider.phone || "",
    hotline: provider.hotline || provider.phone || "",
    contactEmail: provider.email || provider.account_email || "",
    address: provider.address || "",
    website: provider.website_url || "",
    bankName: provider.bank_name || "",
    bankBranch: provider.bank_branch || "",
    bankAccountNumber: provider.bank_account_number || "",
    bankAccountName: provider.bank_account_name || "",
    logoUrl: provider.logo_url || "",
    rating: 4.9,
    totalTours: Number(tourStats?.total_tours || 0),
    totalReviews: 0,
    totalCustomers: Number(customerStats?.total_customers || 0),
    memberSince: provider.created_at || null,
    accountName: provider.account_name || "Provider",
    accountEmail: provider.account_email || provider.email || "",
    certificates: [
      {
        name: "Giấy phép kinh doanh",
        status: provider.license_number ? "Đã xác minh" : "Chưa cập nhật"
      }
    ]
  };
}

export async function updateProviderProfile(providerId, data) {
  const {
    companyName,
    taxCode,
    businessLicense,
    companyDescription,
    phone,
    hotline,
    contactEmail,
    address,
    website,
    bankName,
    bankBranch,
    bankAccountNumber,
    bankAccountName,
    logoUrl
  } = data;

  await db.query(
    `
    UPDATE providers
    SET
      company_name = ?,
      tax_code = ?,
      license_number = ?,
      description = ?,
      phone = ?,
      hotline = ?,
      email = ?,
      address = ?,
      website_url = ?,
      bank_name = ?,
      bank_branch = ?,
      bank_account_number = ?,
      bank_account_name = ?,
      logo_url = ?
    WHERE id = ?
    `,
    [
      companyName || null,
      taxCode || null,
      businessLicense || null,
      companyDescription || null,
      phone || null,
      hotline || null,
      contactEmail || null,
      address || null,
      website || null,
      bankName || null,
      bankBranch || null,
      bankAccountNumber || null,
      bankAccountName || null,
      logoUrl || null,
      providerId
    ]
  );

  return getProviderProfile(providerId);
}

export async function getDashboardDataByProvider(providerId) {
  const [[totalToursRow]] = await db.query(
    `
    SELECT COUNT(*) AS totalTours
    FROM tours
    WHERE provider_id = ?
    `,
    [providerId]
  );

  const [[activeToursRow]] = await db.query(
    `
    SELECT COUNT(*) AS activeTours
    FROM tours
    WHERE provider_id = ?
      AND status = 'active'
    `,
    [providerId]
  );

  const [[bookingsTodayRow]] = await db.query(
    `
    SELECT COUNT(*) AS bookingsToday
    FROM bookings b
    JOIN tours t ON b.tour_id = t.id
    WHERE t.provider_id = ?
      AND DATE(b.booked_at) = CURDATE()
    `,
    [providerId]
  );

  const [[revenueMonthRow]] = await db.query(
    `
    SELECT COALESCE(SUM(t.base_price), 0) AS revenueMonth
    FROM bookings b
    JOIN tours t ON b.tour_id = t.id
    WHERE t.provider_id = ?
      AND b.status IN ('confirmed', 'completed')
      AND MONTH(b.booked_at) = MONTH(CURDATE())
      AND YEAR(b.booked_at) = YEAR(CURDATE())
    `,
    [providerId]
  );

  const [recentBookingsRows] = await db.query(
    `
    SELECT
      b.id,
      u.full_name AS customer_name,
      t.title AS tour_title,
      b.booked_at,
      b.status
    FROM bookings b
    JOIN tours t ON b.tour_id = t.id
    JOIN users u ON b.user_id = u.id
    WHERE t.provider_id = ?
    ORDER BY b.booked_at DESC
    LIMIT 5
    `,
    [providerId]
  );

  const [upcomingToursRows] = await db.query(
    `
    SELECT
      t.id,
      t.title,
      t.location,
      t.duration_days,
      t.max_capacity,
      t.base_price,
      t.created_at
    FROM tours t
    WHERE t.provider_id = ?
      AND t.status = 'active'
    ORDER BY t.created_at DESC
    LIMIT 5
    `,
    [providerId]
  );

  const [bookingTrendRows] = await db.query(
    `
    SELECT
      DATE_FORMAT(b.booked_at, '%Y-%m') AS month_key,
      MONTH(b.booked_at) AS month_number,
      COUNT(*) AS totalBookings
    FROM bookings b
    JOIN tours t ON b.tour_id = t.id
    WHERE t.provider_id = ?
      AND b.booked_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
    GROUP BY DATE_FORMAT(b.booked_at, '%Y-%m'), MONTH(b.booked_at)
    ORDER BY month_key ASC
    `,
    [providerId]
  );

  const [revenueTrendRows] = await db.query(
    `
    SELECT
      DATE_FORMAT(b.booked_at, '%Y-%m') AS month_key,
      MONTH(b.booked_at) AS month_number,
      COALESCE(SUM(t.base_price), 0) AS totalRevenue
    FROM bookings b
    JOIN tours t ON b.tour_id = t.id
    WHERE t.provider_id = ?
      AND b.status IN ('confirmed', 'completed')
      AND b.booked_at >= DATE_SUB(CURDATE(), INTERVAL 5 MONTH)
    GROUP BY DATE_FORMAT(b.booked_at, '%Y-%m'), MONTH(b.booked_at)
    ORDER BY month_key ASC
    `,
    [providerId]
  );

  const monthLabels = [];
  const bookingMap = {};
  const revenueMap = {};

  for (let i = 5; i >= 0; i -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);

    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const label = `T${date.getMonth() + 1}`;

    monthLabels.push({ key: monthKey, label });
  }

  bookingTrendRows.forEach((item) => {
    bookingMap[item.month_key] = Number(item.totalBookings || 0);
  });

  revenueTrendRows.forEach((item) => {
    revenueMap[item.month_key] = Number(item.totalRevenue || 0);
  });

  const bookingChart = monthLabels.map((item) => bookingMap[item.key] || 0);
  const revenueChart = monthLabels.map((item) =>
    Number(((revenueMap[item.key] || 0) / 1000000).toFixed(2))
  );
  const chartLabels = monthLabels.map((item) => item.label);

  const recentBookings = recentBookingsRows.map((item) => ({
    id: item.id,
    customer: item.customer_name || "Khách hàng",
    tour: item.tour_title || "Chưa có tên tour",
    date: item.booked_at,
    status: normalizeBookingStatus(item.status),
    statusClass: getBookingStatusClass(item.status)
  }));

  const upcomingTours = upcomingToursRows.map((item) => ({
    id: item.id,
    name: item.title || "Chưa có tên tour",
    guide: item.location ? `Địa điểm: ${item.location}` : "Chưa có địa điểm",
    date: item.created_at,
    guests: `${item.max_capacity || 0} khách`
  }));

  return {
    stats: {
      totalTours: Number(totalToursRow?.totalTours || 0),
      bookingsToday: Number(bookingsTodayRow?.bookingsToday || 0),
      activeTours: Number(activeToursRow?.activeTours || 0),
      revenueMonth: Number(revenueMonthRow?.revenueMonth || 0)
    },
    charts: {
      labels: chartLabels,
      revenue: revenueChart,
      bookings: bookingChart
    },
    recentBookings,
    upcomingTours
  };
}

function normalizeBookingStatus(status) {
  const value = String(status || "").toLowerCase();
  if (value === "confirmed" || value === "completed") return "Đã xác nhận";
  if (value === "pending") return "Chờ xác nhận";
  if (value === "cancelled") return "Đã hủy";
  return status || "Không xác định";
}

function getBookingStatusClass(status) {
  const value = String(status || "").toLowerCase();
  if (value === "confirmed" || value === "completed") return "confirmed";
  if (value === "pending") return "pending";
  if (value === "cancelled") return "cancelled";
  return "pending";
}

export async function getPublicFeaturedTours(limit = 6) {
  const [rows] = await db.query(
    `
    SELECT
      t.id,
      t.title,
      t.slug,
      t.description,
      t.location,
      t.meeting_point,
      t.latitude,
      t.longitude,
      t.base_price,
      t.duration_days,
      t.max_capacity,
      t.thumbnail_url,
      t.status,
      t.created_at,
      p.company_name AS provider_name
    FROM tours t
    LEFT JOIN providers p ON t.provider_id = p.id
    WHERE t.status = 'active'
    ORDER BY t.created_at DESC
    LIMIT ?
    `,
    [Number(limit)]
  );

  return rows;
}

export async function getPublicTours(filters = {}) {
  const { destination = "", limit = 20 } = filters;

  let sql = `
    SELECT
      t.id,
      t.title,
      t.slug,
      t.description,
      t.location,
      t.meeting_point,
      t.latitude,
      t.longitude,
      t.base_price,
      t.duration_days,
      t.max_capacity,
      t.thumbnail_url,
      t.status,
      t.created_at,
      p.company_name AS provider_name
    FROM tours t
    LEFT JOIN providers p ON t.provider_id = p.id
    WHERE t.status = 'active'
  `;

  const params = [];

  if (destination) {
    sql += ` AND t.location LIKE ? `;
    params.push(`%${destination}%`);
  }

  sql += `
    ORDER BY t.created_at DESC
    LIMIT ?
  `;
  params.push(Number(limit));

  const [rows] = await db.query(sql, params);
  return rows;
}

export async function getPublicTourById(tourId) {
  const [rows] = await db.query(
    `
    SELECT
      t.id,
      t.title,
      t.slug,
      t.description,
      t.location,
      t.meeting_point,
      t.latitude,
      t.longitude,
      t.base_price,
      t.duration_days,
      t.max_capacity,
      t.thumbnail_url,
      t.includes,
      t.excludes,
      t.itinerary,
      t.status,
      t.created_at,
      p.company_name AS provider_name
    FROM tours t
    LEFT JOIN providers p ON t.provider_id = p.id
    WHERE t.id = ?
      AND t.status = 'active'
    LIMIT 1
    `,
    [tourId]
  );

  if (!rows.length) return null;

  const tour = rows[0];

  const [imageRows] = await db.query(
    `
    SELECT image_url, is_cover, display_order
    FROM tour_images
    WHERE tour_id = ?
    ORDER BY is_cover DESC, display_order ASC, id ASC
    `,
    [tourId]
  );

  return {
    ...tour,
    images: imageRows || []
  };
}