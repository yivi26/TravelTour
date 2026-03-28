// booking_management.js

async function loadBookings() {
  const res = await fetch("/api/provider/bookings");
  const data = await res.json();

  console.log("DATA:", data); // 👈 DEBUG

  // 👇 tránh crash
  if (!Array.isArray(data)) {
    console.error("API lỗi:", data);
    return;
  }

  const tbody = document.getElementById("bookingTableBody");
  tbody.innerHTML = "";

  data.forEach(b => {
    tbody.innerHTML += `
      <tr>
        <td>${b.booking_code}</td>
        <td>${b.customer_name}</td>
        <td>${b.tour_title}</td>
        <td>${b.departure_date}</td>
        <td>${b.total_pax}</td>
        <td>${b.final_price}</td>
        <td>${b.booking_status}</td>
        <td>
          <button onclick="confirmBooking(${b.booking_id})">✔</button>
        </td>
      </tr>
    `;
  });
}

loadBookings();