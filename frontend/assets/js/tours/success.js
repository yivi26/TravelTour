(function () {
  function getLastBooking() {
    try {
      return (
        JSON.parse(sessionStorage.getItem("traveltour-last-booking")) || {}
      );
    } catch (error) {
      return {};
    }
  }

  var data = getLastBooking();

  var bookingCode = document.getElementById("booking-code");
  var customerName = document.getElementById("customer-name");
  var customerEmail = document.getElementById("customer-email");
  var paymentMethod = document.getElementById("payment-method");
  var officeNote = document.getElementById("office-note");

  if (bookingCode) {
    bookingCode.textContent = data.booking_code || "---";
  }

  if (customerName) {
    customerName.textContent = data.customer?.name || "---";
  }

  if (customerEmail) {
    customerEmail.textContent = data.customer?.email || "---";
  }

  if (paymentMethod) {
    paymentMethod.textContent =
      data.payment_method === "office"
        ? "Thanh toán tại văn phòng"
        : "Ví điện tử";
  }

  if (officeNote && data.payment_method === "office") {
    officeNote.style.display = "block";
  }
})();
