document.addEventListener("DOMContentLoaded", () => {
  (function () {
    const API = "/api/settings";
    const CACHE_KEY = "traveltour_system_settings_v1";
    const CACHE_TTL_MS = 60_000;

    function now() {
      return Date.now();
    }

    function safeJsonParse(value) {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }

    function getCached() {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = safeJsonParse(raw);
      if (!parsed || typeof parsed !== "object") return null;
      if (!parsed.savedAt || now() - parsed.savedAt > CACHE_TTL_MS) return null;
      return parsed.data || null;
    }

    function setCached(data) {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ savedAt: now(), data }));
    }

    function clearCached() {
      sessionStorage.removeItem(CACHE_KEY);
    }

    function setSaving(isSaving) {
      const btn = document.getElementById("btn-save");
      if (!btn) return;
      btn.disabled = Boolean(isSaving);
      btn.style.opacity = isSaving ? "0.7" : "";
      btn.style.cursor = isSaving ? "not-allowed" : "";
    }

    function setValueForKey(key, value) {
      const input = document.querySelector(`[data-setting-key="${key}"]`);
      if (input && (input.tagName === "INPUT" || input.tagName === "TEXTAREA")) {
        if (input.type === "checkbox") input.checked = Boolean(value);
        else input.value = value == null ? "" : String(value);
        return;
      }

      if (key === "theme_primary_color") {
        const wrap = document.querySelector(`.swatches[data-setting-key="theme_primary_color"]`);
        if (!wrap) return;
        const swatches = Array.from(wrap.querySelectorAll(".swatch"));
        for (const sw of swatches) {
          const color = sw.getAttribute("data-color");
          sw.classList.toggle(
            "selected",
            Boolean(
              color &&
                String(color).toLowerCase() === String(value || "").toLowerCase(),
            ),
          );
        }

        if (value) {
          document.documentElement.style.setProperty("--primary-color", String(value));
        }
      }
    }

    function getPayloadFromForm() {
      const payload = {};
      const fields = Array.from(document.querySelectorAll("[data-setting-key]"));

      for (const el of fields) {
        const key = el.getAttribute("data-setting-key");
        if (!key) continue;

        if (el.classList.contains("swatches") && key === "theme_primary_color") {
          const selected = el.querySelector(".swatch.selected");
          payload[key] = selected?.getAttribute("data-color") || "#00a63e";
          continue;
        }

        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          if (el.type === "checkbox") payload[key] = Boolean(el.checked);
          else if (el.type === "url") payload[key] = String(el.value || "").trim() || null;
          else payload[key] = String(el.value || "").trim();
        }
      }

      return payload;
    }

    async function apiGet() {
      const cached = getCached();
      if (cached) return cached;

      const res = await fetch(API, { method: "GET" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Không tải được cài đặt");
      const settings = data?.data || {};
      setCached(settings);
      return settings;
    }

    async function apiPut(payload) {
      const res = await fetch(API, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message || "Lưu cài đặt thất bại");
      const settings = data?.data || {};
      setCached(settings);
      return settings;
    }

    function wireSwatches() {
      const wrap = document.querySelector(`.swatches[data-setting-key="theme_primary_color"]`);
      if (!wrap) return;

      wrap.addEventListener("click", (e) => {
        const sw = e.target && e.target.closest ? e.target.closest(".swatch") : null;
        if (!sw) return;
        for (const el of wrap.querySelectorAll(".swatch")) el.classList.remove("selected");
        sw.classList.add("selected");

        const color = sw.getAttribute("data-color");
        if (color) document.documentElement.style.setProperty("--primary-color", String(color));
      });
    }

    async function init() {
      wireSwatches();

      try {
        setSaving(true);
        const settings = await apiGet();
        for (const [k, v] of Object.entries(settings)) setValueForKey(k, v);
      } catch (err) {
        console.error(err);
        alert(err?.message || "Không tải được cài đặt hệ thống");
      } finally {
        setSaving(false);
      }

      // Cho các trang khác (hoặc script khác) dùng lại settings hiện tại.
      window.TravelTourSettings = {
        fetch: apiGet,
        clearCache: clearCached,
      };

      const btn = document.getElementById("btn-save");
      if (btn) {
        btn.addEventListener("click", async () => {
          try {
            setSaving(true);
            const payload = getPayloadFromForm();
            const updated = await apiPut(payload);
            for (const [k, v] of Object.entries(updated)) setValueForKey(k, v);
            alert("Đã lưu thay đổi!");
          } catch (err) {
            console.error(err);
            alert(err?.message || "Lưu cài đặt thất bại");
          } finally {
            setSaving(false);
          }
        });
      }
    }

    init();
  })();
});

