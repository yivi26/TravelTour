// Fallback dữ liệu mẫu (khi API lỗi) để UI vẫn render.
window.tourData = window.tourData || {
  nav: [
    { label: "Tổng quan", href: "tongquan.html" },
    { label: "Quản lý người dùng", href: "qlinguoidung.html" },
    { label: "Quản lý nhà cung cấp tour", href: "qlinhacungcap.html" },
    { label: "Quản lý hướng dẫn viên", href: "hdv.html" },
    { label: "Quản lý tour", href: "qlitour.html", active: true },
    { label: "Quản lý booking", href: "qlibooking.html" },
    { label: "Quản lý đánh giá", href: "qlidanhgia.html" },
    { label: "Báo cáo & thống kê", href: "baocao.html" },
    { label: "Cài đặt hệ thống", href: "caidat.html" },
  ],
  user: { name: "Admin User", email: "admin@traveltour.vn", initials: "AD" },
  stats: [
    { label: "Tổng số tour", value: "342", tone: "default" },
    { label: "Đã duyệt", value: "298", tone: "approved" },
    { label: "Chờ duyệt", value: "44", tone: "pending" },
    { label: "Giá trung bình", value: "5.2M", tone: "price" },
  ],
  tours: [
    {
      name: "Đà Lạt 3N2Đ",
      supplier: "Du lịch Bình Minh",
      guide: "Nguyễn Minh Khôi",
      slots: "12/30",
      price: "4.200.000",
      status: "Đã duyệt",
      statusKey: "approved",
      location: "Đà Lạt",
    },
    {
      name: "Phú Quốc 4N3Đ",
      supplier: "Hành Trình Xanh",
      guide: "Trần Thu Hà",
      slots: "8/25",
      price: "6.500.000",
      status: "Đã duyệt",
      statusKey: "approved",
      location: "Phú Quốc",
    },
    {
      name: "Hạ Long 2N1Đ",
      supplier: "Hành Trình Di Sản",
      guide: "Lê Quốc Bảo",
      slots: "5/20",
      price: "2.800.000",
      status: "Chờ duyệt",
      statusKey: "pending",
      location: "Hạ Long",
    },
    {
      name: "Sapa 3N2Đ",
      supplier: "Tầm Nhìn Núi",
      guide: "Phạm Ngọc Anh",
      slots: "18/28",
      price: "3.900.000",
      status: "Đã duyệt",
      statusKey: "approved",
      location: "Sapa",
    },
    {
      name: "Nha Trang 5N4Đ",
      supplier: "Ánh Đèn Phố",
      guide: "Hoàng Gia Huy",
      slots: "22/32",
      price: "7.200.000",
      status: "Đã duyệt",
      statusKey: "approved",
      location: "Nha Trang",
    },
    {
      name: "Đà Nẵng - Hội An 3N2Đ",
      supplier: "Hành Trình Xanh",
      guide: "Đỗ Thị Mai",
      slots: "10/26",
      price: "5.100.000",
      status: "Chờ duyệt",
      statusKey: "pending",
      location: "Đà Nẵng - Hội An",
    },
    {
      name: "Huế - Quảng Bình 3N2Đ",
      supplier: "Du lịch Đại Dương",
      guide: "Võ Tấn Phát",
      slots: "16/28",
      price: "4.750.000",
      status: "Đã duyệt",
      statusKey: "approved",
      location: "Huế - Quảng Bình",
    },
  ],
  paging: { text: "Hiển thị 1-7 trong 342 tour", pages: [1, 2, 3] },
};

document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const API_URL = "/api/admin/tours";
    const data = window.tourData || {};
    const state = {
      q: "",
      page: 1,
      pageSize: 7,
      stats: data.stats || [],
      tours: data.tours || [],
      paging: data.paging || { page: 1, totalPages: 1, pages: [1], text: "" },
    };

    const navIcons = {
      grid: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 2.5H3.333A.833.833 0 0 0 2.5 3.333v5.834c0 .46.373.833.833.833H7.5c.46 0 .833-.373.833-.833V3.333A.833.833 0 0 0 7.5 2.5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.667 2.5H12.5a.833.833 0 0 0-.833.833v2.5c0 .46.373.834.833.834h4.167c.46 0 .833-.373.833-.834v-2.5a.833.833 0 0 0-.833-.833Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M16.667 10h-4.167a.833.833 0 0 0-.833.833v5.834c0 .46.373.833.833.833h4.167c.46 0 .833-.373.833-.833v-5.834A.833.833 0 0 0 16.667 10Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M7.5 13.333H3.333A.833.833 0 0 0 2.5 14.167v2.5c0 .46.373.833.833.833H7.5c.46 0 .833-.373.833-.833v-2.5a.833.833 0 0 0-.833-.834Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      user: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 9.167A3.333 3.333 0 1 0 7.5 2.5a3.333 3.333 0 0 0 0 6.667Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.333 17.5V15.833c0-.884-.351-1.732-.976-2.357a3.333 3.333 0 0 0-2.357-.976H5a3.333 3.333 0 0 0-2.357.976A3.333 3.333 0 0 0 1.667 15.833V17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      building:
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 18.333V3.333a1.667 1.667 0 0 1 1.667-1.667h6.666A1.667 1.667 0 0 1 15 3.333v15H5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10H3.333c-.92 0-1.666.747-1.666 1.667v5c0 .92.746 1.666 1.666 1.666H5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7.5h1.667c.92 0 1.666.747 1.666 1.667v7.5c0 .92-.746 1.666-1.666 1.666H15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      compass:
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.604 1.913a.417.417 0 0 1 .792 0l1.925 3.899a1.667 1.667 0 0 0 1.333.91l4.305.63a.417.417 0 0 1 .233.71l-3.113 3.032a1.667 1.667 0 0 0-.447 1.412l.735 4.283a.417.417 0 0 1-.604.438l-3.848-2.023a1.666 1.666 0 0 0-1.49 0l-3.847 2.023a.417.417 0 0 1-.604-.438l.734-4.283a1.667 1.667 0 0 1-.447-1.412L1.8 8.163a.417.417 0 0 1 .234-.71l4.304-.63a1.667 1.667 0 0 0 1.333-.91l1.934-3.9Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      map: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16.667 8.333c0 4.16-4.616 8.494-6.167 9.833a.833.833 0 0 1-1.166 0C7.783 16.827 3.167 12.494 3.167 8.333c0-1.768.702-3.463 1.952-4.714A6.667 6.667 0 0 1 10 1.667c1.768 0 3.464.702 4.714 1.952a6.666 6.666 0 0 1 1.953 4.714Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 10.833a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      calendar:
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.667 1.667V5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.333 1.667V5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15.833 3.333H4.167A1.667 1.667 0 0 0 2.5 5v11.667A1.667 1.667 0 0 0 4.167 18.333h11.666A1.667 1.667 0 0 0 17.5 16.667V5A1.667 1.667 0 0 0 15.833 3.333Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.5 8.333h15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      star: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9.604 1.913a.417.417 0 0 1 .792 0l1.925 3.899a1.667 1.667 0 0 0 1.333.91l4.305.63a.417.417 0 0 1 .233.71l-3.113 3.032a1.667 1.667 0 0 0-.447 1.412l.735 4.283a.417.417 0 0 1-.604.438l-3.848-2.023a1.666 1.666 0 0 0-1.49 0l-3.847 2.023a.417.417 0 0 1-.604-.438l.734-4.283a1.667 1.667 0 0 1-.447-1.412L1.8 8.163a.417.417 0 0 1 .234-.71l4.304-.63a1.667 1.667 0 0 0 1.333-.91l1.934-3.9Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      chart:
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M2.5 2.5v13.333c0 .442.176.866.489 1.178.313.313.737.489 1.178.489H17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 14.167V7.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10.833 14.167V4.167" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M6.667 14.167V11.667" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      settings:
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10.183 1.667H9.817a1.667 1.667 0 0 0-1.667 1.667v.15a1.667 1.667 0 0 1-.833 1.442l-.358.209a1.666 1.666 0 0 1-1.7 0l-.125-.067a1.667 1.667 0 0 0-1.786.143 1.667 1.667 0 0 0-.417 2.108l.184.316a1.667 1.667 0 0 1-.3 1.974l-.125.125a1.667 1.667 0 0 0-.417 2.108 1.667 1.667 0 0 0 1.786.143l.125-.067a1.666 1.666 0 0 1 1.7 0l.358.209a1.667 1.667 0 0 1 .833 1.442v.15a1.667 1.667 0 0 0 1.667 1.667h.366a1.667 1.667 0 0 0 1.667-1.667v-.15a1.667 1.667 0 0 1 .833-1.442l.358-.209a1.666 1.666 0 0 1 1.7 0l.125.067a1.667 1.667 0 0 0 1.786-.143 1.667 1.667 0 0 0 .417-2.108l-.184-.316a1.667 1.667 0 0 1 .3-1.974l.125-.125a1.667 1.667 0 0 0 .417-2.108 1.667 1.667 0 0 0-1.786-.143l-.125.067a1.666 1.666 0 0 1-1.7 0l-.358-.209a1.667 1.667 0 0 1-.833-1.442v-.15a1.667 1.667 0 0 0-1.667-1.667Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    };

    const getInitials = (text = "") =>
      text
        .split(" ")
        .filter(Boolean)
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

    const renderSidebar = () => {
      const sidebarNav = document.getElementById("sidebarNav");
      if (!sidebarNav) return;

      const navItems = Array.isArray(data.nav) ? data.nav : [];
      const iconKeys = [
        "grid",
        "user",
        "building",
        "compass",
        "map",
        "calendar",
        "star",
        "chart",
        "settings",
      ];

      sidebarNav.innerHTML = navItems
        .map((item, index) => {
          const iconKey = iconKeys[index] || "grid";
          return `<a class="nav-item" data-index="${index}" href="${item.href || "#"}">
            <span class="nav-icon">${navIcons[iconKey] || navIcons.grid}</span>
            <span>${item.label || ""}</span>
          </a>`;
        })
        .join("");

      const currentPath = window.location.pathname;
      sidebarNav.querySelectorAll(".nav-item").forEach((link) => {
        const linkPath = new URL(link.getAttribute("href") || "#", window.location.origin)
          .pathname;
        link.classList.toggle("active", currentPath === linkPath);
      });
    };

    const renderUser = () => {
      const user = data.user || {};
      const avatarEl = document.querySelector(".user-avatar");
      const nameEl = document.querySelector(".user-info .name");
      const emailEl = document.querySelector(".user-info .email");
      if (avatarEl && user.initials) avatarEl.textContent = user.initials;
      if (nameEl && user.name) nameEl.textContent = user.name;
      if (emailEl && user.email) emailEl.textContent = user.email;
    };

    const renderStats = () => {
      const statsGrid = document.getElementById("statsGrid");
      if (!statsGrid || !Array.isArray(state.stats)) return;

      const toneClass = {
        default: "default",
        approved: "approved",
        pending: "pending",
        price: "price",
      };

      statsGrid.innerHTML = state.stats
        .map(
          (item) => `<div class="stat-card ${toneClass[item.tone] || "default"} card">
            <div class="label">${item.label || ""}</div>
            <div class="value">${item.value || ""}</div>
            ${item.note ? `<div class="note">${item.note}</div>` : ""}
          </div>`,
        )
        .join("");
    };

    const renderTours = () => {
      const tbody = document.querySelector("#tourTable tbody");
      if (!tbody || !Array.isArray(state.tours)) return;

      tbody.innerHTML = state.tours
        .map((tour) => {
          const initials = getInitials(tour.name || "");
          const statusClass = ["badge", "status-pill", "status", tour.statusKey || ""]
            .filter(Boolean)
            .join(" ");
          const approveButton =
            tour.statusKey === "pending"
              ? `<button class="btn btn-approve" type="button" data-action="approve" data-tour-id="${tour.id}">Duyệt</button>`
              : "";
          return `<tr>
            <td>
              <div class="name-cell">
                <div class="avatar">${initials}</div>
                <div>
                  <div>${tour.name || ""}</div>
                  <div class="small-text">${tour.location || ""}</div>
                </div>
              </div>
            </td>
            <td>${tour.supplier || ""}</td>
            <td>${tour.guide || ""}</td>
            <td>${tour.slots || ""}</td>
            <td class="col-price">${tour.price || ""} VND</td>
            <td><span class="${statusClass}">${tour.status || ""}</span></td>
            <td>
              <div class="actions-table" style="justify-content: flex-end;">
                ${approveButton}
                <button class="icon-btn location" type="button" aria-label="Xem địa điểm" data-action="location" data-location="${(tour.location || "").replace(/"/g, "&quot;")}">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8 1.333c2.944 0 5.333 2.389 5.333 5.333 0 3.167-3.052 6.333-4.56 7.706a1 1 0 0 1-1.546 0C5.719 12.999 2.667 9.833 2.667 6.666 2.667 3.722 5.056 1.333 8 1.333Z" stroke="#155DFC" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 8.333a1.667 1.667 0 1 0 0-3.333 1.667 1.667 0 0 0 0 3.333Z" stroke="#155DFC" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="icon-btn trash" type="button" aria-label="Xóa tour" data-action="delete" data-tour-id="${tour.id}">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3.333 4h9.334" stroke="#EF4444" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6.667 2h2.666c.184 0 .36.073.49.203.131.131.204.307.204.491V4H6V2.694c0-.184.073-.36.204-.491A.693.693 0 0 1 6.667 2Z" stroke="#EF4444" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12.667 4v8c0 .37-.147.725-.41.987a1.4 1.4 0 0 1-.99.413H4.733a1.4 1.4 0 0 1-.99-.413 1.4 1.4 0 0 1-.41-.987V4" stroke="#EF4444" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M6.667 7.333v4" stroke="#EF4444" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M9.333 7.333v4" stroke="#EF4444" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </td>
          </tr>`;
        })
        .join("");
    };

    const renderPaging = () => {
      const pagingTextEl = document.getElementById("pagingText");
      if (pagingTextEl && state.paging?.text) pagingTextEl.textContent = state.paging.text;

      const paginationEl = document.getElementById("pagination");
      if (!paginationEl || !state.paging) return;

      const pages = Array.isArray(state.paging.pages) ? state.paging.pages : [1];
      const currentPage = Number(state.paging.page || state.page || 1);
      const totalPages = Number(state.paging.totalPages || 1);
      const canPrev = currentPage > 1;
      const canNext = currentPage < totalPages;
      const buttons = [
        `<button class="page-btn" type="button" data-page="prev" ${canPrev ? "" : "disabled"}>Trước</button>`,
        ...pages.map(
          (p) =>
            `<button class="page-btn ${Number(p) === currentPage ? "active" : ""}" type="button" data-page="${p}">${p}</button>`,
        ),
        `<button class="page-btn" type="button" data-page="next" ${canNext ? "" : "disabled"}>Sau</button>`,
      ];
      paginationEl.innerHTML = buttons.join("");
    };

    function debounce(fn, wait = 350) {
      let t = null;
      return (...args) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    }

    async function apiGetTours() {
      const url = new URL(API_URL, window.location.origin);
      url.searchParams.set("page", String(state.page));
      url.searchParams.set("pageSize", String(state.pageSize));
      if (state.q) url.searchParams.set("q", state.q);
      const res = await fetch(url.toString(), { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      return await res.json();
    }

    async function apiPatchStatus(tourId, status) {
      const res = await fetch(`/api/admin/tours/${tourId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      return await res.json();
    }

    async function apiDeleteTour(tourId) {
      const res = await fetch(`/api/admin/tours/${tourId}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      return await res.json();
    }

    function renderAll() {
      renderSidebar();
      renderUser();
      renderStats();
      renderTours();
      renderPaging();
    }

    async function load() {
      try {
        const payload = await apiGetTours();
        state.stats = payload.stats || [];
        state.tours = payload.tours || [];
        state.paging = payload.paging || state.paging;
        state.page = Number(state.paging.page || state.page || 1);
        renderAll();
      } catch (err) {
        console.error(err);
        renderAll(); // fallback data cứng
      }
    }

    function bindSearch() {
      const input = document.querySelector(".topbar .search input[type='search']");
      if (!input) return;
      input.addEventListener(
        "input",
        debounce(() => {
          state.q = String(input.value || "").trim();
          state.page = 1;
          load();
        }, 350),
      );
    }

    function bindPaging() {
      const paginationEl = document.getElementById("pagination");
      if (!paginationEl) return;
      paginationEl.addEventListener("click", (e) => {
        const btn = e.target.closest("button.page-btn");
        if (!btn || btn.disabled) return;
        const v = btn.getAttribute("data-page");
        const current = Number(state.paging?.page || state.page || 1);
        const totalPages = Number(state.paging?.totalPages || 1);
        if (v === "prev") state.page = Math.max(1, current - 1);
        else if (v === "next") state.page = Math.min(totalPages, current + 1);
        else state.page = Math.max(1, Number(v || 1));
        load();
      });
    }

    function bindActions() {
      const tbody = document.querySelector("#tourTable tbody");
      if (!tbody) return;
      tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const action = btn.getAttribute("data-action");
        try {
          if (action === "approve") {
            const id = btn.getAttribute("data-tour-id");
            if (!id) return;
            await apiPatchStatus(id, "active");
            await load();
          } else if (action === "delete") {
            const id = btn.getAttribute("data-tour-id");
            if (!id) return;
            const ok = confirm("Bạn chắc chắn muốn xóa tour này?");
            if (!ok) return;
            await apiDeleteTour(id);
            await load();
          } else if (action === "location") {
            const loc = btn.getAttribute("data-location") || "";
            if (loc) alert(loc);
          }
        } catch (err) {
          console.error(err);
          alert(err?.message || "Thao tác thất bại");
        }
      });
    }

    renderAll();
    bindSearch();
    bindPaging();
    bindActions();
    load();
  })();
});
