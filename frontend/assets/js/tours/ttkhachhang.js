async function fetchTourDetailById(tourId) {
  const response = await fetch(
    `http://localhost:3000/api/provider/public/tours/${tourId}`,
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Không lấy được chi tiết tour.");
  }

  const result = await response.json();
  return result.data;
}
async function fetchBookingSummary(params) {
  const query = new URLSearchParams({
    tour_id: params.tourId || "",
    departure_date: params.departureDate || "",
    adults: String(params.adults || 0),
    children: String(params.children || 0),
  });

  const response = await fetch(
    `http://localhost:3000/api/bookings/summary?${query.toString()}`,
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Không lấy được tổng kết đặt tour.");
  }

  const result = await response.json();
  return result.data;
}
(function () {
  var STORAGE_KEY = "traveltour-booking";
  var bookingForm = document.getElementById("booking-form");
  var guestList = document.getElementById("guest-list");
  var guestTemplate = document.getElementById("guest-card-template");
  var addGuestButton = document.querySelector(".js-add-guest");
  var backTourButton = document.querySelector(".js-back-tour");
  var toastTimer = null;

  function formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN").format(value) + " ₫";
  }

  function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("vi-VN");
  }

  function getStoredData() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || "{}");
    } catch (error) {
      return {};
    }
  }

  function setStoredData(nextData) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(nextData));
  }

  function persistTourBookingMeta(meta) {
    var storedData = getStoredData();
    storedData.bookingMeta = meta;
    setStoredData(storedData);
  }

  function showToast(message) {
    var toast = document.querySelector(".page-toast");

    if (!toast) {
      toast = document.createElement("div");
      toast.className = "page-toast";
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      toast.classList.remove("is-visible");
    }, 2200);
  }

  function createGuestCard() {
    if (!guestTemplate) {
      return null;
    }

    return guestTemplate.content.firstElementChild.cloneNode(true);
  }

  function updateGuestIndexes() {
    var guestCards = guestList.querySelectorAll(".guest-card");

    guestCards.forEach(function (card, index) {
      var cardIndex = index + 1;
      var heading = card.querySelector("h3");
      var textInputs = card.querySelectorAll('input[type="text"]');
      var genderSelect = card.querySelector("select");
      var labels = card.querySelectorAll("label");
      var removeButton = card.querySelector(".guest-card__remove");

      card.dataset.guestIndex = String(cardIndex);

      if (heading) {
        heading.textContent = "Khách #" + cardIndex;
      }

      if (textInputs[0]) {
        textInputs[0].id = "guest-name-" + cardIndex;
        textInputs[0].name = "guest-name-" + cardIndex;
        labels[0].setAttribute("for", textInputs[0].id);
      }

      if (textInputs[1]) {
        textInputs[1].id = "guest-birthday-" + cardIndex;
        textInputs[1].name = "guest-birthday-" + cardIndex;
        labels[1].setAttribute("for", textInputs[1].id);
      }

      if (genderSelect) {
        genderSelect.id = "guest-gender-" + cardIndex;
        genderSelect.name = "guest-gender-" + cardIndex;
        labels[2].setAttribute("for", genderSelect.id);
      }

      if (textInputs[2]) {
        textInputs[2].id = "guest-id-" + cardIndex;
        textInputs[2].name = "guest-id-" + cardIndex;
        labels[3].setAttribute("for", textInputs[2].id);
      }

      if (removeButton) {
        removeButton.hidden = guestCards.length === 1;
      }
    });
  }

  function fillGuestCard(card, guest) {
    var textInputs = card.querySelectorAll('input[type="text"]');
    var genderSelect = card.querySelector("select");

    if (textInputs[0]) {
      textInputs[0].value = guest.name || "";
    }
    if (textInputs[1]) {
      textInputs[1].value = guest.birthday || "";
    }
    if (genderSelect) {
      genderSelect.value = guest.gender || "";
    }
    if (textInputs[2]) {
      textInputs[2].value = guest.documentId || "";
    }
  }

  function addGuestCard(guest) {
    var newCard = createGuestCard();

    if (!newCard) {
      return;
    }

    guestList.appendChild(newCard);

    if (guest) {
      fillGuestCard(newCard, guest);
    }

    updateGuestIndexes();
  }

  function removeGuestCard(button) {
    var card = button.closest(".guest-card");

    if (!card) {
      return;
    }

    card.remove();
    updateGuestIndexes();
    persistBookingData();
    updateAddGuestButtonState();
    showToast("Đã xóa khách tham gia.");
  }

  function collectBookerData() {
    return {
      name: document.getElementById("booker-name")
        ? document.getElementById("booker-name").value.trim()
        : "",
      email: document.getElementById("booker-email")
        ? document.getElementById("booker-email").value.trim()
        : "",
      phone: document.getElementById("booker-phone")
        ? document.getElementById("booker-phone").value.trim()
        : "",
      country: document.getElementById("booker-country")
        ? document.getElementById("booker-country").value
        : "",
      note: document.getElementById("booker-note")
        ? document.getElementById("booker-note").value.trim()
        : "",
    };
  }

  function collectGuestsData() {
    return Array.prototype.map.call(
      guestList.querySelectorAll(".guest-card"),
      function (card) {
        var textInputs = card.querySelectorAll('input[type="text"]');
        var genderSelect = card.querySelector("select");

        return {
          name: textInputs[0] ? textInputs[0].value.trim() : "",
          birthday: textInputs[1] ? textInputs[1].value.trim() : "",
          gender: genderSelect ? genderSelect.value : "",
          documentId: textInputs[2] ? textInputs[2].value.trim() : "",
        };
      },
    );
  }

  function persistBookingData() {
    var storedData = getStoredData();

    storedData.customer = collectBookerData();
    storedData.guests = collectGuestsData();
    setStoredData(storedData);
  }
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function isValidVietnamPhone(phone) {
    return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone);
  }

  function isValidFullName(name) {
    if (!name) return false;

    const normalized = name.trim().replace(/\s+/g, " ");

    if (normalized.length < 2) return false;

    // Không cho toàn số / ký tự lạ
    if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(normalized)) return false;

    return true;
  }

  function isValidDocumentId(value) {
    if (!value) return false;

    const normalized = value.trim();

    // chấp nhận chữ + số + độ dài từ 6 đến 20
    return /^[A-Za-z0-9]{6,20}$/.test(normalized);
  }

  function parseDateDDMMYYYY(dateStr) {
    if (!dateStr) return null;

    const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateStr.trim());
    if (!match) return null;

    const day = Number(match[1]);
    const month = Number(match[2]);
    const year = Number(match[3]);

    const date = new Date(year, month - 1, day);

    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      return null;
    }

    return date;
  }

  function isFutureDate(date) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const compareDate = new Date(date);
    compareDate.setHours(0, 0, 0, 0);

    return compareDate > today;
  }

  function focusAndToast(element, message) {
    if (element && typeof element.focus === "function") {
      element.focus();
    }
    showToast(message);
  }
  function validateForm() {
    // =========================
    // 1. THÔNG TIN NGƯỜI ĐẶT TOUR
    // =========================
    var bookerName = document.getElementById("booker-name");
    var bookerEmail = document.getElementById("booker-email");
    var bookerPhone = document.getElementById("booker-phone");
    var bookerCountry = document.getElementById("booker-country");

    var nameValue = bookerName ? bookerName.value.trim() : "";
    var emailValue = bookerEmail ? bookerEmail.value.trim() : "";
    var phoneValue = bookerPhone ? bookerPhone.value.trim() : "";
    var countryValue = bookerCountry ? bookerCountry.value.trim() : "";

    if (!nameValue) {
      focusAndToast(bookerName, "Vui lòng nhập họ và tên người đặt tour.");
      return false;
    }

    if (!isValidFullName(nameValue)) {
      focusAndToast(
        bookerName,
        "Họ và tên không hợp lệ. Chỉ được chứa chữ cái và khoảng trắng.",
      );
      return false;
    }

    if (!emailValue) {
      focusAndToast(bookerEmail, "Vui lòng nhập email.");
      return false;
    }

    if (!isValidEmail(emailValue)) {
      focusAndToast(bookerEmail, "Email không đúng định dạng.");
      return false;
    }

    if (!phoneValue) {
      focusAndToast(bookerPhone, "Vui lòng nhập số điện thoại.");
      return false;
    }

    if (!isValidVietnamPhone(phoneValue)) {
      focusAndToast(
        bookerPhone,
        "Số điện thoại không hợp lệ. Vui lòng nhập đúng số điện thoại Việt Nam.",
      );
      return false;
    }

    if (!countryValue) {
      focusAndToast(bookerCountry, "Vui lòng chọn quốc tịch.");
      return false;
    }

    // =========================
    // 2. THÔNG TIN KHÁCH THAM GIA
    // =========================
    var guestCards = guestList ? guestList.querySelectorAll(".guest-card") : [];

    for (var i = 0; i < guestCards.length; i += 1) {
      var card = guestCards[i];
      var guestIndex = i + 1;

      var textInputs = card.querySelectorAll('input[type="text"]');
      var genderSelect = card.querySelector("select");

      var guestNameInput = textInputs[0];
      var guestBirthdayInput = textInputs[1];
      var guestDocumentInput = textInputs[2];

      var guestName = guestNameInput ? guestNameInput.value.trim() : "";
      var guestBirthday = guestBirthdayInput
        ? guestBirthdayInput.value.trim()
        : "";
      var guestGender = genderSelect ? genderSelect.value.trim() : "";
      var guestDocument = guestDocumentInput
        ? guestDocumentInput.value.trim()
        : "";

      if (!guestName) {
        focusAndToast(
          guestNameInput,
          `Vui lòng nhập họ và tên cho khách #${guestIndex}.`,
        );
        return false;
      }

      if (!isValidFullName(guestName)) {
        focusAndToast(
          guestNameInput,
          `Họ và tên của khách #${guestIndex} không hợp lệ.`,
        );
        return false;
      }

      if (!guestBirthday) {
        focusAndToast(
          guestBirthdayInput,
          `Vui lòng nhập ngày sinh cho khách #${guestIndex}.`,
        );
        return false;
      }

      var parsedBirthday = parseDateDDMMYYYY(guestBirthday);

      if (!parsedBirthday) {
        focusAndToast(
          guestBirthdayInput,
          `Ngày sinh của khách #${guestIndex} không đúng định dạng dd/mm/yyyy.`,
        );
        return false;
      }

      if (isFutureDate(parsedBirthday)) {
        focusAndToast(
          guestBirthdayInput,
          `Ngày sinh của khách #${guestIndex} không được ở tương lai.`,
        );
        return false;
      }

      if (!guestGender) {
        focusAndToast(
          genderSelect,
          `Vui lòng chọn giới tính cho khách #${guestIndex}.`,
        );
        return false;
      }

      if (!guestDocument) {
        focusAndToast(
          guestDocumentInput,
          `Vui lòng nhập số hộ chiếu / CMND cho khách #${guestIndex}.`,
        );
        return false;
      }

      if (!isValidDocumentId(guestDocument)) {
        focusAndToast(
          guestDocumentInput,
          `Số hộ chiếu / CMND của khách #${guestIndex} không hợp lệ.`,
        );
        return false;
      }
    }

    return true;
  }
  function hydrateFromStorage() {
    var storedData = getStoredData();
    var customer = storedData.customer || {};
    var guests = storedData.guests || [];
    var firstGuestCard = guestList.querySelector(".guest-card");

    if (document.getElementById("booker-name")) {
      document.getElementById("booker-name").value = customer.name || "";
    }
    if (document.getElementById("booker-email")) {
      document.getElementById("booker-email").value = customer.email || "";
    }
    if (document.getElementById("booker-phone")) {
      document.getElementById("booker-phone").value = customer.phone || "";
    }
    if (document.getElementById("booker-country")) {
      document.getElementById("booker-country").value = customer.country || "";
    }
    if (document.getElementById("booker-note")) {
      document.getElementById("booker-note").value = customer.note || "";
    }

    if (guests.length > 0 && firstGuestCard) {
      fillGuestCard(firstGuestCard, guests[0]);

      for (var i = 1; i < guests.length; i += 1) {
        addGuestCard(guests[i]);
      }
    }

    updateGuestIndexes();
  }

  function getBookingParamsFromURL() {
    const params = new URLSearchParams(window.location.search);

    return {
      tourId: params.get("tour_id"),
      departureDate: params.get("departure_date"),
      adults: Number(params.get("adults") || 0),
      children: Number(params.get("children") || 0),
    };
  }

  function getRequiredGuestCount() {
    var storedData = getStoredData();
    var bookingMeta = storedData.bookingMeta || {};
    return Number(bookingMeta.totalGuests || 0);
  }

  function validateGuestCountMatchBooking() {
    var requiredGuests = getRequiredGuestCount();
    var actualGuests = guestList
      ? guestList.querySelectorAll(".guest-card").length
      : 0;

    if (requiredGuests <= 0) {
      showToast("Không xác định được số lượng khách từ bước trước.");
      return false;
    }

    if (actualGuests !== requiredGuests) {
      showToast(
        `Bạn đã chọn ${requiredGuests} khách, vui lòng nhập đủ thông tin cho ${requiredGuests} khách.`,
      );
      return false;
    }

    return true;
  }

  function updateAddGuestButtonState() {
    if (!addGuestButton || !guestList) return;

    var requiredGuests = getRequiredGuestCount();
    var currentGuests = guestList.querySelectorAll(".guest-card").length;

    if (requiredGuests <= 0) {
      addGuestButton.style.opacity = "0.6";
      addGuestButton.title = "Không xác định được số lượng khách.";
      return;
    }

    if (currentGuests >= requiredGuests) {
      addGuestButton.style.opacity = "0.6";
      addGuestButton.title = `Đã đủ ${requiredGuests} khách`;
    } else {
      addGuestButton.style.opacity = "1";
      addGuestButton.title = "Thêm khách";
    }
  }
  if (addGuestButton) {
    addGuestButton.addEventListener("click", function () {
      var requiredGuests = getRequiredGuestCount();
      var currentGuests = guestList
        ? guestList.querySelectorAll(".guest-card").length
        : 0;

      if (requiredGuests <= 0) {
        showToast("Không xác định được số lượng khách.");
        return;
      }

      if (currentGuests >= requiredGuests) {
        showToast(`Bạn đã thêm đủ ${requiredGuests} khách.`);
        return;
      }

      addGuestCard();
      persistBookingData();
      updateGuestIndexes();
      updateAddGuestButtonState();

      var updatedGuests = guestList.querySelectorAll(".guest-card").length;
      if (updatedGuests >= requiredGuests) {
        showToast(`Đã thêm đủ ${requiredGuests} khách.`);
        return;
      }

      showToast("Đã thêm khách tham gia mới.");
    });
  }

  if (guestList) {
    guestList.addEventListener("click", function (event) {
      if (event.target.classList.contains("guest-card__remove")) {
        removeGuestCard(event.target);
      }
    });
  }
  var bookerPhoneInput = document.getElementById("booker-phone");

  if (bookerPhoneInput) {
    bookerPhoneInput.addEventListener("input", function () {
      this.value = this.value.replace(/[^\d+]/g, "");

      // nếu bắt đầu không phải 0 hoặc + thì vẫn cho nhập, nhưng chỉ giữ ký tự hợp lệ
      if (this.value.startsWith("+84")) {
        this.value = "+84" + this.value.slice(3).replace(/\D/g, "");
      } else {
        this.value = this.value.replace(/\D/g, "");
      }
    });
  }
  if (bookingForm) {
    bookingForm.addEventListener("input", persistBookingData);
    bookingForm.addEventListener("change", persistBookingData);
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateGuestCountMatchBooking()) {
        return;
      }

      if (!validateForm()) {
        return;
      }

      persistBookingData();
      window.location.href = "./tuychon.html";
    });
  }

  if (backTourButton) {
    backTourButton.addEventListener("click", function () {
      persistBookingData();

      var params = getBookingParamsFromURL();
      if (params.tourId) {
        window.location.href = `./chitiet.html?id=${params.tourId}`;
        return;
      }

      window.location.href = "./dstour.html";
    });
  }
  async function renderBookingSummaryFromURL() {
    const data = getBookingParamsFromURL();
    const storedData = getStoredData();
    const bookingMeta = storedData.bookingMeta || {};

    const hasUrlParams =
      data.tourId && Number(data.adults || 0) + Number(data.children || 0) > 0;

    try {
      let summary = null;
      let tour = null;

      if (hasUrlParams) {
        [tour, summary] = await Promise.all([
          fetchTourDetailById(data.tourId),
          fetchBookingSummary(data),
        ]);

        persistTourBookingMeta({
          tourId: summary.tour_id,
          departureDate: summary.departure_date,
          adults: summary.adults,
          children: summary.children,
          totalGuests: summary.total_guests,
          pricePerPerson: summary.price_per_person,
          serviceFee: 0,
          grandTotal: summary.tour_total,
          grandTotal: summary.grand_total,
          tourTitle: summary.tour_title || "",
          location: summary.location || "",
          thumbnailUrl: summary.thumbnail_url || "",
        });
      } else if (bookingMeta.tourId) {
        summary = {
          tour_id: bookingMeta.tourId,
          departure_date: bookingMeta.departureDate,
          adults: bookingMeta.adults || 0,
          children: bookingMeta.children || 0,
          total_guests: bookingMeta.totalGuests || 0,
          price_per_person: bookingMeta.pricePerPerson || 0,
          tour_total: bookingMeta.totalPrice || 0,
          service_fee: bookingMeta.serviceFee || 0,
          grand_total: bookingMeta.grandTotal || 0,
          tour_title: bookingMeta.tourTitle || "",
          location: bookingMeta.location || "",
          thumbnail_url: bookingMeta.thumbnailUrl || "",
        };

        tour = {
          title: bookingMeta.tourTitle || "",
          location: bookingMeta.location || "",
        };
      } else {
        showToast("Không tìm thấy dữ liệu đặt tour.");
        return;
      }

      const titleEl = document.getElementById("tour-title");
      const locationEl = document.getElementById("tour-location");
      const departureDateEl = document.getElementById("tour-departure-date");
      const totalGuestsEl = document.getElementById("tour-total-guests");
      const pricePerPersonEl = document.getElementById("tour-price-per-person");
      const totalPriceEl = document.getElementById("tour-total-price");

      const summaryGuestLineEl = document.getElementById("summary-guest-line");
      const summaryTourPriceEl = document.getElementById("summary-tour-price");
      const summaryServiceFeeEl = document.getElementById(
        "summary-service-fee",
      );
      const summaryGrandTotalEl = document.getElementById(
        "summary-grand-total",
      );

      const tourImageEl = document.querySelector(".tour-card__media img");

      if (titleEl) {
        titleEl.textContent =
          summary.tour_title || tour.title || "Chưa có tên tour";
      }

      if (locationEl) {
        locationEl.textContent =
          summary.location || tour.location || "Chưa cập nhật";
      }

      if (departureDateEl) {
        departureDateEl.textContent = summary.departure_date
          ? formatDate(summary.departure_date)
          : "Chưa có ngày";
      }

      if (totalGuestsEl) {
        totalGuestsEl.textContent = `${summary.total_guests} khách`;
      }

      if (pricePerPersonEl) {
        pricePerPersonEl.textContent = formatCurrency(summary.price_per_person);
      }

      if (totalPriceEl) {
        totalPriceEl.textContent = formatCurrency(summary.tour_total);
      }

      if (summaryGuestLineEl) {
        summaryGuestLineEl.innerHTML = `Giá tour ×<br />${summary.total_guests} khách`;
      }

      if (summaryTourPriceEl) {
        summaryTourPriceEl.textContent = formatCurrency(summary.tour_total);
      }

      if (summaryServiceFeeEl) {
        summaryServiceFeeEl.closest(".summary-card__row").style.display =
          "none";
      }

      if (summaryGrandTotalEl) {
        summaryGrandTotalEl.textContent = formatCurrency(summary.grand_total);
      }

      if (tourImageEl) {
        tourImageEl.src =
          summary.thumbnail_url ||
          "../../assets/images/tours/chitiet/hero-vinh-ha-long.png";
        tourImageEl.alt = summary.tour_title || "Ảnh tour";

        tourImageEl.onerror = function () {
          this.onerror = null;
          this.src = "../../assets/images/tours/chitiet/hero-vinh-ha-long.png";
        };
      }
    } catch (error) {
      console.error(error);
      showToast(error.message || "Không tải được thông tin tour.");
    }
  }
  (async function initPage() {
    await renderBookingSummaryFromURL();
    hydrateFromStorage();
    updateGuestIndexes();
    updateAddGuestButtonState();
  })();
})();
