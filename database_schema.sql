-- ============================================================
--  TravelTour - Web Application for Ecotourism Management
--  Database: MySQL 8.0+  |  Charset: utf8mb4
--  Project: C2SE.59 – Capstone Project 2 – Duy Tan University
--  Version: 1.0  |  Date: 2026-02-09
-- ============================================================

CREATE DATABASE IF NOT EXISTS traveltour
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE traveltour;

-- ============================================================
-- 1. USERS – Tài khoản hệ thống (4 vai trò)
-- ============================================================
CREATE TABLE users (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    email           VARCHAR(191)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(100)    NOT NULL,
    phone           VARCHAR(20)         NULL,
    avatar_url      VARCHAR(500)        NULL,
    role            ENUM('customer','provider','guide','admin')
                                    NOT NULL DEFAULT 'customer',
    is_active       TINYINT(1)      NOT NULL DEFAULT 1,
    email_verified  TINYINT(1)      NOT NULL DEFAULT 0,
    last_login_at   TIMESTAMP           NULL,
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uk_email  (email),
    INDEX   idx_role      (role),
    INDEX   idx_is_active (is_active)
) COMMENT = 'Tài khoản người dùng – tất cả vai trò';

-- ============================================================
-- 2. PROVIDERS – Nhà cung cấp dịch vụ tour sinh thái
-- ============================================================
CREATE TABLE providers (
    id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id         INT UNSIGNED    NOT NULL,
    company_name    VARCHAR(150)    NOT NULL,
    description     TEXT                NULL,
    address         VARCHAR(300)        NULL,
    website_url     VARCHAR(300)        NULL,
    license_number  VARCHAR(100)        NULL,
    tax_code        VARCHAR(50)         NULL,
    status          ENUM('pending','approved','suspended')
                                    NOT NULL DEFAULT 'pending',
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                              ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uk_user (user_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX   idx_status   (status)
) COMMENT = 'Hồ sơ nhà cung cấp dịch vụ du lịch sinh thái';

-- ============================================================
-- 3. TOUR_CATEGORIES – Danh mục loại hình sinh thái
-- ============================================================
CREATE TABLE tour_categories (
    id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    name        VARCHAR(100)    NOT NULL,
    slug        VARCHAR(120)    NOT NULL,
    description TEXT                NULL,
    icon_url    VARCHAR(300)        NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uk_slug (slug)
) COMMENT = 'Danh mục tour sinh thái (rừng, biển, núi...)';

-- ============================================================
-- 4. TOURS – Thông tin đầy đủ của mỗi tour sinh thái
-- ============================================================
CREATE TABLE tours (
    id               INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id      INT UNSIGNED     NOT NULL,
    title            VARCHAR(200)     NOT NULL,
    slug             VARCHAR(220)     NOT NULL,
    description      TEXT                 NULL,
    itinerary        LONGTEXT             NULL,
    location         VARCHAR(200)     NOT NULL,
    province         VARCHAR(100)         NULL,
    latitude         DECIMAL(10,7)        NULL,
    longitude        DECIMAL(10,7)        NULL,
    base_price       DECIMAL(14,0)    NOT NULL DEFAULT 0,
    duration_days    SMALLINT         NOT NULL DEFAULT 1,
    duration_nights  SMALLINT         NOT NULL DEFAULT 0,
    min_participants SMALLINT         NOT NULL DEFAULT 1,
    max_capacity     SMALLINT         NOT NULL DEFAULT 20,
    thumbnail_url    VARCHAR(500)         NULL,
    difficulty_level ENUM('easy','moderate','challenging')
                                      NOT NULL DEFAULT 'easy',
    eco_score        DECIMAL(3,1)     NOT NULL DEFAULT 0.0,
    language         VARCHAR(50)          NULL DEFAULT 'Vietnamese',
    includes         TEXT                 NULL,
    excludes         TEXT                 NULL,
    status           ENUM('draft','active','paused','archived')
                                      NOT NULL DEFAULT 'draft',
    total_bookings   INT UNSIGNED     NOT NULL DEFAULT 0,
    rating_avg       DECIMAL(3,2)     NOT NULL DEFAULT 0.00,
    rating_count     INT UNSIGNED     NOT NULL DEFAULT 0,
    created_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uk_slug      (slug),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE RESTRICT,
    INDEX   idx_provider     (provider_id),
    INDEX   idx_status       (status),
    INDEX   idx_province     (province),
    INDEX   idx_eco_score    (eco_score),
    INDEX   idx_price        (base_price),
    FULLTEXT INDEX ft_search (title, description, location)
) COMMENT = 'Tour du lịch sinh thái';

-- ============================================================
-- 5. TOUR_IMAGES – Hình ảnh của tour
-- ============================================================
CREATE TABLE tour_images (
    id            INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    tour_id       INT UNSIGNED    NOT NULL,
    image_url     VARCHAR(500)    NOT NULL,
    caption       VARCHAR(200)        NULL,
    display_order TINYINT         NOT NULL DEFAULT 0,
    is_cover      TINYINT(1)      NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_tour (tour_id)
) COMMENT = 'Ảnh minh họa của tour';

-- ============================================================
-- 6. TOUR_CATEGORY_MAP – Quan hệ Tour ↔ Danh mục (N:N)
-- ============================================================
CREATE TABLE tour_category_map (
    tour_id     INT UNSIGNED    NOT NULL,
    category_id INT UNSIGNED    NOT NULL,
    PRIMARY KEY (tour_id, category_id),
    FOREIGN KEY (tour_id)     REFERENCES tours(id)           ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES tour_categories(id) ON DELETE CASCADE
) COMMENT = 'Phân loại tour theo danh mục';

-- ============================================================
-- 7. TOUR_SCHEDULES – Lịch khởi hành của từng tour
-- ============================================================
CREATE TABLE tour_schedules (
    id              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    tour_id         INT UNSIGNED     NOT NULL,
    departure_date  DATE             NOT NULL,
    return_date     DATE             NOT NULL,
    available_slots SMALLINT         NOT NULL DEFAULT 0,
    booked_slots    SMALLINT         NOT NULL DEFAULT 0,
    price_override  DECIMAL(14,0)        NULL,
    note            VARCHAR(300)         NULL,
    status          ENUM('open','full','cancelled','completed')
                                     NOT NULL DEFAULT 'open',
    created_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_tour      (tour_id),
    INDEX idx_departure (departure_date),
    INDEX idx_status    (status)
) COMMENT = 'Lịch khởi hành của từng tour';

-- ============================================================
-- 8. GUIDES – Hồ sơ hướng dẫn viên
-- ============================================================
CREATE TABLE guides (
    id               INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id          INT UNSIGNED    NOT NULL,
    provider_id      INT UNSIGNED    NOT NULL,
    bio              TEXT                NULL,
    specialty        VARCHAR(200)        NULL,
    languages        VARCHAR(200)        NULL,
    experience_years TINYINT         NOT NULL DEFAULT 0,
    certification    VARCHAR(300)        NULL,
    rating_avg       DECIMAL(3,2)    NOT NULL DEFAULT 0.00,
    rating_count     INT UNSIGNED    NOT NULL DEFAULT 0,
    status           ENUM('active','inactive','on_leave')
                                     NOT NULL DEFAULT 'active',
    created_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uk_user    (user_id),
    FOREIGN KEY (user_id)     REFERENCES users(id)     ON DELETE CASCADE,
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE RESTRICT,
    INDEX idx_provider (provider_id),
    INDEX idx_status   (status)
) COMMENT = 'Hồ sơ hướng dẫn viên du lịch';

-- ============================================================
-- 9. BOOKINGS – Đặt tour của khách hàng
-- ============================================================
CREATE TABLE bookings (
    id               INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id          INT UNSIGNED     NOT NULL,
    tour_id          INT UNSIGNED     NOT NULL,
    schedule_id      INT UNSIGNED     NOT NULL,
    booking_code     VARCHAR(20)      NOT NULL,
    num_adults       SMALLINT         NOT NULL DEFAULT 1,
    num_children     SMALLINT         NOT NULL DEFAULT 0,
    num_infants      SMALLINT         NOT NULL DEFAULT 0,
    total_price      DECIMAL(14,0)    NOT NULL DEFAULT 0,
    discount_amount  DECIMAL(14,0)    NOT NULL DEFAULT 0,
    final_price      DECIMAL(14,0)    NOT NULL DEFAULT 0,
    status           ENUM('pending','confirmed','paid','in_progress',
                          'completed','cancelled','refunded')
                                      NOT NULL DEFAULT 'pending',
    contact_name     VARCHAR(100)         NULL,
    contact_phone    VARCHAR(20)          NULL,
    contact_email    VARCHAR(191)         NULL,
    special_requests TEXT                 NULL,
    cancelled_reason TEXT                 NULL,
    cancelled_at     TIMESTAMP            NULL,
    booked_at        TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP
                                               ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uk_code       (booking_code),
    FOREIGN KEY (user_id)     REFERENCES users(id)          ON DELETE RESTRICT,
    FOREIGN KEY (tour_id)     REFERENCES tours(id)          ON DELETE RESTRICT,
    FOREIGN KEY (schedule_id) REFERENCES tour_schedules(id) ON DELETE RESTRICT,
    INDEX idx_user     (user_id),
    INDEX idx_tour     (tour_id),
    INDEX idx_schedule (schedule_id),
    INDEX idx_status   (status)
) COMMENT = 'Đặt tour của khách hàng';

-- ============================================================
-- 10. PAYMENTS – Lịch sử thanh toán
-- ============================================================
CREATE TABLE payments (
    id               INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    booking_id       INT UNSIGNED     NOT NULL,
    amount           DECIMAL(14,0)    NOT NULL,
    currency         VARCHAR(10)      NOT NULL DEFAULT 'VND',
    payment_method   ENUM('bank_transfer','credit_card','momo',
                          'zalopay','vnpay','cash','other')
                                      NOT NULL DEFAULT 'bank_transfer',
    status           ENUM('pending','success','failed','refunded')
                                      NOT NULL DEFAULT 'pending',
    transaction_id   VARCHAR(200)         NULL,
    gateway          VARCHAR(50)          NULL,
    gateway_response TEXT                 NULL,
    refund_amount    DECIMAL(14,0)        NULL,
    refund_reason    TEXT                 NULL,
    paid_at          TIMESTAMP            NULL,
    refunded_at      TIMESTAMP            NULL,
    created_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE RESTRICT,
    INDEX idx_booking (booking_id),
    INDEX idx_status  (status),
    INDEX idx_txn     (transaction_id)
) COMMENT = 'Lịch sử thanh toán';

-- ============================================================
-- 11. GUIDE_ASSIGNMENTS – Phân công hướng dẫn viên
-- ============================================================
CREATE TABLE guide_assignments (
    id                   INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    booking_id           INT UNSIGNED    NOT NULL,
    guide_id             INT UNSIGNED    NOT NULL,
    participation_status ENUM('assigned','confirmed','on_tour',
                              'completed','cancelled')
                                         NOT NULL DEFAULT 'assigned',
    note                 TEXT                NULL,
    assigned_at          TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                                  ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (guide_id)   REFERENCES guides(id)   ON DELETE RESTRICT,
    INDEX idx_booking (booking_id),
    INDEX idx_guide   (guide_id),
    INDEX idx_status  (participation_status)
) COMMENT = 'Phân công HDV cho từng booking';

-- ============================================================
-- 12. REVIEWS – Đánh giá sau chuyến đi (1 booking = 1 review)
-- ============================================================
CREATE TABLE reviews (
    id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    booking_id   INT UNSIGNED    NOT NULL,
    user_id      INT UNSIGNED    NOT NULL,
    tour_id      INT UNSIGNED    NOT NULL,
    rating       TINYINT         NOT NULL,
    title        VARCHAR(200)        NULL,
    comment      TEXT                NULL,
    photos       JSON                NULL,
    guide_rating TINYINT             NULL,
    status       ENUM('pending','approved','rejected','hidden')
                                 NOT NULL DEFAULT 'pending',
    admin_note   TEXT                NULL,
    created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                           ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uk_booking (booking_id),
    FOREIGN KEY (booking_id) REFERENCES bookings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE RESTRICT,
    FOREIGN KEY (tour_id)    REFERENCES tours(id)    ON DELETE RESTRICT,
    INDEX idx_tour   (tour_id),
    INDEX idx_rating (rating),
    INDEX idx_status (status),
    CONSTRAINT chk_rating       CHECK (rating       BETWEEN 1 AND 5),
    CONSTRAINT chk_guide_rating CHECK (guide_rating BETWEEN 1 AND 5
                                       OR guide_rating IS NULL)
) COMMENT = 'Đánh giá của khách hàng sau chuyến đi';

-- ============================================================
-- 13. NOTIFICATIONS – Thông báo gửi người dùng
-- ============================================================
CREATE TABLE notifications (
    id        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id   INT UNSIGNED    NOT NULL,
    title     VARCHAR(200)    NOT NULL,
    message   TEXT            NOT NULL,
    type      ENUM('booking_confirmed','payment_success','payment_failed',
                   'tour_reminder','guide_assigned','review_approved',
                   'promotion','system')
                              NOT NULL DEFAULT 'system',
    channel   ENUM('email','in_app','sms')
                              NOT NULL DEFAULT 'in_app',
    is_read   TINYINT(1)      NOT NULL DEFAULT 0,
    ref_id    INT UNSIGNED        NULL,
    ref_type  VARCHAR(50)         NULL,
    sent_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    read_at   TIMESTAMP           NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user    (user_id),
    INDEX idx_is_read (is_read),
    INDEX idx_type    (type)
) COMMENT = 'Thông báo hệ thống (in-app + email)';

-- ============================================================
-- 14. PROMOTIONS – Mã giảm giá & khuyến mãi
-- ============================================================
CREATE TABLE promotions (
    id              INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    provider_id     INT UNSIGNED         NULL,
    code            VARCHAR(50)      NOT NULL,
    name            VARCHAR(150)     NOT NULL,
    description     TEXT                 NULL,
    discount_type   ENUM('percent','fixed')
                                     NOT NULL DEFAULT 'percent',
    discount_value  DECIMAL(10,2)    NOT NULL,
    min_order_value DECIMAL(14,0)    NOT NULL DEFAULT 0,
    max_uses        INT                  NULL,
    used_count      INT              NOT NULL DEFAULT 0,
    max_per_user    TINYINT          NOT NULL DEFAULT 1,
    applicable_to   ENUM('all','specific_tour')
                                     NOT NULL DEFAULT 'all',
    tour_id         INT UNSIGNED         NULL,
    is_active       TINYINT(1)       NOT NULL DEFAULT 1,
    starts_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      TIMESTAMP            NULL,
    created_at      TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uk_code      (code),
    FOREIGN KEY (provider_id) REFERENCES providers(id) ON DELETE SET NULL,
    FOREIGN KEY (tour_id)     REFERENCES tours(id)     ON DELETE SET NULL,
    INDEX idx_is_active (is_active),
    INDEX idx_expires   (expires_at)
) COMMENT = 'Mã giảm giá và chương trình khuyến mãi';

-- ============================================================
-- 15. RECOMMENDATIONS – Gợi ý tour cá nhân hóa (AI)
-- ============================================================
CREATE TABLE recommendations (
    id           INT UNSIGNED     NOT NULL AUTO_INCREMENT,
    user_id      INT UNSIGNED     NOT NULL,
    tour_id      INT UNSIGNED     NOT NULL,
    score        DECIMAL(5,4)     NOT NULL DEFAULT 0.0000,
    reason       VARCHAR(300)         NULL,
    algorithm    VARCHAR(50)          NULL DEFAULT 'collab_filter',
    is_clicked   TINYINT(1)       NOT NULL DEFAULT 0,
    is_booked    TINYINT(1)       NOT NULL DEFAULT 0,
    generated_at TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at   TIMESTAMP            NULL,
    PRIMARY KEY (id),
    UNIQUE  KEY uk_user_tour (user_id, tour_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE,
    INDEX idx_user  (user_id),
    INDEX idx_score (score DESC)
) COMMENT = 'Gợi ý tour cá nhân hóa (AI Recommendation)';

-- ============================================================
-- 16. WISHLISTS – Tour yêu thích của khách
-- ============================================================
CREATE TABLE wishlists (
    id        INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id   INT UNSIGNED    NOT NULL,
    tour_id   INT UNSIGNED    NOT NULL,
    added_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE  KEY uk_user_tour (user_id, tour_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (tour_id) REFERENCES tours(id) ON DELETE CASCADE
) COMMENT = 'Tour yêu thích (bookmark) của khách hàng';

-- ============================================================
-- 17. VOICE_SEARCH_LOGS – Lịch sử tìm kiếm giọng nói
-- ============================================================
CREATE TABLE voice_search_logs (
    id           INT UNSIGNED    NOT NULL AUTO_INCREMENT,
    user_id      INT UNSIGNED        NULL,
    raw_text     TEXT            NOT NULL,
    parsed_query JSON                NULL,
    result_count SMALLINT        NOT NULL DEFAULT 0,
    session_id   VARCHAR(100)        NULL,
    created_at   TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user    (user_id),
    INDEX idx_created (created_at)
) COMMENT = 'Lịch sử tìm kiếm bằng giọng nói';

-- ============================================================
-- 18. AUDIT_LOGS – Nhật ký kiểm toán hệ thống
-- ============================================================
CREATE TABLE audit_logs (
    id          BIGINT UNSIGNED   NOT NULL AUTO_INCREMENT,
    user_id     INT UNSIGNED          NULL,
    ip_address  VARCHAR(45)           NULL,
    user_agent  VARCHAR(300)          NULL,
    table_name  VARCHAR(64)       NOT NULL,
    record_id   INT UNSIGNED          NULL,
    action      ENUM('INSERT','UPDATE','DELETE','LOGIN','LOGOUT',
                     'APPROVE','REJECT')
                                  NOT NULL,
    old_data    JSON                  NULL,
    new_data    JSON                  NULL,
    description VARCHAR(300)          NULL,
    created_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_table   (table_name),
    INDEX idx_user    (user_id),
    INDEX idx_action  (action),
    INDEX idx_created (created_at)
) COMMENT = 'Nhật ký kiểm toán hệ thống';

-- ============================================================
-- SEED DATA
-- ============================================================

INSERT INTO tour_categories (name, slug, description) VALUES
  ('Rừng nhiệt đới',         'rung-nhiet-doi',         'Khám phá rừng nguyên sinh và đa dạng sinh học'),
  ('Biển đảo',               'bien-dao',               'Nghỉ dưỡng và lặn biển tại các đảo sinh thái'),
  ('Núi cao – Trekking',     'nui-cao-trekking',       'Leo núi và trekking tại các vùng rừng núi'),
  ('Làng nghề truyền thống', 'lang-nghe-truyen-thong', 'Trải nghiệm văn hóa và nghề thủ công địa phương'),
  ('Nông nghiệp sinh thái',  'nong-nghiep-sinh-thai',  'Tham quan và trải nghiệm nông trại hữu cơ'),
  ('Du lịch cộng đồng',      'du-lich-cong-dong',      'Homestay và sinh hoạt cùng cộng đồng dân tộc'),
  ('Hang động – Địa chất',   'hang-dong-dia-chat',     'Khám phá hang động và địa hình karst'),
  ('Sông – Thác – Hồ',       'song-thac-ho',           'Du ngoạn sông nước, thác và hồ tự nhiên');

INSERT INTO users (email, password_hash, full_name, role, is_active, email_verified)
VALUES ('admin@traveltour.vn', '$2b$12$REPLACE_WITH_REAL_HASH', 'TravelTour Admin', 'admin', 1, 1);

-- ============================================================
-- VIEWS – Hỗ trợ API và Dashboard
-- ============================================================

CREATE OR REPLACE VIEW v_tour_summary AS
SELECT
    t.id, t.title, t.slug, t.location, t.province,
    t.base_price, t.duration_days, t.duration_nights,
    t.max_capacity, t.eco_score, t.difficulty_level,
    t.rating_avg, t.rating_count, t.total_bookings,
    t.thumbnail_url, t.status,
    p.id            AS provider_id,
    p.company_name  AS provider_name,
    COUNT(DISTINCT ts.id)
        AS total_schedules,
    SUM(CASE WHEN ts.status = 'open'
             THEN ts.available_slots - ts.booked_slots ELSE 0 END)
        AS total_available_slots,
    MIN(CASE WHEN ts.status = 'open' THEN ts.departure_date END)
        AS next_departure
FROM tours t
JOIN providers p ON t.provider_id = p.id
LEFT JOIN tour_schedules ts ON t.id = ts.tour_id
GROUP BY t.id, t.title, t.slug, t.location, t.province,
         t.base_price, t.duration_days, t.duration_nights,
         t.max_capacity, t.eco_score, t.difficulty_level,
         t.rating_avg, t.rating_count, t.total_bookings,
         t.thumbnail_url, t.status, p.id, p.company_name;

CREATE OR REPLACE VIEW v_provider_revenue AS
SELECT
    pr.id                    AS provider_id,
    pr.company_name,
    COUNT(DISTINCT t.id)     AS total_tours,
    COUNT(DISTINCT b.id)     AS total_bookings,
    SUM(CASE WHEN b.status = 'completed' THEN b.final_price ELSE 0 END) AS total_revenue,
    SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_bookings,
    SUM(CASE WHEN b.status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_bookings,
    ROUND(AVG(t.rating_avg), 2) AS avg_tour_rating
FROM providers pr
LEFT JOIN tours    t ON pr.id = t.provider_id
LEFT JOIN bookings b ON t.id  = b.tour_id
GROUP BY pr.id, pr.company_name;

CREATE OR REPLACE VIEW v_booking_detail AS
SELECT
    b.id AS booking_id,
    b.booking_code,
    b.status AS booking_status,
    b.num_adults + b.num_children + b.num_infants AS total_pax,
    b.final_price,
    b.booked_at,
    u.full_name    AS customer_name,
    u.email        AS customer_email,
    u.phone        AS customer_phone,
    t.title        AS tour_title,
    t.location,
    ts.departure_date,
    ts.return_date,
    pr.company_name AS provider_name,
    gu.full_name   AS guide_name,
    ga.participation_status AS guide_status,
    py.status      AS payment_status,
    py.payment_method,
    py.paid_at
FROM bookings b
JOIN users          u  ON b.user_id     = u.id
JOIN tours          t  ON b.tour_id     = t.id
JOIN tour_schedules ts ON b.schedule_id = ts.id
JOIN providers      pr ON t.provider_id = pr.id
LEFT JOIN guide_assignments ga ON b.id = ga.booking_id
                               AND ga.participation_status != 'cancelled'
LEFT JOIN guides    g  ON ga.guide_id = g.id
LEFT JOIN users     gu ON g.user_id   = gu.id
LEFT JOIN payments  py ON b.id = py.booking_id AND py.status = 'success';

CREATE OR REPLACE VIEW v_guide_schedule AS
SELECT
    g.id AS guide_id,
    gu.full_name  AS guide_name,
    b.booking_code,
    t.title       AS tour_title,
    t.location,
    ts.departure_date,
    ts.return_date,
    ga.participation_status,
    b.num_adults + b.num_children AS group_size,
    cu.full_name  AS customer_name,
    cu.phone      AS customer_phone
FROM guide_assignments ga
JOIN guides         g  ON ga.guide_id   = g.id
JOIN users          gu ON g.user_id     = gu.id
JOIN bookings       b  ON ga.booking_id = b.id
JOIN users          cu ON b.user_id     = cu.id
JOIN tours          t  ON b.tour_id     = t.id
JOIN tour_schedules ts ON b.schedule_id = ts.id
ORDER BY ts.departure_date;
