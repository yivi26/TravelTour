document.addEventListener("DOMContentLoaded", function () {
  const saveBtn = document.getElementById("saveBtn");
  const cancelBtn = document.getElementById("cancelBtn");
  const changeLogoBtn = document.getElementById("changeLogoBtn");
  const formControls = document.querySelectorAll(".form-control");

  const initialValues = Array.from(formControls).map((input) => input.value);

  if (saveBtn) {
    saveBtn.addEventListener("click", function () {
      alert("Đã lưu thông tin nhà cung cấp.");
    });
  }

  if (cancelBtn) {
    cancelBtn.addEventListener("click", function () {
      formControls.forEach((input, index) => {
        input.value = initialValues[index];
      });
      alert("Đã khôi phục dữ liệu ban đầu.");
    });
  }

  if (changeLogoBtn) {
    changeLogoBtn.addEventListener("click", function () {
      alert("Chức năng thay đổi logo sẽ làm sau.");
    });
  }
});
