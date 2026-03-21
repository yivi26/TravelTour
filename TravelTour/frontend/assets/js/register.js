// register.js
const registerForm = document.getElementById("registerForm");
const formMessage = document.getElementById("formMessage");
const toggleButtons = document.querySelectorAll(".toggle-password");

// Hiển thị thông báo
function showMessage(message, type) {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.className = "form-message " + type; // type: 'error' hoặc 'success'
}

// Toggle hiện/ẩn mật khẩu
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

// Xử lý submit form
if (registerForm) {
  registerForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const fullName = document.getElementById("fullname").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const password = document.getElementById("password").value.trim();
    const confirmPassword = document.getElementById("confirm-password").value.trim();
    const terms = document.getElementById("terms").checked;

    // Validate cơ bản
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

    // Gửi dữ liệu lên backend
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, phone, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message || "Đăng ký thất bại.", "error");
        return;
      }

      showMessage("Đăng ký thành công!", "success");
      registerForm.reset();

      // Redirect về login sau 1.2 giây
      setTimeout(() => {
        window.location.href = "./login.html";
      }, 1200);
    } catch (error) {
      console.error("Register error:", error);
      showMessage("Có lỗi khi kết nối server.", "error");
    }
  });
}