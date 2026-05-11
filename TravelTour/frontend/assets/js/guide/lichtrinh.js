let schedules = [];

function formatDateVN(dateString) {
  if (!dateString) return "--/--/----";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  return date.toLocaleDateString("vi-VN");
}

function formatTimeRange(startDate, endDate) {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const startTime =
    start && !Number.isNaN(start.getTime())
      ? start.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "--:--";

  const endTime =
    end && !Number.isNaN(end.getTime())
      ? end.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit"
        })
      : "--:--";

  return `${startTime} - ${endTime}`;
}

async function fetchSchedules(filter = "all") {
  const response = await fetch(`/api/guide/schedules?filter=${encodeURIComponent(filter)}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Không thể tải lịch trình");
  }

  return Array.isArray(result.data) ? result.data : [];
}

function renderSchedules(filter = "all") {
  const container = document.getElementById("scheduleList");
  if (!container) return;

  let filtered = schedules;

  if (filter !== "all") {
    filtered = schedules.filter((item) => item.type === filter);
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">Không có lịch trình phù hợp.</div>
    `;
    return;
  }

  container.innerHTML = filtered
    .map(
      (item) => `
        <div class="schedule-card">
          <div class="schedule-top">
            <div>
              <div class="schedule-title">${item.tourName}</div>

              <div class="schedule-info">
                <div>📅 ${formatDateVN(item.startDate)}</div>
                <div>🕒 ${formatTimeRange(item.startDate, item.endDate)}</div>
                <div>📍 ${item.location}</div>
                <div>👥 ${item.customers} khách</div>
              </div>
            </div>

            <div class="schedule-right">
              <span class="status-badge status-${item.type}">
                ${item.status}
              </span>
              <div class="detail-btn" data-tour-id="${item.id}">
                Xem chi tiết →
              </div>
            </div>
          </div>
        </div>
      `
    )
    .join("");
}

function bindEvents() {
  const filterSelect = document.getElementById("statusFilter");
  const filterBtn = document.getElementById("filterBtn");
  const logoutBtn = document.getElementById("logoutBtn");

  filterBtn?.addEventListener("click", async () => {
    try {
      const filter = filterSelect?.value || "all";
      schedules = await fetchSchedules(filter);
      renderSchedules(filter);
    } catch (error) {
      console.error("Lỗi lọc lịch trình:", error);
      alert(error.message || "Không thể lọc lịch trình");
    }
  });

  filterSelect?.addEventListener("change", async () => {
    try {
      const filter = filterSelect.value || "all";
      schedules = await fetchSchedules(filter);
      renderSchedules(filter);
    } catch (error) {
      console.error("Lỗi đổi bộ lọc:", error);
      alert(error.message || "Không thể tải lịch trình");
    }
  });

  logoutBtn?.addEventListener("click", function () {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "http://localhost:3000/login";
  });

  document.addEventListener("click", function (event) {
    const detailBtn = event.target.closest(".detail-btn[data-tour-id]");
    if (!detailBtn) return;

    const tourId = detailBtn.getAttribute("data-tour-id");
    if (!tourId) return;

    window.location.href = `tourdangdan.html?tourId=${tourId}`;
  });
}

async function initPage() {
  try {
    schedules = await fetchSchedules("all");
    renderSchedules("all");
    bindEvents();
  } catch (error) {
    console.error("Lỗi tải lịch trình:", error);

    const container = document.getElementById("scheduleList");
    if (container) {
      container.innerHTML = `
        <div class="empty-state">Không tải được lịch trình.</div>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", initPage);