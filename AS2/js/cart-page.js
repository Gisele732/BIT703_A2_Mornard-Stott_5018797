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

  // ----- Forms (Bootstrap validation styling + custom rules) -----
  const shippingForm = document.getElementById("shippingForm");
  const paymentForm = document.getElementById("paymentForm");

  const el = {
    country: document.getElementById("country"),
    postcode: document.getElementById("postcode"),
    phone: document.getElementById("phone"),
    payCard: document.getElementById("payCard"),
    payPaypal: document.getElementById("payPaypal"),
    cardNo: document.getElementById("cardNo"),
    exp: document.getElementById("exp"),
    cvv: document.getElementById("cvv"),
    cardName: document.getElementById("cardName"),
  };

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function luhnCheck(numString) {
    const s = digitsOnly(numString);
    if (s.length < 13) return false;
    let sum = 0;
    let doubleIt = false;
    for (let i = s.length - 1; i >= 0; i--) {
      let digit = Number(s[i]);
      if (doubleIt) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      doubleIt = !doubleIt;
    }
    return sum % 10 === 0;
  }

  function isValidExpiry(mmYY) {
    const raw = String(mmYY || "").trim();
    const m = raw.match(/^(0[1-9]|1[0-2])\s*\/\s*(\d{2})$/);
    if (!m) return false;
    const month = Number(m[1]);
    const year = 2000 + Number(m[2]);
    // Expiry is end of given month
    const expiry = new Date(year, month, 0, 23, 59, 59, 999);
    return expiry.getTime() > Date.now();
  }

  function setShippingCustomValidity() {
    if (!shippingForm) return;

    // Postcode: NZ and AU are both 4 digits (simple course-safe rule)
    if (el.postcode) {
      const pc = digitsOnly(el.postcode.value);
      const ok = pc.length === 4;
      el.postcode.setCustomValidity(ok ? "" : "Invalid postcode");
    }

    // Phone: 7–15 digits (allows country codes/spaces)
    if (el.phone) {
      const p = digitsOnly(el.phone.value);
      const ok = p.length >= 7 && p.length <= 15;
      el.phone.setCustomValidity(ok ? "" : "Invalid phone");
    }
  }

  function setPaymentCustomValidity() {
    if (!paymentForm) return;

    // If PayPal selected, card fields are not required/validated
    const usingCard = !!el.payCard?.checked;
    [el.cardNo, el.exp, el.cvv, el.cardName].forEach((input) => {
      if (!input) return;
      input.disabled = !usingCard;
      input.toggleAttribute("required", usingCard);
      if (!usingCard) input.setCustomValidity("");
    });

    if (!usingCard) return;

    if (el.cardNo) {
      const ok = luhnCheck(el.cardNo.value);
      el.cardNo.setCustomValidity(ok ? "" : "Invalid card number");
    }

    if (el.exp) {
      const ok = isValidExpiry(el.exp.value);
      el.exp.setCustomValidity(ok ? "" : "Invalid expiry");
    }

    if (el.cvv) {
      const c = digitsOnly(el.cvv.value);
      const ok = c.length === 3 || c.length === 4;
      el.cvv.setCustomValidity(ok ? "" : "Invalid CVV");
    }
  }

  function validateStep(stepNumber) {
    const s = Number(stepNumber);

    if (s === 2 && shippingForm) {
      setShippingCustomValidity();
      const ok = shippingForm.checkValidity();
      shippingForm.classList.add("was-validated");
      if (!ok) {
        // Focus first invalid input for accessibility
        shippingForm.querySelector(":invalid")?.focus();
      }
      return ok;
    }

    if (s === 3 && paymentForm) {
      setPaymentCustomValidity();
      const ok = paymentForm.checkValidity();
      paymentForm.classList.add("was-validated");
      if (!ok) {
        paymentForm.querySelector(":invalid")?.focus();
      }
      return ok;
    }

    return true;
  }

  function canNavigateTo(targetStep) {
    const current = getActiveStep();
    const target = Number(targetStep);
    if (target <= current) return true;
    // Validate each intermediate step before allowing forward navigation
    for (let s = current; s < target; s++) {
      // If the user is trying to jump ahead, bring the required step into view
      // so validation feedback is visible.
      if (s !== current) setStep(s);
      if (!validateStep(s)) {
        setStep(s);
        return false;
      }
    }
    return true;
  }

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
      if (canNavigateTo(t.dataset.step)) setStep(t.dataset.step);
    })
  );

  // Next/Prev buttons
  document.addEventListener("click", (e) => {
    const next = e.target.closest("[data-next]");
    const prev = e.target.closest("[data-prev]");
    if (!next && !prev) return;

    const active = getActiveStep();
    if (next) {
      // Validate current step before moving forward
      if (validateStep(active)) setStep(Math.min(3, active + 1));
    }
    if (prev) setStep(Math.max(1, active - 1));
  });

  // Keep payment validation state in sync with selected payment method
  if (paymentForm) {
    const checkoutComplete = document.getElementById("checkoutComplete");
    [el.payCard, el.payPaypal].forEach((r) => {
      if (!r) return;
      r.addEventListener("change", () => {
        setPaymentCustomValidity();
        paymentForm.classList.remove("was-validated");
      });
    });

    // Block demo submission if invalid (shows Bootstrap feedback)
    paymentForm.addEventListener("submit", (e) => {
      setPaymentCustomValidity();
      if (!paymentForm.checkValidity()) {
        e.preventDefault();
        e.stopPropagation();
        paymentForm.classList.add("was-validated");
        paymentForm.querySelector(":invalid")?.focus();
        return;
      }
      // No real payment processing in this assignment
      e.preventDefault();
      paymentForm.classList.add("was-validated");
      if (checkoutComplete) checkoutComplete.classList.remove("d-none");
    });
  }

  // Validate shipping inputs live (optional, keeps messages accurate)
  if (shippingForm) {
    [el.postcode, el.phone].forEach((input) => {
      if (!input) return;
      input.addEventListener("input", () => {
        setShippingCustomValidity();
        // If user is correcting after validation attempt, keep UI responsive
        if (shippingForm.classList.contains("was-validated")) {
          shippingForm.checkValidity();
        }
      });
    });
  }

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
  // Ensure card inputs are enabled/required based on default payment selection
  setPaymentCustomValidity();
  setStep(1);
})();
