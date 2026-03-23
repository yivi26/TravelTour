(function () {
  var STORAGE_KEY = "traveltour-booking";
  var BASE_PRICE = 8500000;
  var SERVICE_FEE = 500000;
  var paymentForm = document.getElementById("payment-form");
  var cardForm = document.getElementById("card-form");
  var agreeTerms = document.getElementById("agree-terms");
  var confirmButton = document.querySelector(".js-confirm-booking");
  var goBackButton = document.querySelector(".js-go-back");
  var payTotal = document.getElementById("pay-total");
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

  function getSelectedMethod() {
    return document.querySelector('input[name="payment-method"]:checked');
  }

  function refreshSelectedMethod() {
    var selected = getSelectedMethod();

    document.querySelectorAll(".payment-method").forEach(function (method) {
      var input = method.querySelector("input");
      method.classList.toggle("is-selected", Boolean(selected && input === selected));
    });

    if (cardForm) {
      cardForm.style.display = selected && selected.value === "card" ? "grid" : "none";
    }
  }

  function updateTotal() {
    var storedData = getStoredData();
    var optionExtra = storedData.options ? Number(storedData.options.extraPrice || 0) : 0;
    var selected = getSelectedMethod();
    var laterFee = selected && selected.value === "later" ? Math.round(BASE_PRICE * 0.05) : 0;

    if (payTotal) {
      payTotal.innerHTML = formatCurrencyMultiline(BASE_PRICE + SERVICE_FEE + optionExtra + laterFee);
    }
  }

  function persistPayment() {
    var storedData = getStoredData();
    var selected = getSelectedMethod();

    storedData.payment = {
      method: selected ? selected.value : "card",
      agreed: Boolean(agreeTerms && agreeTerms.checked),
      card: {
        number: document.getElementById("card-number") ? document.getElementById("card-number").value.trim() : "",
        expiry: document.getElementById("card-expiry") ? document.getElementById("card-expiry").value.trim() : "",
        cvv: document.getElementById("card-cvv") ? document.getElementById("card-cvv").value.trim() : "",
        name: document.getElementById("card-name") ? document.getElementById("card-name").value.trim() : ""
      }
    };

    setStoredData(storedData);
  }

  function hydratePayment() {
    var storedData = getStoredData();
    var payment = storedData.payment || {};

    if (payment.method) {
      var methodInput = document.querySelector('input[name="payment-method"][value="' + payment.method + '"]');

      if (methodInput) {
        methodInput.checked = true;
      }
    }

    if (document.getElementById("card-number")) {
      document.getElementById("card-number").value = payment.card && payment.card.number ? payment.card.number : "";
    }
    if (document.getElementById("card-expiry")) {
      document.getElementById("card-expiry").value = payment.card && payment.card.expiry ? payment.card.expiry : "";
    }
    if (document.getElementById("card-cvv")) {
      document.getElementById("card-cvv").value = payment.card && payment.card.cvv ? payment.card.cvv : "";
    }
    if (document.getElementById("card-name")) {
      document.getElementById("card-name").value = payment.card && payment.card.name ? payment.card.name : "";
    }

    if (agreeTerms) {
      agreeTerms.checked = Boolean(payment.agreed);
    }
  }

  function updateConfirmState() {
    var enabled = Boolean(agreeTerms && agreeTerms.checked);

    if (!confirmButton) {
      return;
    }

    confirmButton.disabled = !enabled;
    confirmButton.classList.toggle("action-button--disabled", !enabled);
  }

  function validatePayment() {
    var selected = getSelectedMethod();

    if (!selected) {
      showToast("Vui l\u00f2ng ch\u1ecdn ph\u01b0\u01a1ng th\u1ee9c thanh to\u00e1n.");
      return false;
    }

    if (!agreeTerms || !agreeTerms.checked) {
      showToast("Vui l\u00f2ng \u0111\u1ed3ng \u00fd v\u1edbi \u0111i\u1ec1u kho\u1ea3n v\u00e0 \u0111i\u1ec1u ki\u1ec7n.");
      return false;
    }

    if (selected.value === "card") {
      var fieldIds = ["card-number", "card-expiry", "card-cvv", "card-name"];

      for (var i = 0; i < fieldIds.length; i += 1) {
        var field = document.getElementById(fieldIds[i]);

        if (field && !field.value.trim()) {
          field.focus();
          showToast("Vui l\u00f2ng nh\u1eadp \u0111\u1ea7y \u0111\u1ee7 th\u00f4ng tin th\u1ebb.");
          return false;
        }
      }
    }

    return true;
  }

  if (paymentForm) {
    paymentForm.addEventListener("change", function () {
      refreshSelectedMethod();
      updateTotal();
      persistPayment();
    });

    paymentForm.addEventListener("input", persistPayment);
    paymentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      if (!validatePayment()) {
        return;
      }

      persistPayment();
      showToast("\u0110\u1eb7t tour th\u00e0nh c\u00f4ng. Ch\u00fang t\u00f4i s\u1ebd g\u1eedi x\u00e1c nh\u1eadn qua email.");
    });
  }

  if (agreeTerms) {
    agreeTerms.addEventListener("change", function () {
      updateConfirmState();
      persistPayment();
    });
  }

  if (goBackButton) {
    goBackButton.addEventListener("click", function () {
      persistPayment();
      window.location.href = "./tuychon.html";
    });
  }

  if (confirmButton) {
    confirmButton.addEventListener("click", function (event) {
      if (!validatePayment()) {
        event.preventDefault();
      }
    });
  }

  hydratePayment();
  refreshSelectedMethod();
  updateTotal();
  updateConfirmState();
})();
