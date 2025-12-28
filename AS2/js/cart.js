// js/cart.js
const CART_KEY = "aag_cart_v1";

// Cart constants (assignment)
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

function calculateShipping(subtotal) {
  if (subtotal <= 0) return 0;
  if (subtotal >= FREE_SHIPPING_THRESHOLD) return 0; // automatic offer

  const mode = getSelectedShippingMode();
  if (mode === "free") return 0;
  if (mode === "nextday") return NEXT_DAY_FEE;
  return SHIPPING_FEE; // standard
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

  // simple tax logic (replace with your preferred rule if needed)
  const taxes = subtotal > 0 ? 13 : 0;

  const total = subtotal + shipping + taxes;

  return { items, subtotal, shipping, taxes, total };
}

/**
 * Sync the Shipping Details step UI (radios + offer banner) to current cart totals.
 * - If eligible for free shipping, force "free" selection and disable paid options.
 * - Otherwise, ensure paid options are enabled (does not override user choice).
 */
function syncShippingOfferUI({
  standardRadioId = "shipStandard",
  freeRadioId = "shipFree",
  nextDayRadioId = "shipNext",
  bannerId = "freeShippingBanner",
  progressId = "freeShippingProgress"
} = {}) {
  const { subtotal } = cartTotals();
  const eligible = subtotal >= FREE_SHIPPING_THRESHOLD && subtotal > 0;
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);

  const standard = document.getElementById(standardRadioId);
  const free = document.getElementById(freeRadioId);
  const next = document.getElementById(nextDayRadioId);
  const banner = document.getElementById(bannerId);
  const progress = document.getElementById(progressId);

  if (free && standard) {
    if (eligible) {
      free.checked = true;
      standard.checked = false;
      if (next) next.checked = false;

      standard.disabled = true;
      if (next) next.disabled = true;
    } else {
      standard.disabled = false;
      if (next) next.disabled = false;

      // don't force-select standard if user already chose something
      const mode = getSelectedShippingMode();
      if (!mode && standard) standard.checked = true;
    }
  }

  if (banner) banner.classList.toggle("d-none", !eligible);

  if (progress) {
    progress.textContent = eligible
      ? "Free shipping applied."
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

/* Voucher dropdown toggle */
function setupVoucherToggle() {
  const btn = document.getElementById("voucherToggle");
  const panel = document.getElementById("voucherPanel");
  if (!btn || !panel) return;

  // prevent double-binding if you re-init
  if (btn.dataset.bound === "1") return;
  btn.dataset.bound = "1";

  btn.addEventListener("click", () => {
    const isOpen = !panel.classList.contains("d-none");
    panel.classList.toggle("d-none", isOpen);
    btn.setAttribute("aria-expanded", String(!isOpen));
  });
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

  const { items, subtotal, shipping, taxes, total } = cartTotals();

  // LEFT: items
  if (items.length === 0) {
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

  // Shipping offer banner + radio states (if Step 2 exists on page)
  syncShippingOfferUI();

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

  // Update totals when shipping radio changes (Step 2)
  document.querySelectorAll('input[name="shipping"]').forEach((r) => {
    if (r.dataset.bound === "1") return;
    r.dataset.bound = "1";
    r.addEventListener("change", () => {
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

  // ensure voucher toggle works if present
  setupVoucherToggle();
}

/* Utility: read product id from ?id= */
function getProductIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id")) || 1;
}
