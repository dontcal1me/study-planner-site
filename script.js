const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".site-header nav a").forEach((link) => {
  const linkPage = link.getAttribute("href");
  link.classList.toggle("active", linkPage === currentPage);
});
