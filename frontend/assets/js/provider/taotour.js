const categories = [
  "Du lịch sinh thái",
  "Du lịch biển đảo",
  "Du lịch núi rừng",
  "Du lịch văn hóa",
  "Du lịch ẩm thực",
  "Du lịch mạo hiểm",
];

const includedServices = [
  "Vé máy bay khứ hồi",
  "Khách sạn 4-5 sao",
  "Bữa ăn theo chương trình",
  "Hướng dẫn viên tiếng Việt",
  "Vé tham quan",
  "Bảo hiểm du lịch",
  "Nước uống suốt hành trình",
];

const excludedServices = [
  "Chi phí cá nhân",
  "Đồ uống có cồn",
  "Giặt ủi",
  "Hành lý quá cước",
  "Tham quan ngoài chương trình",
];

let highlights = ["Điểm nổi bật 1", "Điểm nổi bật 2", "Điểm nổi bật 3"];
let itineraryDays = [
  { id: 1, title: "Ngày 1", description: "Mô tả hoạt động trong ngày..." },
];
let galleryCount = 0;

function renderCategories() {
  const select = document.getElementById("categorySelect");
  if (!select) return;

  select.innerHTML = `
    <option value="">Chọn danh mục</option>
    ${categories.map((item) => `<option value="${item}">${item}</option>`).join("")}
  `;
}

function renderCheckboxList(containerId, list, prefix) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = list
    .map(
      (item, index) => `
    <label class="checkbox-item">
      <input type="checkbox" name="${prefix}-${index}">
      <span>${item}</span>
    </label>
  `,
    )
    .join("");
}

function renderHighlights() {
  const container = document.getElementById("highlightList");
  if (!container) return;

  container.innerHTML = highlights
    .map(
      (value, index) => `
    <div class="dynamic-row">
      <input type="text" value="${value}" data-highlight-index="${index}">
      ${highlights.length > 1 ? `<button type="button" class="remove-btn" data-remove-highlight="${index}">✕</button>` : ""}
    </div>
  `,
    )
    .join("");
}

function renderItinerary() {
  const container = document.getElementById("itineraryList");
  if (!container) return;

  container.innerHTML = itineraryDays
    .map(
      (day, index) => `
    <div class="itinerary-day">
      <div class="itinerary-head">
        <h4>${day.title}</h4>
        ${itineraryDays.length > 1 ? `<button type="button" class="remove-btn" data-remove-day="${day.id}">✕</button>` : ""}
      </div>
      <textarea rows="3" data-day-index="${index}" placeholder="Mô tả hoạt động trong ngày...">${day.description}</textarea>
    </div>
  `,
    )
    .join("");
}

function addGalleryThumb() {
  const grid = document.getElementById("galleryGrid");
  const addBtn = document.getElementById("galleryAddBtn");
  if (!grid || !addBtn || galleryCount >= 10) return;

  galleryCount += 1;

  const thumb = document.createElement("div");
  thumb.className = "gallery-thumb";
  thumb.innerHTML = `
    <i class="fa-regular fa-image"></i>
    <button type="button" class="remove-thumb">✕</button>
  `;
  grid.insertBefore(thumb, addBtn);
}

function bindEvents() {
  const addHighlightBtn = document.getElementById("addHighlightBtn");
  const addDayBtn = document.getElementById("addDayBtn");
  const galleryAddBtn = document.getElementById("galleryAddBtn");
  const coverUploadBox = document.getElementById("coverUploadBox");

  if (addHighlightBtn) {
    addHighlightBtn.addEventListener("click", function () {
      highlights.push("");
      renderHighlights();
    });
  }

  if (addDayBtn) {
    addDayBtn.addEventListener("click", function () {
      itineraryDays.push({
        id: Date.now(),
        title: `Ngày ${itineraryDays.length + 1}`,
        description: "",
      });
      renderItinerary();
    });
  }

  if (galleryAddBtn) {
    galleryAddBtn.addEventListener("click", function () {
      addGalleryThumb();
    });
  }

  if (coverUploadBox) {
    coverUploadBox.addEventListener("click", function () {
      alert("Chức năng upload ảnh sẽ làm tiếp.");
    });
  }

  document.addEventListener("input", function (event) {
    const highlightIndex = event.target.getAttribute("data-highlight-index");
    if (highlightIndex !== null) {
      highlights[Number(highlightIndex)] = event.target.value;
    }

    const dayIndex = event.target.getAttribute("data-day-index");
    if (dayIndex !== null) {
      itineraryDays[Number(dayIndex)].description = event.target.value;
    }
  });

  document.addEventListener("click", function (event) {
    const removeHighlight = event.target.closest("[data-remove-highlight]");
    if (removeHighlight) {
      const index = Number(
        removeHighlight.getAttribute("data-remove-highlight"),
      );
      highlights.splice(index, 1);
      renderHighlights();
      return;
    }

    const removeDay = event.target.closest("[data-remove-day]");
    if (removeDay) {
      const id = Number(removeDay.getAttribute("data-remove-day"));
      itineraryDays = itineraryDays.filter((day) => day.id !== id);
      itineraryDays = itineraryDays.map((day, index) => ({
        ...day,
        title: `Ngày ${index + 1}`,
      }));
      renderItinerary();
      return;
    }

    const removeThumb = event.target.closest(".remove-thumb");
    if (removeThumb) {
      const thumb = removeThumb.closest(".gallery-thumb");
      if (thumb) {
        thumb.remove();
        galleryCount -= 1;
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", function () {
  renderCategories();
  renderCheckboxList("includedServicesList", includedServices, "included");
  renderCheckboxList("excludedServicesList", excludedServices, "excluded");
  renderHighlights();
  renderItinerary();
  bindEvents();
});
