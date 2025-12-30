(function () {
  "use strict";

  // Only run on cart page (requires step panels)
  const panels = Array.from(document.querySelectorAll("[data-step-panel]"));
  if (!panels.length) return;

  // ----- Cart render (Step 1 + summary + totals) -----
  function getSelectedShippingMode() {
    const checked = document.querySelector('input[name="shipping"]:checked');
    return checked ? checked.value : "standard";
  }

  function renderCart() {
    if (typeof renderCartStep1 !== "function") return;

    renderCartStep1({
      itemsContainerSelector: "#cart-items",
      summaryItemsSelector: "#summary-items",
      subtotalSelector: "#summary-subtotal",
      shippingSelector: "#summary-shipping",
      taxesSelector: "#summary-taxes",
      totalSelector: "#summary-total",
    });
  }

  // ----- Checkout steps (Bootstrap nav-underline) -----
  const tabs = Array.from(document.querySelectorAll("#checkoutSteps .nav-link"));

  function getActiveStep() {
    return Number(tabs.find(t => t.classList.contains("active"))?.dataset.step) || 1;
  }

  function setStep(step) {
    const s = Number(step);

    // Tabs: use Bootstrap's .active
    tabs.forEach((t) => {
      const isActive = Number(t.dataset.step) === s;
      t.classList.toggle("active", isActive);
      t.setAttribute("aria-selected", String(isActive));
      if (isActive) t.setAttribute("aria-current", "step");
      else t.removeAttribute("aria-current");
    });

    // Panels: hide/show with d-none
    panels.forEach((p) => {
      const show = Number(p.dataset.stepPanel) === s;
      p.classList.toggle("d-none", !show);
    });

    // When entering Shipping step, ensure totals reflect chosen shipping mode
    if (s === 2) {
      // If your cart.js uses DOM radios to compute shipping, renderCart() is enough.
      // If you later refactor to pass mode, you can re-render here too.
      renderCart();
    }
  }

  // Click top nav links (stay on page)
  tabs.forEach((t) =>
    t.addEventListener("click", (e) => {
      e.preventDefault();
      setStep(t.dataset.step);
    })
  );

  // Next/Prev buttons
  document.addEventListener("click", (e) => {
    const next = e.target.closest("[data-next]");
    const prev = e.target.closest("[data-prev]");
    if (!next && !prev) return;

    const active = getActiveStep();
    if (next) setStep(Math.min(3, active + 1));
    if (prev) setStep(Math.max(1, active - 1));
  });

  // Update totals when shipping radios change (Step 2)
  document.querySelectorAll('input[name="shipping"]').forEach((r) => {
    if (r.dataset.bound === "1") return;
    r.dataset.bound = "1";
    r.addEventListener("change", () => {
      renderCart();
    });
  });

  // Init
  renderCart();
  setStep(1);
})();
