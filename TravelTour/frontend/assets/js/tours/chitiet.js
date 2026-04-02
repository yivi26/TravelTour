(function () {
  let TOUR_PRICE = 0;
  let currentTour = null;
  let meetingMap = null;
  let meetingMarker = null;

  const bookingForm = document.getElementById("booking-form");
  const dateInput = document.getElementById("departure-date");
  const adultSelect = document.getElementById("adult-count");
  const childSelect = document.getElementById("child-count");
  const lineLabel = document.getElementById("booking-line-label");
  const lineTotal = document.getElementById("booking-line-total");
  const grandTotal = document.getElementById("booking-grand-total");

  const FALLBACK_IMAGE =
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80";

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
    if (Array.isArray(value)) return value;

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  function normalizeImageUrl(url) {
    const rawUrl = String(url || "").trim();
    if (!rawUrl) return FALLBACK_IMAGE;
    if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) return rawUrl;
    if (rawUrl.startsWith("/")) return rawUrl;
    return "/" + rawUrl.replace(/^\/+/, "");
  }

  function getMainImage(tour) {
    if (Array.isArray(tour.images) && tour.images.length > 0) {
      const firstImage = tour.images[0]?.image_url || "";
      if (firstImage) return normalizeImageUrl(firstImage);
    }
    return normalizeImageUrl(tour.thumbnail_url);
  }

  function getGalleryImages(tour) {
    const gallery = [];

    if (tour.thumbnail_url) {
      gallery.push(normalizeImageUrl(tour.thumbnail_url));
    }

    if (Array.isArray(tour.images)) {
      tour.images.forEach((item) => {
        const imageUrl = item?.image_url || item;
        if (imageUrl) gallery.push(normalizeImageUrl(imageUrl));
      });
    }

    return [...new Set(gallery.filter(Boolean))];
  }

  async function fetchTourDetail(id) {
    const response = await fetch(`http://localhost:3000/api/provider/public/tours/${id}`);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Lỗi lấy chi tiết tour");
    }

    const result = await response.json();
    return result.data;
  }

  function renderList(elementId, items, emptyText) {
    const container = document.getElementById(elementId);
    if (!container) return;

    if (!Array.isArray(items) || items.length === 0) {
      container.innerHTML = `<li>${emptyText}</li>`;
      return;
    }

    container.innerHTML = items.map((item) => `<li>${item}</li>`).join("");
  }

  function renderItinerary(itinerary) {
    const container = document.getElementById("tour-itinerary");
    if (!container) return;

    if (!Array.isArray(itinerary) || itinerary.length === 0) {
      container.innerHTML = "<p>Chưa có lịch trình.</p>";
      return;
    }

    container.innerHTML = itinerary
      .map(
        (day) => `
          <div class="itinerary-day">
            <h3>Ngày ${day.day || ""}</h3>
            <h4>${day.title || "Chưa có tiêu đề"}</h4>
            <p>${day.description || "Chưa có mô tả cho ngày này."}</p>
          </div>
        `
      )
      .join("");
  }

  function renderGallery(tour) {
    const mainImage = document.getElementById("tour-main-image");
    const thumbsContainer = document.getElementById("tour-thumbs");
    if (!mainImage || !thumbsContainer) return;

    const images = getGalleryImages(tour);
    const activeMainImage = getMainImage(tour);

    mainImage.src = activeMainImage;
    mainImage.alt = tour.title || "Ảnh tour";
    mainImage.onerror = function () {
      this.onerror = null;
      this.src = FALLBACK_IMAGE;
    };

    if (images.length <= 1) {
      thumbsContainer.innerHTML = "";
      return;
    }

    thumbsContainer.innerHTML = images
      .map(
        (imageUrl, index) => `
          <button
            type="button"
            class="tour-thumb"
            data-image="${imageUrl}"
            aria-label="Xem ảnh tour ${index + 1}"
          >
            <img src="${imageUrl}" alt="Ảnh tour ${index + 1}" />
          </button>
        `
      )
      .join("");

    thumbsContainer.querySelectorAll(".tour-thumb").forEach((button) => {
      button.addEventListener("click", () => {
        const imageUrl = button.getAttribute("data-image") || FALLBACK_IMAGE;
        mainImage.src = imageUrl;
      });
    });
  }

  function setMeetingPointText(meetingPoint) {
    const meetingPointElement = document.getElementById("tour-meeting-point");
    if (!meetingPointElement) return;

    if (!meetingPoint || !meetingPoint.trim()) {
      meetingPointElement.textContent = "Chưa cập nhật điểm tập trung.";
      meetingPointElement.classList.add("meeting-point-empty");
      return;
    }

    meetingPointElement.textContent = meetingPoint;
    meetingPointElement.classList.remove("meeting-point-empty");
  }

  function destroyMeetingMap() {
    if (meetingMap) {
      meetingMap.remove();
      meetingMap = null;
      meetingMarker = null;
    }
  }

  function renderMapEmpty(message) {
    const mapContainer = document.getElementById("tour-meeting-map");
    if (!mapContainer) return;

    destroyMeetingMap();
    mapContainer.innerHTML = `<div class="map-empty-box">${message}</div>`;
  }

  function clearMapFallback() {
    const mapContainer = document.getElementById("tour-meeting-map");
    if (!mapContainer) return;
    mapContainer.innerHTML = "";
  }

  function renderMeetingPointMap(tour) {
    const meetingPoint = tour.meeting_point || tour.location || "";
    const lat = Number(tour.latitude);
    const lng = Number(tour.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
      renderMapEmpty("Chưa có dữ liệu bản đồ cho điểm tập trung.");
      return;
    }

    destroyMeetingMap();
    clearMapFallback();

    meetingMap = L.map("tour-meeting-map").setView([lat, lng], 15);

    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap"
    }).addTo(meetingMap);

    meetingMarker = L.marker([lat, lng])
      .addTo(meetingMap)
      .bindPopup(meetingPoint || "Điểm tập trung")
      .openPopup();

    setTimeout(() => {
      meetingMap.invalidateSize();
    }, 200);
  }

  function renderTourDetail(tour) {
    currentTour = tour;
    TOUR_PRICE = Number(tour.base_price || 0);

    const title = tour.title || "Chưa có tên tour";
    const location = tour.location || "Chưa cập nhật";
    const provider = tour.provider_name || "Nhà cung cấp";
    const description = tour.description || "Chưa có mô tả";
    const meetingPoint = tour.meeting_point || "";
    const duration = getDurationText(tour.duration_days);
    const capacity = `${Number(tour.max_capacity || 0)} khách`;
    const displayPrice = formatCurrency(tour.base_price || 0);

    document.title = `${title} - TravelTour`;

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

    if (breadcrumbTitle) breadcrumbTitle.textContent = title;
    if (tourTitle) tourTitle.textContent = title;
    if (tourLocation) tourLocation.textContent = location;
    if (tourProvider) tourProvider.textContent = provider;
    if (tourDescription) tourDescription.textContent = description;
    if (tourDescriptionFull) tourDescriptionFull.textContent = description;
    if (tourDuration) tourDuration.textContent = duration;
    if (tourCapacity) tourCapacity.textContent = capacity;
    if (tourPrice) tourPrice.textContent = displayPrice;
    if (bookingTourPrice) bookingTourPrice.textContent = displayPrice;

    const includes = safeParseJsonArray(tour.includes);
    const excludes = safeParseJsonArray(tour.excludes);
    const itinerary = safeParseJsonArray(tour.itinerary);

    renderGallery(tour);
    renderList("tour-includes-list", includes, "Chưa có thông tin bao gồm");
    renderList("tour-excludes-list", excludes, "Chưa có thông tin không bao gồm");
    renderItinerary(itinerary);
    setMeetingPointText(meetingPoint);
    renderMeetingPointMap(tour);
    updateBookingSummary();
  }

  function updateBookingSummary() {
    if (!adultSelect || !childSelect || !lineLabel || !lineTotal || !grandTotal) return;

    const adults = Number(adultSelect.value) || 0;
    const children = Number(childSelect.value) || 0;
    const totalGuests = Math.max(adults + children, 1);
    const totalPrice = TOUR_PRICE * totalGuests;

    lineLabel.textContent = `${formatCurrency(TOUR_PRICE)} x ${totalGuests} khách`;
    lineTotal.textContent = formatCurrency(totalPrice);
    grandTotal.textContent = formatCurrency(totalPrice);
  }

  function setupDepartureDate() {
    if (!dateInput) return;

    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 10);

    dateInput.min = localDate;
    dateInput.value = localDate;
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
      setupDepartureDate();
    } catch (error) {
      console.error("Lỗi tải chi tiết tour:", error);
      alert("Không thể tải dữ liệu chi tiết tour");
    }
  }

  if (adultSelect) adultSelect.addEventListener("change", updateBookingSummary);
  if (childSelect) childSelect.addEventListener("change", updateBookingSummary);

  if (bookingForm) {
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!currentTour) {
        alert("Chưa có dữ liệu tour");
        return;
      }

      updateBookingSummary();
      window.location.href = "./ttkhachhang.html";
    });
  }
  

  document.addEventListener("DOMContentLoaded", init);
})();
