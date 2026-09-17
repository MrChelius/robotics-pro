(() => {
  'use strict';

  const config = window.CCCTradePayments;
  if (!config) return;

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const readCart = () => {
    try {
      const value = JSON.parse(localStorage.getItem('robotics_pro_cart') || '[]');
      return Array.isArray(value) ? value : [];
    } catch { return []; }
  };
  const products = () => window.RP?.products || [];
  const money = (value) => new Intl.NumberFormat('ru-RU',{style:'currency',currency:config.currency || 'RUB',maximumFractionDigits:0}).format(value);
  const cartDetails = () => readCart().map(item => {
    const product = products().find(p => p.id === item.id);
    if (!product) return null;
    const quantity = Math.max(1, Math.min(99, Number(item.quantity) || 1));
    return { product, quantity, subtotal: product.price * quantity };
  }).filter(Boolean);

  function ensureDialog() {
    let dialog = document.querySelector('#paymentDialog');
    if (dialog) return dialog;
    dialog = document.createElement('dialog');
    dialog.id = 'paymentDialog';
    dialog.setAttribute('aria-labelledby','paymentTitle');
    document.body.append(dialog);
    dialog.addEventListener('click', e => {
      if (e.target !== dialog) return;
      const r = dialog.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
    });
    dialog.addEventListener('close', () => document.body.classList.remove('lock-scroll'));
    return dialog;
  }

  function renderCheckout() {
    const dialog = ensureDialog();
    const lines = cartDetails();
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const methods = Object.entries(config.methods || {});
    dialog.innerHTML = `
      <div class="checkout-shell">
        <section class="checkout-main">
          <div class="checkout-top"><div><span class="checkout-badge">Secure checkout</span><h2 id="paymentTitle">Payment</h2></div><button class="checkout-close" type="button" data-payment-close aria-label="Close">×</button></div>
          <div class="checkout-fields">
            <div class="checkout-field"><label for="payName">Name</label><input id="payName" autocomplete="name" required></div>
            <div class="checkout-field"><label for="payEmail">Email</label><input id="payEmail" type="email" autocomplete="email" required></div>
            <div class="checkout-field full"><label for="payPhone">Phone</label><input id="payPhone" type="tel" autocomplete="tel" required></div>
          </div>
          <div class="payment-methods" role="radiogroup" aria-label="Payment method">
            ${methods.map(([key, method], index) => `
              <div class="payment-method"><input type="radio" name="paymentMethod" id="pay_${esc(key)}" value="${esc(key)}" ${index===0?'checked':''}><label for="pay_${esc(key)}"><strong>${esc(method.label)}</strong><small>${esc(method.note || '')}</small></label></div>
            `).join('')}
          </div>
          <button class="button checkout-pay" type="button" data-payment-submit ${lines.length ? '' : 'disabled'}>Pay ${money(total)} →</button>
          <p class="checkout-secure">Card details are never entered on CCCTrade. Visa, Mastercard, MIR, UnionPay and Alipay payments must be completed on the payment provider's secure hosted page.</p>
          <p class="checkout-status" id="paymentStatus" role="status" aria-live="polite"></p>
        </section>
        <aside class="checkout-summary">
          <span class="eyebrow">Order summary</span>
          <div class="checkout-order">${lines.length ? lines.map(({product,quantity,subtotal}) => `
            <div class="checkout-line"><img src="./images/${esc(product.images?.[0] || '')}" alt=""><div><h3>${esc(product.name)}</h3><p>Qty ${quantity}</p></div><strong>${money(subtotal)}</strong></div>
          `).join('') : '<p>Your cart is empty.</p>'}</div>
          <div class="checkout-total"><span>Total</span><strong>${money(total)}</strong></div>
          <p class="checkout-provider-note">The payment button becomes transaction-capable when a merchant hosted-checkout URL is added to <code>payment-config.js</code>. This keeps payment secrets and card data out of the public GitHub Pages site.</p>
        </aside>
      </div>`;
    return { dialog, total, lines };
  }

  function buildCheckoutUrl(methodKey, total, lines) {
    const method = config.methods?.[methodKey];
    if (!method?.checkoutUrl) return null;
    const url = new URL(method.checkoutUrl, location.href);
    url.searchParams.set('amount', String(Math.round(total)));
    url.searchParams.set('currency', config.currency || 'RUB');
    url.searchParams.set('reference', `CCC-${Date.now()}`);
    url.searchParams.set('items', lines.map(x => `${x.product.name} x${x.quantity}`).join(', '));
    if (config.successUrl) url.searchParams.set('success_url', config.successUrl);
    if (config.cancelUrl) url.searchParams.set('cancel_url', config.cancelUrl);
    return url.toString();
  }

  function openCheckout() {
    const { dialog } = renderCheckout();
    document.querySelectorAll('dialog[open]').forEach(d => { if (d !== dialog) d.close(); });
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('lock-scroll');
    dialog.querySelector('#payName')?.focus();
  }

  document.addEventListener('click', e => {
    const checkout = e.target.closest('[data-checkout]');
    if (checkout) {
      e.preventDefault();
      e.stopImmediatePropagation();
      openCheckout();
      return;
    }
    if (e.target.closest('[data-payment-close]')) {
      document.querySelector('#paymentDialog')?.close();
      return;
    }
    const submit = e.target.closest('[data-payment-submit]');
    if (!submit) return;
    const dialog = document.querySelector('#paymentDialog');
    const status = dialog?.querySelector('#paymentStatus');
    const name = dialog?.querySelector('#payName');
    const email = dialog?.querySelector('#payEmail');
    const phone = dialog?.querySelector('#payPhone');
    if (![name,email,phone].every(input => input?.reportValidity())) return;
    const methodKey = dialog.querySelector('input[name="paymentMethod"]:checked')?.value;
    const lines = cartDetails();
    const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
    const target = buildCheckoutUrl(methodKey,total,lines);
    if (!target) {
      status.textContent = 'Merchant checkout is not connected yet for this payment method. Add the provider checkout URL in payment-config.js.';
      return;
    }
    try {
      if (typeof window.gtag === 'function') window.gtag('event','begin_checkout',{currency:config.currency || 'RUB',value:total,payment_type:methodKey});
    } catch {}
    location.href = target;
  }, true);
})();
