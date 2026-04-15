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
    console.log("PAYMENT METHOD FROM REQ:", payment_method);
    console.log("REQ BODY FULL:", req.body);
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

    const unitPrice = Number(tour.sale_price || tour.base_price || 0);
    const totalTravelers =
      travelerCounts.adults + travelerCounts.children + travelerCounts.infants;

    const totalPrice = unitPrice * totalTravelers;
    const discountAmount = 0;
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
      status: "pending",
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
    return res.status(500).json({
      success: false,
      message: "Lỗi server khi tạo booking",
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

      if (item.status === "pending") {
        statusLabel = "Chờ thanh toán";
      } else if (item.status === "confirmed") {
        statusLabel = "Đã xác nhận";
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
    if (booking.status === "pending") statusLabel = "Chờ thanh toán";
    else if (booking.status === "confirmed") statusLabel = "Đã xác nhận";
    else if (booking.status === "completed") statusLabel = "Hoàn thành";
    else if (booking.status === "cancelled") statusLabel = "Đã hủy";

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
    const userId = req.user.id;

    const bookings = await getBookingHistoryByUser(userId);

    const mapped = bookings.map((item) => {
      let statusLabel = "Không xác định";

      if (item.status === "pending") statusLabel = "Chờ thanh toán";
      else if (item.status === "confirmed") statusLabel = "Đã xác nhận";
      else if (item.status === "completed") statusLabel = "Hoàn thành";
      else if (item.status === "cancelled") statusLabel = "Đã hủy";

      let statusClass = "status-default";
      if (item.status === "pending") statusClass = "status-pending";
      else if (item.status === "confirmed") statusClass = "status-confirmed";
      else if (item.status === "completed") statusClass = "status-completed";
      else if (item.status === "cancelled") statusClass = "status-cancelled";

      const durationDays = Number(item.duration_days || 1);
      const durationText =
        durationDays <= 1
          ? "1 ngày"
          : `${durationDays} ngày ${durationDays - 1} đêm`;

      return {
        id: item.booking_id,
        booking_code: item.booking_code,
        tourName: item.tour_name,
        destination: item.location,
        bookingDate: item.booked_at,
        travelDate: item.departure_date,
        status: statusLabel,
        statusRaw: item.status,
        statusClass: statusClass,
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
      if (item.status === "pending") statusLabel = "Chờ thanh toán";
      else if (item.status === "confirmed") statusLabel = "Đã xác nhận";
      else if (item.status === "completed") statusLabel = "Đã hoàn thành";
      else if (item.status === "cancelled") statusLabel = "Đã hủy";

      let statusClass = "status-default";
      if (item.status === "pending") statusClass = "status-pending";
      else if (item.status === "confirmed") statusClass = "status-confirmed";
      else if (item.status === "completed") statusClass = "status-completed";
      else if (item.status === "cancelled") statusClass = "status-cancelled";

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
