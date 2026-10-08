const pages = document.querySelectorAll(".page");
const navLinks = document.querySelectorAll(".nav-link");
const featureCards = document.querySelectorAll("[data-open]");
const pageTitle = document.getElementById("page-title");

const titles = {
  accueil: "Tableau de bord",
  tactiques: "Laboratoire tactique",
  entrainements: "Entraînements",
  analyse: "Analyse vidéo"
};

function openPage(pageName) {
  if (!titles[pageName]) return;

  pages.forEach(page => {
    page.classList.toggle("active", page.id === pageName);
  });

  navLinks.forEach(link => {
    const isActive = link.dataset.page === pageName;
    link.classList.toggle("active", isActive);
    link.setAttribute("aria-current", isActive ? "page" : "false");
  });

  pageTitle.textContent = titles[pageName];

  window.scrollTo(0, 0);
}

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    openPage(link.dataset.page);
  });
});

featureCards.forEach(card => {
  card.addEventListener("click", () => {
    openPage(card.dataset.open);
  });
});
