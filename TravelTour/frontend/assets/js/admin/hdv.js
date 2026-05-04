// Fallback dữ liệu mẫu (khi API lỗi) để UI vẫn render.
window.hdvData = window.hdvData || {
  nav: [
    { label: "T\u1ed5ng quan", href: "tongquan.html" },
    {
      label: "Qu\u1ea3n l\u00fd ng\u01b0\u1eddi d\u00f9ng",
      href: "qlinguoidung.html",
    },
    {
      label: "Qu\u1ea3n l\u00fd nh\u00e0 cung c\u1ea5p tour",
      href: "qlinhacungcap.html",
    },
    {
      label: "Qu\u1ea3n l\u00fd h\u01b0\u1edbng d\u1eabn vi\u00ean",
      href: "hdv.html",
      active: true,
    },
    { label: "Qu\u1ea3n l\u00fd tour", href: "qlitour.html" },
    { label: "Qu\u1ea3n l\u00fd booking", href: "qlibooking.html" },
    { label: "Qu\u1ea3n l\u00fd \u0111\u00e1nh gi\u00e1", href: "qlidanhgia.html" },
    { label: "B\u00e1o c\u00e1o & th\u1ed1ng k\u00ea", href: "baocao.html" },
    { label: "C\u00e0i \u0111\u1eb7t h\u1ec7 th\u1ed1ng", href: "caidat.html" },
  ],
  user: { name: "Admin User", email: "admin@traveltour.vn", initials: "AD" },
  stats: [
    {
      label: "T\u1ed5ng h\u01b0\u1edbng d\u1eabn vi\u00ean",
      value: "234",
      icon: "users",
      tone: "purple",
    },
    {
      label: "\u0110ang ho\u1ea1t \u0111\u1ed9ng",
      value: "210",
      note: "+8 so v\u1edbi th\u00e1ng tr\u01b0\u1edbc",
      icon: "check",
      tone: "green",
    },
    {
      label: "Tour \u0111ang ph\u1ee5 tr\u00e1ch",
      value: "342",
      icon: "compass",
      tone: "blue",
    },
    {
      label: "\u0110\u00e1nh gi\u00e1 TB",
      value: "4.8",
      icon: "star",
      tone: "yellow",
    },
  ],
  guides: [
    {
      name: "Nguy\u1ec5n Minh Kh\u00f4i",
      phone: "0901 123 456",
      tours: ["\u0110\u00e0 L\u1ea1t 3N2\u0110", "Nha Trang 5N4\u0110"],
      tourCount: 2,
      rating: "4.8",
    },
    {
      name: "Tr\u1ea7n Thu H\u00e0",
      phone: "0902 234 567",
      tours: [
        "Ph\u00fa Qu\u1ed1c 4N3\u0110",
        "C\u00f4n \u0110\u1ea3o 3N2\u0110",
      ],
      tourCount: 2,
      rating: "4.9",
    },
    {
      name: "L\u00ea Qu\u1ed1c B\u1ea3o",
      phone: "0903 345 678",
      tours: ["H\u1ea1 Long 2N1\u0110"],
      tourCount: 1,
      rating: "4.6",
    },
    {
      name: "Ph\u1ea1m Ng\u1ecdc Anh",
      phone: "0904 456 789",
      tours: ["Sapa 3N2\u0110", "H\u00e0 Giang 4N3\u0110"],
      tourCount: 2,
      rating: "4.7",
    },
    {
      name: "Ho\u00e0ng Gia Huy",
      phone: "0905 567 890",
      tours: ["\u0110\u00e0 N\u1eb5ng - H\u1ed9i An 3N2\u0110"],
      tourCount: 1,
      rating: "4.5",
    },
    {
      name: "\u0110\u1ed7 Th\u1ecb Mai",
      phone: "0906 678 901",
      tours: [
        "Hu\u1ebf - Qu\u1ea3ng B\u00ecnh 3N2\u0110",
        "C\u1ea7n Th\u01a1 - Ch\u00e2u \u0110\u1ed1c 2N1\u0110",
      ],
      tourCount: 2,
      rating: "4.6",
    },
    {
      name: "V\u00f5 T\u1ea5n Ph\u00e1t",
      phone: "0907 789 012",
      tours: ["M\u1ed9c Ch\u00e2u 3N2\u0110"],
      tourCount: 1,
      rating: "4.4",
    },
  ],
  paging: {
    text: "Hi\u1ec3n th\u1ecb 1-7 trong 234 h\u01b0\u1edbng d\u1eabn vi\u00ean",
    pages: [1, 2, 3],
  },
};

document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const API_URL = "/api/admin/guides";
    const data = window.hdvData || {};
    const state = {
      q: "",
      page: 1,
      pageSize: 7,
      stats: data.stats || [],
      guides: data.guides || [],
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

    const statIcons = {
      users:
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M7.5 9.167A3.333 3.333 0 1 0 7.5 2.5a3.333 3.333 0 0 0 0 6.667Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M13.333 17.5V15.833c0-.884-.351-1.732-.976-2.357a3.333 3.333 0 0 0-2.357-.976H5a3.333 3.333 0 0 0-2.357.976A3.333 3.333 0 0 0 1.667 15.833V17.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      check:
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m4.167 10.417 3.333 3.333 8.333-8.333" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      compass:
        '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m8.333 8.333-1.25 3.334 4.584-1.25 1.25-3.334-4.584 1.25Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M10 18.333a8.333 8.333 0 1 0 0-16.666 8.333 8.333 0 0 0 0 16.666Z" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
      star: '<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2.5 12.083 7.5H17.5l-4.166 3.125L15.416 15 10 11.875 4.583 15l2.083-4.375L2.5 7.5h5.417L10 2.5Z" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
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
        const linkPath = new URL(link.getAttribute("href") || "#", window.location.href).pathname;
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

      statsGrid.innerHTML = state.stats
        .map(
          (item) => `<div class="stat-card tone-${item.tone || "default"} card">
            <div class="stat-icon">${statIcons[item.icon] || ""}</div>
            <div class="stat-content">
              <div class="label">${item.label || ""}</div>
              <div class="value">${item.value || ""}</div>
              ${item.note ? `<div class="note">${item.note}</div>` : ""}
            </div>
          </div>`,
        )
        .join("");
    };

    const renderGuides = () => {
      const tbody = document.querySelector("#guideTable tbody");
      if (!tbody || !Array.isArray(state.guides)) return;

      tbody.innerHTML = state.guides
        .map((guide) => {
          const initials = getInitials(guide.name || "");
          const toursList = Array.isArray(guide.tours) ? guide.tours.join(", ") : "";
          const tourCountText = `${guide.tourCount || 0} tour`;

          return `<tr>
            <td>
              <div class="name-cell">
                <div class="avatar guide-avatar">${initials}</div>
                <div class="company-name">${guide.name || ""}</div>
              </div>
            </td>
            <td>${guide.phone || ""}</td>
            <td>${toursList}</td>
            <td><span class="tour-badge">${tourCountText}</span></td>
            <td>
              <div class="rating">
                <span class="star">&#9733;</span>
                <span>${guide.rating || ""}</span>
              </div>
            </td>
            <td>
              <div class="actions-table">
                <button class="icon-btn view" type="button" aria-label="Xem chi ti&#7871;t">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.375 8.232c-.056-.15-.056-.315 0-.464C1.916 6.456 2.834 5.334 4.014 4.545 5.193 3.755 6.581 3.334 8 3.334c1.42 0 2.807.421 3.986 1.211 1.18.79 2.099 1.912 2.64 3.224.056.15.056.315 0 .465-.541 1.312-1.46 2.434-2.64 3.223C10.807 12.245 9.419 12.667 8 12.667c-1.42 0-2.807-.422-3.986-1.212-1.18-.789-2.098-1.91-2.64-3.223Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M8 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <button class="icon-btn lock btn-lock" type="button" aria-label="Kh&#243;a h&#432;&#7899;ng d&#7851;n vi&#234;n" data-action="lock-toggle" data-guide-id="${guide.id}" data-is-active="${guide.is_active ? "1" : "0"}">
                  <svg class="lock-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.667 7.333H3.333C2.597 7.333 2 7.93 2 8.667v4.666C2 14.07 2.597 14.667 3.333 14.667h9.334C13.403 14.667 14 14.07 14 13.333V8.667c0-.737-.597-1.334-1.333-1.334Z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M4.667 7.333V4.667c0-.884.351-1.732.976-2.357A3.333 3.333 0 0 1 8 1.333c.884 0 1.732.351 2.357.977.625.625.976 1.473.976 2.357v2.666" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
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

    async function apiGetGuides() {
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

    async function apiPatchActive(guideId, isActive) {
      const res = await fetch(`/api/admin/guides/${guideId}/active`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ is_active: Boolean(isActive) }),
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
      renderGuides();
      renderPaging();
    }

    async function load() {
      try {
        const payload = await apiGetGuides();
        state.stats = payload.stats || [];
        state.guides = payload.guides || [];
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
      const tbody = document.querySelector("#guideTable tbody");
      if (!tbody) return;
      tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button[data-action='lock-toggle']");
        if (!btn) return;
        const id = btn.getAttribute("data-guide-id");
        const isActive = btn.getAttribute("data-is-active") === "1";
        if (!id) return;
        try {
          await apiPatchActive(id, !isActive);
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
