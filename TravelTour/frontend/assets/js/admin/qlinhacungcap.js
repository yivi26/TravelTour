// Fallback dữ liệu mẫu (khi API lỗi) để UI vẫn render.
window.quanLyNhaCungCapTourData = window.quanLyNhaCungCapTourData || {
  nav: [
    { label: "Tổng quan", href: "tongquan.html" },
    { label: "Quản lý người dùng", href: "qlinguoidung.html" },
    { label: "Quản lý nhà cung cấp tour", href: "qlinhacungcap.html", active: true },
    { label: "Quản lý hướng dẫn viên", href: "hdv.html" },
    { label: "Quản lý tour", href: "qlitour.html" },
    { label: "Quản lý booking", href: "qlibooking.html" },
    { label: "Quản lý đánh giá", href: "qlidanhgia.html" },
    { label: "Báo cáo & thống kê", href: "baocao.html" },
    { label: "Cài đặt hệ thống", href: "caidat.html" },
  ],
  user: { name: "Admin User", email: "admin@traveltour.vn", initials: "AD" },
  stats: [
    { label: "Tổng nhà cung cấp", value: "87", tone: "neutral" },
    {
      label: "Đã phê duyệt",
      value: "72",
      note: "+5 so với tháng trước",
      tone: "approved",
    },
    {
      label: "Chờ phê duyệt",
      value: "15",
      note: "Yêu cầu phê duyệt mới",
      tone: "pending",
    },
  ],
  suppliers: [
    {
      name: "Du lịch Bình Minh",
      email: "lienhe@binhminh.vn",
      tours: 45,
      status: "Đã phê duyệt",
      statusKey: "approved",
    },
    {
      name: "Hành Trình Xanh",
      email: "hello@hanhtrinhxanh.vn",
      tours: 38,
      status: "Đã phê duyệt",
      statusKey: "approved",
    },
    {
      name: "Du lịch Đại Dương",
      email: "support@daiduong.vn",
      tours: 29,
      status: "Chờ phê duyệt",
      statusKey: "pending",
    },
    {
      name: "Hành Trình Di Sản",
      email: "sales@disan.vn",
      tours: 33,
      status: "Đã phê duyệt",
      statusKey: "approved",
    },
    {
      name: "Tầm Nhìn Núi",
      email: "info@tamnhinnu.vn",
      tours: 21,
      status: "Đã phê duyệt",
      statusKey: "approved",
    },
    {
      name: "Ánh Đèn Phố",
      email: "contact@anhdenpho.vn",
      tours: 18,
      status: "Chờ phê duyệt",
      statusKey: "pending",
    },
    {
      name: "Dòng Sông Xanh",
      email: "team@dongsongxanh.vn",
      tours: 14,
      status: "Chờ phê duyệt",
      statusKey: "pending",
    },
  ],
  paging: { text: "Hiển thị 1-7 trong 87 nhà cung cấp", pages: [1, 2, 3] },
};

document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const API_URL = "/api/admin/providers";
    const data = window.quanLyNhaCungCapTourData || {};
    const state = {
      q: "",
      page: 1,
      pageSize: 7,
      stats: data.stats || [],
      suppliers: data.suppliers || [],
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

    const companyIcon =
      '<svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 18.333V3.333a1.667 1.667 0 0 1 1.667-1.667h6.666A1.667 1.667 0 0 1 15 3.333v15H5Z" stroke="#00A63E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M5 10H3.333c-.92 0-1.666.747-1.666 1.667v5c0 .92.746 1.666 1.666 1.666H5" stroke="#00A63E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M15 7.5h1.667c.92 0 1.666.747 1.666 1.667v7.5c0 .92-.746 1.666-1.666 1.666H15" stroke="#00A63E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

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

      const current = window.location.pathname.split("/").pop();
      sidebarNav.querySelectorAll(".nav-item").forEach((link) => {
        const hrefFile = (link.getAttribute("href") || "").split("/").pop();
        link.classList.toggle("active", hrefFile === current);
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

      statsGrid.innerHTML = state.stats
        .map(
          (item) => `<div class="stat-card card tone-${item.tone || "neutral"}">
            <div class="label">${item.label || ""}</div>
            <div class="value">${item.value || ""}</div>
            ${item.note ? `<div class="note">${item.note}</div>` : ""}
          </div>`,
        )
        .join("");
    };

    const renderSuppliers = () => {
      const tbody = document.querySelector("#supplierTable tbody");
      if (!tbody || !Array.isArray(state.suppliers)) return;

      tbody.innerHTML = state.suppliers
        .map((supplier) => {
          const statusClass = ["badge", "status-pill", "status", supplier.statusKey || ""]
            .filter(Boolean)
            .join(" ");
          const lockButton = `<button class="icon-btn lock-btn" type="button" aria-label="Khóa nhà cung cấp" data-action="lock" data-provider-id="${supplier.id}" data-status-key="${supplier.statusKey || ""}">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12.667 7.333H3.333C2.597 7.333 2 7.93 2 8.667v4.666C2 14.07 2.597 14.667 3.333 14.667h9.334C13.403 14.667 14 14.07 14 13.333V8.667c0-.737-.597-1.334-1.333-1.334Z" stroke="#4A5565" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M4.667 7.333V4.667c0-.884.351-1.732.976-2.357A3.333 3.333 0 0 1 8 1.333c.884 0 1.732.351 2.357.977.625.625.976 1.473.976 2.357v2.666" stroke="#4A5565" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>`;

          const actions =
            supplier.statusKey === "pending"
              ? `<button class="btn btn-approve" type="button" data-action="approve" data-provider-id="${supplier.id}">Phê duyệt</button>${lockButton}`
              : lockButton;

          return `<tr>
            <td>
              <div class="company-cell">
                <div class="company-icon">${companyIcon}</div>
                <div class="company-meta">
                  <div class="company-name">${supplier.name || ""}</div>
                  <div class="small-text">${supplier.email || ""}</div>
                </div>
              </div>
            </td>
            <td>${supplier.email || ""}</td>
            <td>${supplier.tours || 0} tour</td>
            <td><span class="${statusClass}">${supplier.status || ""}</span></td>
            <td>
              <div class="actions-table">
                ${actions}
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

    async function apiGetProviders() {
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

    async function apiPatchStatus(providerId, status) {
      const res = await fetch(`/api/admin/providers/${providerId}/status`, {
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

    function renderAll() {
      renderSidebar();
      renderUser();
      renderStats();
      renderSuppliers();
      renderPaging();
    }

    async function load() {
      try {
        const payload = await apiGetProviders();
        state.stats = payload.stats || [];
        state.suppliers = payload.suppliers || [];
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
      const tbody = document.querySelector("#supplierTable tbody");
      if (!tbody) return;
      tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const action = btn.getAttribute("data-action");
        const id = btn.getAttribute("data-provider-id");
        if (!id) return;

        try {
          if (action === "approve") {
            await apiPatchStatus(id, "active");
          } else if (action === "lock") {
            await apiPatchStatus(id, "locked");
          }
          await load();
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
