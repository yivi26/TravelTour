const guides = [
  {
    id: 1,
    name: "Nguyễn Minh",
    rating: 4.8,
    experience: "5 năm",
    languages: "Tiếng Anh, Tiếng Nhật",
  },
  {
    id: 2,
    name: "Trần Hà",
    rating: 4.9,
    experience: "7 năm",
    languages: "Tiếng Anh, Tiếng Pháp",
  },
  {
    id: 3,
    name: "Lê Phương",
    rating: 4.7,
    experience: "4 năm",
    languages: "Tiếng Anh, Tiếng Hàn",
  },
  {
    id: 4,
    name: "Phạm Tuấn",
    rating: 4.8,
    experience: "6 năm",
    languages: "Tiếng Anh, Tiếng Trung",
  },
  {
    id: 5,
    name: "Hoàng Mai",
    rating: 4.6,
    experience: "3 năm",
    languages: "Tiếng Anh",
  },
];

const tours = [
  {
    id: 1,
    title: "Tour Bali 5N4Đ",
    destination: "Bali, Indonesia",
    departureDate: "20/03/2026",
    guests: 12,
    assignedGuideId: 1,
  },
  {
    id: 2,
    title: "Tour Paris Lãng mạn",
    destination: "Paris, Pháp",
    departureDate: "22/03/2026",
    guests: 8,
    assignedGuideId: 2,
  },
  {
    id: 3,
    title: "Tour Santorini 6N5Đ",
    destination: "Santorini, Hy Lạp",
    departureDate: "25/03/2026",
    guests: 15,
    assignedGuideId: 3,
  },
  {
    id: 4,
    title: "Tour Kyoto văn hóa",
    destination: "Kyoto, Nhật Bản",
    departureDate: "28/03/2026",
    guests: 12,
    assignedGuideId: null,
  },
  {
    id: 5,
    title: "Tour Machu Picchu",
    destination: "Peru",
    departureDate: "30/03/2026",
    guests: 10,
    assignedGuideId: null,
  },
];

function getGuideById(id) {
  return guides.find((guide) => guide.id === id) || null;
}

function renderGuides(data) {
  const container = document.getElementById("guideList");
  if (!container) return;

  if (!data.length) {
    container.innerHTML = `<div class="empty-state">Không tìm thấy hướng dẫn viên.</div>`;
    return;
  }

  container.innerHTML = data
    .map(
      (guide) => `
    <div class="guide-card">
      <div class="gc-avatar"><i class="fa-solid fa-user"></i></div>
      <div class="gc-info">
        <div class="gc-header">
          <span class="gc-name">${guide.name}</span>
          <span class="gc-rating"><i class="fa-solid fa-star"></i> ${guide.rating}</span>
        </div>
        <div class="gc-exp">${guide.experience}</div>
        <div class="gc-lang">${guide.languages}</div>
      </div>
    </div>
  `,
    )
    .join("");
}

function renderTours(data) {
  const container = document.getElementById("tourList");
  if (!container) return;

  if (!data.length) {
    container.innerHTML = `<div class="empty-state">Không tìm thấy tour phù hợp.</div>`;
    return;
  }

  container.innerHTML = data
    .map((tour) => {
      const assignedGuide = getGuideById(tour.assignedGuideId);
      const isAssigned = !!assignedGuide;

      return `
      <div class="tour-card">
        <div class="tc-title">${tour.title}</div>

        <div class="tc-details">
          <p><i class="fa-solid fa-location-dot"></i> ${tour.destination}</p>
          <p><i class="fa-regular fa-calendar"></i> Khởi hành: ${tour.departureDate}</p>
          <p><i class="fa-solid fa-users"></i> ${tour.guests} khách</p>
        </div>

        <div class="tc-assign-label">Hướng dẫn viên</div>

        <div class="tc-assign-row">
          <select class="tc-select" data-tour-id="${tour.id}">
            <option value="">Chọn hướng dẫn viên</option>
            ${guides
              .map(
                (guide) => `
              <option value="${guide.id}" ${tour.assignedGuideId === guide.id ? "selected" : ""}>
                ${guide.name}
              </option>
            `,
              )
              .join("")}
          </select>

          <button class="btn-action" data-action="assign" data-tour-id="${tour.id}">
            ${isAssigned ? "Cập nhật" : "Phân công"}
          </button>
        </div>

        <div class="tc-status ${isAssigned ? "" : "hidden"}" id="tour-status-${tour.id}">
          <i class="fa-solid fa-check"></i>
          <span>Đã phân công: ${isAssigned ? assignedGuide.name : ""}</span>
        </div>
      </div>
    `;
    })
    .join("");
}

function getFilteredData() {
  const keyword = document
    .getElementById("globalSearchInput")
    .value.trim()
    .toLowerCase();

  const filteredGuides = guides.filter((guide) => {
    return (
      guide.name.toLowerCase().includes(keyword) ||
      guide.languages.toLowerCase().includes(keyword) ||
      guide.experience.toLowerCase().includes(keyword)
    );
  });

  const filteredTours = tours.filter((tour) => {
    const assignedGuide = getGuideById(tour.assignedGuideId);
    return (
      tour.title.toLowerCase().includes(keyword) ||
      tour.destination.toLowerCase().includes(keyword) ||
      tour.departureDate.toLowerCase().includes(keyword) ||
      String(tour.guests).includes(keyword) ||
      (assignedGuide && assignedGuide.name.toLowerCase().includes(keyword))
    );
  });

  return { filteredGuides, filteredTours };
}

function updateView() {
  const { filteredGuides, filteredTours } = getFilteredData();
  renderGuides(filteredGuides);
  renderTours(filteredTours);
}

function assignGuideToTour(tourId) {
  const select = document.querySelector(`select[data-tour-id="${tourId}"]`);
  if (!select) return;

  const selectedGuideId = Number(select.value);
  const tour = tours.find((item) => item.id === tourId);

  if (!tour) return;

  if (!selectedGuideId) {
    alert("Vui lòng chọn hướng dẫn viên.");
    return;
  }

  tour.assignedGuideId = selectedGuideId;
  renderTours(getFilteredData().filteredTours);
  alert("Cập nhật phân công thành công.");
}

function bindEvents() {
  const searchInput = document.getElementById("globalSearchInput");

  if (searchInput) {
    searchInput.addEventListener("input", updateView);
  }

  document.addEventListener("click", function (event) {
    const button = event.target.closest("[data-action='assign']");
    if (!button) return;

    const tourId = Number(button.getAttribute("data-tour-id"));
    assignGuideToTour(tourId);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderGuides(guides);
  renderTours(tours);
  bindEvents();
});
