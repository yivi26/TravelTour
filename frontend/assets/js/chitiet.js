(function () {
  var TOUR_PRICE = 5890000;
  var bookingForm = document.getElementById("booking-form");
  var dateInput = document.getElementById("departure-date");
  var adultSelect = document.getElementById("adult-count");
  var childSelect = document.getElementById("child-count");
  var lineLabel = document.getElementById("booking-line-label");
  var lineTotal = document.getElementById("booking-line-total");
  var grandTotal = document.getElementById("booking-grand-total");
  var favoriteButton = document.querySelector(".js-favorite-button");
  var shareButton = document.querySelector(".js-share-button");
  var galleryButton = document.querySelector(".js-gallery-button");
  var mapButton = document.querySelector(".js-map-button");
  var directionsButton = document.querySelector(".js-directions-button");
  var saveLocationButton = document.querySelector(".js-save-location-button");
  var contactButton = document.querySelector(".js-contact-button");
  var faqButtons = document.querySelectorAll(".faq-item__question");
  var toastTimer = null;

  function formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN").format(value) + "\u20ab";
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

  function fallbackCopyText(text) {
    var textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.setAttribute("readonly", "");
    textArea.style.position = "absolute";
    textArea.style.left = "-9999px";
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }

  async function copyText(text) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        fallbackCopyText(text);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  function updateBookingSummary() {
    if (!adultSelect || !childSelect || !lineLabel || !lineTotal || !grandTotal) {
      return;
    }

    var adults = Number(adultSelect.value) || 0;
    var children = Number(childSelect.value) || 0;
    var totalGuests = Math.max(adults + children, 1);
    var totalPrice = TOUR_PRICE * totalGuests;

    lineLabel.textContent = formatCurrency(TOUR_PRICE) + " x " + totalGuests + " khach";
    lineTotal.textContent = formatCurrency(totalPrice);
    grandTotal.textContent = formatCurrency(totalPrice);
  }

  function toggleFaq(button) {
    var item = button.closest(".faq-item");

    if (!item) {
      return;
    }

    var isOpen = item.classList.contains("is-open");

    faqButtons.forEach(function (currentButton) {
      var currentItem = currentButton.closest(".faq-item");

      if (!currentItem) {
        return;
      }

      currentItem.classList.remove("is-open");
      currentButton.setAttribute("aria-expanded", "false");
    });

    if (!isOpen) {
      item.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
    }
  }

  if (favoriteButton) {
    favoriteButton.addEventListener("click", function () {
      var isPressed = favoriteButton.getAttribute("aria-pressed") === "true";
      favoriteButton.setAttribute("aria-pressed", String(!isPressed));
      favoriteButton.classList.toggle("is-active", !isPressed);
      showToast(!isPressed ? "Da them vao danh sach yeu thich." : "Da bo khoi danh sach yeu thich.");
    });
  }

  if (shareButton) {
    shareButton.addEventListener("click", async function () {
      var title = document.title || "TravelTour";
      var url = window.location.href;

      try {
        if (navigator.share) {
          await navigator.share({
            title: title,
            url: url
          });
          showToast("Da mo hop thoai chia se.");
          return;
        }
      } catch (error) {
        if (error && error.name === "AbortError") {
          return;
        }
      }

      var copied = await copyText(url);
      showToast(copied ? "Da sao chep lien ket tour." : "Khong the sao chep lien ket.");
    });
  }

  if (galleryButton) {
    galleryButton.addEventListener("click", function () {
      var mainImage = document.querySelector(".hero-gallery__item--main img");

      if (mainImage && mainImage.src) {
        window.open(mainImage.src, "_blank", "noopener");
      } else {
        showToast("Khong tim thay anh de hien thi.");
      }
    });
  }

  if (mapButton) {
    mapButton.addEventListener("click", function () {
      var mapImage = "../../assets/images/tours/chitiet/map-vinh-ha-long.png";
      window.open(mapImage, "_blank", "noopener");
    });
  }

  if (directionsButton) {
    directionsButton.addEventListener("click", function () {
      window.open("https://www.google.com/maps/search/?api=1&query=Vinh+Ha+Long%2C+Quang+Ninh", "_blank", "noopener");
    });
  }

  if (saveLocationButton) {
    saveLocationButton.addEventListener("click", async function () {
      var copied = await copyText("Vinh Ha Long, Quang Ninh, Viet Nam");
      showToast(copied ? "Da luu thong tin dia diem." : "Khong the luu dia diem.");
    });
  }

  if (contactButton) {
    contactButton.addEventListener("click", function () {
      var footer = document.getElementById("site-footer");

      if (footer) {
        footer.scrollIntoView({
          behavior: "smooth",
          block: "start"
        });
      }
    });
  }

  faqButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      toggleFaq(button);
    });
  });

  if (dateInput) {
    var today = new Date();
    var localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
    dateInput.min = localDate;
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
      updateBookingSummary();
      showToast("Da ghi nhan yeu cau dat cho. Nhan vien se lien he xac nhan.");
    });
  }

  updateBookingSummary();
})();
