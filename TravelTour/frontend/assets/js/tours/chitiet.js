(function () {
  let TOUR_PRICE = 0;
  let currentTour = null;

  const bookingForm = document.getElementById("booking-form");
  const dateInput = document.getElementById("departure-date");
  const adultSelect = document.getElementById("adult-count");
  const childSelect = document.getElementById("child-count");
  const lineLabel = document.getElementById("booking-line-label");
  const lineTotal = document.getElementById("booking-line-total");
  const grandTotal = document.getElementById("booking-grand-total");

  function formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN").format(Number(value || 0)) + "đ";
  }

  function getTourIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function getDurationText(days) {
    const totalDays = Number(days || 1);
    if (totalDays <= 1) return "1 ngày";
    return `${totalDays} ngày ${Math.max(totalDays - 1, 0)} đêm`;
  }

  function safeParseJsonArray(value) {
    if (!value) return [];

    if (Array.isArray(value)) {
      return value;
    }

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function getMainImage(tour) {
    if (Array.isArray(tour.images) && tour.images.length > 0) {
      const firstImage = tour.images[0]?.image_url || "";
      if (firstImage) {
        if (firstImage.startsWith("http://") || firstImage.startsWith("https://")) {
          return firstImage;
        }
        if (firstImage.startsWith("/")) {
          return firstImage;
        }
        return "/" + firstImage.replace(/^\/+/, "");
      }
    }

    const rawUrl = String(tour.thumbnail_url || "").trim();

    if (!rawUrl) {
      return "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";
    }

    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
      return rawUrl;
    }

    if (rawUrl.startsWith("/")) {
      return rawUrl;
    }

    return "/" + rawUrl.replace(/^\/+/, "");
  }

  async function fetchTourDetail(id) {
    const response = await fetch(`http://localhost:3000/api/provider/public/tours/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không lấy được dữ liệu tour");
    }

    const result = await response.json();
    return result.data;
  }

  function renderList(elementId, items, emptyText) {
    const container = document.getElementById(elementId);
    if (!container) return;

    if (!items.length) {
      container.innerHTML = `<li>${emptyText}</li>`;
      return;
    }

    container.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  }

  function renderTourDetail(tour) {
    currentTour = tour;
    TOUR_PRICE = Number(tour.base_price || 0);

    document.title = `${tour.title || "Chi tiết tour"} - TravelTour`;

    const title = tour.title || "Chưa có tên tour";
    const location = tour.location || "Chưa cập nhật";
    const provider = tour.provider_name || "Nhà cung cấp";
    const description = tour.description || "Chưa có mô tả";
    const duration = getDurationText(tour.duration_days);
    const capacity = `${Number(tour.max_capacity || 0)} khách`;
    const price = formatCurrency(tour.base_price || 0);
    const image = getMainImage(tour);

    const breadcrumbTitle = document.getElementById("breadcrumb-title");
    const tourTitle = document.getElementById("tour-title");
    const tourLocation = document.getElementById("tour-location");
    const tourProvider = document.getElementById("tour-provider");
    const tourDescription = document.getElementById("tour-description");
    const tourDescriptionFull = document.getElementById("tour-description-full");
    const tourDuration = document.getElementById("tour-duration");
    const tourCapacity = document.getElementById("tour-capacity");
    const tourPrice = document.getElementById("tour-price");
    const bookingTourPrice = document.getElementById("booking-tour-price");
    const tourMainImage = document.getElementById("tour-main-image");

    if (breadcrumbTitle) breadcrumbTitle.textContent = title;
    if (tourTitle) tourTitle.textContent = title;
    if (tourLocation) tourLocation.textContent = location;
    if (tourProvider) tourProvider.textContent = provider;
    if (tourDescription) tourDescription.textContent = description;
    if (tourDescriptionFull) tourDescriptionFull.textContent = description;
    if (tourDuration) tourDuration.textContent = duration;
    if (tourCapacity) tourCapacity.textContent = capacity;
    if (tourPrice) tourPrice.textContent = price;
    if (bookingTourPrice) bookingTourPrice.textContent = price;

    if (tourMainImage) {
      tourMainImage.src = image;
      tourMainImage.alt = title;
      tourMainImage.onerror = function () {
        this.onerror = null;
        this.src =
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";
      };
    }

    const includes = safeParseJsonArray(tour.includes);
    const excludes = safeParseJsonArray(tour.excludes);

    renderList("tour-includes-list", includes, "Chưa có thông tin bao gồm");
    renderList("tour-excludes-list", excludes, "Chưa có thông tin không bao gồm");

    updateBookingSummary();
  }

  function updateBookingSummary() {
    if (!adultSelect || !childSelect || !lineLabel || !lineTotal || !grandTotal) {
      return;
    }

    const adults = Number(adultSelect.value) || 0;
    const children = Number(childSelect.value) || 0;
    const totalGuests = Math.max(adults + children, 1);
    const totalPrice = TOUR_PRICE * totalGuests;

    lineLabel.textContent = `${formatCurrency(TOUR_PRICE)} x ${totalGuests} khách`;
    lineTotal.textContent = formatCurrency(totalPrice);
    grandTotal.textContent = formatCurrency(totalPrice);
  }

  async function init() {
    try {
      const tourId = getTourIdFromURL();

      if (!tourId) {
        alert("Thiếu ID tour");
        return;
      }

      const tour = await fetchTourDetail(tourId);
      renderTourDetail(tour);

      if (dateInput) {
        const today = new Date();
        const localDate = new Date(
          today.getTime() - today.getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 10);
        dateInput.min = localDate;
        dateInput.value = localDate;
      }
    } catch (error) {
      console.error("Lỗi tải chi tiết tour:", error);
      alert("Không thể tải dữ liệu chi tiết tour");
    }
  }

  if (adultSelect) {
    adultSelect.addEventListener("change", updateBookingSummary);
  }

  if (childSelect) {
    childSelect.addEventListener("change", updateBookingSummary);
  }

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!currentTour) {
        alert("Chưa có dữ liệu tour");
        return;
      }

      updateBookingSummary();
      alert(`Đã ghi nhận yêu cầu đặt tour: ${currentTour.title}`);
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
const bookingForm = document.getElementById("booking-form");

bookingForm.addEventListener("submit", function (e) {
  e.preventDefault(); // chặn submit mặc định

  // Có thể lấy thêm dữ liệu ở đây nếu cần

  // Chuyển trang
  window.location.href = "./ttkhachhang.html";
});