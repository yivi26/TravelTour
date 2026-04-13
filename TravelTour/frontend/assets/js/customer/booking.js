const upcomingBookings = [
  {
    id: 1,
    tourName: "Du lịch Hạ Long - 3 ngày 2 đêm",
    destination: "Vịnh Hạ Long, Quảng Ninh",
    travelDate: "20/04/2026",
    endDate: "22/04/2026",
    participants: 2,
    status: "Đã xác nhận",
    statusClass: "status-confirmed",
    price: "4.500.000 VNĐ",
    duration: "3 ngày 2 đêm",
    imageUrl:
      "https://images.unsplash.com/photo-1528127269322-539801943592?w=800",
  },
  {
    id: 2,
    tourName: "Phú Quốc - Thiên đường biển đảo",
    destination: "Phú Quốc, Kiên Giang",
    travelDate: "05/05/2026",
    endDate: "08/05/2026",
    participants: 4,
    status: "Chờ thanh toán",
    statusClass: "status-pending",
    price: "6.200.000 VNĐ",
    duration: "4 ngày 3 đêm",
    imageUrl: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800",
  },
];

function renderStats() {
  const upcomingCount = document.getElementById("upcomingCount");
  const completedCount = document.getElementById("completedCount");
  const totalCount = document.getElementById("totalCount");

  if (upcomingCount) upcomingCount.textContent = upcomingBookings.length;
  if (completedCount) completedCount.textContent = "3";
  if (totalCount) totalCount.textContent = String(upcomingBookings.length + 3);
}

function renderUpcomingBookings() {
  const list = document.getElementById("upcomingBookingList");
  if (!list) return;

  if (!upcomingBookings.length) {
    list.innerHTML = `
      <div class="empty-booking">
        Chưa có booking nào sắp tới. Hãy khám phá và đặt tour ngay!
      </div>
    `;
    return;
  }

  list.innerHTML = upcomingBookings
    .map(
      (booking) => `
    <div class="upcoming-booking-card">
      <div class="upcoming-booking-layout">
        <div class="booking-image" style="background-image: url('${booking.imageUrl}')">
          <div class="booking-image-icon">📍</div>
        </div>

        <div class="booking-detail">
          <div class="booking-detail-top">
            <div class="booking-title-wrap">
              <h3>${booking.tourName}</h3>
              <div class="booking-location">
                <span>📍</span>
                <span>${booking.destination}</span>
              </div>
            </div>

            <span class="booking-status ${booking.statusClass}">${booking.status}</span>
          </div>

          <div class="booking-meta-grid">
            <div class="meta-box">
              <p class="meta-label">Ngày đi</p>
              <div class="meta-value">
                <span>📅</span>
                <span>${booking.travelDate}</span>
              </div>
            </div>

            <div class="meta-box">
              <p class="meta-label">Ngày về</p>
              <div class="meta-value">
                <span>📅</span>
                <span>${booking.endDate}</span>
              </div>
            </div>

            <div class="meta-box">
              <p class="meta-label">Thời gian</p>
              <div class="meta-value">
                <span>⏰</span>
                <span>${booking.duration}</span>
              </div>
            </div>

            <div class="meta-box">
              <p class="meta-label">Số người</p>
              <div class="meta-value">
                <span>👥</span>
                <span>${booking.participants} người</span>
              </div>
            </div>
          </div>

          <div class="booking-footer">
            <div>
              <p class="booking-price-text">Tổng tiền</p>
              <p class="booking-price-value">${booking.price}</p>
            </div>

            <div class="booking-action-group">
              ${
                booking.status === "Chờ thanh toán"
                  ? `
                <button class="booking-btn booking-btn-primary" data-action="pay" data-id="${booking.id}">
                  Thanh toán ngay
                </button>
              `
                  : ""
              }

              <button class="booking-btn booking-btn-outline-primary" data-action="detail" data-id="${booking.id}">
                Chi tiết
              </button>

              <button class="booking-btn booking-btn-outline-muted" data-action="contact" data-id="${booking.id}">
                Liên hệ
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

function toggleSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.toggle("open");
  if (overlay) overlay.classList.toggle("show");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("show");
}

function bindEvents() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  document.addEventListener("click", function (event) {
    const target = event.target;
    const action = target.dataset.action;
    const id = target.dataset.id;

    if (!action || !id) return;

    if (action === "pay") {
      alert("Thanh toán booking ID: " + id);
    }

    if (action === "detail") {
      alert("Xem chi tiết booking ID: " + id);
    }

    if (action === "contact") {
      alert("Liên hệ hỗ trợ cho booking ID: " + id);
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024) {
      closeSidebar();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderStats();
  renderUpcomingBookings();
  bindEvents();
});
async function loadUpcoming() {
  const res = await fetch("http://localhost:5000/api/customer/bookings/upcoming", {
    headers: {
      Authorization: "Bearer " + localStorage.getItem("token")
    }
  });

  const data = await res.json();
  renderUpcomingBookings(data);
}