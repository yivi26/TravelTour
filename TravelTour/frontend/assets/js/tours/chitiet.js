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

  function escapeHtml(text) {
    return String(text ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function formatMultilineText(text) {
    return escapeHtml(text).replace(/\n/g, "<br>");
  }

  function hasText(value) {
    return String(value ?? "").trim() !== "";
  }

  function getTourIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
  }

  function getDurationText(days, durationText) {
    if (hasText(durationText)) return durationText;
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

  function getAppliedPrice(tour) {
    const basePrice = Number(tour?.base_price || 0);
    const salePrice = Number(tour?.sale_price || 0);

    if (salePrice > 0 && salePrice < basePrice) {
      return salePrice;
    }

    return basePrice;
  }

  function getTaxPercent(tour) {
    const p = Number(tour?.tax_percent);
    return Number.isFinite(p) && p > 0 ? p : 0;
  }

  function getTaxAmount(tour) {
    const taxPercent = getTaxPercent(tour);
    if (taxPercent <= 0) return 0;

    const appliedPrice = getAppliedPrice(tour);
    const taxValue = Number(tour?.tax || 0);

    if (taxValue > 0) return taxValue;

    return Math.round(appliedPrice * (taxPercent / 100));
  }

  function getFinalPrice(tour) {
    const finalPrice = Number(tour?.final_price || 0);
    if (finalPrice > 0) return finalPrice;

    return getAppliedPrice(tour) + getTaxAmount(tour);
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
      container.innerHTML = `<li>${escapeHtml(emptyText)}</li>`;
      return;
    }

    container.innerHTML = items
      .map((item) => `<li>${escapeHtml(item)}</li>`)
      .join("");
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
            <h3>Ngày ${escapeHtml(day.day || "")}</h3>
            <h4>${escapeHtml(day.title || "Chưa có tiêu đề")}</h4>
            <p>${escapeHtml(day.description || "Chưa có mô tả cho ngày này.")}</p>
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
            class="tour-thumb ${imageUrl === activeMainImage ? "active" : ""}"
            data-image="${imageUrl}"
            aria-label="Xem ảnh tour ${index + 1}"
          >
            <img src="${imageUrl}" alt="Ảnh tour ${index + 1}" />
          </button>
        `
      )
      .join("");

    const thumbButtons = thumbsContainer.querySelectorAll(".tour-thumb");

    thumbButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const imageUrl = button.getAttribute("data-image") || FALLBACK_IMAGE;
        mainImage.src = imageUrl;

        thumbButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
      });
    });
  }

  function setMeetingPointText(meetingPoint) {
    const meetingPointElement = document.getElementById("tour-meeting-point");
    if (!meetingPointElement) return;

    if (!hasText(meetingPoint)) {
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
    mapContainer.innerHTML = `<div class="map-empty-box">${escapeHtml(message)}</div>`;
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

    if (typeof L === "undefined") {
      renderMapEmpty("Không tải được bản đồ.");
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

  function renderPolicySection(tour) {
    const policySection = document.getElementById("tour-policy-section");
    const cancelPolicyWrap = document.getElementById("cancel-policy-wrap");
    const termsConditionsWrap = document.getElementById("terms-conditions-wrap");
    const otherNotesWrap = document.getElementById("other-notes-wrap");

    const cancelPolicyEl = document.getElementById("tour-cancel-policy");
    const termsConditionsEl = document.getElementById("tour-terms-conditions");
    const otherNotesEl = document.getElementById("tour-other-notes");

    if (
      !policySection ||
      !cancelPolicyWrap ||
      !termsConditionsWrap ||
      !otherNotesWrap ||
      !cancelPolicyEl ||
      !termsConditionsEl ||
      !otherNotesEl
    ) {
      return;
    }

    const cancelPolicy = tour.cancel_policy || "";
    const termsConditions = tour.terms_conditions || "";
    const otherNotes = tour.other_notes || "";

    const hasCancelPolicy = hasText(cancelPolicy);
    const hasTermsConditions = hasText(termsConditions);
    const hasOtherNotes = hasText(otherNotes);

    policySection.style.display = "none";
    cancelPolicyWrap.style.display = "none";
    termsConditionsWrap.style.display = "none";
    otherNotesWrap.style.display = "none";

    cancelPolicyEl.innerHTML = "";
    termsConditionsEl.innerHTML = "";
    otherNotesEl.innerHTML = "";

    if (!hasCancelPolicy && !hasTermsConditions && !hasOtherNotes) {
      return;
    }

    policySection.style.display = "block";

    if (hasCancelPolicy) {
      cancelPolicyWrap.style.display = "block";
      cancelPolicyEl.innerHTML = formatMultilineText(cancelPolicy);
    }

    if (hasTermsConditions) {
      termsConditionsWrap.style.display = "block";
      termsConditionsEl.innerHTML = formatMultilineText(termsConditions);
    }

    if (hasOtherNotes) {
      otherNotesWrap.style.display = "block";
      otherNotesEl.innerHTML = formatMultilineText(otherNotes);
    }
  }

  function renderExtraInfo(tour) {
    const section = document.getElementById("tour-extra-info-section");
    const hotelWrap = document.getElementById("hotel-info-wrap");
    const transportWrap = document.getElementById("transport-info-wrap");

    const hotelEl = document.getElementById("tour-hotel-info");
    const transportEl = document.getElementById("tour-transport-info");

    if (!section || !hotelWrap || !transportWrap || !hotelEl || !transportEl) return;

    const hasHotel = hasText(tour.hotel_info);
    const hasTransport = hasText(tour.transport_info);

    section.style.display = "none";
    hotelWrap.style.display = "none";
    transportWrap.style.display = "none";

    if (!hasHotel && !hasTransport) return;

    section.style.display = "block";

    if (hasHotel) {
      hotelWrap.style.display = "block";
      hotelEl.innerHTML = formatMultilineText(tour.hotel_info);
    }

    if (hasTransport) {
      transportWrap.style.display = "block";
      transportEl.innerHTML = formatMultilineText(tour.transport_info);
    }
  }

  function renderTourDetail(tour) {
    currentTour = tour;

    const appliedPrice = getAppliedPrice(tour);
    const taxPercent = getTaxPercent(tour);
    const taxAmount = getTaxAmount(tour);
    const finalPrice = getFinalPrice(tour);

    TOUR_PRICE = finalPrice;

    const title = tour.title || "Chưa có tên tour";
    const location = tour.location || "Chưa cập nhật";
    const provider = tour.provider_name || "Nhà cung cấp";
    const description = tour.description || tour.short_description || "Chưa có mô tả";
    const meetingPoint = tour.meeting_point || "";
    const duration = getDurationText(tour.duration_days, tour.duration_text);
    const capacity = `${Number(tour.max_capacity || 0)} khách`;

    const appliedPriceText = formatCurrency(appliedPrice);
    const taxAmountText = formatCurrency(taxAmount);
    const finalPriceText = formatCurrency(finalPrice);

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

    const tourBasePriceEl = document.getElementById("tour-base-price");
    const tourTaxPercentEl = document.getElementById("tour-tax-percent");
    const tourTaxEl = document.getElementById("tour-tax");
    const tourFinalPriceEl = document.getElementById("tour-final-price");

    const bookingBasePriceEl = document.getElementById("booking-base-price");
    const bookingTaxPercentEl = document.getElementById("booking-tax-percent");
    const bookingTaxEl = document.getElementById("booking-tax");
    const bookingFinalPriceEl = document.getElementById("booking-final-price");

    if (breadcrumbTitle) breadcrumbTitle.textContent = title;
    if (tourTitle) tourTitle.textContent = title;
    if (tourLocation) tourLocation.textContent = location;
    if (tourProvider) tourProvider.textContent = provider;
    if (tourDescription) tourDescription.textContent = description;
    if (tourDescriptionFull) tourDescriptionFull.textContent = description;
    if (tourDuration) tourDuration.textContent = duration;
    if (tourCapacity) tourCapacity.textContent = capacity;
    if (tourPrice) tourPrice.textContent = finalPriceText;
    if (bookingTourPrice) bookingTourPrice.textContent = finalPriceText;

    if (tourBasePriceEl) tourBasePriceEl.textContent = appliedPriceText;
    if (tourTaxPercentEl) tourTaxPercentEl.textContent = `${taxPercent}%`;
    if (tourTaxEl) tourTaxEl.textContent = taxAmountText;
    if (tourFinalPriceEl) tourFinalPriceEl.textContent = finalPriceText;

    if (bookingBasePriceEl) bookingBasePriceEl.textContent = appliedPriceText;
    if (bookingTaxPercentEl) bookingTaxPercentEl.textContent = `${taxPercent}%`;
    if (bookingTaxEl) bookingTaxEl.textContent = taxAmountText;
    if (bookingFinalPriceEl) bookingFinalPriceEl.textContent = finalPriceText;

    const includes = safeParseJsonArray(tour.includes);
    const excludes = safeParseJsonArray(tour.excludes);
    const itinerary = safeParseJsonArray(tour.itinerary);

    renderGallery(tour);
    renderList("tour-includes-list", includes, "Chưa có thông tin bao gồm");
    renderList("tour-excludes-list", excludes, "Chưa có thông tin không bao gồm");
    renderItinerary(itinerary);
    setMeetingPointText(meetingPoint);
    renderMeetingPointMap(tour);
    renderExtraInfo(tour);
    renderPolicySection(tour);
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
        throw new Error("Không tìm thấy id tour trên URL");
      }

      const tour = await fetchTourDetail(tourId);
      console.log("TOUR DATA:", tour);

      renderTourDetail(tour);
      setupDepartureDate();
    } catch (error) {
      console.error("Lỗi tải chi tiết tour:", error);
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
      window.location.href = "./ttkhachhang.html";
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();