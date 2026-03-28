const recentBookings = [
  {
    id: 1,
    tourName: "Du lịch Hạ Long - 3 ngày 2 đêm",
    destination: "Vịnh Hạ Long, Quảng Ninh",
    bookingDate: "15/03/2026",
    travelDate: "20/04/2026",
    status: "Đã xác nhận",
    statusClass: "status-confirmed",
    price: "4.500.000 VNĐ",
  },
  {
    id: 2,
    tourName: "Phú Quốc - Thiên đường biển đảo",
    destination: "Phú Quốc, Kiên Giang",
    bookingDate: "10/03/2026",
    travelDate: "05/05/2026",
    status: "Chờ thanh toán",
    statusClass: "status-pending",
    price: "6.200.000 VNĐ",
  },
  {
    id: 3,
    tourName: "Sapa - Khám phá núi rừng Tây Bắc",
    destination: "Sapa, Lào Cai",
    bookingDate: "01/03/2026",
    travelDate: "15/03/2026",
    status: "Hoàn thành",
    statusClass: "status-completed",
    price: "3.800.000 VNĐ",
  },
];

function renderBookings() {
  const bookingList = document.getElementById("bookingList");
  if (!bookingList) return;

  bookingList.innerHTML = recentBookings
    .map(
      (booking) => `
    <div class="booking-item">
      <div class="booking-content">
        <div class="booking-main">
          <div class="booking-top">
            <h3 class="booking-title">${booking.tourName}</h3>
            <span class="status-badge ${booking.statusClass}">${booking.status}</span>
          </div>

          <div class="booking-location">
            <span>📍</span>
            <span>${booking.destination}</span>
          </div>

          <div class="booking-dates">
            <div>
              <span class="date-label">Ngày đặt</span>
              <span class="date-value">${booking.bookingDate}</span>
            </div>
            <div>
              <span class="date-label">Ngày khởi hành</span>
              <span class="date-value">${booking.travelDate}</span>
            </div>
          </div>
        </div>

        <div class="booking-side">
          <div class="total-box">
            <p class="total-label">Tổng tiền</p>
            <p class="total-price">${booking.price}</p>
          </div>
          <button class="btn btn-detail" data-id="${booking.id}">Chi tiết</button>
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
  sidebar.classList.toggle("open");
  overlay.classList.toggle("show");
}

function closeSidebar() {
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("sidebarOverlay");
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

function bindEvents() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const changeAvatarBtn = document.getElementById("changeAvatarBtn");
  const updateInfoBtn = document.getElementById("updateInfoBtn");
  const changePasswordBtn = document.getElementById("changePasswordBtn");
  const viewAllBtn = document.getElementById("viewAllBtn");

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  if (changeAvatarBtn) {
    changeAvatarBtn.addEventListener("click", function () {
      alert("Chức năng đổi ảnh đại diện sẽ làm sau.");
    });
  }

  if (updateInfoBtn) {
    updateInfoBtn.addEventListener("click", function () {
      alert("Chức năng cập nhật thông tin sẽ làm sau.");
    });
  }

  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", function () {
      window.location.href = "customer_changepass.html";
    });
  }

  if (viewAllBtn) {
    viewAllBtn.addEventListener("click", function () {
      window.location.href = "history.html";
      alert("Đi tới trang tất cả booking.");
    });
  }

  document.addEventListener("click", function (event) {
    if (event.target.classList.contains("btn-detail")) {
      const bookingId = Number(event.target.getAttribute("data-id"));
      const booking = recentBookings.find((item) => item.id === bookingId);

      if (booking) {
        alert(
          "Tour: " +
            booking.tourName +
            "\n" +
            "Điểm đến: " +
            booking.destination +
            "\n" +
            "Ngày đặt: " +
            booking.bookingDate +
            "\n" +
            "Ngày khởi hành: " +
            booking.travelDate +
            "\n" +
            "Trạng thái: " +
            booking.status +
            "\n" +
            "Tổng tiền: " +
            booking.price,
        );
      }
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024) {
      closeSidebar();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderBookings();
  bindEvents();
});
