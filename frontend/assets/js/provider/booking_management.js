const bookings = [
  {
    id: 1,
    code: "BK001",
    customerName: "Nguyễn Văn A",
    phone: "0901234567",
    tour: "Tour Bali",
    subTour: "5N4Đ",
    departureDate: "20/03/2026",
    guests: "2 người",
    totalPrice: "30,000,000 ₫",
    status: "Đã xác nhận",
    statusClass: "badge-success",
  },
  {
    id: 2,
    code: "BK002",
    customerName: "Trần Thị B",
    phone: "0912345678",
    tour: "Tour Paris",
    subTour: "Lãng mạn",
    departureDate: "22/03/2026",
    guests: "2 người",
    totalPrice: "90,000,000 ₫",
    status: "Chờ xác nhận",
    statusClass: "badge-warning",
  },
  {
    id: 3,
    code: "BK003",
    customerName: "Lê Văn C",
    phone: "0923456789",
    tour: "Tour Santorini",
    subTour: "6N5Đ",
    departureDate: "25/03/2026",
    guests: "4 người",
    totalPrice: "140,000,000 ₫",
    status: "Đã xác nhận",
    statusClass: "badge-success",
  },
  {
    id: 4,
    code: "BK004",
    customerName: "Phạm Thị D",
    phone: "0934567890",
    tour: "Tour Kyoto",
    subTour: "văn hóa",
    departureDate: "28/03/2026",
    guests: "3 người",
    totalPrice: "84,000,000 ₫",
    status: "Đã xác nhận",
    statusClass: "badge-success",
  },
  {
    id: 5,
    code: "BK005",
    customerName: "Hoàng Văn E",
    phone: "0945678901",
    tour: "Tour Machu",
    subTour: "Picchu",
    departureDate: "30/03/2026",
    guests: "3 người",
    totalPrice: "84,000,000 ₫",
    status: "Chờ xác nhận",
    statusClass: "badge-warning",
  },
  {
    id: 6,
    code: "BK006",
    customerName: "Võ Thị F",
    phone: "0956789012",
    tour: "Tour Bali",
    subTour: "5N4Đ",
    departureDate: "02/04/2026",
    guests: "1 người",
    totalPrice: "15,000,000 ₫",
    status: "Đã hủy",
    statusClass: "badge-danger",
  },
];

function renderStats(data) {
  const totalBookings = document.getElementById("totalBookings");
  const pendingBookings = document.getElementById("pendingBookings");
  const confirmedBookings = document.getElementById("confirmedBookings");
  const cancelledBookings = document.getElementById("cancelledBookings");

  const pending = data.filter((item) => item.status === "Chờ xác nhận").length;
  const confirmed = data.filter((item) => item.status === "Đã xác nhận").length;
  const cancelled = data.filter((item) => item.status === "Đã hủy").length;

  if (totalBookings) totalBookings.textContent = data.length;
  if (pendingBookings) pendingBookings.textContent = pending;
  if (confirmedBookings) confirmedBookings.textContent = confirmed;
  if (cancelledBookings) cancelledBookings.textContent = cancelled;
}

function renderBookings(data) {
  const tableBody = document.getElementById("bookingTableBody");
  if (!tableBody) return;

  if (!data.length) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8">
          <div class="empty-state">Không tìm thấy booking phù hợp.</div>
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = data
    .map(
      (booking) => `
    <tr>
      <td class="td-code">${booking.code}</td>
      <td class="td-customer">
        <div class="name">${booking.customerName}</div>
        <div class="phone">${booking.phone}</div>
      </td>
      <td class="td-tour">${booking.tour}<br>${booking.subTour}</td>
      <td>${booking.departureDate}</td>
      <td>${booking.guests}</td>
      <td class="td-price">${booking.totalPrice}</td>
      <td><span class="badge ${booking.statusClass}">${booking.status}</span></td>
      <td>
        <div class="actions">
          <button class="action-btn btn-view" data-action="view" data-id="${booking.id}" title="Xem">
            <i class="fa-regular fa-eye"></i>
          </button>

          ${
            booking.status === "Chờ xác nhận"
              ? `
            <button class="action-btn btn-approve" data-action="approve" data-id="${booking.id}" title="Xác nhận">
              <i class="fa-regular fa-circle-check"></i>
            </button>
            <button class="action-btn btn-reject" data-action="reject" data-id="${booking.id}" title="Từ chối">
              <i class="fa-regular fa-circle-xmark"></i>
            </button>
          `
              : ""
          }
        </div>
      </td>
    </tr>
  `,
    )
    .join("");
}

function getFilteredBookings() {
  const globalKeyword = document
    .getElementById("globalSearchInput")
    .value.trim()
    .toLowerCase();
  const codeKeyword = document
    .getElementById("bookingCodeSearchInput")
    .value.trim()
    .toLowerCase();

  return bookings.filter((booking) => {
    const matchGlobal =
      !globalKeyword ||
      booking.code.toLowerCase().includes(globalKeyword) ||
      booking.customerName.toLowerCase().includes(globalKeyword) ||
      booking.phone.toLowerCase().includes(globalKeyword) ||
      booking.tour.toLowerCase().includes(globalKeyword) ||
      booking.subTour.toLowerCase().includes(globalKeyword) ||
      booking.status.toLowerCase().includes(globalKeyword);

    const matchCode =
      !codeKeyword || booking.code.toLowerCase().includes(codeKeyword);

    return matchGlobal && matchCode;
  });
}

function updateBookingView() {
  const filtered = getFilteredBookings();
  renderStats(filtered);
  renderBookings(filtered);
}

function bindEvents() {
  const globalSearchInput = document.getElementById("globalSearchInput");
  const bookingCodeSearchInput = document.getElementById(
    "bookingCodeSearchInput",
  );

  if (globalSearchInput) {
    globalSearchInput.addEventListener("input", updateBookingView);
  }

  if (bookingCodeSearchInput) {
    bookingCodeSearchInput.addEventListener("input", updateBookingView);
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action]");
    if (!button) return;

    const action = button.getAttribute("data-action");
    const id = button.getAttribute("data-id");

    if (action === "view") {
      alert("Xem booking ID: " + id);
    }

    if (action === "approve") {
      alert("Xác nhận booking ID: " + id);
    }

    if (action === "reject") {
      alert("Từ chối booking ID: " + id);
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderStats(bookings);
  renderBookings(bookings);
  bindEvents();
});
