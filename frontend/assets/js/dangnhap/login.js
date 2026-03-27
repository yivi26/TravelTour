const loginForm = document.getElementById("loginForm");
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

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();
  const remember = document.getElementById("remember").checked;

  if (!email || !password) {
    showMessage("Vui lòng nhập đầy đủ email và mật khẩu.", "error");
    return;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showMessage("Email không đúng định dạng.", "error");
    return;
  }

  const savedUser = JSON.parse(localStorage.getItem("traveltour_user"));

  if (!savedUser) {
    showMessage("Chưa có tài khoản nào được đăng ký.", "error");
    return;
  }

  if (email !== savedUser.email || password !== savedUser.password) {
    showMessage("Email hoặc mật khẩu không đúng.", "error");
    return;
  }

  if (remember) {
    localStorage.setItem("traveltour_remember", "true");
  } else {
    localStorage.removeItem("traveltour_remember");
  }

  showMessage("Đăng nhập thành công!", "success");

  setTimeout(() => {
    window.location.href = "../index.html";
  }, 1200);
});
