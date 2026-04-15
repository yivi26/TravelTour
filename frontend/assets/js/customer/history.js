let bookingHistory = [];

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN");
}

function formatCurrency(value) {
  return Number(value || 0).toLocaleString("vi-VN") + " VNĐ";
}
async function loadBookingHistory() {
  try {
    const response = await fetch("http://localhost:3000/api/bookings/history");
    const result = await response.json();

    if (!result.success) {
      console.error(result.message || "Không lấy được lịch sử booking");
      return;
    }

    bookingHistory = result.data || [];
    updateHistory();
  } catch (error) {
    console.error("Lỗi loadBookingHistory:", error);
  }
}
function getHiddenPrice(price) {
  return "••••••••";
}

function renderHistory(data) {
  const historyList = document.getElementById("historyList");
  if (!historyList) return;

  if (!data.length) {
    historyList.innerHTML = `
      <div class="empty-state">
        Không tìm thấy booking phù hợp.
      </div>
    `;
    return;
  }

  historyList.innerHTML = data
    .map(
      (booking) => `
      <div class="history-card">
        <div class="history-content">
          <div class="history-main">
            <div class="history-top">
              <div>
                <h3 class="history-title">${booking.tourName}</h3>
                <div class="history-meta">
                  <div class="meta-item">
                    <span>📍</span>
                    <span>${booking.destination}</span>
                  </div>
                  <div class="meta-item">
                    <span>⏰</span>
                    <span>${booking.duration}</span>
                  </div>
                </div>
              </div>

              <span class="status-chip ${booking.statusClass}">${booking.status}</span>
            </div>

            <div class="history-grid">
              <div class="info-tile">
                <div class="tile-label">Ngày đặt</div>
                <div class="tile-value">
                  <span>📅</span>
                  <span>${formatDate(booking.bookingDate)}</span>
                </div>
              </div>

              <div class="info-tile">
                <div class="tile-label">Ngày khởi hành</div>
                <div class="tile-value">
                  <span>📅</span>
                  <span>${formatDate(booking.travelDate)}</span>
                </div>
              </div>

              <div class="info-tile price-tile">
                <div class="tile-label">Tổng tiền</div>
                <div class="tile-price-row">
                 <div
  class="tile-price"
  id="price-${booking.id}"
  data-price="${formatCurrency(booking.price)}"
  data-hidden="false"
>
  ${formatCurrency(booking.price)}
</div>

                  <button
                    type="button"
                    class="price-toggle-btn"
                    data-action="toggle-price"
                    data-target="price-${booking.id}"
                    aria-label="Ẩn hoặc hiện tổng tiền"
                    title="Ẩn/hiện tổng tiền"
                  >
                    👁
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="history-actions">
            <button class="history-btn history-btn-primary" data-action="detail" data-id="${booking.id}">
              Chi tiết
            </button>

            ${
              booking.status === "Đã xác nhận"
                ? `
              <button class="history-btn history-btn-danger" data-action="cancel" data-id="${booking.id}">
                Hủy tour
              </button>
            `
                : ""
            }

            ${
              booking.status === "Hoàn thành"
                ? `
              <button class="history-btn history-btn-outline" data-action="rebook" data-id="${booking.id}">
                Đặt lại
              </button>
            `
                : ""
            }
          </div>
        </div>
      </div>
    `,
    )
    .join("");
}

function getFilteredHistory() {
  const statusFilterEl = document.getElementById("statusFilter");
  const searchInputEl = document.getElementById("searchInput");

  const statusValue = statusFilterEl ? statusFilterEl.value : "all";
  const searchValue = searchInputEl
    ? searchInputEl.value.trim().toLowerCase()
    : "";

  return bookingHistory.filter((item) => {
    const matchStatus = statusValue === "all" || item.status === statusValue;
    const matchSearch =
      item.tourName.toLowerCase().includes(searchValue) ||
      item.destination.toLowerCase().includes(searchValue);

    return matchStatus && matchSearch;
  });
}

function updateHistory() {
  renderHistory(getFilteredHistory());
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

function togglePrice(targetId, buttonEl) {
  const priceEl = document.getElementById(targetId);
  if (!priceEl) return;

  const isHidden = priceEl.dataset.hidden === "true";
  const realPrice = priceEl.dataset.price || "";

  if (isHidden) {
    priceEl.textContent = realPrice;
    priceEl.dataset.hidden = "false";
    if (buttonEl) buttonEl.textContent = "👁";
  } else {
    priceEl.textContent = getHiddenPrice(realPrice);
    priceEl.dataset.hidden = "true";
    if (buttonEl) buttonEl.textContent = "🙈";
  }
}

function bindEvents() {
  const menuToggle = document.getElementById("menuToggle");
  const sidebarOverlay = document.getElementById("sidebarOverlay");
  const statusFilter = document.getElementById("statusFilter");
  const searchInput = document.getElementById("searchInput");

  if (menuToggle) {
    menuToggle.addEventListener("click", toggleSidebar);
  }

  if (sidebarOverlay) {
    sidebarOverlay.addEventListener("click", closeSidebar);
  }

  if (statusFilter) {
    statusFilter.addEventListener("change", updateHistory);
  }

  if (searchInput) {
    searchInput.addEventListener("input", updateHistory);
  }

  document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const action = target.dataset.action;

    if (action === "toggle-price") {
      togglePrice(target.dataset.target, target);
      return;
    }

    if (action === "detail") {
      window.location.href = `../tours/chitiet.html?booking_id=${target.dataset.id}`;
      return;
    }

    if (action === "cancel") {
      alert("Hủy tour booking ID: " + target.dataset.id);
    }

    if (action === "rebook") {
      alert("Đặt lại booking ID: " + target.dataset.id);
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024) {
      closeSidebar();
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  bindEvents();
  loadBookingHistory();
});
