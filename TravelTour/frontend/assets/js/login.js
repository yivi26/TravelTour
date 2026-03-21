// login.js
const loginForm = document.getElementById("loginForm");
const formMessage = document.getElementById("formMessage");
const toggleButtons = document.querySelectorAll(".toggle-password");

// Hiển thị thông báo
function showMessage(message, type) {
  if (!formMessage) return;
  formMessage.textContent = message;
  formMessage.className = "form-message " + type;
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

// -------------------- Login thường --------------------
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const remember = document.getElementById("remember")?.checked || false;

    if (!email || !password) {
      showMessage("Vui lòng nhập đầy đủ email và mật khẩu.", "error");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      showMessage("Email không đúng định dạng.", "error");
      return;
    }

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (!res.ok) {
        showMessage(data.message || "Đăng nhập thất bại.", "error");
        return;
      }

      if (remember) {
        localStorage.setItem("traveltour_remember", "true");
      } else {
        localStorage.removeItem("traveltour_remember");
      }

      localStorage.setItem("traveltour_user", JSON.stringify(data.user));
      showMessage("Đăng nhập thành công!", "success");

      setTimeout(() => {
        window.location.href = "../index.html";
      }, 1200);
    } catch (error) {
      console.error("Login error:", error);
      showMessage("Có lỗi khi kết nối server.", "error");
    }
  });
}

// -------------------- Login Google --------------------
function initGoogle() {
  if (!window.google) {
    console.log("Google chưa load...");
    setTimeout(initGoogle, 500);
    return;
  }

  google.accounts.id.initialize({
    client_id: "60974853277-a0jg39ps7b4too995e58rvmehte0e16a.apps.googleusercontent.com",
    callback: handleCredentialResponse
  });

  console.log("Google init OK");
}

function setupGoogleButton() {
  const btn = document.getElementById("googleBtn");
  if (!btn) {
    console.log("Không tìm thấy nút Google");
    return;
  }

  btn.addEventListener("click", () => {
    console.log("Đã click Google");
    if (!window.google) {
      alert("Google chưa load!");
      return;
    }
    google.accounts.id.prompt();
  });
}

async function handleCredentialResponse(response) {
  try {
    const token = response.credential;
    console.log("Token:", token);

    const res = await fetch("/api/auth/google-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token })
    });

    const data = await res.json();

    if (!res.ok) {
      showMessage(data.message || "Đăng nhập Google thất bại.", "error");
      return;
    }

    localStorage.setItem("traveltour_user", JSON.stringify(data.user));
    showMessage("Đăng nhập Google thành công!", "success");

    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1200);
  } catch (error) {
    console.error("Google login error:", error);
    showMessage("Có lỗi khi đăng nhập Google.", "error");
  }
}

// -------------------- Khởi tạo --------------------
window.onload = () => {
  initGoogle();
  setupGoogleButton();
};