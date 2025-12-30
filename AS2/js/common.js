// common.js

(function () {
  "use strict";

  // Scroll-to-top button
  const topButton = document.getElementById("topBtn");

  if (topButton) {
    const toggleTopButton = () => {
      const scrolled =
        document.documentElement.scrollTop || document.body.scrollTop;

      topButton.classList.toggle("d-none", scrolled <= 20);
    };

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("scroll", toggleTopButton);
    topButton.addEventListener("click", scrollToTop);

    // Run once on load
    toggleTopButton();
  }

  // Cart badge (shared across pages)
  if (typeof updateCartCount === "function") {
    updateCartCount();
  }
})();
