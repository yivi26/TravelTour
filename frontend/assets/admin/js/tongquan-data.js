window.tongQuanData = {
  stats: [
    { title: "Tổng số booking", value: "8,234", change: "+23%", icon: "booking" },
    { title: "Doanh thu hệ thống", value: "45.8 tỷ VNĐ", change: "+18%", icon: "money" },
    { title: "Tổng số tour", value: "342", change: "+23%", icon: "tour" },
    { title: "Tổng số người dùng", value: "12,458", change: "+12%", icon: "users" }
  ],
  highlights: [
    { title: "Nhà cung cấp đang hoạt động", value: "87", note: "+5 nhà cung cấp mới tháng này", tone: "green" },
    { title: "Hướng dẫn viên hoạt động", value: "234", note: "Đang phụ trách 342 tour", tone: "blue" },
    { title: "Đánh giá trung bình", value: "4.8/5.0", note: "Từ 3,245 đánh giá", tone: "purple" }
  ],
  bookings: [
    { name: "Nguyễn Văn A", tour: "Đà Lạt 3N2Đ", date: "2026-03-20", status: "Đã xác nhận", statusType: "success" },
    { name: "Trần Thị B", tour: "Phú Quốc 4N3Đ", date: "2026-03-22", status: "Chờ xử lý", statusType: "warning" },
    { name: "Lê Văn C", tour: "Hạ Long 2N1Đ", date: "2026-03-25", status: "Đã xác nhận", statusType: "success" },
    { name: "Phạm Thị D", tour: "Sapa 3N2Đ", date: "2026-03-28", status: "Đã hoàn thành", statusType: "info" },
    { name: "Hoàng Văn E", tour: "Nha Trang 5N4Đ", date: "2026-03-30", status: "Đã xác nhận", statusType: "success" }
  ],
  popularTours: [
    { rank: 1, name: "Đà Lạt 3N2Đ", bookings: 145, revenue: "2.1 tỷ" },
    { rank: 2, name: "Phú Quốc 4N3Đ", bookings: 132, revenue: "3.5 tỷ" },
    { rank: 3, name: "Hạ Long 2N1Đ", bookings: 128, revenue: "1.8 tỷ" },
    { rank: 4, name: "Sapa 3N2Đ", bookings: 98, revenue: "1.2 tỷ" },
    { rank: 5, name: "Nha Trang 5N4Đ", bookings: 87, revenue: "2.9 tỷ" }
  ],
  user: {
    name: "Admin User",
    email: "admin@traveltour.vn",
    initials: "AD"
  },
  nav: [
    { label: "Tổng quan", href: "tongquan.html", active: true },
    { label: "Quản lý người dùng", href: "quanlinguoidung.html" },
    { label: "Quản lý nhà cung cấp tour", href: "quanlinhacungcaptour.html" },
    { label: "Quản lý hướng dẫn viên", href: "hdv.html" },
    { label: "Quản lý tour", href: "#" },
    { label: "Quản lý booking", href: "#" },
    { label: "Quản lý đánh giá", href: "#" },
    { label: "Báo cáo & thống kê", href: "#" },
    { label: "Cài đặt hệ thống", href: "#" }
  ]
};
