const popularDestinations = [
  {
    id: 1,
    name: "Vịnh Hạ Long",
    location: "Quảng Ninh",
    image:
      "https://images.unsplash.com/photo-1668000018482-a02acf02b22a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.9,
    price: "Từ 2.500.000đ",
    reviews: 1240,
  },
  {
    id: 2,
    name: "Phú Quốc",
    location: "Kiên Giang",
    image:
      "https://images.unsplash.com/photo-1693282815546-f7eeb0fa909b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.8,
    price: "Từ 3.200.000đ",
    reviews: 980,
  },
  {
    id: 3,
    name: "Sapa",
    location: "Lào Cai",
    image:
      "https://images.unsplash.com/photo-1694152362587-99d77d21793b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.7,
    price: "Từ 1.800.000đ",
    reviews: 1560,
  },
  {
    id: 4,
    name: "Hội An",
    location: "Quảng Nam",
    image:
      "https://images.unsplash.com/photo-1643030080539-b411caf44c37?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.9,
    price: "Từ 2.000.000đ",
    reviews: 2140,
  },
];

const featuredTours = [
  {
    id: 1,
    name: "Du lịch Hạ Long - 3 ngày 2 đêm",
    image:
      "https://images.unsplash.com/photo-1668000018482-a02acf02b22a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.9,
    reviews: 1240,
    price: "4.500.000đ",
    duration: "3 ngày 2 đêm",
    description: "Khám phá kỳ quan thiên nhiên thế giới",
  },
  {
    id: 2,
    name: "Phú Quốc - Thiên đường biển đảo",
    image:
      "https://images.unsplash.com/photo-1693282815546-f7eeb0fa909b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.8,
    reviews: 980,
    price: "6.200.000đ",
    duration: "4 ngày 3 đêm",
    description: "Tận hưởng biển xanh cát trắng tuyệt đẹp",
  },
  {
    id: 3,
    name: "Sapa - Khám phá núi rừng Tây Bắc",
    image:
      "https://images.unsplash.com/photo-1694152362587-99d77d21793b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    rating: 4.7,
    reviews: 1560,
    price: "3.800.000đ",
    duration: "2 ngày 1 đêm",
    description: "Trải nghiệm văn hóa vùng cao độc đáo",
  },
];

const features = [
  {
    icon: "🛡️",
    title: "Uy tín",
    description: "Đảm bảo chất lượng dịch vụ tốt nhất",
  },
  {
    icon: "🧭",
    title: "Đa dạng tour",
    description: "Hàng trăm điểm đến hấp dẫn",
  },
  {
    icon: "🏆",
    title: "Hướng dẫn viên chuyên nghiệp",
    description: "Đội ngũ HDV giàu kinh nghiệm",
  },
  {
    icon: "💵",
    title: "Giá tốt",
    description: "Cam kết giá cạnh tranh nhất",
  },
];

const promotions = [
  {
    id: 1,
    title: "Giảm 20% Tour Đà Lạt",
    description: "Áp dụng cho đoàn từ 4 người trở lên",
    discount: "20%",
    image:
      "https://images.unsplash.com/photo-1663667150361-147bbd6af0cd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    validUntil: "30/04/2026",
  },
  {
    id: 2,
    title: "Ưu đãi Nha Trang",
    description: "Đặt sớm giảm ngay 15%",
    discount: "15%",
    image:
      "https://images.unsplash.com/photo-1713451398271-a9c5e85e807c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1080",
    validUntil: "15/05/2026",
  },
];

function renderDestinations() {
  const container = document.getElementById("destinations-list");
  if (!container) return;

  container.innerHTML = popularDestinations
    .map((dest) => {
      const reviewText = new Intl.NumberFormat("vi-VN").format(dest.reviews);

      return `
      <div class="destination-card">
        <img src="${dest.image}" alt="${dest.name}">
        <div class="destination-content">
          <div class="destination-top">
            <h3>${dest.name}</h3>
            <span class="rating">⭐ ${dest.rating}</span>
          </div>

          <p class="location">${dest.location}</p>

          <div class="destination-bottom">
            <div class="price-wrap">
              <span class="price-label">Từ</span>
              <span class="price">${dest.price.replace("Từ ", "")}</span>
            </div>
            <span class="reviews">${reviewText} đánh giá</span>
          </div>
        </div>
      </div>
      `;
    })
    .join("");
}

function renderTours() {
  const container = document.getElementById("featured-tours-list");
  if (!container) return;

  container.innerHTML = featuredTours
    .map(
      (tour) => `
      <div class="tour-card">
        <img src="${tour.image}" alt="${tour.name}">
        <div class="tour-content">
          <h3>${tour.name}</h3>
          <p class="muted">${tour.description}</p>
          <div class="tour-rating">
            <span>⭐ ${tour.rating}</span>
            <span class="reviews">(${tour.reviews} đánh giá)</span>
          </div>
          <div class="tour-bottom">
            <div>
              <p class="muted">Giá từ</p>
              <p class="price">${tour.price}</p>
            </div>
            <button class="btn btn-primary btn-detail">Xem chi tiết</button>
          </div>
        </div>
      </div>
    `,
    )
    .join("");
}

function renderFeatures() {
  const container = document.getElementById("features-list");
  if (!container) return;

  container.innerHTML = features
    .map(
      (feature) => `
      <div class="feature-card">
        <div class="feature-icon">${feature.icon}</div>
        <h3>${feature.title}</h3>
        <p>${feature.description}</p>
      </div>
    `,
    )
    .join("");
}

function renderPromotions() {
  const container = document.getElementById("promotions-list");
  if (!container) return;

  container.innerHTML = promotions
    .map(
      (promo) => `
      <div class="promo-card">
        <div class="promo-badge">-${promo.discount}</div>
        <img src="${promo.image}" alt="${promo.title}">
        <div class="promo-content">
          <h3>${promo.title}</h3>
          <p>${promo.description}</p>
          <p class="muted">Có hiệu lực đến: ${promo.validUntil}</p>
          <button class="btn btn-primary" style="margin-top:16px;">Đặt tour ngay</button>
        </div>
      </div>
    `,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", function () {
  renderDestinations();
  renderTours();
  renderFeatures();
  renderPromotions();

  const btnLogout = document.getElementById("btnLogout");
  if (btnLogout) {
    btnLogout.addEventListener("click", function () {
      localStorage.removeItem("traveltour_user");
      localStorage.removeItem("traveltour_remember");
      window.location.href = "/login";
    });
  }
});
