-- =========================================
-- TravelTour - Clean Database Schema
-- Database: traveltour
-- Description: Hệ thống quản lý tour du lịch sinh thái
-- =========================================

CREATE DATABASE IF NOT EXISTS traveltour
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE traveltour;

-- =========================================
-- Xóa view trước
-- =========================================
DROP VIEW IF EXISTS v_booking_detail;
DROP VIEW IF EXISTS v_guide_schedule;
DROP VIEW IF EXISTS v_provider_revenue;
DROP VIEW IF EXISTS v_tour_summary;

-- =========================================
-- Xóa bảng theo thứ tự phụ thuộc
-- =========================================
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS voice_search_logs;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS wishlists;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS guide_assignments;
DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS promotions;
DROP TABLE IF EXISTS tour_images;
DROP TABLE IF EXISTS tour_category_map;
DROP TABLE IF EXISTS tour_schedules;
DROP TABLE IF EXISTS tours;
DROP TABLE IF EXISTS guides;
DROP TABLE IF EXISTS tour_categories;
DROP TABLE IF EXISTS providers;
DROP TABLE IF EXISTS users;

-- =========================================
-- 1. Người dùng
-- =========================================
CREATE TABLE users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  email VARCHAR(191) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  avatar_url VARCHAR(500) DEFAULT NULL,
  role ENUM('customer', 'provider', 'guide', 'admin') NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  last_login_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_users_email (email),
  KEY idx_users_role (role),
  KEY idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tài khoản người dùng';

-- =========================================
-- 2. Nhà cung cấp
-- =========================================
CREATE TABLE providers (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  company_name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT NULL,
  address VARCHAR(300) DEFAULT NULL,
  website_url VARCHAR(300) DEFAULT NULL,
  license_number VARCHAR(100) DEFAULT NULL,
  tax_code VARCHAR(50) DEFAULT NULL,
  status ENUM('pending', 'approved', 'suspended') NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_providers_user_id (user_id),
  KEY idx_providers_status (status),
  CONSTRAINT fk_providers_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thông tin nhà cung cấp tour';

-- =========================================
-- 3. Hướng dẫn viên
-- =========================================
CREATE TABLE guides (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  provider_id INT UNSIGNED NOT NULL,
  bio TEXT DEFAULT NULL,
  specialty VARCHAR(200) DEFAULT NULL,
  languages VARCHAR(200) DEFAULT NULL,
  experience_years TINYINT UNSIGNED NOT NULL DEFAULT 0,
  certification VARCHAR(300) DEFAULT NULL,
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  status ENUM('active', 'inactive', 'on_leave') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_guides_user_id (user_id),
  KEY idx_guides_provider_id (provider_id),
  KEY idx_guides_status (status),
  CONSTRAINT fk_guides_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_guides_provider
    FOREIGN KEY (provider_id) REFERENCES providers(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thông tin hướng dẫn viên';

-- =========================================
-- 4. Danh mục tour
-- =========================================
CREATE TABLE tour_categories (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(120) NOT NULL,
  description TEXT DEFAULT NULL,
  icon_url VARCHAR(300) DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tour_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Danh mục tour';

-- =========================================
-- 5. Tour
-- =========================================
CREATE TABLE tours (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  description TEXT DEFAULT NULL,
  itinerary LONGTEXT DEFAULT NULL,
  location VARCHAR(200) NOT NULL,
  province VARCHAR(100) DEFAULT NULL,
  latitude DECIMAL(10,7) DEFAULT NULL,
  longitude DECIMAL(10,7) DEFAULT NULL,
  base_price DECIMAL(14,0) NOT NULL DEFAULT 0,
  duration_days SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  duration_nights SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  min_participants SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  max_capacity SMALLINT UNSIGNED NOT NULL DEFAULT 20,
  thumbnail_url VARCHAR(500) DEFAULT NULL,
  difficulty_level ENUM('easy', 'moderate', 'challenging') NOT NULL DEFAULT 'easy',
  eco_score DECIMAL(3,1) NOT NULL DEFAULT 0.0,
  language VARCHAR(50) DEFAULT 'Vietnamese',
  includes TEXT DEFAULT NULL,
  excludes TEXT DEFAULT NULL,
  status ENUM('draft', 'active', 'paused', 'archived') NOT NULL DEFAULT 'draft',
  total_bookings INT UNSIGNED NOT NULL DEFAULT 0,
  rating_avg DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  rating_count INT UNSIGNED NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_tours_slug (slug),
  KEY idx_tours_provider_id (provider_id),
  KEY idx_tours_status (status),
  KEY idx_tours_province (province),
  KEY idx_tours_eco_score (eco_score),
  KEY idx_tours_base_price (base_price),
  FULLTEXT KEY ft_tours_search (title, description, location),
  CONSTRAINT fk_tours_provider
    FOREIGN KEY (provider_id) REFERENCES providers(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thông tin tour';

-- =========================================
-- 6. Mapping tour - danh mục
-- =========================================
CREATE TABLE tour_category_map (
  tour_id INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (tour_id, category_id),
  KEY idx_tour_category_map_category_id (category_id),
  CONSTRAINT fk_tour_category_map_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_tour_category_map_category
    FOREIGN KEY (category_id) REFERENCES tour_categories(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Liên kết tour và danh mục';

-- =========================================
-- 7. Ảnh tour
-- =========================================
CREATE TABLE tour_images (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tour_id INT UNSIGNED NOT NULL,
  image_url VARCHAR(500) NOT NULL,
  caption VARCHAR(200) DEFAULT NULL,
  display_order TINYINT UNSIGNED NOT NULL DEFAULT 0,
  is_cover BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (id),
  KEY idx_tour_images_tour_id (tour_id),
  CONSTRAINT fk_tour_images_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Ảnh minh họa tour';

-- =========================================
-- 8. Lịch khởi hành
-- =========================================
CREATE TABLE tour_schedules (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  tour_id INT UNSIGNED NOT NULL,
  departure_date DATE NOT NULL,
  return_date DATE NOT NULL,
  available_slots SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  booked_slots SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  price_override DECIMAL(14,0) DEFAULT NULL,
  note VARCHAR(300) DEFAULT NULL,
  status ENUM('open', 'full', 'cancelled', 'completed') NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_tour_schedules_tour_id (tour_id),
  KEY idx_tour_schedules_departure_date (departure_date),
  KEY idx_tour_schedules_status (status),
  CONSTRAINT fk_tour_schedules_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE CASCADE,
  CONSTRAINT chk_tour_schedules_date_range
    CHECK (return_date >= departure_date),
  CONSTRAINT chk_tour_schedules_slots
    CHECK (booked_slots <= available_slots)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lịch khởi hành của tour';

-- =========================================
-- 9. Đặt tour
-- =========================================
CREATE TABLE bookings (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  tour_id INT UNSIGNED NOT NULL,
  schedule_id INT UNSIGNED NOT NULL,
  booking_code VARCHAR(20) NOT NULL,
  num_adults SMALLINT UNSIGNED NOT NULL DEFAULT 1,
  num_children SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  num_infants SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  total_price DECIMAL(14,0) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(14,0) NOT NULL DEFAULT 0,
  final_price DECIMAL(14,0) NOT NULL DEFAULT 0,
  status ENUM('pending', 'confirmed', 'paid', 'in_progress', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',
  contact_name VARCHAR(100) DEFAULT NULL,
  contact_phone VARCHAR(20) DEFAULT NULL,
  contact_email VARCHAR(191) DEFAULT NULL,
  special_requests TEXT DEFAULT NULL,
  cancelled_reason TEXT DEFAULT NULL,
  cancelled_at TIMESTAMP NULL DEFAULT NULL,
  booked_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_bookings_code (booking_code),
  KEY idx_bookings_user_id (user_id),
  KEY idx_bookings_tour_id (tour_id),
  KEY idx_bookings_schedule_id (schedule_id),
  KEY idx_bookings_status (status),
  CONSTRAINT fk_bookings_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_bookings_schedule
    FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thông tin đặt tour';

-- =========================================
-- 10. Phân công hướng dẫn viên
-- =========================================
CREATE TABLE guide_assignments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id INT UNSIGNED NOT NULL,
  guide_id INT UNSIGNED NOT NULL,
  participation_status ENUM('assigned', 'confirmed', 'on_tour', 'completed', 'cancelled') NOT NULL DEFAULT 'assigned',
  note TEXT DEFAULT NULL,
  assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_guide_assignments_booking_id (booking_id),
  KEY idx_guide_assignments_guide_id (guide_id),
  KEY idx_guide_assignments_status (participation_status),
  CONSTRAINT fk_guide_assignments_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_guide_assignments_guide
    FOREIGN KEY (guide_id) REFERENCES guides(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Phân công hướng dẫn viên';

-- =========================================
-- 11. Thanh toán
-- =========================================
CREATE TABLE payments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id INT UNSIGNED NOT NULL,
  amount DECIMAL(14,0) NOT NULL,
  currency VARCHAR(10) NOT NULL DEFAULT 'VND',
  payment_method ENUM('bank_transfer', 'credit_card', 'momo', 'zalopay', 'vnpay', 'cash', 'other') NOT NULL DEFAULT 'bank_transfer',
  status ENUM('pending', 'success', 'failed', 'refunded') NOT NULL DEFAULT 'pending',
  transaction_id VARCHAR(200) DEFAULT NULL,
  gateway VARCHAR(50) DEFAULT NULL,
  gateway_response TEXT DEFAULT NULL,
  refund_amount DECIMAL(14,0) DEFAULT NULL,
  refund_reason TEXT DEFAULT NULL,
  paid_at TIMESTAMP NULL DEFAULT NULL,
  refunded_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_payments_booking_id (booking_id),
  KEY idx_payments_status (status),
  KEY idx_payments_transaction_id (transaction_id),
  CONSTRAINT fk_payments_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lịch sử thanh toán';

-- =========================================
-- 12. Khuyến mãi
-- =========================================
CREATE TABLE promotions (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider_id INT UNSIGNED DEFAULT NULL,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(150) NOT NULL,
  description TEXT DEFAULT NULL,
  discount_type ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
  discount_value DECIMAL(10,2) NOT NULL,
  min_order_value DECIMAL(14,0) NOT NULL DEFAULT 0,
  max_uses INT DEFAULT NULL,
  used_count INT NOT NULL DEFAULT 0,
  max_per_user TINYINT UNSIGNED NOT NULL DEFAULT 1,
  applicable_to ENUM('all', 'specific_tour') NOT NULL DEFAULT 'all',
  tour_id INT UNSIGNED DEFAULT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  starts_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_promotions_code (code),
  KEY idx_promotions_provider_id (provider_id),
  KEY idx_promotions_tour_id (tour_id),
  KEY idx_promotions_is_active (is_active),
  KEY idx_promotions_expires_at (expires_at),
  CONSTRAINT fk_promotions_provider
    FOREIGN KEY (provider_id) REFERENCES providers(id)
    ON DELETE SET NULL,
  CONSTRAINT fk_promotions_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Mã giảm giá';

-- =========================================
-- 13. Đánh giá
-- =========================================
CREATE TABLE reviews (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  booking_id INT UNSIGNED NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  tour_id INT UNSIGNED NOT NULL,
  rating TINYINT NOT NULL,
  title VARCHAR(200) DEFAULT NULL,
  comment TEXT DEFAULT NULL,
  photos JSON DEFAULT NULL,
  guide_rating TINYINT DEFAULT NULL,
  status ENUM('pending', 'approved', 'rejected', 'hidden') NOT NULL DEFAULT 'pending',
  admin_note TEXT DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_reviews_booking_id (booking_id),
  KEY idx_reviews_user_id (user_id),
  KEY idx_reviews_tour_id (tour_id),
  KEY idx_reviews_rating (rating),
  KEY idx_reviews_status (status),
  CONSTRAINT fk_reviews_booking
    FOREIGN KEY (booking_id) REFERENCES bookings(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_reviews_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE RESTRICT,
  CONSTRAINT fk_reviews_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE RESTRICT,
  CONSTRAINT chk_reviews_rating
    CHECK (rating BETWEEN 1 AND 5),
  CONSTRAINT chk_reviews_guide_rating
    CHECK (guide_rating BETWEEN 1 AND 5 OR guide_rating IS NULL)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Đánh giá sau chuyến đi';

-- =========================================
-- 14. Yêu thích
-- =========================================
CREATE TABLE wishlists (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  tour_id INT UNSIGNED NOT NULL,
  added_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_wishlists_user_tour (user_id, tour_id),
  KEY idx_wishlists_tour_id (tour_id),
  CONSTRAINT fk_wishlists_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_wishlists_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Tour yêu thích';

-- =========================================
-- 15. Gợi ý tour
-- =========================================
CREATE TABLE recommendations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  tour_id INT UNSIGNED NOT NULL,
  score DECIMAL(5,4) NOT NULL DEFAULT 0.0000,
  reason VARCHAR(300) DEFAULT NULL,
  algorithm VARCHAR(50) DEFAULT 'collab_filter',
  is_clicked BOOLEAN NOT NULL DEFAULT FALSE,
  is_booked BOOLEAN NOT NULL DEFAULT FALSE,
  generated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_recommendations_user_tour (user_id, tour_id),
  KEY idx_recommendations_tour_id (tour_id),
  KEY idx_recommendations_user_id (user_id),
  KEY idx_recommendations_score (score DESC),
  CONSTRAINT fk_recommendations_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE,
  CONSTRAINT fk_recommendations_tour
    FOREIGN KEY (tour_id) REFERENCES tours(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Gợi ý tour cá nhân hóa';

-- =========================================
-- 16. Thông báo
-- =========================================
CREATE TABLE notifications (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  type ENUM('booking_confirmed', 'payment_success', 'payment_failed', 'tour_reminder', 'guide_assigned', 'review_approved', 'promotion', 'system') NOT NULL DEFAULT 'system',
  channel ENUM('email', 'in_app', 'sms') NOT NULL DEFAULT 'in_app',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  ref_id INT UNSIGNED DEFAULT NULL,
  ref_type VARCHAR(50) DEFAULT NULL,
  sent_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (id),
  KEY idx_notifications_user_id (user_id),
  KEY idx_notifications_is_read (is_read),
  KEY idx_notifications_type (type),
  CONSTRAINT fk_notifications_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Thông báo hệ thống';

-- =========================================
-- 17. Nhật ký hoạt động
-- =========================================
CREATE TABLE audit_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(300) DEFAULT NULL,
  table_name VARCHAR(64) NOT NULL,
  record_id INT UNSIGNED DEFAULT NULL,
  action ENUM('INSERT', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'APPROVE', 'REJECT') NOT NULL,
  old_data JSON DEFAULT NULL,
  new_data JSON DEFAULT NULL,
  description VARCHAR(300) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_audit_logs_table_name (table_name),
  KEY idx_audit_logs_user_id (user_id),
  KEY idx_audit_logs_action (action),
  KEY idx_audit_logs_created_at (created_at),
  CONSTRAINT fk_audit_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Nhật ký hệ thống';

-- =========================================
-- 18. Log tìm kiếm giọng nói
-- =========================================
CREATE TABLE voice_search_logs (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id INT UNSIGNED DEFAULT NULL,
  raw_text TEXT NOT NULL,
  parsed_query JSON DEFAULT NULL,
  result_count SMALLINT UNSIGNED NOT NULL DEFAULT 0,
  session_id VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_voice_search_logs_user_id (user_id),
  KEY idx_voice_search_logs_created_at (created_at),
  CONSTRAINT fk_voice_search_logs_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='Lịch sử tìm kiếm bằng giọng nói';

-- =========================================
-- Dữ liệu mẫu
-- =========================================
INSERT INTO users (
  id, email, password_hash, full_name, phone, avatar_url, role, is_active, email_verified, last_login_at
) VALUES
  (1, 'admin@traveltour.vn', '$2b$12$REPLACE_WITH_REAL_HASH', 'TravelTour Admin', NULL, NULL, 'admin', TRUE, TRUE, NULL);

INSERT INTO tour_categories (id, name, slug, description, icon_url) VALUES
  (1, 'Rừng nhiệt đới', 'rung-nhiet-doi', 'Khám phá rừng nguyên sinh và đa dạng sinh học', NULL),
  (2, 'Biển đảo', 'bien-dao', 'Nghỉ dưỡng và lặn biển tại các đảo sinh thái', NULL),
  (3, 'Núi cao - Trekking', 'nui-cao-trekking', 'Leo núi và trekking tại các vùng rừng núi', NULL),
  (4, 'Làng nghề truyền thống', 'lang-nghe-truyen-thong', 'Trải nghiệm văn hóa và nghề thủ công địa phương', NULL),
  (5, 'Nông nghiệp sinh thái', 'nong-nghiep-sinh-thai', 'Tham quan và trải nghiệm nông trại hữu cơ', NULL),
  (6, 'Du lịch cộng đồng', 'du-lich-cong-dong', 'Homestay và sinh hoạt cùng cộng đồng dân tộc', NULL),
  (7, 'Hang động - Địa chất', 'hang-dong-dia-chat', 'Khám phá hang động và địa hình karst', NULL),
  (8, 'Sông - Thác - Hồ', 'song-thac-ho', 'Du ngoạn sông nước, thác và hồ tự nhiên', NULL);

-- =========================================
-- View tổng hợp
-- =========================================
CREATE VIEW v_booking_detail AS
SELECT
  b.id AS booking_id,
  b.booking_code,
  b.status AS booking_status,
  (b.num_adults + b.num_children + b.num_infants) AS total_pax,
  b.final_price,
  b.booked_at,
  u.full_name AS customer_name,
  u.email AS customer_email,
  u.phone AS customer_phone,
  t.title AS tour_title,
  t.location,
  ts.departure_date,
  ts.return_date,
  pr.company_name AS provider_name,
  gu.full_name AS guide_name,
  ga.participation_status AS guide_status,
  py.status AS payment_status,
  py.payment_method,
  py.paid_at
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN tours t ON b.tour_id = t.id
JOIN tour_schedules ts ON b.schedule_id = ts.id
JOIN providers pr ON t.provider_id = pr.id
LEFT JOIN guide_assignments ga
  ON b.id = ga.booking_id AND ga.participation_status <> 'cancelled'
LEFT JOIN guides g ON ga.guide_id = g.id
LEFT JOIN users gu ON g.user_id = gu.id
LEFT JOIN payments py
  ON b.id = py.booking_id AND py.status = 'success';

CREATE VIEW v_guide_schedule AS
SELECT
  g.id AS guide_id,
  gu.full_name AS guide_name,
  b.booking_code,
  t.title AS tour_title,
  t.location,
  ts.departure_date,
  ts.return_date,
  ga.participation_status,
  (b.num_adults + b.num_children) AS group_size,
  cu.full_name AS customer_name,
  cu.phone AS customer_phone
FROM guide_assignments ga
JOIN guides g ON ga.guide_id = g.id
JOIN users gu ON g.user_id = gu.id
JOIN bookings b ON ga.booking_id = b.id
JOIN users cu ON b.user_id = cu.id
JOIN tours t ON b.tour_id = t.id
JOIN tour_schedules ts ON b.schedule_id = ts.id;

CREATE VIEW v_provider_revenue AS
SELECT
  pr.id AS provider_id,
  pr.company_name,
  COUNT(DISTINCT t.id) AS total_tours,
  COUNT(DISTINCT b.id) AS total_bookings,
  SUM(CASE WHEN b.status = 'completed' THEN b.final_price ELSE 0 END) AS total_revenue,
  SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
  SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
  ROUND(AVG(t.rating_avg), 2) AS avg_tour_rating
FROM providers pr
LEFT JOIN tours t ON pr.id = t.provider_id
LEFT JOIN bookings b ON t.id = b.tour_id
GROUP BY pr.id, pr.company_name;

CREATE VIEW v_tour_summary AS
SELECT
  t.id,
  t.title,
  t.slug,
  t.location,
  t.province,
  t.base_price,
  t.duration_days,
  t.duration_nights,
  t.max_capacity,
  t.eco_score,
  t.difficulty_level,
  t.rating_avg,
  t.rating_count,
  t.total_bookings,
  t.thumbnail_url,
  t.status,
  p.id AS provider_id,
  p.company_name AS provider_name,
  COUNT(DISTINCT ts.id) AS total_schedules,
  SUM(CASE WHEN ts.status = 'open' THEN (ts.available_slots - ts.booked_slots) ELSE 0 END) AS total_available_slots,
  MIN(CASE WHEN ts.status = 'open' THEN ts.departure_date END) AS next_departure
FROM tours t
JOIN providers p ON t.provider_id = p.id
LEFT JOIN tour_schedules ts ON t.id = ts.tour_id
GROUP BY
  t.id, t.title, t.slug, t.location, t.province, t.base_price,
  t.duration_days, t.duration_nights, t.max_capacity, t.eco_score,
  t.difficulty_level, t.rating_avg, t.rating_count, t.total_bookings,
  t.thumbnail_url, t.status, p.id, p.company_name;
