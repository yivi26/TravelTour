let guidesData = [];
let bookingsData = [];

function formatDateVN(dateString) {
  if (!dateString) return "--/--/----";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--/--/----";

  return date.toLocaleDateString("vi-VN");
}

function getStatusText(status) {
  const map = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancelled: "Đã hủy"
  };

  return map[status] || status || "Không xác định";
}

function normalizeGuide(guide) {
  return {
    id: Number(guide.id),
    name: guide.full_name || "Chưa có tên",
    rating: guide.rating || "N/A",
    experience:
      guide.experience_years != null
        ? `${guide.experience_years} năm`
        : guide.experience || "Chưa cập nhật",
    languages: guide.languages || "Chưa cập nhật"
  };
}

function normalizeBooking(booking) {
  return {
    bookingId: Number(booking.booking_id || booking.id),
    title: booking.tour_title || "Chưa có tên tour",
    destination: booking.location || "Chưa cập nhật",
    departureDate: booking.departure_date || null,
    guests: Number(booking.total_pax || 0),
    assignedGuideName: booking.guide_name || "",
    status: booking.booking_status || booking.status || "",
    guideStatus: booking.guide_status || ""
  };
}

async function fetchGuides() {
  const response = await fetch("/api/provider/guides", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh sách HDV");
  }

  return Array.isArray(data) ? data.map(normalizeGuide) : [];
}

async function fetchBookings() {
  const response = await fetch("/api/provider/bookings", {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const data = await response.json().catch(() => []);

  if (!response.ok) {
    throw new Error(data.message || "Không thể tải danh sách tour");
  }

  return Array.isArray(data) ? data.map(normalizeBooking) : [];
}

async function assignGuideToBooking(bookingId, guideId) {
  const response = await fetch("/api/provider/assign-guide", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      bookingId,
      guideId
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Phân công hướng dẫn viên thất bại");
  }

  return data;
}

function renderGuides(data) {
  const container = document.getElementById("guideList");
  if (!container) return;

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">Không tìm thấy hướng dẫn viên.</div>
    `;
    return;
  }

  container.innerHTML = data
    .map(
      (guide) => `
        <div class="guide-card">
          <div class="gc-avatar"><i class="fa-solid fa-user"></i></div>
          <div class="gc-info">
            <div class="gc-header">
              <span class="gc-name">${guide.name}</span>
              <span class="gc-rating"><i class="fa-solid fa-star"></i> ${guide.rating}</span>
            </div>
            <div class="gc-exp">${guide.experience}</div>
            <div class="gc-lang">${guide.languages}</div>
          </div>
        </div>
      `
    )
    .join("");
}

function renderTours(data) {
  const container = document.getElementById("tourList");
  if (!container) return;

  if (!Array.isArray(data) || data.length === 0) {
    container.innerHTML = `
      <div class="empty-state">Không tìm thấy tour phù hợp.</div>
    `;
    return;
  }

  container.innerHTML = data
    .map((tour) => {
      const isAssigned = Boolean(tour.assignedGuideName);

      return `
        <div class="tour-card">
          <div class="tc-title">${tour.title}</div>

          <div class="tc-details">
            <p><i class="fa-solid fa-location-dot"></i> ${tour.destination}</p>
            <p><i class="fa-regular fa-calendar"></i> Khởi hành: ${formatDateVN(tour.departureDate)}</p>
            <p><i class="fa-solid fa-users"></i> ${tour.guests} khách</p>
            <p><i class="fa-solid fa-ticket"></i> Trạng thái booking: ${getStatusText(tour.status)}</p>
          </div>

          <div class="tc-assign-label">Hướng dẫn viên</div>

          <div class="tc-assign-row">
            <select class="tc-select" data-booking-id="${tour.bookingId}">
              <option value="">Chọn hướng dẫn viên</option>
              ${guidesData
                .map(
                  (guide) => `
                    <option value="${guide.id}">
                      ${guide.name}
                    </option>
                  `
                )
                .join("")}
            </select>

            <button
              class="btn-action"
              data-action="assign"
              data-booking-id="${tour.bookingId}"
            >
              ${isAssigned ? "Cập nhật" : "Phân công"}
            </button>
          </div>

          <div class="tc-status ${isAssigned ? "" : "hidden"}">
            <i class="fa-solid fa-check"></i>
            <span>Đã phân công: ${isAssigned ? tour.assignedGuideName : ""}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function getFilteredData() {
  const input = document.getElementById("globalSearchInput");
  const keyword = (input?.value || "").trim().toLowerCase();

  const filteredGuides = guidesData.filter((guide) => {
    return (
      guide.name.toLowerCase().includes(keyword) ||
      String(guide.languages).toLowerCase().includes(keyword) ||
      String(guide.experience).toLowerCase().includes(keyword) ||
      String(guide.rating).toLowerCase().includes(keyword)
    );
  });

  const filteredTours = bookingsData.filter((tour) => {
    return (
      tour.title.toLowerCase().includes(keyword) ||
      tour.destination.toLowerCase().includes(keyword) ||
      formatDateVN(tour.departureDate).toLowerCase().includes(keyword) ||
      String(tour.guests).includes(keyword) ||
      String(tour.assignedGuideName).toLowerCase().includes(keyword) ||
      getStatusText(tour.status).toLowerCase().includes(keyword)
    );
  });

  return { filteredGuides, filteredTours };
}

function updateView() {
  const { filteredGuides, filteredTours } = getFilteredData();
  renderGuides(filteredGuides);
  renderTours(filteredTours);
}

async function handleAssign(bookingId) {
  const select = document.querySelector(`select[data-booking-id="${bookingId}"]`);
  if (!select) return;

  const guideId = Number(select.value);

  if (!guideId) {
    alert("Vui lòng chọn hướng dẫn viên.");
    return;
  }

  try {
    await assignGuideToBooking(bookingId, guideId);

    await loadPageData();
    alert("Phân công hướng dẫn viên thành công.");
  } catch (error) {
    console.error("Lỗi phân công:", error);
    alert(error.message || "Có lỗi xảy ra khi phân công.");
  }
}

function bindEvents() {
  const searchInput = document.getElementById("globalSearchInput");

  if (searchInput) {
    searchInput.addEventListener("input", updateView);
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action='assign']");
    if (!button) return;

    const bookingId = Number(button.getAttribute("data-booking-id"));
    if (!bookingId) return;

    handleAssign(bookingId);
  });
}

async function loadPageData() {
  const [guides, bookings] = await Promise.all([
    fetchGuides(),
    fetchBookings()
  ]);

  guidesData = guides;
  bookingsData = bookings.filter((item) => item.status !== "cancelled");

  updateView();
}

async function initPage() {
  try {
    await loadPageData();
    bindEvents();
  } catch (error) {
    console.error("Lỗi tải dữ liệu trang phân công guide:", error);

    const guideList = document.getElementById("guideList");
    const tourList = document.getElementById("tourList");

    if (guideList) {
      guideList.innerHTML = `
        <div class="empty-state">Không tải được danh sách hướng dẫn viên.</div>
      `;
    }

    if (tourList) {
      tourList.innerHTML = `
        <div class="empty-state">Không tải được danh sách tour.</div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", initPage);