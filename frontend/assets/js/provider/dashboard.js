const recentBookings = [
  {
    customer: "Nguyễn Văn A",
    tour: "Tour Bali 5N4Đ",
    date: "20/03/2026",
    status: "Đã xác nhận",
    statusClass: "confirmed",
  },
  {
    customer: "Trần Thị B",
    tour: "Tour Paris 7N6Đ",
    date: "22/03/2026",
    status: "Chờ xác nhận",
    statusClass: "pending",
  },
  {
    customer: "Lê Văn C",
    tour: "Tour Santorini 6N5Đ",
    date: "25/03/2026",
    status: "Đã xác nhận",
    statusClass: "confirmed",
  },
  {
    customer: "Phạm Thị D",
    tour: "Tour Kyoto 5N4Đ",
    date: "28/03/2026",
    status: "Đã xác nhận",
    statusClass: "confirmed",
  },
];

const upcomingTours = [
  {
    name: "Tour Bali",
    guide: "HDV: Nguyễn Minh",
    date: "20/03/2026",
    guests: "12 khách",
  },
  {
    name: "Tour Paris",
    guide: "HDV: Trần Hà",
    date: "22/03/2026",
    guests: "8 khách",
  },
  {
    name: "Tour Santorini",
    guide: "HDV: Lê Phương",
    date: "25/03/2026",
    guests: "15 khách",
  },
];

function renderRecentBookings() {
  const container = document.getElementById("recentBookingList");
  if (!container) return;

  container.innerHTML = recentBookings
    .map(
      (item) => `
    <div class="list-item">
      <div class="book-left">
        <div class="name">${item.customer}</div>
        <div class="tour">${item.tour}</div>
      </div>
      <div class="book-right">
        <div class="date">${item.date}</div>
        <div class="status ${item.statusClass}">${item.status}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderUpcomingTours() {
  const container = document.getElementById("upcomingTourList");
  if (!container) return;

  container.innerHTML = upcomingTours
    .map(
      (item) => `
    <div class="list-item">
      <div class="tour-item-left">
        <div class="tour-icon"><i class="fa-regular fa-clock"></i></div>
        <div class="tour-info">
          <div class="t-name">${item.name}</div>
          <div class="t-guide">${item.guide}</div>
        </div>
      </div>
      <div class="tour-right">
        <div class="date">${item.date}</div>
        <div class="guests"><i class="fa-solid fa-users"></i> ${item.guests}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

function initCharts() {
  Chart.defaults.font.family = "'Inter', sans-serif";
  Chart.defaults.color = "#9ca3af";

  const barCanvas = document.getElementById("barChart");
  const lineCanvas = document.getElementById("lineChart");

  if (barCanvas) {
    const ctxBar = barCanvas.getContext("2d");
    new Chart(ctxBar, {
      type: "bar",
      data: {
        labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
        datasets: [
          {
            label: "Doanh thu",
            data: [45, 52, 48, 62, 55, 68],
            backgroundColor: "#10b981",
            borderRadius: 4,
            barPercentage: 0.6,
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
            max: 80,
            ticks: {
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

  if (lineCanvas) {
    const ctxLine = lineCanvas.getContext("2d");
    new Chart(ctxLine, {
      type: "line",
      data: {
        labels: ["T1", "T2", "T3", "T4", "T5", "T6"],
        datasets: [
          {
            label: "Booking",
            data: [120, 160, 140, 210, 180, 240],
            borderColor: "#3b82f6",
            backgroundColor: "#ffffff",
            borderWidth: 2,
            pointBackgroundColor: "#ffffff",
            pointBorderColor: "#3b82f6",
            pointBorderWidth: 2,
            pointRadius: 4,
            tension: 0.4,
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
            max: 300,
            ticks: { stepSize: 100 },
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
}

document.addEventListener("DOMContentLoaded", function () {
  renderRecentBookings();
  renderUpcomingTours();
  initCharts();
});
