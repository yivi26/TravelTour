// =========================================
// taotour.js
// Xử lý toàn bộ chức năng trang tạo tour
// =========================================

document.addEventListener("DOMContentLoaded", () => {
  const categoryOptions = [
    { id: 1, name: "Rừng nhiệt đới" },
    { id: 2, name: "Biển đảo" },
    { id: 3, name: "Núi cao – Trekking" },
    { id: 4, name: "Làng nghề truyền thống" },
    { id: 5, name: "Nông nghiệp sinh thái" },
    { id: 6, name: "Du lịch cộng đồng" }
  ];

  const includedServices = [
    "Xe đưa đón",
    "Khách sạn",
    "Ăn sáng",
    "Ăn trưa",
    "Vé tham quan",
    "Hướng dẫn viên",
    "Bảo hiểm du lịch",
    "Nước uống"
  ];

  const excludedServices = [
    "Chi phí cá nhân",
    "Thuế VAT",
    "Vé máy bay",
    "Tiền tip",
    "Phí phát sinh",
    "Đồ uống ngoài chương trình"
  ];

  const categorySelect = document.getElementById("categorySelect");
  const includedServicesList = document.getElementById("includedServicesList");
  const excludedServicesList = document.getElementById("excludedServicesList");
  const highlightList = document.getElementById("highlightList");
  const itineraryList = document.getElementById("itineraryList");

  const addHighlightBtn = document.getElementById("addHighlightBtn");
  const addDayBtn = document.getElementById("addDayBtn");

  const coverUploadBox = document.getElementById("coverUploadBox");
  const coverImageInput = document.getElementById("coverImageInput");
  const coverPreview = document.getElementById("coverPreview");

  const galleryAddBtn = document.getElementById("galleryAddBtn");
  const galleryGrid = document.getElementById("galleryGrid");
  const galleryImageInput = document.getElementById("galleryImageInput");

  const publishTourBtn = document.getElementById("publishTourBtn");
  const saveDraftBtn = document.getElementById("saveDraftBtn");
  const cancelCreateTourBtn = document.getElementById("cancelCreateTourBtn");

  const formProgressText = document.getElementById("formProgressText");
  const formProgressBar = document.getElementById("formProgressBar");

  const requiredBasicInfo = document.getElementById("requiredBasicInfo");
  const requiredCoverImage = document.getElementById("requiredCoverImage");
  const requiredDescription = document.getElementById("requiredDescription");
  const requiredItinerary = document.getElementById("requiredItinerary");

  let selectedCoverImage = null;
  let selectedGalleryImages = [];

  init();

  function init() {
    renderCategories();
    renderServiceCheckboxes();
    addHighlightRow();
    addItineraryDay();
    bindEvents();
    updateFormProgress();
  }

  function bindEvents() {
    addHighlightBtn?.addEventListener("click", addHighlightRow);
    addDayBtn?.addEventListener("click", addItineraryDay);

    coverUploadBox?.addEventListener("click", () => {
      coverImageInput.click();
    });

    coverImageInput?.addEventListener("change", handleCoverImageChange);

    galleryAddBtn?.addEventListener("click", () => {
      galleryImageInput.click();
    });

    galleryImageInput?.addEventListener("change", handleGalleryImagesChange);

    publishTourBtn?.addEventListener("click", async () => {
      await submitTour("active");
    });

    saveDraftBtn?.addEventListener("click", async () => {
      await submitTour("draft");
    });

    cancelCreateTourBtn?.addEventListener("click", () => {
      const isConfirmed = confirm("Bạn có chắc muốn hủy tạo tour?");
      if (!isConfirmed) return;
      window.location.href = "./tour_management.html";
    });

    document.addEventListener("input", updateFormProgress);
    document.addEventListener("change", updateFormProgress);
  }

  function renderCategories() {
    if (!categorySelect) return;

    categorySelect.innerHTML = `
      <option value="">-- Chọn danh mục --</option>
      ${categoryOptions
        .map(
          category =>
            `<option value="${category.id}">${category.name}</option>`
        )
        .join("")}
    `;
  }

  function renderServiceCheckboxes() {
    if (includedServicesList) {
      includedServicesList.innerHTML = includedServices
        .map(
          (service, index) => `
            <label class="checkbox-item">
              <input type="checkbox" name="includedServices" value="${service}" id="includedService${index}" />
              <span>${service}</span>
            </label>
          `
        )
        .join("");
    }

    if (excludedServicesList) {
      excludedServicesList.innerHTML = excludedServices
        .map(
          (service, index) => `
            <label class="checkbox-item">
              <input type="checkbox" name="excludedServices" value="${service}" id="excludedService${index}" />
              <span>${service}</span>
            </label>
          `
        )
        .join("");
    }
  }

  function addHighlightRow(value = "") {
    if (!highlightList) return;

    const row = document.createElement("div");
    row.className = "dynamic-row";
    row.innerHTML = `
      <input type="text" class="highlight-input" placeholder="Ví dụ: Khám phá vịnh bằng du thuyền" value="${escapeHtml(value)}" />
      <button type="button" class="remove-row-btn">Xóa</button>
    `;

    const removeBtn = row.querySelector(".remove-row-btn");
    removeBtn?.addEventListener("click", () => {
      row.remove();
      updateFormProgress();
    });

    highlightList.appendChild(row);
    updateFormProgress();
  }

  function addItineraryDay(dayData = null) {
    if (!itineraryList) return;

    const currentDay = itineraryList.children.length + 1;

    const block = document.createElement("div");
    block.className = "itinerary-day-card";
    block.innerHTML = `
      <div class="itinerary-day-header">
        <h4>Ngày ${currentDay}</h4>
        <button type="button" class="remove-day-btn">Xóa ngày</button>
      </div>

      <div class="form-group">
        <label>Tiêu đề ngày</label>
        <input
          type="text"
          class="itinerary-title"
          placeholder="Ví dụ: Khởi hành đến Hạ Long"
          value="${escapeHtml(dayData?.title || "")}"
        />
      </div>

      <div class="form-group">
        <label>Nội dung chi tiết</label>
        <textarea
          rows="4"
          class="itinerary-description"
          placeholder="Nhập hoạt động trong ngày..."
        >${escapeHtml(dayData?.description || "")}</textarea>
      </div>
    `;

    const removeBtn = block.querySelector(".remove-day-btn");
    removeBtn?.addEventListener("click", () => {
      if (itineraryList.children.length === 1) {
        alert("Lịch trình phải có ít nhất 1 ngày.");
        return;
      }
      block.remove();
      reindexItineraryDays();
      updateFormProgress();
    });

    itineraryList.appendChild(block);
    updateFormProgress();
  }

  function reindexItineraryDays() {
    const dayCards = itineraryList.querySelectorAll(".itinerary-day-card");
    dayCards.forEach((card, index) => {
      const title = card.querySelector(".itinerary-day-header h4");
      if (title) {
        title.textContent = `Ngày ${index + 1}`;
      }
    });
  }

  function handleCoverImageChange(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    selectedCoverImage = file;

    const fileReader = new FileReader();
    fileReader.onload = e => {
      coverPreview.innerHTML = `
        <div class="image-preview-item">
          <img src="${e.target?.result}" alt="Ảnh bìa tour" style="max-width: 100%; border-radius: 12px;" />
          <p style="margin-top: 8px;">${file.name}</p>
        </div>
      `;
      updateFormProgress();
    };
    fileReader.readAsDataURL(file);
  }

  function handleGalleryImagesChange(event) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) return;

    const totalAfterAdd = selectedGalleryImages.length + files.length;
    if (totalAfterAdd > 10) {
      alert("Chỉ được chọn tối đa 10 ảnh thư viện.");
      return;
    }

    selectedGalleryImages = [...selectedGalleryImages, ...files];
    renderGalleryPreview();
    updateFormProgress();
  }

  function renderGalleryPreview() {
    const oldItems = galleryGrid.querySelectorAll(".gallery-preview-item");
    oldItems.forEach(item => item.remove());

    selectedGalleryImages.forEach((file, index) => {
      const fileReader = new FileReader();
      fileReader.onload = e => {
        const item = document.createElement("div");
        item.className = "gallery-preview-item";
        item.innerHTML = `
          <img src="${e.target?.result}" alt="Gallery Image" style="width: 100%; height: 100px; object-fit: cover; border-radius: 10px;" />
          <button type="button" class="remove-gallery-btn" data-index="${index}">×</button>
        `;

        galleryGrid.insertBefore(item, galleryAddBtn);

        item.querySelector(".remove-gallery-btn")?.addEventListener("click", () => {
          selectedGalleryImages.splice(index, 1);
          renderGalleryPreview();
          updateFormProgress();
        });
      };
      fileReader.readAsDataURL(file);
    });
  }

  function getInputValue(id) {
    const element = document.getElementById(id);
    return element ? element.value.trim() : "";
  }

  function getCheckedValues(name) {
    return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(
      input => input.value
    );
  }

  function getHighlights() {
    return Array.from(document.querySelectorAll(".highlight-input"))
      .map(input => input.value.trim())
      .filter(Boolean);
  }

  function getItineraryItems() {
    return Array.from(document.querySelectorAll(".itinerary-day-card"))
      .map((card, index) => {
        const title = card.querySelector(".itinerary-title")?.value.trim() || "";
        const description =
          card.querySelector(".itinerary-description")?.value.trim() || "";

        return {
          day: index + 1,
          title,
          description
        };
      })
      .filter(item => item.title || item.description);
  }

  function parseDurationDays(durationText) {
    const matched = durationText.match(/(\d+)/);
    if (!matched) return 1;
    return Number(matched[1]) || 1;
  }

  function createSlug(title) {
    return title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  }

  function collectFormData() {
    const title = getInputValue("tourTitle");
    const code = getInputValue("tourCode");
    const categoryId = getInputValue("categorySelect");
    const location = getInputValue("tourLocation");
    const durationText = getInputValue("tourDurationText");
    const startDate = getInputValue("tourStartDate");
    const endDate = getInputValue("tourEndDate");
    const maxCapacity = Number(getInputValue("tourMaxCapacity"));
    const basePrice = Number(getInputValue("tourBasePrice"));
    const salePrice = Number(getInputValue("tourSalePrice"));
    const shortDescription = getInputValue("tourShortDescription");
    const meetingPoint = getInputValue("meetingPoint");
    const hotelInfo = getInputValue("hotelInfo");
    const transportInfo = getInputValue("transportInfo");
    const cancelPolicy = getInputValue("cancelPolicy");
    const termsConditions = getInputValue("termsConditions");
    const otherNotes = getInputValue("otherNotes");

    const highlights = getHighlights();
    const included = getCheckedValues("includedServices");
    const excluded = getCheckedValues("excludedServices");
    const itineraryItems = getItineraryItems();

    return {
      title,
      code,
      category_id: categoryId ? Number(categoryId) : null,
      location,
      duration_text: durationText,
      duration_days: parseDurationDays(durationText),
      start_date: startDate || null,
      end_date: endDate || null,
      max_capacity: Number.isFinite(maxCapacity) ? maxCapacity : 0,
      base_price: Number.isFinite(basePrice) ? basePrice : 0,
      sale_price: Number.isFinite(salePrice) ? salePrice : 0,
      short_description: shortDescription,
      description: shortDescription,
      meeting_point: meetingPoint,
      hotel_info: hotelInfo,
      transport_info: transportInfo,
      cancel_policy: cancelPolicy,
      terms_conditions: termsConditions,
      other_notes: otherNotes,
      highlights,
      includes: included,
      excludes: excluded,
      itinerary_items: itineraryItems,
      thumbnail_url: selectedCoverImage ? `/uploads/${selectedCoverImage.name}` : null,
      gallery_images: selectedGalleryImages.map(file => `/uploads/${file.name}`),
      slug: createSlug(title)
    };
  }

  function validateFormData(data, submitMode) {
    if (!data.title) {
      alert("Vui lòng nhập tên tour.");
      return false;
    }

    if (!data.code) {
      alert("Vui lòng nhập mã tour.");
      return false;
    }

    if (!data.category_id) {
      alert("Vui lòng chọn danh mục.");
      return false;
    }

    if (!data.location) {
      alert("Vui lòng nhập điểm đến.");
      return false;
    }

    if (!data.duration_text) {
      alert("Vui lòng nhập thời gian tour.");
      return false;
    }

    if (!data.max_capacity || data.max_capacity <= 0) {
      alert("Vui lòng nhập số người tối đa hợp lệ.");
      return false;
    }

    if (!data.base_price || data.base_price <= 0) {
      alert("Vui lòng nhập giá tour hợp lệ.");
      return false;
    }

    if (!data.short_description) {
      alert("Vui lòng nhập mô tả ngắn.");
      return false;
    }

    if (submitMode === "active") {
      if (!selectedCoverImage) {
        alert("Vui lòng chọn ảnh bìa chính.");
        return false;
      }

      if (data.itinerary_items.length === 0) {
        alert("Vui lòng nhập ít nhất 1 ngày lịch trình.");
        return false;
      }
    }

    return true;
  }

  async function submitTour(status) {
    try {
      const formData = collectFormData();

      if (!validateFormData(formData, status)) {
        return;
      }

      const payload = {
        ...formData,
        status
      };

      console.log("Payload tạo tour:", payload);

      const response = await fetch("/api/provider/tours", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.message || "Tạo tour thất bại.");
        return;
      }

      alert(status === "draft" ? "Lưu nháp thành công!" : "Xuất bản tour thành công!");
      window.location.href = "./tour_management.html";
    } catch (error) {
      console.error("Lỗi submit tour:", error);
      alert("Có lỗi xảy ra khi tạo tour.");
    }
  }

  function updateRequiredStatus(element, isDone) {
    if (!element) return;
    if (isDone) {
      element.classList.add("done");
    } else {
      element.classList.remove("done");
    }
  }

  function updateFormProgress() {
    const data = collectFormData();

    const basicInfoDone =
      !!data.title &&
      !!data.code &&
      !!data.category_id &&
      !!data.location &&
      !!data.duration_text &&
      data.max_capacity > 0 &&
      data.base_price > 0;

    const coverDone = !!selectedCoverImage;
    const descriptionDone = !!data.short_description;
    const itineraryDone = data.itinerary_items.length > 0;

    updateRequiredStatus(requiredBasicInfo, basicInfoDone);
    updateRequiredStatus(requiredCoverImage, coverDone);
    updateRequiredStatus(requiredDescription, descriptionDone);
    updateRequiredStatus(requiredItinerary, itineraryDone);

    const completedCount = [basicInfoDone, coverDone, descriptionDone, itineraryDone].filter(Boolean).length;
    const progressPercent = Math.round((completedCount / 4) * 100);

    if (formProgressText) {
      formProgressText.textContent = `${progressPercent}%`;
    }

    if (formProgressBar) {
      formProgressBar.style.width = `${progressPercent}%`;
    }
  }

  function escapeHtml(text) {
    return String(text)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
});
// ===========================
// LEAFLET MAP
// ===========================

let map;
let marker;

document.addEventListener("DOMContentLoaded", () => {
  initLeafletMap();
});

function initLeafletMap() {
  const defaultLat = 21.0285;
  const defaultLng = 105.8542;

  map = L.map("map").setView([defaultLat, defaultLng], 13);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap"
  }).addTo(map);

  marker = L.marker([defaultLat, defaultLng])
    .addTo(map)
    .bindPopup("Chọn địa điểm")
    .openPopup();

  // Click map để chọn vị trí
  map.on("click", function (e) {
    const { lat, lng } = e.latlng;

    marker.setLatLng([lat, lng])
      .bindPopup(`Lat: ${lat.toFixed(5)}, Lng: ${lng.toFixed(5)}`)
      .openPopup();
  });

  // 👉 THÊM PHẦN NÀY
  const meetingPointInput = document.getElementById("meetingPoint");

  let timeout = null;

  meetingPointInput.addEventListener("input", function () {
    clearTimeout(timeout);

    // debounce 500ms tránh spam API
    timeout = setTimeout(() => {
      searchAddress(this.value);
    }, 500);
  });
}
async function searchAddress(address) {
  if (!address || address.length < 3) return;

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`
    );

    const data = await response.json();

    if (data.length === 0) {
      console.log("Không tìm thấy địa chỉ");
      return;
    }

    const { lat, lon, display_name } = data[0];

    // Di chuyển map
    map.setView([lat, lon], 15);

    // Di chuyển marker
    marker.setLatLng([lat, lon])
      .bindPopup(display_name)
      .openPopup();

  } catch (error) {
    console.error("Lỗi tìm địa chỉ:", error);
  }
}