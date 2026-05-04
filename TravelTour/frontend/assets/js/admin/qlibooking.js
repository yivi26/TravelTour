document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const API_URL = "/api/admin/bookings";
    const state = { q: "", page: 1, pageSize: 7, stats: null, bookings: [], paging: null };

    const customerIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`;
    const tourIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.657 16.657L13.414 20.9a2 2 0 0 1-2.827 0l-4.244-4.243a8 8 0 1 1 11.314 0z"/><circle cx="12" cy="11" r="3"/></svg>`;
    const dateIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`;
    const eyeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;

    function debounce(fn, wait = 350) {
      let t = null;
      return (...args) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    }

    async function apiGet() {
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

    async function apiGetDetail(id) {
      const res = await fetch(`/api/admin/bookings/${id}`, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      return await res.json();
    }

    function setText(id, text) {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    }

    function renderStats() {
      const s = state.stats || { total: 0, pending: 0, confirmed: 0, completed: 0 };
      setText("statTotal", (s.total ?? 0).toLocaleString("vi-VN"));
      setText("statPending", (s.pending ?? 0).toLocaleString("vi-VN"));
      setText("statConfirmed", (s.confirmed ?? 0).toLocaleString("vi-VN"));
      setText("statCompleted", (s.completed ?? 0).toLocaleString("vi-VN"));
    }

    function renderTable() {
      const tbody = document.querySelector("#bookingTable tbody");
      if (!tbody) return;

      tbody.innerHTML = (state.bookings || [])
        .map((b) => {
          const dateText = b.departureDate ? String(b.departureDate).slice(0, 10) : "—";
          return `<tr>
            <td><span class="booking-id">${b.code || ""}</span></td>
            <td><div class="customer-cell">${customerIcon}<span>${b.customerName || ""}</span></div></td>
            <td><div class="tour-cell">${tourIcon}<span>${b.tourTitle || ""}</span></div></td>
            <td><div class="date-cell">${dateIcon}${dateText}</div></td>
            <td>${Number(b.people || 0)} người</td>
            <td><span class="money">${b.amount || "0 VND"}</span></td>
            <td><span class="badge ${b.statusKey || "pending"}">${b.status || ""}</span></td>
            <td>
              <button class="action-btn" type="button" title="Xem chi tiết" data-action="view" data-booking-id="${b.id}">
                ${eyeIcon}
              </button>
            </td>
          </tr>`;
        })
        .join("");
    }

    function renderPaging() {
      if (state.paging?.text) setText("pagingText", state.paging.text);
      const paginationEl = document.getElementById("pagination");
      if (!paginationEl) return;

      const pages = Array.isArray(state.paging?.pages) ? state.paging.pages : [1];
      const currentPage = Number(state.paging?.page || state.page || 1);
      const totalPages = Number(state.paging?.totalPages || 1);
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
    }

    function renderAll() {
      renderStats();
      renderTable();
      renderPaging();
    }

    async function load() {
      try {
        const payload = await apiGet();
        state.stats = payload.stats || state.stats;
        state.bookings = payload.bookings || [];
        state.paging = payload.paging || state.paging;
        state.page = Number(state.paging?.page || state.page || 1);
        renderAll();
      } catch (err) {
        console.error(err);
        renderAll();
      }
    }

    function bindSearch() {
      const input = document.getElementById("searchInput");
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
      const tbody = document.querySelector("#bookingTable tbody");
      if (!tbody) return;
      tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button[data-action='view']");
        if (!btn) return;
        const id = btn.getAttribute("data-booking-id");
        if (!id) return;
        try {
          const detail = await apiGetDetail(id);
          alert(JSON.stringify(detail.item, null, 2));
        } catch (err) {
          console.error(err);
          alert(err?.message || "Không tải được chi tiết booking");
        }
      });
    }

    bindSearch();
    bindPaging();
    bindActions();
    load();
  })();
});

