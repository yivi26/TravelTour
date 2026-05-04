import db from "../config/db.js";
import {
  createBooking,
  createBookingTravelers,
  getTourPriceById,
  updateBookedSlots,
  getRecentBookingsByUser,
  getBookingDetailById,
  getBookingTravelersByBookingId,
  getBookingHistoryByUser,
  getMyBookingsByUser,
  countBookingsByUser,
  getBookingSummaryData,
  getCancelableBookingById,
  cancelBookingById,
} from "../models/bookingModel.js";

function countTravelersByType(travelers) {
  var counts = {
    adults: 0,
    children: 0,
    infants: 0,
  };

  if (!Array.isArray(travelers)) {
    return counts;
  }

  travelers.forEach(function (traveler) {
    if (traveler.traveler_type === "adult") {
      counts.adults += 1;
    } else if (traveler.traveler_type === "child") {
      counts.children += 1;
    } else if (traveler.traveler_type === "infant") {
      counts.infants += 1;
    }
  });

  return counts;
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}

function isValidVietnamPhone(phone) {
  return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(String(phone || "").trim());
}

function isValidFullName(name) {
  const normalized = String(name || "")
    .trim()
    .replace(/\s+/g, " ");

  if (normalized.length < 2) return false;

  return /^[a-zA-ZÀ-ỹ\s]+$/.test(normalized);
}

function isValidDocumentId(value) {
  const normalized = String(value || "").trim();

  return /^[A-Za-z0-9]{6,20}$/.test(normalized);
}

function isValidTravelerType(type) {
  return ["adult", "child", "infant"].includes(type);
}

function isValidGender(gender) {
  return ["male", "female", "other"].includes(gender);
}

function parseDateYYYYMMDD(dateStr) {
  if (!dateStr) return null;

  const normalized = String(dateStr).trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  const date = new Date(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

function isFutureDate(date) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);

  return compareDate > today;
}
export const confirmBooking = async (req, res) => {
  try {
    const user_id = req.user.id;
    const {
      tour_id,
      schedule_id,
      contact_name,
      contact_phone,
      contact_email,
      special_requests,
      travelers,
      payment_method,
    } = req.body;

    if (!tour_id || Number.isNaN(Number(tour_id))) {
      return res.status(400).json({
        success: false,
        message: "tour_id không hợp lệ",
      });
    }

    if (!schedule_id || Number.isNaN(Number(schedule_id))) {
      return res.status(400).json({
        success: false,
        message: "schedule_id không hợp lệ",
      });
    }

    if (!contact_name || !String(contact_name).trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập họ tên người đặt tour",
      });
    }

    if (!isValidFullName(contact_name)) {
      return res.status(400).json({
        success: false,
        message: "Họ tên người đặt tour không hợp lệ",
      });
    }

    if (!contact_phone || !String(contact_phone).trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập số điện thoại người đặt tour",
      });
    }

    if (!isValidVietnamPhone(contact_phone)) {
      return res.status(400).json({
        success: false,
        message: "Số điện thoại người đặt tour không hợp lệ",
      });
    }

    if (!contact_email || !String(contact_email).trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập email người đặt tour",
      });
    }

    if (!isValidEmail(contact_email)) {
      return res.status(400).json({
        success: false,
        message: "Email người đặt tour không đúng định dạng",
      });
    }

    if (!payment_method || !String(payment_method).trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn phương thức thanh toán",
      });
    }

    const allowedPaymentMethods = ["momo", "office"];

    if (!allowedPaymentMethods.includes(String(payment_method).trim())) {
      return res.status(400).json({
        success: false,
        message: "Phương thức thanh toán không hợp lệ",
      });
    }

    if (!Array.isArray(travelers) || travelers.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Danh sách khách tham gia không hợp lệ",
      });
    }

    for (let i = 0; i < travelers.length; i += 1) {
      const traveler = travelers[i];
      const index = i + 1;

      if (!traveler.full_name || !String(traveler.full_name).trim()) {
        return res.status(400).json({
          success: false,
          message: `Vui lòng nhập họ tên cho khách #${index}`,
        });
      }

      if (!isValidFullName(traveler.full_name)) {
        return res.status(400).json({
          success: false,
          message: `Họ tên của khách #${index} không hợp lệ`,
        });
      }

      if (!traveler.birth_date || !String(traveler.birth_date).trim()) {
        return res.status(400).json({
          success: false,
          message: `Vui lòng nhập ngày sinh cho khách #${index}`,
        });
      }

      const parsedBirthDate = parseDateYYYYMMDD(traveler.birth_date);

      if (!parsedBirthDate) {
        return res.status(400).json({
          success: false,
          message: `Ngày sinh của khách #${index} không đúng định dạng yyyy-mm-dd`,
        });
      }

      if (isFutureDate(parsedBirthDate)) {
        return res.status(400).json({
          success: false,
          message: `Ngày sinh của khách #${index} không được ở tương lai`,
        });
      }

      if (!traveler.gender || !String(traveler.gender).trim()) {
        return res.status(400).json({
          success: false,
          message: `Vui lòng chọn giới tính cho khách #${index}`,
        });
      }

      if (!isValidGender(traveler.gender)) {
        return res.status(400).json({
          success: false,
          message: `Giới tính của khách #${index} không hợp lệ`,
        });
      }

      if (!traveler.id_number || !String(traveler.id_number).trim()) {
        return res.status(400).json({
          success: false,
          message: `Vui lòng nhập số hộ chiếu / CMND cho khách #${index}`,
        });
      }

      if (!isValidDocumentId(traveler.id_number)) {
        return res.status(400).json({
          success: false,
          message: `Số hộ chiếu / CMND của khách #${index} không hợp lệ`,
        });
      }

      if (!traveler.traveler_type || !String(traveler.traveler_type).trim()) {
        return res.status(400).json({
          success: false,
          message: `Loại khách của khách #${index} không hợp lệ`,
        });
      }

      if (!isValidTravelerType(traveler.traveler_type)) {
        return res.status(400).json({
          success: false,
          message: `Loại khách của khách #${index} không hợp lệ`,
        });
      }
    }

    if (
      !tour_id ||
      !schedule_id ||
      !contact_name ||
      !contact_phone ||
      !contact_email
    ) {
      return res.status(400).json({
        success: false,
        message: "Thiếu thông tin bắt buộc",
      });
    }

    const travelerCounts = countTravelersByType(travelers);
    const tour = await getTourPriceById(tour_id);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    const unitPrice =
      Number(tour.sale_price || 0) > 0
        ? Number(tour.sale_price)
        : Number(tour.base_price || 0);
    const totalTravelers =
      travelerCounts.adults + travelerCounts.children + travelerCounts.infants;
    if (totalTravelers <= 0) {
      return res.status(400).json({
        success: false,
        message: "Phải có ít nhất một khách tham gia",
      });
    }
    const totalPrice = unitPrice * totalTravelers;

    const previousBookingCount = await countBookingsByUser(user_id);

    let discountPercent = 0;
    if (previousBookingCount >= 5) {
      discountPercent = 10;
    } else if (previousBookingCount >= 3) {
      discountPercent = 5;
    }

    const discountAmount = Math.round((totalPrice * discountPercent) / 100);
    const finalPrice = totalPrice - discountAmount;

    const booking_code = "BK" + Date.now();

    const bookingData = {
      user_id,
      tour_id,
      schedule_id,
      booking_code,
      num_adults: travelerCounts.adults,
      num_children: travelerCounts.children,
      num_infants: travelerCounts.infants,
      total_price: totalPrice,
      discount_amount: discountAmount,
      final_price: finalPrice,
      status: "pending_payment",
      contact_name,
      contact_phone,
      contact_email,
      special_requests: special_requests || null,
      payment_method,
    };

    const result = await createBooking(bookingData);
    const bookingId = result.insertId;

    if (travelers && travelers.length > 0) {
      await createBookingTravelers(bookingId, travelers);
    }

    await updateBookedSlots(schedule_id, totalTravelers);

    return res.status(201).json({
      success: true,
      message: "Tạo booking thành công",
      booking_id: bookingId,
      booking_code,
    });
  } catch (error) {
    console.error("confirmBooking error:", error);
    console.error("REQ BODY:", req.body);
    console.error("REQ USER:", req.user);

    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo booking",
      error: error.message,
      sqlMessage: error.sqlMessage || null,
      code: error.code || null,
    });
  }
};
export const getRecentBookings = async (req, res) => {
  try {
    const user_id = req.user.id;

    const bookings = await getRecentBookingsByUser(user_id);

    // map status sang tiếng Việt
    const mapped = bookings.map((item) => {
      let statusLabel = "";

      if (item.status === "pending_payment") {
        statusLabel = "Chờ thanh toán";
      } else if (item.status === "confirmed") {
        statusLabel = "Đã xác nhận";
      } else if (item.status === "cancel_requested") {
        statusLabel = "Chờ xác nhận hủy";
      } else if (item.status === "cancelled") {
        statusLabel = "Đã hủy";
      } else if (item.status === "completed") {
        statusLabel = "Hoàn thành";
      } else {
        statusLabel = "Không xác định";
      }

      return {
        booking_id: item.booking_id,
        booking_code: item.booking_code,
        tour_name: item.tour_name,
        location: item.location,
        booking_date: item.booked_at,
        departure_date: item.departure_date,
        status: item.status,
        statusLabel: statusLabel,
        total_price: item.final_price,
      };
    });

    return res.status(200).json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    console.error("getRecentBookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy booking gần đây",
    });
  }
};
export const getBookingDetail = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.user.id;

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID không hợp lệ",
      });
    }

    const booking = await getBookingDetailById(bookingId, userId);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    const travelers = await getBookingTravelersByBookingId(bookingId);

    let statusLabel = "Không xác định";
    if (booking.status === "pending_payment") statusLabel = "Chờ thanh toán";
    else if (booking.status === "confirmed") statusLabel = "Đã xác nhận";
    else if (booking.status === "cancel_requested")
      statusLabel = "Chờ xác nhận hủy";
    else if (booking.status === "cancelled") statusLabel = "Đã hủy";
    else if (booking.status === "completed") statusLabel = "Hoàn thành";
    return res.status(200).json({
      success: true,
      data: {
        booking_id: booking.booking_id,
        booking_code: booking.booking_code,
        tour_id: booking.tour_id,
        tour_name: booking.tour_name,
        location: booking.location,
        booking_date: booking.booked_at,
        departure_date: booking.departure_date,
        status: booking.status,
        statusLabel: statusLabel,
        num_adults: booking.num_adults,
        num_children: booking.num_children,
        num_infants: booking.num_infants,
        total_price: booking.total_price,
        discount_amount: booking.discount_amount,
        final_price: booking.final_price,
        contact_name: booking.contact_name,
        contact_phone: booking.contact_phone,
        contact_email: booking.contact_email,
        special_requests: booking.special_requests,
        payment_method: booking.payment_method,
        travelers: travelers,
      },
    });
  } catch (error) {
    console.error("getBookingDetail error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy chi tiết booking",
    });
  }
};
export const getBookingHistory = async (req, res) => {
  try {
    console.log("GET BOOKING HISTORY FILE ĐANG CHẠY");
    const userId = req.user.id;

    const bookings = await getBookingHistoryByUser(userId);

    const statusLabelMap = {
      pending_payment: "Chờ thanh toán",
      confirmed: "Đã xác nhận",
      cancel_requested: "Chờ xác nhận hủy",
      cancelled: "Đã hủy",
      completed: "Hoàn thành",
    };

    const statusClassMap = {
      pending_payment: "status-pending",
      confirmed: "status-confirmed",
      cancel_requested: "status-cancel-requested",
      cancelled: "status-cancelled",
      completed: "status-completed",
    };

    const mapped = bookings.map((item) => {
      const durationDays = Number(item.duration_days || 1);
      const durationText =
        durationDays <= 1
          ? "1 ngày"
          : `${durationDays} ngày ${durationDays - 1} đêm`;

      const statusRaw = String(item.status || "").trim();

      return {
        id: item.booking_id,
        booking_code: item.booking_code,
        tourName: item.tour_name,
        destination: item.location,
        bookingDate: item.booked_at,
        travelDate: item.departure_date,
        status: statusLabelMap[statusRaw] || "Không xác định",
        statusRaw: statusRaw,
        statusClass: statusClassMap[statusRaw] || "status-default",
        price: item.final_price,
        duration: durationText,
      };
    });
    return res.status(200).json({
      success: true,
      data: mapped,
    });
  } catch (error) {
    console.error("getBookingHistory error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy lịch sử booking",
    });
  }
};
export const getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await getMyBookingsByUser(userId);

    const mapped = bookings.map((item) => {
      let statusLabel = "Không xác định";
      if (item.status === "pending_payment") statusLabel = "Chờ thanh toán";
      else if (item.status === "confirmed") statusLabel = "Đã xác nhận";
      else if (item.status === "cancel_requested")
        statusLabel = "Chờ xác nhận hủy";
      else if (item.status === "cancelled") statusLabel = "Đã hủy";
      else if (item.status === "completed") statusLabel = "Đã hoàn thành";

      let statusClass = "status-default";
      if (item.status === "pending_payment") statusClass = "status-pending";
      else if (item.status === "confirmed") statusClass = "status-confirmed";
      else if (item.status === "cancel_requested")
        statusClass = "status-cancel-requested";
      else if (item.status === "cancelled") statusClass = "status-cancelled";
      else if (item.status === "completed") statusClass = "status-completed";

      const durationDays = Number(item.duration_days || 1);
      const durationText =
        durationDays <= 1
          ? "1 ngày"
          : `${durationDays} ngày ${durationDays - 1} đêm`;

      const participants =
        Number(item.num_adults || 0) +
        Number(item.num_children || 0) +
        Number(item.num_infants || 0);

      return {
        id: item.booking_id,
        booking_code: item.booking_code,
        tourName: item.tour_name,
        destination: item.location,
        travelDate: item.departure_date,
        endDate: null,
        participants: participants,
        status: statusLabel,
        statusRaw: item.status,
        statusClass: statusClass,
        paymentMethod: item.payment_method,
        price: item.final_price,
        duration: durationText,
        imageUrl: item.thumbnail_url || "",
      };
    });

    const today = new Date();

    const upcomingBookings = mapped.filter((item) => {
      if (!item.travelDate) return false;
      return (
        new Date(item.travelDate) >= today && item.statusRaw !== "cancelled"
      );
    });

    const completedBookings = mapped.filter(
      (item) => item.statusRaw === "completed",
    );

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          upcomingCount: upcomingBookings.length,
          completedCount: completedBookings.length,
          totalCount: mapped.length,
        },
        upcomingBookings: upcomingBookings,
      },
    });
  } catch (error) {
    console.error("getMyBookings error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách booking của tôi",
    });
  }
};
export const getBookingSummary = async (req, res) => {
  try {
    const tourId = Number(req.query.tour_id);
    const departureDate = req.query.departure_date || null;
    const adults = Number(req.query.adults || 0);
    const children = Number(req.query.children || 0);

    const totalGuests = adults + children;

    if (!tourId) {
      return res.status(400).json({
        success: false,
        message: "Thiếu tour_id",
      });
    }

    if (totalGuests <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số lượng khách không hợp lệ",
      });
    }

    const tour = await getBookingSummaryData(tourId);

    if (!tour) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy tour",
      });
    }

    const pricePerPerson =
      Number(tour.sale_price || 0) > 0
        ? Number(tour.sale_price)
        : Number(tour.base_price || 0);

    const tourTotal = pricePerPerson * totalGuests;

    const grandTotal = tourTotal;

    return res.status(200).json({
      success: true,
      data: {
        tour_id: tour.id,
        tour_title: tour.title,
        location: tour.location,
        thumbnail_url: tour.thumbnail_url || "",
        departure_date: departureDate,
        adults,
        children,
        total_guests: totalGuests,
        price_per_person: pricePerPerson,
        tour_total: tourTotal,

        grand_total: grandTotal,
      },
    });
  } catch (error) {
    console.error("getBookingSummary error:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy tổng kết đặt tour",
    });
  }
};
export const cancelBooking = async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const userId = req.user.id;
    const reason = String(req.body.reason || "").trim();

    if (!bookingId) {
      return res.status(400).json({
        success: false,
        message: "Booking ID không hợp lệ",
      });
    }

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập lý do hủy",
      });
    }

    // 🔥 Lấy booking
    const [rows] = await db.execute(
      `
      SELECT b.id, b.status, ts.departure_date
      FROM bookings b
      JOIN tour_schedules ts ON b.schedule_id = ts.id
      WHERE b.id = ? AND b.user_id = ?
      LIMIT 1
      `,
      [bookingId, userId],
    );

    if (!rows.length) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }
    const booking = rows[0];
    if (booking.status === "cancel_requested") {
      return res.status(400).json({
        success: false,
        message: "Booking này đã gửi yêu cầu hủy, đang chờ provider xác nhận",
      });
    }

    // Check trạng thái
    if (booking.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking đã bị hủy trước đó",
      });
    }

    if (booking.status === "completed") {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy tour đã hoàn thành",
      });
    }

    if (!["pending_payment", "confirmed"].includes(booking.status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không cho phép hủy",
      });
    }

    // 🔥 Check thời gian (48h)
    const now = new Date();
    const departure = new Date(booking.departure_date);
    const diffHours = (departure - now) / (1000 * 60 * 60);

    if (diffHours < 48) {
      return res.status(400).json({
        success: false,
        message: "Không thể hủy tour trong vòng 48h trước ngày khởi hành",
      });
    }

    // ✅ OK thì mới cho hủy
    await db.execute(
      `
      UPDATE bookings
SET status = 'cancel_requested',
    cancelled_reason = ?,
    cancelled_at = NULL,
    updated_at = NOW()
WHERE id = ? AND user_id = ?
      `,
      [reason, bookingId, userId],
    );

    return res.json({
      success: true,
      message: "Đã gửi yêu cầu hủy tour. Vui lòng chờ provider xác nhận.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Lỗi server",
    });
  }
};
