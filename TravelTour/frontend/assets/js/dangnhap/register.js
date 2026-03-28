const registerForm = document.getElementById("registerForm");
const formMessage = document.getElementById("formMessage");
const toggleButtons = document.querySelectorAll(".toggle-password");

function showMessage(message, type) {
  formMessage.textContent = message;
  formMessage.className = "form-message " + type;
}

toggleButtons.forEach((button) => {
  button.addEventListener("click", function () {
    const targetId = this.getAttribute("data-target");
    const input = document.getElementById(targetId);

    if (!input) return;

    if (input.type === "password") {
      input.type = "text";
      this.textContent = "🙈";
      this.setAttribute("aria-label", "Ẩn mật khẩu");
    } else {
      input.type = "password";
      this.textContent = "👁️";
      this.setAttribute("aria-label", "Hiện mật khẩu");
    }
  });
});

registerForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const fullName = document.getElementById("fullname").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirmPassword = document
    .getElementById("confirm-password")
    .value.trim();
  const terms = document.getElementById("terms").checked;

  if (!fullName || !email || !phone || !password || !confirmPassword) {
    showMessage("Vui lòng nhập đầy đủ thông tin.", "error");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showMessage("Email không đúng định dạng.", "error");
    return;
  }

  const phonePattern = /^[0-9\s+]{9,15}$/;
  if (!phonePattern.test(phone)) {
    showMessage("Số điện thoại không hợp lệ.", "error");
    return;
  }

  if (password.length < 6) {
    showMessage("Mật khẩu phải có ít nhất 6 ký tự.", "error");
    return;
  }

  if (password !== confirmPassword) {
    showMessage("Mật khẩu xác nhận không khớp.", "error");
    return;
  }

  if (!terms) {
    showMessage("Bạn cần đồng ý với điều khoản dịch vụ.", "error");
    return;
  }

  const userData = {
    fullName,
    email,
    phone,
    password,
  };

  localStorage.setItem("traveltour_user", JSON.stringify(userData));

  showMessage("Đăng ký thành công!", "success");
  registerForm.reset();

  setTimeout(() => {
    window.location.href = "/login";
  }, 1200);
});
