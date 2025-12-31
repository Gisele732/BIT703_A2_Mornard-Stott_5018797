// js/cart.js
const CART_KEY = "aag_cart_v1";

// Cart constants
const SHIPPING_FEE = 15;
const NEXT_DAY_FEE = 20;
const FREE_SHIPPING_THRESHOLD = 600;

function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function addToCart(productId, qty = 1, model = null) {
  const id = Number(productId);
  const quantity = Math.max(1, Number(qty) || 1);

  const cart = getCart();
  const existing = cart.find((item) => item.id === id && item.model === model);

  if (existing) existing.qty += quantity;
  else cart.push({ id, qty: quantity, model });

  saveCart(cart);
  updateCartCount();
}

function updateItemQty(index, qty) {
  const cart = getCart();
  const quantity = Math.max(1, Number(qty) || 1);
  if (!cart[index]) return;
  cart[index].qty = quantity;
  saveCart(cart);
  updateCartCount();
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  saveCart(cart);
  updateCartCount();
}

function clearCart() {
  saveCart([]);
  updateCartCount();
}

/* Helpers */
function currency(n) {
  return `$${Number(n).toFixed(0)}`;
}

function getSelectedShippingMode() {
  const checked = document.querySelector('input[name="shipping"]:checked');
  return checked ? checked.value : "standard";
}

// Update totals when shipping radios change (Step 2)
function calculateShipping(subtotal) {
  if (subtotal <= 0) return 0;

  const mode = getSelectedShippingMode();

  // Next day is always paid, even when free shipping is eligible
  if (mode === "nextday") return NEXT_DAY_FEE;

  // Free only if eligible AND selected
  if (mode === "free") {
    return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  }

  // Standard (default)
  return SHIPPING_FEE;
}

function cartTotals() {
  const cart = getCart();
  const items = cart
    .map((item) => {
      const p = PRODUCTS?.[item.id];
      if (!p) return null;
      return {
        ...item,
        name: p.name,
        price: p.price,
        image: p.image,
        lineTotal: p.price * item.qty
      };
    })
    .filter(Boolean);

  const subtotal = items.reduce((sum, i) => sum + i.lineTotal, 0);
  const shipping = calculateShipping(subtotal);

  // simple tax logic
  const subtotalPlusShipping = subtotal + shipping;
  // GST portion of an inclusive price (15%)
  const taxes =
    subtotalPlusShipping > 0
      ? Math.round((subtotalPlusShipping * 15) / 115)
      : 0;

  // Total stays the same because GST is already included
  const total = subtotalPlusShipping;

  return { items, subtotal, shipping, taxes, total };
}

/**
 * Sync the Shipping Details step UI (radios + offer banner) to current cart totals.
 * - If eligible for free shipping, force "free" selection and disable standard paid option.
 * - Otherwise, ensure paid options are enabled (does not override user choice).
 */
function syncShippingOfferUI({
  standardRadioId = "shipStandard",
  freeRadioId = "shipFree",
  nextDayRadioId = "shipNext",
  bannerId = "freeShippingBanner",
  progressId = "freeShippingProgress",
  subtotal
} = {}) {
  const eligible = subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const standard = document.getElementById(standardRadioId);
  const free = document.getElementById(freeRadioId);
  const next = document.getElementById(nextDayRadioId);
  const banner = document.getElementById(bannerId);
  const progress = document.getElementById(progressId);

  // If elements aren't on this page/step, just bail safely
  if (!free && !standard && !next) return;

  if (eligible) {
    // Free available
    if (free) free.disabled = false;

    // Standard becomes redundant 
    if (standard) standard.disabled = true;

    // Next day is still available as a paid upgrade
    if (next) next.disabled = false;

    const nextChosen = !!(next && next.checked);

    if (nextChosen) {
      // User chose next day: make sure free/standard aren't also selected
      if (free) free.checked = false;
      if (standard) standard.checked = false;
    } else {
      // Default to free when eligible (only if next isn't chosen)
      if (free) free.checked = true;
      if (standard) standard.checked = false;
    }
  } else {
    // Not eligible: disable free and ensure it's not selected
    if (free) {
      free.disabled = true;
      if (free.checked) free.checked = false;
    }

    // Paid options available
    if (standard) standard.disabled = false;
    if (next) next.disabled = false;

    // If neither standard nor next is selected, default to standard
    const mode = (document.querySelector('input[name="shipping"]:checked') || {}).value;
    if (!mode && standard) standard.checked = true;

    // If free had been selected earlier, force standard
    if (standard && !next?.checked) standard.checked = true;
  }

  if (banner) banner.classList.toggle("d-none", !eligible);

  if (progress) {
    progress.textContent = eligible
      ? "Free shipping available (Next day available as upgrade)."
      : `Spend $${remaining.toFixed(0)} more to unlock free shipping (orders over $600).`;
  }
}

/* small badge in nav */
function updateCartCount() {
  const el = document.querySelector("[data-cart-count]");
  if (!el) return;
  const count = getCart().reduce((sum, i) => sum + i.qty, 0);
  el.textContent = String(count);
}

/* Summary product list (right column) */
function renderSummaryItems(items, containerSelector) {
  const wrap = document.querySelector(containerSelector);
  if (!wrap) return;

  if (!items || items.length === 0) {
    wrap.innerHTML = `<p class="text-muted small mb-0">No items yet.</p>`;
    return;
  }

  wrap.innerHTML = items
    .map((item) => {
      const p = PRODUCTS?.[item.id];
      if (!p) return "";
      return `
        <div class="d-flex align-items-center gap-3 mb-3">
          <a href="product.html?id=${p.id}" class="text-decoration-none">
            <img src="${p.image}" alt="${p.name}" class="img-fluid" style="max-width:72px" />
          </a>
          <div class="flex-grow-1">
            <div class="small text-uppercase">${p.name}</div>
            <div class="text-muted small">${currency(p.price)}</div>
          </div>
        </div>
      `;
    })
    .join("");
}

/* Cart page rendering */
function renderCartStep1({
  itemsContainerSelector,
  summaryItemsSelector = "#summary-items",
  subtotalSelector,
  shippingSelector,
  taxesSelector,
  totalSelector
}) {
  const container = document.querySelector(itemsContainerSelector);
  if (!container) return;

  // Pass 1: get items + subtotal (shipping may be stale if "free" was previously checked)
  let { items, subtotal } = cartTotals();

  // Sync shipping UI based on current subtotal (forces off "free" when under threshold,
  // disables/enables options, updates banner)
  syncShippingOfferUI({ subtotal });

  // Pass 2: totals after shipping UI is corrected
  const { shipping, taxes, total } = cartTotals();

  // LEFT: items
  if (!items || items.length === 0) {
    container.innerHTML = `<p class="text-muted mb-0">Your cart is empty.</p>`;
  } else {
    container.innerHTML = items
      .map((item, index) => {
        const modelText = item.model
          ? `<span class="text-muted small">Model: ${item.model}</span><br />`
          : "";

        return `
          <div class="d-flex align-items-start gap-3 mb-4">
            <a href="product.html?id=${item.id}" class="text-decoration-none">
              <img
                src="${item.image}"
                alt="${item.name}"
                class="img-fluid"
                style="max-width: 90px"
              />
            </a>

            <div class="flex-grow-1">
              <p class="mb-1 text-uppercase small">${item.name}</p>
              ${modelText}
              <p class="mb-0">${currency(item.price)}</p>
              <button
                type="button"
                class="btn btn-link p-0 small text-danger"
                data-remove="${index}"
              >
                Remove
              </button>
            </div>

            <div style="max-width: 110px">
              <label class="visually-hidden" for="qty-${index}">Quantity</label>
              <input
                id="qty-${index}"
                type="number"
                class="form-control"
                min="1"
                value="${item.qty}"
                data-qty="${index}"
              />
            </div>
          </div>
        `;
      })
      .join("");
  }

  // RIGHT: summary items (images)
  renderSummaryItems(items, summaryItemsSelector);

  // totals text
  const s1 = document.querySelector(subtotalSelector);
  const s2 = document.querySelector(shippingSelector);
  const s3 = document.querySelector(taxesSelector);
  const s4 = document.querySelector(totalSelector);

  if (s1) s1.textContent = currency(subtotal);
  if (s2) s2.textContent = shipping === 0 ? "FREE" : currency(shipping);
  if (s3) s3.textContent = currency(taxes);
  if (s4) s4.textContent = currency(total);

  // events: qty
  container.querySelectorAll("[data-qty]").forEach((input) => {
    input.addEventListener("input", (e) => {
      updateItemQty(Number(e.target.dataset.qty), e.target.value);
      renderCartStep1({
        itemsContainerSelector,
        summaryItemsSelector,
        subtotalSelector,
        shippingSelector,
        taxesSelector,
        totalSelector
      });
    });
  });

  // events: remove
  container.querySelectorAll("[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      removeItem(Number(e.target.dataset.remove));
      renderCartStep1({
        itemsContainerSelector,
        summaryItemsSelector,
        subtotalSelector,
        shippingSelector,
        taxesSelector,
        totalSelector
      });
    });
  });
}

/* Utility: read product id from ?id= */
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id")) || 1;
}
