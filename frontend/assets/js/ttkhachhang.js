(function () {
  var STORAGE_KEY = "traveltour-booking";
  var bookingForm = document.getElementById("booking-form");
  var guestList = document.getElementById("guest-list");
  var guestTemplate = document.getElementById("guest-card-template");
  var addGuestButton = document.querySelector(".js-add-guest");
  var backTourButton = document.querySelector(".js-back-tour");
  var nextStepButton = document.querySelector(".js-next-step");
  var toastTimer = null;

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
        heading.textContent = "Kh\u00e1ch #" + cardIndex;
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
    showToast("\u0110\u00e3 x\u00f3a kh\u00e1ch tham gia.");
  }

  function collectBookerData() {
    return {
      name: document.getElementById("booker-name") ? document.getElementById("booker-name").value.trim() : "",
      email: document.getElementById("booker-email") ? document.getElementById("booker-email").value.trim() : "",
      phone: document.getElementById("booker-phone") ? document.getElementById("booker-phone").value.trim() : "",
      country: document.getElementById("booker-country") ? document.getElementById("booker-country").value : "",
      note: document.getElementById("booker-note") ? document.getElementById("booker-note").value.trim() : ""
    };
  }

  function collectGuestsData() {
    return Array.prototype.map.call(guestList.querySelectorAll(".guest-card"), function (card) {
      var textInputs = card.querySelectorAll('input[type="text"]');
      var genderSelect = card.querySelector("select");

      return {
        name: textInputs[0] ? textInputs[0].value.trim() : "",
        birthday: textInputs[1] ? textInputs[1].value.trim() : "",
        gender: genderSelect ? genderSelect.value : "",
        documentId: textInputs[2] ? textInputs[2].value.trim() : ""
      };
    });
  }

  function persistBookingData() {
    var storedData = getStoredData();

    storedData.customer = collectBookerData();
    storedData.guests = collectGuestsData();
    setStoredData(storedData);
  }

  function validateForm() {
    var fields = document.querySelectorAll("#booking-form [required], .guest-card [required]");

    for (var i = 0; i < fields.length; i += 1) {
      if (!fields[i].value.trim()) {
        fields[i].focus();
        showToast("Vui l\u00f2ng \u0111i\u1ec1n \u0111\u1ea7y \u0111\u1ee7 th\u00f4ng tin b\u1eaft bu\u1ed9c.");
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

  if (addGuestButton) {
    addGuestButton.addEventListener("click", function () {
      addGuestCard();
      persistBookingData();
      showToast("\u0110\u00e3 th\u00eam kh\u00e1ch tham gia m\u1edbi.");
    });
  }

  if (guestList) {
    guestList.addEventListener("click", function (event) {
      if (event.target.classList.contains("guest-card__remove")) {
        removeGuestCard(event.target);
      }
    });
  }

  if (bookingForm) {
    bookingForm.addEventListener("input", persistBookingData);
    bookingForm.addEventListener("change", persistBookingData);
    bookingForm.addEventListener("submit", function (event) {
      event.preventDefault();

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
      window.location.href = "./chitiet.html";
    });
  }

  if (nextStepButton) {
    nextStepButton.addEventListener("click", function (event) {
      if (!validateForm()) {
        event.preventDefault();
        return;
      }

      persistBookingData();
      window.location.href = "./tuychon.html";
    });
  }

  hydrateFromStorage();
  updateGuestIndexes();
})();
