const customers = [
  {
    id: 1,
    name: "Nguyễn Thị Hương",
    phone: "0901234567",
    email: "huong.nguyen@email.com",
    tour: "Tour Hạ Long 3N2Đ",
    tourDate: "25/03/2026",
  },
  {
    id: 2,
    name: "Trần Văn Minh",
    phone: "0912345678",
    email: "minh.tran@email.com",
    tour: "Tour Sapa - Fansipan",
    tourDate: "28/03/2026",
  },
  {
    id: 3,
    name: "Lê Thị Mai",
    phone: "0923456789",
    email: "mai.le@email.com",
    tour: "Tour Phú Quốc 4N3Đ",
    tourDate: "01/04/2026",
  },
  {
    id: 4,
    name: "Phạm Hoàng Long",
    phone: "0934567890",
    email: "long.pham@email.com",
    tour: "Tour Đà Nẵng - Hội An",
    tourDate: "20/03/2026",
  },
  {
    id: 5,
    name: "Võ Thị Lan",
    phone: "0945678901",
    email: "lan.vo@email.com",
    tour: "Tour Nha Trang 3N2Đ",
    tourDate: "15/03/2026",
  },
  {
    id: 6,
    name: "Đặng Văn Tùng",
    phone: "0956789012",
    email: "tung.dang@email.com",
    tour: "Tour Hạ Long 3N2Đ",
    tourDate: "25/03/2026",
  },
  {
    id: 7,
    name: "Bùi Thị Nga",
    phone: "0967890123",
    email: "nga.bui@email.com",
    tour: "Tour Sapa - Fansipan",
    tourDate: "28/03/2026",
  },
  {
    id: 8,
    name: "Hoàng Văn Hải",
    phone: "0978901234",
    email: "hai.hoang@email.com",
    tour: "Tour Phú Quốc 4N3Đ",
    tourDate: "01/04/2026",
  },
];

function getInitial(name) {
  return name.trim().charAt(0).toUpperCase();
}

function renderCustomerCount(count) {
  const customerCountText = document.getElementById("customerCountText");
  if (!customerCountText) return;
  customerCountText.textContent = `Tổng số ${count} khách hàng`;
}

function renderCustomers(keyword = "", selectedTour = "all") {
  const tableBody = document.getElementById("customerTableBody");
  if (!tableBody) return;

  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredCustomers = customers.filter((customer) => {
    const matchKeyword =
      customer.name.toLowerCase().includes(normalizedKeyword) ||
      customer.phone.toLowerCase().includes(normalizedKeyword) ||
      customer.email.toLowerCase().includes(normalizedKeyword) ||
      customer.tour.toLowerCase().includes(normalizedKeyword);

    const matchTour =
      selectedTour === "all" || customer.tour.includes(selectedTour);

    return matchKeyword && matchTour;
  });

  renderCustomerCount(filteredCustomers.length);

  if (!filteredCustomers.length) {
    tableBody.innerHTML = `
      <tr class="empty-state-row">
        <td colspan="6">Không tìm thấy khách hàng phù hợp.</td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredCustomers
    .map(
      (customer) => `
    <tr>
      <td>
        <div class="customer-name-wrap">
          <div class="customer-avatar">${getInitial(customer.name)}</div>
          <span class="customer-name">${customer.name}</span>
        </div>
      </td>

      <td>
        <div class="customer-info-inline">
          <span class="info-icon">📞</span>
          <span>${customer.phone}</span>
        </div>
      </td>

      <td>
        <div class="customer-info-inline">
          <span class="info-icon">✉️</span>
          <span>${customer.email}</span>
        </div>
      </td>

      <td>
        <div class="customer-info-inline">
          <span class="info-icon">📍</span>
          <span>${customer.tour}</span>
        </div>
      </td>

      <td>
        <span class="customer-info-inline">${customer.tourDate}</span>
      </td>

      <td>
        <button class="contact-btn" data-id="${customer.id}">
          Liên hệ
        </button>
      </td>
    </tr>
  `,
    )
    .join("");
}

function bindEvents() {
  const searchInput = document.getElementById("customerSearchInput");
  const tourFilter = document.getElementById("tourFilter");
  const logoutBtn = document.getElementById("logoutBtn");

  function applyFilters() {
    const keyword = searchInput ? searchInput.value : "";
    const selectedTour = tourFilter ? tourFilter.value : "all";
    renderCustomers(keyword, selectedTour);
  }

  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  if (tourFilter) {
    tourFilter.addEventListener("change", applyFilters);
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      alert("Đăng xuất");
    });
  }

  document.addEventListener("click", function (event) {
    const contactBtn = event.target.closest(".contact-btn");
    if (!contactBtn) return;

    const id = contactBtn.getAttribute("data-id");
    alert("Liên hệ khách hàng ID: " + id);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderCustomers();
  bindEvents();
});
