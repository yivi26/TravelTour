import {
  getToursByProvider,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
  updateTourStatus,
  getBookingsByProvider,
  updateBookingStatus,
  getGuides,
  assignGuide,
  getProviderProfile,
  updateProviderProfile,
  getDashboardDataByProvider,
  getPublicFeaturedTours,
  getPublicTours,
  getPublicTourById
} from "../models/providerModel.js";

const PROVIDER_ID = 1;

/* =========================
   PUBLIC API CHO KHÁCH HÀNG
========================= */
export async function getPublicFeaturedToursController(req, res) {
  try {
    const limit = Number(req.query.limit || 6);
    const tours = await getPublicFeaturedTours(limit);

    return res.status(200).json({
      message: "Lấy danh sách tour nổi bật thành công",
      data: tours
    });
  } catch (err) {
    console.error("❌ PUBLIC FEATURED TOURS ERROR:", err);
    return res.status(500).json({
      message: "Lỗi lấy tour nổi bật",
      error: err.message
    });
  }
}

export async function getPublicToursController(req, res) {
  try {
    const tours = await getPublicTours({
      destination: req.query.destination || "",
      limit: Number(req.query.limit || 20)
    });

    return res.status(200).json({
      message: "Lấy danh sách tour thành công",
      data: tours
    });
  } catch (err) {
    console.error("❌ PUBLIC TOURS ERROR:", err);
    return res.status(500).json({
      message: "Lỗi lấy danh sách tour",
      error: err.message
    });
  }
}

export async function getPublicTourDetailController(req, res) {
  try {
    const tourId = Number(req.params.id);

    if (!tourId) {
      return res.status(400).json({
        message: "ID tour không hợp lệ"
      });
    }

    const tour = await getPublicTourById(tourId);

    if (!tour) {
      return res.status(404).json({
        message: "Không tìm thấy tour"
      });
    }

    return res.status(200).json({
      message: "Lấy chi tiết tour thành công",
      data: tour
    });
  } catch (err) {
    console.error("❌ PUBLIC TOUR DETAIL ERROR:", err);
    return res.status(500).json({
      message: "Lỗi lấy chi tiết tour",
      error: err.message
    });
  }
}

/* =========================
   PROVIDER DASHBOARD
========================= */
export async function getDashboardData(req, res) {
  try {
    const dashboardData = await getDashboardDataByProvider(PROVIDER_ID);

    return res.status(200).json({
      message: "Lấy dữ liệu dashboard thành công",
      data: dashboardData
    });
  } catch (err) {
    console.error("❌ DASHBOARD ERROR:", err);
    return res.status(500).json({
      message: "Lỗi lấy dữ liệu dashboard",
      error: err.message
    });
  }
}

/* =========================
   PROVIDER PROFILE
========================= */
export async function getProfile(req, res) {
  try {
    const profile = await getProviderProfile(PROVIDER_ID);

    if (!profile) {
      return res.status(404).json({
        message: "Không tìm thấy hồ sơ provider"
      });
    }

    return res.status(200).json({ profile });
  } catch (err) {
    console.error("❌ GET PROFILE ERROR:", err);
    return res.status(500).json({
      message: "Lỗi lấy hồ sơ provider",
      error: err.message
    });
  }
}

export async function updateProfile(req, res) {
  try {
    const profile = await updateProviderProfile(PROVIDER_ID, req.body);

    return res.status(200).json({
      message: "Cập nhật hồ sơ provider thành công",
      profile
    });
  } catch (err) {
    console.error("❌ UPDATE PROFILE ERROR:", err);
    return res.status(500).json({
      message: "Lỗi cập nhật hồ sơ provider",
      error: err.message
    });
  }
}

/* =========================
   PROVIDER TOURS
========================= */
export async function getTours(req, res) {
  try {
    const tours = await getToursByProvider(PROVIDER_ID);
    return res.status(200).json(tours);
  } catch (err) {
    console.error("❌ TOUR ERROR:", err);
    return res.status(500).json({
      message: "Lỗi lấy tour",
      error: err.message
    });
  }
}

export async function getTourDetailController(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID tour không hợp lệ"
      });
    }

    const tour = await getTourById(PROVIDER_ID, id);

    if (!tour) {
      return res.status(404).json({
        message: "Không tìm thấy tour"
      });
    }

    return res.status(200).json(tour);
  } catch (err) {
    console.error("❌ GET TOUR DETAIL ERROR:", err);
    return res.status(500).json({
      message: "Lỗi lấy chi tiết tour",
      error: err.message
    });
  }
}

export async function createNewTour(req, res) {
  try {
    const tourId = await createTour(PROVIDER_ID, req.body);
    return res.status(201).json({
      message: "Tạo tour thành công",
      tourId
    });
  } catch (err) {
    console.error("❌ CREATE TOUR ERROR:", err);
    return res.status(500).json({
      message: "Lỗi tạo tour",
      error: err.message
    });
  }
}

export async function updateTourController(req, res) {
  try {
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID tour không hợp lệ"
      });
    }

    const existedTour = await getTourById(PROVIDER_ID, id);

    if (!existedTour) {
      return res.status(404).json({
        message: "Không tìm thấy tour để cập nhật"
      });
    }

    await updateTour(PROVIDER_ID, id, req.body);

    return res.status(200).json({
      message: "Cập nhật tour thành công"
    });
  } catch (err) {
    console.error("❌ UPDATE TOUR ERROR:", err);
    return res.status(500).json({
      message: "Lỗi cập nhật tour",
      error: err.message
    });
  }
}

export async function deleteTourController(req, res) {
  try {
    await deleteTour(req.params.id);
    return res.status(200).json({
      message: "Xóa tour thành công"
    });
  } catch (err) {
    console.error("❌ DELETE TOUR ERROR:", err);
    return res.status(500).json({
      message: "Lỗi xóa tour",
      error: err.message
    });
  }
}

export async function updateTourStatusController(req, res) {
  try {
    const { status } = req.body;
    const id = Number(req.params.id);

    if (!id) {
      return res.status(400).json({
        message: "ID tour không hợp lệ"
      });
    }

    if (!status) {
      return res.status(400).json({
        message: "Thiếu trạng thái tour"
      });
    }

    const allowedStatuses = ["draft", "active", "paused", "archived", "full"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "Trạng thái tour không hợp lệ"
      });
    }

    await updateTourStatus(id, status);

    return res.status(200).json({
      message: "Cập nhật trạng thái tour thành công"
    });
  } catch (err) {
    console.error("❌ UPDATE TOUR STATUS ERROR:", err);
    return res.status(500).json({
      message: "Lỗi cập nhật trạng thái tour",
      error: err.message
    });
  }
}

/* =========================
   PROVIDER BOOKINGS
========================= */
export async function getBookings(req, res) {
  try {
    const bookings = await getBookingsByProvider(PROVIDER_ID);
    return res.status(200).json(bookings);
  } catch (err) {
    console.error("❌ BOOKING ERROR:", err);
    return res.status(500).json({
      message: "Lỗi booking",
      error: err.message
    });
  }
}

export async function updateBooking(req, res) {
  try {
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        message: "Thiếu trạng thái booking"
      });
    }

    await updateBookingStatus(req.params.id, status);

    return res.status(200).json({
      message: "Cập nhật booking thành công"
    });
  } catch (err) {
    console.error("❌ UPDATE BOOKING ERROR:", err);
    return res.status(500).json({
      message: "Lỗi update booking",
      error: err.message
    });
  }
}

/* =========================
   PROVIDER GUIDES
========================= */
export async function getAllGuides(req, res) {
  try {
    const guides = await getGuides(PROVIDER_ID);
    return res.status(200).json(guides);
  } catch (err) {
    console.error("❌ GUIDE ERROR:", err);
    return res.status(500).json({
      message: "Lỗi guide",
      error: err.message
    });
  }
}

export async function assignGuideController(req, res) {
  try {
    const { bookingId, guideId } = req.body;

    if (!bookingId || !guideId) {
      return res.status(400).json({
        message: "Thiếu bookingId hoặc guideId"
      });
    }

    await assignGuide(bookingId, guideId);

    return res.status(200).json({
      message: "Phân công thành công"
    });
  } catch (err) {
    console.error("❌ ASSIGN GUIDE ERROR:", err);
    return res.status(500).json({
      message: "Lỗi assign guide",
      error: err.message
    });
  }
}