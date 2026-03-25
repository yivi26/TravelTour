const tours = [
  {
    id: 1,
    name: "Tour Bali 5N4Đ",
    destination: "Bali, Indonesia",
    price: "15,000,000 ₫",
    booked: 12,
    total: 20,
    status: "Đang hoạt động",
    statusClass: "badge-active",
  },
  {
    id: 2,
    name: "Tour Paris Lãng mạn",
    destination: "Paris, Pháp",
    price: "45,000,000 ₫",
    booked: 8,
    total: 15,
    status: "Đang hoạt động",
    statusClass: "badge-active",
  },
  {
    id: 3,
    name: "Tour Santorini 6N5Đ",
    destination: "Santorini, Hy Lạp",
    price: "35,000,000 ₫",
    booked: 15,
    total: 18,
    status: "Đang hoạt động",
    statusClass: "badge-active",
  },
  {
    id: 4,
    name: "Tour Kyoto văn hóa",
    destination: "Kyoto, Nhật Bản",
    price: "28,000,000 ₫",
    booked: 12,
    total: 12,
    status: "Đã đầy",
    statusClass: "badge-full",
  },
  {
    id: 5,
    name: "Tour Machu Picchu",
    destination: "Peru",
    price: "42,000,000 ₫",
    booked: 5,
    total: 16,
    status: "Đang hoạt động",
    statusClass: "badge-active",
  },
  {
    id: 6,
    name: "Tour Aurora Bắc Cực",
    destination: "Iceland",
    price: "52,000,000 ₫",
    booked: 0,
    total: 10,
    status: "Ngưng",
    statusClass: "badge-stopped",
  },
];

function getPercent(booked, total) {
  return Math.round((booked / total) * 100);
}

function renderStats(data) {
  const totalTours = document.getElementById("totalTours");
  const activeTours = document.getElementById("activeTours");
  const fullTours = document.getElementById("fullTours");
  const stoppedTours = document.getElementById("stoppedTours");

  const active = data.filter((item) => item.status === "Đang hoạt động").length;
  const full = data.filter((item) => item.status === "Đã đầy").length;
  const stopped = data.filter((item) => item.status === "Ngưng").length;

  totalTours.textContent = data.length;
  activeTours.textContent = active;
  fullTours.textContent = full;
  stoppedTours.textContent = stopped;
}

function renderTours(data) {
  const tableBody = document.getElementById("tourTableBody");
  if (!tableBody) return;

  if (!data.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6">
          <div class="empty-state">Không tìm thấy tour phù hợp.</div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = data
    .map(
      (tour) => `
    <tr>
      <td class="td-name">${tour.name}</td>
      <td class="td-dest">${tour.destination}</td>
      <td class="td-price">${tour.price}</td>
      <td class="td-slots">
        <span class="fraction">${tour.booked}/${tour.total}</span>
        <span class="percent">(${getPercent(tour.booked, tour.total)}%)</span>
      </td>
      <td>
        <span class="badge ${tour.statusClass}">${tour.status}</span>
      </td>
      <td>
        <div class="actions">
          <button class="action-btn btn-edit" data-action="edit" data-id="${tour.id}" title="Sửa">
            <i class="fa-regular fa-pen-to-square"></i>
          </button>
          <button class="action-btn btn-delete" data-action="delete" data-id="${tour.id}" title="Xóa">
            <i class="fa-regular fa-trash-can"></i>
          </button>
          <button class="action-btn btn-more" data-action="more" data-id="${tour.id}" title="Xem thêm">
            <i class="fa-solid fa-ellipsis-vertical"></i>
          </button>
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

function getFilteredTours() {
  const keyword = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();

  return tours.filter((tour) => {
    return (
      tour.name.toLowerCase().includes(keyword) ||
      tour.destination.toLowerCase().includes(keyword) ||
      tour.status.toLowerCase().includes(keyword)
    );
  });
}

function updateTourView() {
  const filtered = getFilteredTours();
  renderStats(filtered);
  renderTours(filtered);
}

function bindEvents() {
  const searchInput = document.getElementById("searchInput");
  const createTourBtn = document.getElementById("createTourBtn");

  if (searchInput) {
    searchInput.addEventListener("input", updateTourView);
  }

  if (createTourBtn) {
    createTourBtn.addEventListener("click", function () {
      alert("Đi tới trang tạo tour mới.");
    });
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.getAttribute("data-action");
    const id = button.getAttribute("data-id");

    if (action === "edit") {
      alert("Sửa tour ID: " + id);
    }

    if (action === "delete") {
      alert("Xóa tour ID: " + id);
    }

    if (action === "more") {
      alert("Xem thêm tour ID: " + id);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderStats(tours);
  renderTours(tours);
  bindEvents();
});
