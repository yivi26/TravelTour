const incomeStats = [
  {
    icon: "💵",
    iconClass: "icon-green",
    label: "Tổng thu nhập",
    value: "260.5M",
    note: "+12.5% so với tháng trước",
    noteClass: "positive",
  },
  {
    icon: "📅",
    iconClass: "icon-blue",
    label: "Thu nhập tháng này",
    value: "45.5M",
    note: "Từ 5 tour đã hoàn thành",
    noteClass: "",
  },
  {
    icon: "💰",
    iconClass: "icon-yellow",
    label: "Thu nhập trung bình/tour",
    value: "9.1M",
    note: "Dựa trên 6 tháng gần nhất",
    noteClass: "",
  },
];

const incomeDataMap = {
  3: [
    { month: "T4", income: 38 },
    { month: "T5", income: 52 },
    { month: "T6", income: 48 },
  ],
  6: [
    { month: "T1", income: 35 },
    { month: "T2", income: 42 },
    { month: "T3", income: 45.5 },
    { month: "T4", income: 38 },
    { month: "T5", income: 52 },
    { month: "T6", income: 48 },
  ],
  12: [
    { month: "T7", income: 28 },
    { month: "T8", income: 32 },
    { month: "T9", income: 34 },
    { month: "T10", income: 36 },
    { month: "T11", income: 30 },
    { month: "T12", income: 33 },
    { month: "T1", income: 35 },
    { month: "T2", income: 42 },
    { month: "T3", income: 45.5 },
    { month: "T4", income: 38 },
    { month: "T5", income: 52 },
    { month: "T6", income: 48 },
  ],
};

const recentTransactions = [
  {
    id: 1,
    tour: "Tour Hạ Long 3N2Đ",
    date: "15/03/2026",
    amount: "12.5M",
    status: "Đã thanh toán",
  },
  {
    id: 2,
    tour: "Tour Sapa - Fansipan",
    date: "10/03/2026",
    amount: "15.0M",
    status: "Đã thanh toán",
  },
  {
    id: 3,
    tour: "Tour Phú Quốc 4N3Đ",
    date: "05/03/2026",
    amount: "18.0M",
    status: "Đã thanh toán",
  },
];

let barChartInstance = null;
let lineChartInstance = null;

function renderIncomeStats() {
  const container = document.getElementById("incomeStatsGrid");
  if (!container) return;

  container.innerHTML = incomeStats
    .map(
      (item) => `
    <div class="income-stat-card">
      <div class="income-stat-top">
        <div class="income-stat-icon-box ${item.iconClass}">
          ${item.icon}
        </div>
        <div>
          <p class="income-stat-label">${item.label}</p>
          <p class="income-stat-value">${item.value}</p>
        </div>
      </div>
      <p class="income-stat-note ${item.noteClass}">${item.note}</p>
    </div>
  `,
    )
    .join("");
}

function renderTransactions() {
  const container = document.getElementById("transactionList");
  if (!container) return;

  container.innerHTML = recentTransactions
    .map(
      (item) => `
    <div class="transaction-item">
      <div class="transaction-left">
        <p>${item.tour}</p>
        <p class="transaction-date">${item.date}</p>
      </div>
      <div class="transaction-right">
        <div class="transaction-amount">${item.amount}</div>
        <span class="transaction-status">${item.status}</span>
      </div>
    </div>
  `,
    )
    .join("");
}

function buildCharts(monthRange = 6) {
  const data = incomeDataMap[monthRange] || incomeDataMap[6];
  const labels = data.map((item) => item.month);
  const values = data.map((item) => item.income);

  const barCtx = document.getElementById("incomeBarChart");
  const lineCtx = document.getElementById("incomeLineChart");

  if (!barCtx || !lineCtx) return;

  if (barChartInstance) {
    barChartInstance.destroy();
  }

  if (lineChartInstance) {
    lineChartInstance.destroy();
  }

  barChartInstance = new Chart(barCtx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Thu nhập",
          data: values,
          backgroundColor: "#10b981",
          borderRadius: 8,
          maxBarThickness: 48,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.raw}M VNĐ`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + "M";
            },
          },
        },
      },
    },
  });

  lineChartInstance = new Chart(lineCtx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Thu nhập",
          data: values,
          borderColor: "#10b981",
          backgroundColor: "rgba(16, 185, 129, 0.12)",
          fill: true,
          tension: 0.35,
          pointRadius: 5,
          pointBackgroundColor: "#10b981",
          pointBorderColor: "#ffffff",
          pointBorderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              return `${context.raw}M VNĐ`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return value + "M";
            },
          },
        },
      },
    },
  });
}

function bindEvents() {
  const rangeSelect = document.getElementById("rangeSelect");
  const logoutBtn = document.getElementById("logoutBtn");

  if (rangeSelect) {
    rangeSelect.addEventListener("change", function () {
      buildCharts(Number(this.value));
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      alert("Đăng xuất");
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  renderIncomeStats();
  renderTransactions();
  buildCharts(6);
  bindEvents();
});
