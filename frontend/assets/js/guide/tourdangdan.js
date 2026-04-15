const currentTours = [
  {
    id: 1,
    name: "Tour Hạ Long 3 ngày 2 đêm",
    customers: 12,
    startDate: "25/03/2026",
    endDate: "27/03/2026",
    duration: "3 ngày 2 đêm",
    location: "Quảng Ninh",
    status: "active",
  },
  {
    id: 2,
    name: "Tour Sapa - Fansipan",
    customers: 15,
    startDate: "28/03/2026",
    endDate: "30/03/2026",
    duration: "3 ngày 2 đêm",
    location: "Lào Cai",
    status: "active",
  },
  {
    id: 3,
    name: "Tour Phú Quốc 4N3Đ",
    customers: 20,
    startDate: "01/04/2026",
    endDate: "04/04/2026",
    duration: "4 ngày 3 đêm",
    location: "Kiên Giang",
    status: "active",
  },
  {
    id: 4,
    name: "Tour Đà Nẵng - Hội An",
    customers: 18,
    startDate: "20/03/2026",
    endDate: "22/03/2026",
    duration: "3 ngày 2 đêm",
    location: "Đà Nẵng",
    status: "active",
  },
  {
    id: 5,
    name: "Tour Nha Trang 3N2Đ",
    customers: 16,
    startDate: "10/04/2026",
    endDate: "12/04/2026",
    duration: "3 ngày 2 đêm",
    location: "Khánh Hòa",
    status: "active",
  },
];

function renderTourCount(count) {
  const tourCountText = document.getElementById("tourCountText");
  if (!tourCountText) return;
  tourCountText.textContent = `Bạn đang có ${count} tour đang hoạt động`;
}

function renderTours(keyword = "") {
  const tourGrid = document.getElementById("tourGrid");
  if (!tourGrid) return;

  const normalizedKeyword = keyword.trim().toLowerCase();

  const filteredTours = currentTours.filter((tour) => {
    return (
      tour.name.toLowerCase().includes(normalizedKeyword) ||
      tour.location.toLowerCase().includes(normalizedKeyword) ||
      tour.duration.toLowerCase().includes(normalizedKeyword)
    );
  });

  renderTourCount(filteredTours.length);

  if (!filteredTours.length) {
    tourGrid.innerHTML = `
      <div class="empty-state">
        Không tìm thấy tour phù hợp.
      </div>
    `;
    return;
  }

  tourGrid.innerHTML = filteredTours
    .map(
      (tour) => `
    <div class="tour-card">
      <div class="tour-card-top">
        <h4 class="tour-title">${tour.name}</h4>
        <span class="tour-status">Đang hoạt động</span>
      </div>

      <div class="tour-info-list">
        <div class="tour-info-item">
          <span class="tour-info-icon">👥</span>
          <span><strong>${tour.customers}</strong> khách hàng</span>
        </div>

        <div class="tour-info-item">
          <span class="tour-info-icon">📅</span>
          <span>${tour.startDate} - ${tour.endDate}</span>
        </div>

        <div class="tour-info-item">
          <span class="tour-info-icon">🕒</span>
          <span>${tour.duration}</span>
        </div>

        <div class="tour-info-item">
          <span class="tour-info-icon">📍</span>
          <span>${tour.location}</span>
        </div>
      </div>

      <div class="tour-actions">
        <button class="btn-detail" data-action="detail" data-id="${tour.id}">
          Xem chi tiết
        </button>
        <button class="btn-contact" data-action="contact" data-id="${tour.id}">
          Liên hệ khách
        </button>
      </div>
    </div>
  `,
    )
    .join("");
}

function bindEvents() {
  const searchInput = document.getElementById("tourSearchInput");
  const logoutBtn = document.getElementById("logoutBtn");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderTours(this.value);
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
      alert("Đăng xuất");
    });
  }

  document.addEventListener("click", function (event) {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const action = target.getAttribute("data-action");
    const id = target.getAttribute("data-id");

    if (action === "detail") {
      alert("Xem chi tiết tour ID: " + id);
    }

    if (action === "contact") {
      alert("Liên hệ khách của tour ID: " + id);
    }
  });
  const searchBtn = document.getElementById("searchBtn");

  if (searchBtn) {
    searchBtn.addEventListener("click", function () {
      const keyword = document.getElementById("tourSearchInput").value;
      renderTours(keyword);
    });
  }
}

document.addEventListener("DOMContentLoaded", function () {
  renderTours();
  bindEvents();
});
