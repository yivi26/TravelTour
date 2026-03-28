// =========================================
// 📦 LOAD DANH SÁCH TOUR
// =========================================
let toursData = []; // lưu data gốc

async function loadTours() {
  try {
    const res = await fetch("/api/provider/tours");
    const data = await res.json();

    console.log("TOURS:", data);

    if (!Array.isArray(data)) {
      console.error("API lỗi:", data);
      return;
    }

    toursData = data;

    renderTable(data);
    renderStats(data);
  } catch (err) {
    console.error("Lỗi load tours:", err);
  }
}

// =========================================
// 📊 HIỂN THỊ TABLE
// =========================================
function renderTable(data) {
  const tbody = document.getElementById("tourTableBody");
  tbody.innerHTML = "";

  data.forEach(t => {
    tbody.innerHTML += `
      <tr>
        <td>${t.title}</td>
        <td>${t.location}</td>
        <td>${formatMoney(t.base_price)}</td>
        <td>${t.max_capacity}</td>
        <td>${renderStatus(t.status)}</td>
        <td>
          <button onclick="deleteTour(${t.id})">🗑</button>
          <button onclick="toggleStatus(${t.id}, '${t.status}')">🔄</button>
        </td>
      </tr>
    `;
  });
}

// =========================================
// 📊 STATS
// =========================================
function renderStats(data) {
  document.getElementById("totalTours").innerText = data.length;

  const active = data.filter(t => t.status === "active").length;
  const full = data.filter(t => t.status === "full").length;
  const stopped = data.filter(t => t.status === "paused").length;

  document.getElementById("activeTours").innerText = active;
  document.getElementById("fullTours").innerText = full;
  document.getElementById("stoppedTours").innerText = stopped;
}

// =========================================
// 🔍 SEARCH
// =========================================
const searchInput = document.getElementById("searchInput");

if (searchInput) {
  searchInput.addEventListener("input", e => {
    const keyword = e.target.value.toLowerCase();

    const filtered = toursData.filter(t =>
      t.title.toLowerCase().includes(keyword) ||
      t.location.toLowerCase().includes(keyword)
    );

    renderTable(filtered);
  });
}

// =========================================
// ➕ CLICK TẠO TOUR
// =========================================
const createBtn = document.getElementById("createTourBtn");

if (createBtn) {
  createBtn.addEventListener("click", () => {
    window.location.href = "./taotour.html";
  });
}

// =========================================
// 🗑 XOÁ TOUR
// =========================================
async function deleteTour(id) {
  const confirmDelete = confirm("Bạn có chắc muốn xoá tour?");
  if (!confirmDelete) return;

  await fetch(`/api/provider/tours/${id}`, {
    method: "DELETE"
  });

  loadTours();
}

// =========================================
// 🔄 ĐỔI TRẠNG THÁI
// =========================================
async function toggleStatus(id, currentStatus) {
  let newStatus = "active";

  if (currentStatus === "active") newStatus = "paused";
  else if (currentStatus === "paused") newStatus = "active";

  await fetch(`/api/provider/tours/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: newStatus })
  });

  loadTours();
}

// =========================================
// 🎨 HIỂN THỊ STATUS
// =========================================
function renderStatus(status) {
  const map = {
    active: "🟢 Đang hoạt động",
    paused: "🟡 Tạm dừng",
    draft: "⚪ Nháp",
    archived: "🔴 Ngưng"
  };

  return map[status] || status;
}

// =========================================
// 💰 FORMAT TIỀN
// =========================================
function formatMoney(value) {
  return Number(value).toLocaleString("vi-VN") + " đ";
}

// =========================================
// 🚀 INIT
// =========================================
loadTours();