function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("traveltour_user") || "null");
  } catch {
    return null;
  }
}

function providerFetch(url, options = {}) {
  const user = getCurrentUser();
  const userId = user?.id;
  const headers = new Headers(options.headers || {});
  if (userId) headers.set("x-user-id", String(userId));
  // Tránh cache theo URL làm “dính” dữ liệu provider cũ khi đổi tài khoản
  headers.set("Cache-Control", "no-store");
  headers.set("Pragma", "no-cache");
  return fetch(url, { cache: "no-store", ...options, headers });
}

window.providerFetch = providerFetch;

