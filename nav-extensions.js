(() => {
  "use strict";

  const params = new URLSearchParams(window.location.search);
  const lang = params.get("lang") || localStorage.getItem("robotics_pro_language")?.replaceAll('"', "") || "en";
  const withLang = (path) => `${path}?lang=${encodeURIComponent(lang)}`;

  function addLinks() {
    const desktopNav = document.querySelector(".desktop-nav");
    if (desktopNav && !desktopNav.querySelector('[data-extra-nav="partners"]')) {
      const partners = document.createElement("a");
      partners.href = withLang("./partners.html");
      partners.textContent = "Partners";
      partners.dataset.extraNav = "partners";

      const news = document.createElement("a");
      news.href = withLang("./news.html");
      news.textContent = "Tech & IT News";
      news.dataset.extraNav = "news";

      desktopNav.append(partners, news);
    }

    const mobileNav = document.querySelector("#menuDialog nav");
    if (mobileNav && !mobileNav.querySelector('[data-extra-nav="partners"]')) {
      const partners = document.createElement("a");
      partners.href = withLang("./partners.html");
      partners.textContent = "Partners ↗";
      partners.dataset.extraNav = "partners";

      const news = document.createElement("a");
      news.href = withLang("./news.html");
      news.textContent = "Tech & IT News ↗";
      news.dataset.extraNav = "news";

      mobileNav.append(partners, news);
    }
  }

  addLinks();
  requestAnimationFrame(addLinks);
  setTimeout(addLinks, 250);
})();
