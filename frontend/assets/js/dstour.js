// Heart toggle
document.querySelectorAll(".heart-btn").forEach((button) => {
  button.addEventListener("click", () => {
    const isActive = button.classList.toggle("is-active");
    button.setAttribute("aria-pressed", String(isActive));
  });
});

// Prevent demo search submit
const searchForm = document.querySelector(".search-card");
if (searchForm) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
  });
}

// Price slider fill state
const priceSlider = document.querySelector(".price-range__slider");

function updateSliderFill(slider) {
  const min = Number(slider.min);
  const max = Number(slider.max);
  const value = Number(slider.value);
  const percent = ((value - min) / (max - min)) * 100;

  slider.style.background =
    "linear-gradient(to right, var(--primary) 0%, var(--primary) " +
    percent +
    "%, #e5e5e5 " +
    percent +
    "%, #e5e5e5 100%)";
}

if (priceSlider) {
  updateSliderFill(priceSlider);
  priceSlider.addEventListener("input", () => updateSliderFill(priceSlider));
}

// Reset filters
const resetButton = document.querySelector(".filters-reset");
if (resetButton) {
  resetButton.addEventListener("click", () => {
    document.querySelectorAll('.filters-card input[type="checkbox"]').forEach((input) => {
      input.checked = false;
    });

    if (priceSlider) {
      priceSlider.value = "25000000";
      updateSliderFill(priceSlider);
    }

    const destination = document.querySelector('input[name="destination"]');
    const departureDate = document.querySelector('input[name="departure-date"]');
    const sortSelect = document.getElementById("tour-sort");

    if (destination) {
      destination.value = "";
    }

    if (departureDate) {
      departureDate.value = "mm/dd/yyyy";
    }

    if (sortSelect) {
      sortSelect.selectedIndex = 0;
    }
  });
}

// Pagination state
const pageButtons = [...document.querySelectorAll(".page-btn[data-page]")];
const prevButton = document.querySelector('.page-btn--icon[aria-label="Trang trước"]');
const nextButton = document.querySelector('.page-btn--icon[aria-label="Trang sau"]');

function setActivePage(page) {
  pageButtons.forEach((button) => {
    const isActive = button.dataset.page === String(page);
    button.classList.toggle("is-active", isActive);

    if (isActive) {
      button.setAttribute("aria-current", "page");
    } else {
      button.removeAttribute("aria-current");
    }
  });
}

pageButtons.forEach((button) => {
  button.addEventListener("click", () => {
    setActivePage(button.dataset.page);
  });
});

function movePage(direction) {
  const currentIndex = pageButtons.findIndex((button) => button.classList.contains("is-active"));
  if (currentIndex === -1) {
    return;
  }

  const nextIndex = Math.min(Math.max(currentIndex + direction, 0), pageButtons.length - 1);
  setActivePage(pageButtons[nextIndex].dataset.page);
}

if (prevButton) {
  prevButton.addEventListener("click", () => movePage(-1));
}

if (nextButton) {
  nextButton.addEventListener("click", () => movePage(1));
}
