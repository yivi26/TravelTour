document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const API_URL = "/api/admin/reviews";
    const state = { q: "", page: 1, pageSize: 6, stats: null, reviews: [], paging: null };

    const eyeIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
    const hideIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
    const trashIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>`;

    function debounce(fn, wait = 350) {
      let t = null;
      return (...args) => {
        if (t) clearTimeout(t);
        t = setTimeout(() => fn(...args), wait);
      };
    }

    function avatarText(name = "") {
      return String(name || "")
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase();
    }

    function avatarColor(seed = "") {
      const s = String(seed || "");
      let h = 0;
      for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 360;
      return `hsl(${h} 70% 45%)`;
    }

    function starsHtml(rating) {
      const r = Number(rating || 0);
      const full = Math.max(0, Math.min(5, Math.round(r)));
      let html = "";
      for (let i = 1; i <= 5; i++) html += `<span class="star ${i <= full ? "" : "empty"}">★</span>`;
      html += `<span class="star-score">${r.toFixed(1)}</span>`;
      return html;
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
      const res = await fetch(`/api/admin/reviews/${id}`, { headers: { Accept: "application/json" } });
      if (!res.ok) {
        const txt = await res.text().catch(() => "");
        throw new Error(txt || `HTTP ${res.status}`);
      }
      return await res.json();
    }

    async function apiPatchStatus(id, status) {
      const res = await fetch(`/api/admin/reviews/${id}/status`, {
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

    async function apiDelete(id) {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
        headers: { Accept: "application/json" },
      });
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
      const s = state.stats || { total: 0, avg: 0, pending: 0, flagged: 0 };
      setText("statTotal", (s.total ?? 0).toLocaleString("vi-VN"));
      setText("statAvg", `${Number(s.avg || 0).toFixed(1)} ★`);
      setText("statPending", (s.pending ?? 0).toLocaleString("vi-VN"));
      setText("statFlagged", (s.flagged ?? 0).toLocaleString("vi-VN"));
    }

    function renderTable() {
      const tbody = document.querySelector("#reviewTable tbody");
      if (!tbody) return;

      tbody.innerHTML = (state.reviews || [])
        .map((r) => {
          const name = r.customer?.name || "";
          const email = r.customer?.email || "";
          const tour = r.tour?.title || "";
          const comment = r.comment || "";
          const statusKey = r.statusKey || "pending";
          const statusLabel = r.status || "";
          const approveBtn =
            r.rawStatus === "pending"
              ? `<button class="action-btn" title="Duyệt" data-action="approve" data-id="${r.id}">✔</button>`
              : "";

          return `<tr>
            <td>
              <div class="customer-cell">
                <div class="customer-avatar" style="background:${avatarColor(email || name)}">${avatarText(name)}</div>
                <div>
                  <div class="customer-name">${name}</div>
                  <div class="customer-email">${email}</div>
                </div>
              </div>
            </td>
            <td><div class="tour-name">${tour}</div></td>
            <td><div class="stars">${starsHtml(r.rating)}</div></td>
            <td style="max-width: 200px; color: #6b7280; font-size: 12.5px">${comment}</td>
            <td style="white-space: nowrap; color: #6b7280; font-size: 12.5px">${r.dateText || ""}</td>
            <td><span class="badge ${statusKey}">${statusLabel}</span></td>
            <td>
              <div class="actions">
                <button class="action-btn" title="Xem" data-action="view" data-id="${r.id}">${eyeIcon}</button>
                ${approveBtn}
                <button class="action-btn" title="Ẩn" data-action="hide" data-id="${r.id}">${hideIcon}</button>
                <button class="action-btn danger" title="Xoá" data-action="delete" data-id="${r.id}">${trashIcon}</button>
              </div>
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
        `<button class="page-btn" type="button" data-page="prev" ${canPrev ? "" : "disabled"}>&lt;</button>`,
        ...pages.map(
          (p) =>
            `<button class="page-btn ${Number(p) === currentPage ? "active" : ""}" type="button" data-page="${p}">${p}</button>`,
        ),
        `<button class="page-btn" type="button" data-page="next" ${canNext ? "" : "disabled"}>&gt;</button>`,
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
        state.reviews = payload.reviews || [];
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
      const tbody = document.querySelector("#reviewTable tbody");
      if (!tbody) return;
      tbody.addEventListener("click", async (e) => {
        const btn = e.target.closest("button[data-action]");
        if (!btn) return;
        const action = btn.getAttribute("data-action");
        const id = btn.getAttribute("data-id");
        if (!id) return;
        try {
          if (action === "view") {
            const detail = await apiGetDetail(id);
            alert(JSON.stringify(detail.item, null, 2));
          } else if (action === "hide") {
            await apiPatchStatus(id, "hidden");
            await load();
          } else if (action === "approve") {
            await apiPatchStatus(id, "approved");
            await load();
          } else if (action === "delete") {
            const ok = confirm("Bạn chắc chắn muốn xoá đánh giá này?");
            if (!ok) return;
            await apiDelete(id);
            await load();
          }
        } catch (err) {
          console.error(err);
          alert(err?.message || "Thao tác thất bại");
        }
      });
    }

    bindSearch();
    bindPaging();
    bindActions();
    load();
  })();
});

