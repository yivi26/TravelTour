(function () {
  var STORAGE_KEY = "traveltour-booking";
  var BASE_PRICE = 8500000;
  var SERVICE_FEE = 500000;
  var optionForm = document.getElementById("option-form");
  var payTotal = document.getElementById("pay-total");
  var goBackButton = document.querySelector(".js-go-back");
  var goNextButton = document.querySelector(".js-go-next");
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

  function formatCurrency(value) {
    return new Intl.NumberFormat("vi-VN").format(value) + " \u20ab";
  }

  function formatCurrencyMultiline(value) {
    var parts = new Intl.NumberFormat("vi-VN").format(value).split(".");

    if (parts.length >= 2) {
      return parts.slice(0, parts.length - 1).join(".") + ".<br>" + parts[parts.length - 1] + " \u20ab";
    }

    return formatCurrency(value);
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

  function refreshSelectedState() {
    document.querySelectorAll(".option-card").forEach(function (card) {
      var input = card.querySelector("input");
      card.classList.toggle("is-selected", Boolean(input && input.checked));
    });
  }

  function collectOptions() {
    var options = {};
    var extraPrice = 0;

    document.querySelectorAll('.option-card input[type="radio"]:checked').forEach(function (input) {
      var price = Number(input.dataset.price || 0);
      options[input.name] = {
        value: input.value,
        price: price
      };
      extraPrice += price;
    });

    return {
      selections: options,
      extraPrice: extraPrice
    };
  }

  function persistOptions() {
    var storedData = getStoredData();
    storedData.options = collectOptions();
    setStoredData(storedData);
  }

  function updateTotal() {
    var optionData = collectOptions();

    if (payTotal) {
      payTotal.innerHTML = formatCurrencyMultiline(BASE_PRICE + SERVICE_FEE + optionData.extraPrice);
    }
  }

  function validateSelections() {
    var groups = ["room", "pickup", "meal"];

    for (var i = 0; i < groups.length; i += 1) {
      if (!optionForm.querySelector('input[name="' + groups[i] + '"]:checked')) {
        showToast("Vui l\u00f2ng ch\u1ecdn \u0111\u1ea7y \u0111\u1ee7 c\u00e1c t\u00f9y ch\u1ecdn c\u1ee7a tour.");
        return false;
      }
    }

    return true;
  }

  function hydrateOptions() {
    var storedData = getStoredData();
    var selections = storedData.options && storedData.options.selections ? storedData.options.selections : {};

    Object.keys(selections).forEach(function (groupName) {
      var selectedInput = optionForm.querySelector('input[name="' + groupName + '"][value="' + selections[groupName].value + '"]');

      if (selectedInput) {
        selectedInput.checked = true;
      }
    });
  }

  if (optionForm) {
    optionForm.addEventListener("change", function () {
      refreshSelectedState();
      updateTotal();
      persistOptions();
    });

    optionForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validateSelections()) {
        return;
      }

      persistOptions();
      window.location.href = "./thanhtoan.html";
    });
  }

  if (goBackButton) {
    goBackButton.addEventListener("click", function () {
      persistOptions();
      window.location.href = "./ttkhachhang.html";
    });
  }

  if (goNextButton) {
    goNextButton.addEventListener("click", function (event) {
      if (!validateSelections()) {
        event.preventDefault();
        return;
      }

      persistOptions();
      window.location.href = "./thanhtoan.html";
    });
  }

  hydrateOptions();
  refreshSelectedState();
  updateTotal();
})();
