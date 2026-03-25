Chart.defaults.font.family = "'Inter', sans-serif";
Chart.defaults.color = "#9ca3af";

const topTours = [
  {
    rank: 1,
    name: "Tour Paris Lãng mạn",
    bookings: 45,
    revenue: "1,125,000,000 ₫",
    className: "num-1",
  },
  {
    rank: 2,
    name: "Tour Santorini 6N5Đ",
    bookings: 38,
    revenue: "700,000,000 ₫",
    className: "num-2",
  },
  {
    rank: 3,
    name: "Tour Bali 5N4Đ",
    bookings: 35,
    revenue: "420,000,000 ₫",
    className: "num-3",
  },
  {
    rank: 4,
    name: "Tour Kyoto văn hóa",
    bookings: 28,
    revenue: "420,000,000 ₫",
    className: "num-4",
  },
  {
    rank: 5,
    name: "Tour Aurora Bắc Cực",
    bookings: 15,
    revenue: "780,000,000 ₫",
    className: "num-5",
  },
];

const revenueRows = [
  {
    name: "Tour Bali",
    bookings: "35 booking",
    revenue: "420,000,000 ₫",
    rate: "35%",
    color: "#10b981",
  },
  {
    name: "Tour Paris",
    bookings: "25 booking",
    revenue: "1,125,000,000 ₫",
    rate: "25%",
    color: "#3b82f6",
  },
  {
    name: "Tour Santorini",
    bookings: "20 booking",
    revenue: "700,000,000 ₫",
    rate: "20%",
    color: "#f59e0b",
  },
  {
    name: "Tour Kyoto",
    bookings: "15 booking",
    revenue: "420,000,000 ₫",
    rate: "15%",
    color: "#a855f7",
  },
  {
    name: "Khác",
    bookings: "5 booking",
    revenue: "150,000,000 ₫",
    rate: "5%",
    color: "#ec4899",
  },
];

function renderTopTours() {
  const container = document.getElementById("topTours");
  if (!container) return;

  container.innerHTML = topTours
    .map(
      (item) => `
    <div class="top-item">
      <div class="ti-number ${item.className}">${item.rank}</div>
      <div class="ti-info">
        <div class="ti-name">${item.name}</div>
        <div class="ti-bookings">${item.bookings} booking</div>
      </div>
      <div class="ti-revenue">${item.revenue}</div>
    </div>
  `,
    )
    .join("");
}

function renderRevenueTable() {
  const tbody = document.getElementById("revenueTableBody");
  if (!tbody) return;

  tbody.innerHTML = revenueRows
    .map(
      (item) => `
    <tr>
      <td class="td-name">
        <span class="color-dot" style="background:${item.color}"></span>
        ${item.name}
      </td>
      <td>${item.bookings}</td>
      <td class="td-revenue">${item.revenue}</td>
      <td>${item.rate}</td>
    </tr>
  `,
    )
    .join("");
}

function initBarChart() {
  const ctx = document.getElementById("barChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "bar",
    data: {
      labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
      datasets: [
        {
          label: "Doanh thu",
          data: [240, 250, 265, 290, 310, 325],
          backgroundColor: "#10b981",
          borderRadius: 4,
          barPercentage: 0.7,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 340,
          ticks: {
            stepSize: 85,
            callback: function (value) {
              return value + "M";
            },
          },
          border: { display: false },
          grid: {
            color: "#f3f4f6",
            drawTicks: false,
          },
        },
        x: {
          grid: { display: false },
          border: { display: false },
        },
      },
    },
  });
}

function initLineChart() {
  const ctx = document.getElementById("lineChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "line",
    data: {
      labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
      datasets: [
        {
          label: "Booking",
          data: [32, 38, 42, 45, 48, 52],
          borderColor: "#3b82f6",
          backgroundColor: "#ffffff",
          borderWidth: 3,
          pointBackgroundColor: "#3b82f6",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
          pointRadius: 5,
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 60,
          ticks: { stepSize: 15 },
          border: { display: false },
          grid: {
            color: "#f3f4f6",
            drawTicks: false,
          },
        },
        x: {
          grid: {
            color: "#f3f4f6",
            drawTicks: false,
          },
          border: { display: false },
        },
      },
    },
  });
}

function initPieChart() {
  const ctx = document.getElementById("pieChart");
  if (!ctx) return;

  new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Tour Bali", "Paris", "Tour Santorini", "Tour Kyoto", "Khác"],
      datasets: [
        {
          data: [35, 25, 20, 15, 5],
          backgroundColor: [
            "#10b981",
            "#3b82f6",
            "#f59e0b",
            "#a855f7",
            "#ec4899",
          ],
          borderWidth: 1,
          borderColor: "#ffffff",
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderTopTours();
  renderRevenueTable();
  initBarChart();
  initLineChart();
  initPieChart();
});
