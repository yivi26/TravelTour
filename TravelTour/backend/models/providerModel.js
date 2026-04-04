import db from "../config/db.js";

function safeJsonParse(value, fallback = []) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function createSlug(text = "") {
  return String(text)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function isTourCodeExists(providerId, code, excludeId = null) {
  if (!code) return false;

  let sql = `
    SELECT id
    FROM tours
    WHERE provider_id = ?
      AND code = ?
  `;
  const params = [providerId, code];

  if (excludeId) {
    sql += ` AND id <> ? `;
    params.push(excludeId);
  }

  sql += ` LIMIT 1 `;

  const [rows] = await db.query(sql, params);
  return rows.length > 0;
}

async function isTourSlugExists(providerId, slug, excludeId = null) {
  if (!slug) return false;

  let sql = `
    SELECT id
    FROM tours
    WHERE provider_id = ?
      AND slug = ?
  `;
  const params = [providerId, slug];

  if (excludeId) {
    sql += ` AND id <> ? `;
    params.push(excludeId);
  }

  sql += ` LIMIT 1 `;

  const [rows] = await db.query(sql, params);
  return rows.length > 0;
}

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

export async function getTourById(providerId, id) {
  const [rows] = await db.query(
    `
    SELECT t.*
    FROM tours t
    WHERE t.provider_id = ?
      AND t.id = ?
    LIMIT 1
    `,
    [providerId, id]
  );

  if (!rows.length) return null;

  const tour = rows[0];

  const [categoryRows] = await db.query(
    `
    SELECT category_id
    FROM tour_category_map
    WHERE tour_id = ?
    LIMIT 1
    `,
    [id]
  );

  const [imageRows] = await db.query(
    `
    SELECT image_url, is_cover, display_order
    FROM tour_images
    WHERE tour_id = ?
    ORDER BY is_cover DESC, display_order ASC, id ASC
    `,
    [id]
  );

  const coverImage = imageRows.find(item => Number(item.is_cover) === 1) || null;
  const galleryImages = imageRows
    .filter(item => Number(item.is_cover) !== 1)
    .map(item => item.image_url);

  return {
    ...tour,
    category_id: categoryRows.length ? Number(categoryRows[0].category_id) : null,
    short_description: tour.description || "",
    hotel_info: tour.hotel_info || "",
    transport_info: tour.transport_info || "",
    cancel_policy: tour.cancel_policy || "",
    terms_conditions: tour.terms_conditions || "",
    other_notes: tour.other_notes || "",
    highlights: safeJsonParse(tour.highlights, []),
    includes: safeJsonParse(tour.includes, []),
    excludes: safeJsonParse(tour.excludes, []),
    itinerary: safeJsonParse(tour.itinerary, []),
    thumbnail_url: coverImage ? coverImage.image_url : tour.thumbnail_url || null,
    gallery_images: galleryImages
  };
}

export async function createTour(providerId, data) {
  const {
    title,
    slug,
    description,
    short_description,
    location,
    meeting_point,
    latitude,
    longitude,
    base_price,
    sale_price,
    duration_days,
    duration_text,
    max_capacity,
    thumbnail_url,
    includes,
    excludes,
    status,
    category_id,
    itinerary,
    gallery_images,
    highlights,
    start_date,
    end_date,
    code,
    hotel_info,
    transport_info,
    cancel_policy,
    terms_conditions,
    other_notes
  } = data;

  const finalStatus = ["draft", "active", "paused", "archived", "full"].includes(status)
    ? status
    : "draft";

  let finalSlug = slug || createSlug(title);
  if (!finalSlug) {
    finalSlug = `tour-${Date.now()}`;
  }

  if (await isTourCodeExists(providerId, code)) {
    throw new Error("Mã tour đã tồn tại");
  }

  if (await isTourSlugExists(providerId, finalSlug)) {
    finalSlug = `${finalSlug}-${Date.now()}`;
  }

  const finalItinerary =
    Array.isArray(itinerary) && itinerary.length > 0 ? JSON.stringify(itinerary) : null;

  const finalIncludes =
    Array.isArray(includes) && includes.length > 0 ? JSON.stringify(includes) : null;

  const finalExcludes =
    Array.isArray(excludes) && excludes.length > 0 ? JSON.stringify(excludes) : null;

  const finalHighlights =
    Array.isArray(highlights) && highlights.length > 0 ? JSON.stringify(highlights) : null;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `
      INSERT INTO tours (
        provider_id,
        title,
        slug,
        code,
        description,
        highlights,
        itinerary,
        location,
        meeting_point,
        latitude,
        longitude,
        base_price,
        sale_price,
        duration_days,
        duration_text,
        max_capacity,
        thumbnail_url,
        includes,
        excludes,
        start_date,
        end_date,
        hotel_info,
        transport_info,
        cancel_policy,
        terms_conditions,
        other_notes,
        status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        providerId,
        title || null,
        finalSlug,
        code || null,
        short_description || description || null,
        finalHighlights,
        finalItinerary,
        location || null,
        meeting_point || null,
        latitude ?? null,
        longitude ?? null,
        base_price || 0,
        sale_price || 0,
        duration_days || 1,
        duration_text || null,
        max_capacity || 1,
        thumbnail_url || null,
        finalIncludes,
        finalExcludes,
        start_date || null,
        end_date || null,
        hotel_info || null,
        transport_info || null,
        cancel_policy || null,
        terms_conditions || null,
        other_notes || null,
        finalStatus
      ]
    );

    const tourId = result.insertId;

    if (category_id) {
      await conn.query(
        `INSERT INTO tour_category_map (tour_id, category_id) VALUES (?, ?)`,
        [tourId, category_id]
      );
    }

    const insertedUrls = new Set();

    if (thumbnail_url) {
      const normalizedCover = String(thumbnail_url).trim();
      await conn.query(
        `
        INSERT INTO tour_images (tour_id, image_url, display_order, is_cover)
        VALUES (?, ?, 0, 1)
        `,
        [tourId, normalizedCover]
      );
      insertedUrls.add(normalizedCover);
    }

    if (Array.isArray(gallery_images) && gallery_images.length > 0) {
      let displayOrder = 1;

      for (const imageUrl of gallery_images) {
        const normalizedUrl = String(imageUrl || "").trim();
        if (!normalizedUrl || insertedUrls.has(normalizedUrl)) continue;

        await conn.query(
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

    await conn.commit();
    return tourId;
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function updateTour(providerId, id, data) {
  const {
    title,
    slug,
    description,
    short_description,
    location,
    meeting_point,
    latitude,
    longitude,
    base_price,
    sale_price,
    duration_days,
    duration_text,
    max_capacity,
    thumbnail_url,
    includes,
    excludes,
    status,
    category_id,
    itinerary,
    gallery_images,
    highlights,
    start_date,
    end_date,
    code,
    hotel_info,
    transport_info,
    cancel_policy,
    terms_conditions,
    other_notes
  } = data;

  const finalStatus = ["draft", "active", "paused", "archived", "full"].includes(status)
    ? status
    : "draft";

  let finalSlug = slug || createSlug(title);
  if (!finalSlug) {
    finalSlug = `tour-${id}`;
  }

  if (await isTourCodeExists(providerId, code, id)) {
    throw new Error("Mã tour đã tồn tại");
  }

  if (await isTourSlugExists(providerId, finalSlug, id)) {
    finalSlug = `${finalSlug}-${id}`;
  }

  const finalItinerary =
    Array.isArray(itinerary) && itinerary.length > 0 ? JSON.stringify(itinerary) : null;

  const finalIncludes =
    Array.isArray(includes) && includes.length > 0 ? JSON.stringify(includes) : null;

  const finalExcludes =
    Array.isArray(excludes) && excludes.length > 0 ? JSON.stringify(excludes) : null;

  const finalHighlights =
    Array.isArray(highlights) && highlights.length > 0 ? JSON.stringify(highlights) : null;

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    await conn.query(
      `
      UPDATE tours
      SET
        title = ?,
        slug = ?,
        code = ?,
        description = ?,
        highlights = ?,
        itinerary = ?,
        location = ?,
        meeting_point = ?,
        latitude = ?,
        longitude = ?,
        base_price = ?,
        sale_price = ?,
        duration_days = ?,
        duration_text = ?,
        max_capacity = ?,
        thumbnail_url = ?,
        includes = ?,
        excludes = ?,
        start_date = ?,
        end_date = ?,
        hotel_info = ?,
        transport_info = ?,
        cancel_policy = ?,
        terms_conditions = ?,
        other_notes = ?,
        status = ?
      WHERE provider_id = ?
        AND id = ?
      `,
      [
        title || null,
        finalSlug,
        code || null,
        short_description || description || null,
        finalHighlights,
        finalItinerary,
        location || null,
        meeting_point || null,
        latitude ?? null,
        longitude ?? null,
        base_price || 0,
        sale_price || 0,
        duration_days || 1,
        duration_text || null,
        max_capacity || 1,
        thumbnail_url || null,
        finalIncludes,
        finalExcludes,
        start_date || null,
        end_date || null,
        hotel_info || null,
        transport_info || null,
        cancel_policy || null,
        terms_conditions || null,
        other_notes || null,
        finalStatus,
        providerId,
        id
      ]
    );

    await conn.query(`DELETE FROM tour_category_map WHERE tour_id = ?`, [id]);

    if (category_id) {
      await conn.query(
        `INSERT INTO tour_category_map (tour_id, category_id) VALUES (?, ?)`,
        [id, category_id]
      );
    }

    await conn.query(`DELETE FROM tour_images WHERE tour_id = ?`, [id]);

    const insertedUrls = new Set();

    if (thumbnail_url) {
      const normalizedCover = String(thumbnail_url).trim();

      await conn.query(
        `
        INSERT INTO tour_images (tour_id, image_url, display_order, is_cover)
        VALUES (?, ?, 0, 1)
        `,
        [id, normalizedCover]
      );

      insertedUrls.add(normalizedCover);
    }

    if (Array.isArray(gallery_images) && gallery_images.length > 0) {
      let displayOrder = 1;

      for (const imageUrl of gallery_images) {
        const normalizedUrl = String(imageUrl || "").trim();
        if (!normalizedUrl || insertedUrls.has(normalizedUrl)) continue;

        await conn.query(
          `
          INSERT INTO tour_images (tour_id, image_url, display_order, is_cover)
          VALUES (?, ?, ?, 0)
          `,
          [id, normalizedUrl, displayOrder]
        );

        insertedUrls.add(normalizedUrl);
        displayOrder += 1;
      }
    }

    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
}

export async function deleteTour(id) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(`DELETE FROM tour_images WHERE tour_id = ?`, [id]);
    await conn.query(`DELETE FROM tour_category_map WHERE tour_id = ?`, [id]);
    await conn.query(`DELETE FROM tours WHERE id = ?`, [id]);
    await conn.commit();
  } catch (error) {
    await conn.rollback();
    throw error;
  } finally {
    conn.release();
  }
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

/* Các hàm dashboard + public tours giữ nguyên nếu đang chạy ổn */
export async function getDashboardDataByProvider(providerId) {
  const [[totalToursRow]] = await db.query(
    `SELECT COUNT(*) AS totalTours FROM tours WHERE provider_id = ?`,
    [providerId]
  );

  const [[activeToursRow]] = await db.query(
    `SELECT COUNT(*) AS activeTours FROM tours WHERE provider_id = ? AND status = 'active'`,
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

  return {
    stats: {
      totalTours: Number(totalToursRow?.totalTours || 0),
      bookingsToday: Number(bookingsTodayRow?.bookingsToday || 0),
      activeTours: Number(activeToursRow?.activeTours || 0),
      revenueMonth: Number(revenueMonthRow?.revenueMonth || 0)
    }
  };
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

  sql += ` ORDER BY t.created_at DESC LIMIT ? `;
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