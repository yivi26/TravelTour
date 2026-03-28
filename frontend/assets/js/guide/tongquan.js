const stats = [
  {
    title: "Tour đang dẫn",
    value: "5",
    icon: "📍",
    colorClass: "stat-blue",
  },
  {
    title: "Tổng số khách",
    value: "127",
    icon: "👥",
    colorClass: "stat-green",
  },
  {
    title: "Thu nhập tháng",
    value: "45.5M",
    icon: "💰",
    colorClass: "stat-yellow",
  },
  {
    title: "Tour đã hoàn thành",
    value: "32",
    icon: "✅",
    colorClass: "stat-purple",
  },
];

const upcomingTours = [
  {
    id: 1,
    name: "Tour Hạ Long 3 ngày 2 đêm",
    date: "25/03/2026",
    time: "08:00",
    customers: 12,
    status: "Sắp diễn ra",
  },
  {
    id: 2,
    name: "Tour Sapa - Fansipan",
    date: "28/03/2026",
    time: "06:00",
    customers: 15,
    status: "Sắp diễn ra",
  },
  {
    id: 3,
    name: "Tour Phú Quốc 4N3Đ",
    date: "01/04/2026",
    time: "10:00",
    customers: 20,
    status: "Sắp diễn ra",
  },
];

const quickActions = [
  {
    title: "Lịch trình hôm nay",
    desc: "Bạn có 2 tour hôm nay",
    btnText: "Xem chi tiết",
    cardClass: "action-green",
    action: "today-schedule",
  },
  {
    title: "Tin nhắn mới",
    desc: "5 tin nhắn chưa đọc",
    btnText: "Xem tin nhắn",
    cardClass: "action-blue",
    action: "messages",
  },
  {
    title: "Đánh giá mới",
    desc: "3 đánh giá mới từ khách",
    btnText: "Xem đánh giá",
    cardClass: "action-yellow",
    action: "reviews",
  },
];

function renderStats() {
  const statsGrid = document.getElementById("statsGrid");
  if (!statsGrid) return;

  statsGrid.innerHTML = stats
    .map(
      (stat) => `
    <div class="stat-card ${stat.colorClass}">
      <div class="stat-inner">
        <div>
          <p class="stat-title">${stat.title}</p>
          <p class="stat-value">${stat.value}</p>
        </div>
        <div class="stat-icon-box">
          <span class="stat-icon">${stat.icon}</span>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderUpcomingTours() {
  const upcomingToursList = document.getElementById("upcomingToursList");
  if (!upcomingToursList) return;

  upcomingToursList.innerHTML = upcomingTours
    .map(
      (tour) => `
    <div class="upcoming-item">
      <div class="upcoming-left">
        <h4 class="upcoming-name">${tour.name}</h4>
        <div class="upcoming-meta">
          <span>📅 ${tour.date}</span>
          <span>🕐 ${tour.time}</span>
          <span>👥 ${tour.customers} khách</span>
        </div>
      </div>
      <span class="upcoming-status">${tour.status}</span>
    </div>
  `,
    )
    .join("");
}

function renderQuickActions() {
  const quickActionsGrid = document.getElementById("quickActionsGrid");
  if (!quickActionsGrid) return;

  quickActionsGrid.innerHTML = quickActions
    .map(
      (item) => `
    <div class="action-card ${item.cardClass}">
      <h4>${item.title}</h4>
      <p>${item.desc}</p>
      <button class="action-btn" data-action="${item.action}">
        ${item.btnText}
      </button>
    </div>
  `,
    )
    .join("");
}

function bindEvents() {
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      alert("Đăng xuất");
    });
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.getAttribute("data-action");

    if (action === "today-schedule") {
      alert("Đi tới chi tiết lịch trình hôm nay");
    }

    if (action === "messages") {
      alert("Đi tới trang tin nhắn");
    }

    if (action === "reviews") {
      alert("Đi tới trang đánh giá");
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderStats();
  renderUpcomingTours();
  renderQuickActions();
  bindEvents();
});
