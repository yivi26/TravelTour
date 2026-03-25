const upcomingTours = [
  {
    id: 1,
    tourName: "Du lịch Hạ Long - 3 ngày 2 đêm",
    destination: "Vịnh Hạ Long, Quảng Ninh",
    startDate: "20/04/2026",
    status: "Sắp diễn ra",
    statusClass: "status-upcoming",
    customers: 12,
  },
  {
    id: 2,
    tourName: "Phú Quốc - Thiên đường biển đảo",
    destination: "Phú Quốc, Kiên Giang",
    startDate: "25/04/2026",
    status: "Sắp diễn ra",
    statusClass: "status-upcoming",
    customers: 8,
  },
  {
    id: 3,
    tourName: "Sapa - Khám phá núi rừng Tây Bắc",
    destination: "Sapa, Lào Cai",
    startDate: "18/04/2026",
    status: "Đang thực hiện",
    statusClass: "status-active",
    customers: 15,
  },
];

const todayCustomers = [
  { id: 1, name: "Nguyễn Văn An", phone: "0912 345 678", tour: "Sapa 2N1Đ" },
  { id: 2, name: "Trần Thị Bình", phone: "0923 456 789", tour: "Sapa 2N1Đ" },
  { id: 3, name: "Lê Văn Cường", phone: "0934 567 890", tour: "Sapa 2N1Đ" },
];

function renderUpcomingTours() {
  const container = document.getElementById("upcomingToursList");
  if (!container) return;

  container.innerHTML = upcomingTours
    .map(
      (tour) => `
    <div class="tour-card">
      <div class="tour-card-inner">
        <div class="tour-main">
          <div class="tour-top">
            <div>
              <h3 class="tour-title">${tour.tourName}</h3>
              <div class="tour-destination">
                <span>📍</span>
                <span>${tour.destination}</span>
              </div>
            </div>

            <span class="tour-status ${tour.statusClass}">
              ${tour.status}
            </span>
          </div>

          <div class="tour-meta">
            <div class="tour-meta-item">
              <span>📅</span>
              <span>Khởi hành: ${tour.startDate}</span>
            </div>
            <div class="tour-meta-item">
              <span>👥</span>
              <span>${tour.customers} khách</span>
            </div>
          </div>
        </div>

        <div class="tour-action">
          <button class="btn btn-primary" data-action="tour-detail" data-id="${tour.id}">
            Xem chi tiết
          </button>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderTodayCustomers() {
  const tableBody = document.getElementById("todayCustomersTable");
  if (!tableBody) return;

  tableBody.innerHTML = todayCustomers
    .map(
      (customer) => `
    <tr>
      <td>
        <div class="customer-name-wrap">
          <div class="customer-avatar-icon">👥</div>
          <span>${customer.name}</span>
        </div>
      </td>
      <td class="customer-phone">${customer.phone}</td>
      <td>
        <span class="customer-tour-badge">${customer.tour}</span>
      </td>
      <td class="text-right">
        <button class="btn btn-outline" data-action="customer-detail" data-id="${customer.id}">
          Chi tiết
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function bindEvents() {
  document.addEventListener("click", function (event) {
    const target = event.target;
    const action = target.dataset.action;
    const id = target.dataset.id;

    if (!action || !id) return;

    if (action === "tour-detail") {
      alert("Xem chi tiết tour ID: " + id);
    }

    if (action === "customer-detail") {
      alert("Xem chi tiết khách hàng ID: " + id);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderUpcomingTours();
  renderTodayCustomers();
  bindEvents();
});
