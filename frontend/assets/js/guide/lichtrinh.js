const schedules = [
  {
    id: 1,
    tourName: "Tour Hạ Long 3 ngày 2 đêm",
    date: "25/03/2026",
    time: "08:00 - 17:00",
    location: "Quảng Ninh",
    status: "Sắp diễn ra",
    type: "upcoming",
  },
  {
    id: 2,
    tourName: "Tour Sapa - Fansipan",
    date: "28/03/2026",
    time: "06:00 - 18:00",
    location: "Lào Cai",
    status: "Sắp diễn ra",
    type: "upcoming",
  },
  {
    id: 3,
    tourName: "Tour Phú Quốc 4N3Đ",
    date: "01/04/2026",
    time: "10:00 - 20:00",
    location: "Kiên Giang",
    status: "Sắp diễn ra",
    type: "upcoming",
  },
  {
    id: 4,
    tourName: "Tour Đà Nẵng - Hội An",
    date: "20/03/2026",
    time: "07:00 - 19:00",
    location: "Đà Nẵng",
    status: "Đang diễn ra",
    type: "running",
  },
  {
    id: 5,
    tourName: "Tour Nha Trang 3N2Đ",
    date: "15/03/2026",
    time: "09:00 - 18:00",
    location: "Khánh Hòa",
    status: "Đã xong",
    type: "done",
  },
];

function renderSchedules(filter = "all") {
  const container = document.getElementById("scheduleList");

  let filtered = schedules;

  if (filter !== "all") {
    filtered = schedules.filter((item) => item.type === filter);
  }

  container.innerHTML = filtered
    .map(
      (item) => `
    <div class="schedule-card">
      <div class="schedule-top">
        <div>
          <div class="schedule-title">${item.tourName}</div>

          <div class="schedule-info">
            <div>📅 ${item.date}</div>
            <div>🕒 ${item.time}</div>
            <div>📍 ${item.location}</div>
          </div>
        </div>

        <div class="schedule-right">
          <span class="status-badge status-${item.type}">
            ${item.status}
          </span>
          <div class="detail-btn">Xem chi tiết →</div>
        </div>
      </div>
    </div>
  `,
    )
    .join("");
}

const filterSelect = document.getElementById("statusFilter");
const filterBtn = document.getElementById("filterBtn");

/* click nút lọc */
filterBtn.addEventListener("click", () => {
  renderSchedules(filterSelect.value);
});

/* change select tự lọc luôn */
filterSelect.addEventListener("change", () => {
  renderSchedules(filterSelect.value);
});

/* load mặc định */
renderSchedules("all");
