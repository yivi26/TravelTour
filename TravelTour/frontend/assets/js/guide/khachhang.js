let customers = [];

function getInitial(name) {
  return String(name || "").trim().charAt(0).toUpperCase() || "?";
}

function formatDateVN(dateString) {
  if (!dateString) return "--/--/----";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "--/--/----";
  return date.toLocaleDateString("vi-VN");
}

function renderCustomerCount(count) {
  const customerCountText = document.getElementById("customerCountText");
  if (!customerCountText) return;
  customerCountText.textContent = `Tổng số ${count} khách hàng`;
}

async function fetchCustomers(keyword = "", selectedTour = "all") {
  const response = await fetch(
    `/api/guide/customers?keyword=${encodeURIComponent(keyword)}&tour=${encodeURIComponent(selectedTour)}`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    }
  );

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || "Không thể tải danh sách khách hàng");
  }

  return Array.isArray(result.data) ? result.data : [];
}

function fillTourFilterFromData(data) {
  const tourFilter = document.getElementById("tourFilter");
  if (!tourFilter) return;

  const currentValue = tourFilter.value || "all";
  const uniqueTours = [...new Set(data.map((item) => item.tour).filter(Boolean))];

  tourFilter.innerHTML = `
    <option value="all">Tất cả tour</option>
    ${uniqueTours
      .map((tour) => `<option value="${tour}">${tour}</option>`)
      .join("")}
  `;

  const hasOldValue = uniqueTours.includes(currentValue);
  tourFilter.value = hasOldValue ? currentValue : "all";
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
      selectedTour === "all" || customer.tour === selectedTour;

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
            <span class="customer-info-inline">${formatDateVN(customer.tourDate)}</span>
          </td>

          <td>
            <button class="contact-btn" data-id="${customer.id}">
              Liên hệ
            </button>
          </td>
        </tr>
      `
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
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "http://localhost:3000/login";
    });
  }

  document.addEventListener("click", function (event) {
    const contactBtn = event.target.closest(".contact-btn");
    if (!contactBtn) return;

    const id = contactBtn.getAttribute("data-id");
    alert("Chức năng liên hệ khách sẽ làm ở bước tiếp theo. Booking ID: " + id);
  });
}

async function initPage() {
  try {
    customers = await fetchCustomers("", "all");
    fillTourFilterFromData(customers);
    renderCustomers("", "all");
    bindEvents();
  } catch (error) {
    console.error("Lỗi tải khách hàng:", error);

    const tableBody = document.getElementById("customerTableBody");
    const customerCountText = document.getElementById("customerCountText");

    if (customerCountText) {
      customerCountText.textContent = "Không tải được dữ liệu khách hàng";
    }

    if (tableBody) {
      tableBody.innerHTML = `
        <tr class="empty-state-row">
          <td colspan="6">Không tải được danh sách khách hàng.</td>
        </tr>
      `;
    }
  }
}

document.addEventListener("DOMContentLoaded", initPage);