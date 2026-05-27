/**
 * cart.js
 * Controla la página del carrito de compras (cart.html).
 *
 * Responsabilidades:
 *  - Renderizar los productos que el usuario agregó al carrito.
 *  - Permitir cambiar la cantidad o eliminar productos del carrito.
 *  - Mostrar el resumen de precios (subtotal, envío, total).
 *  - Abrir el modal de confirmación de pedido al hacer clic en "Confirmar pedido".
 *  - Mostrar el resumen del pedido y luego el formulario de datos del cliente.
 *  - Validar los campos del formulario y guardar el pedido en localStorage.
 *  - Mostrar pantalla de éxito y limpiar el carrito tras confirmar la compra.
 */

import { getCart, setCart, loadProducts, saveOrders, loadOrders } from './storage.js';
import { updateCartBadge } from './ui.js';
import { products as defaultProducts } from './products.js';

const cartList = document.getElementById('cartList');
const checkoutButton = document.getElementById('checkoutButton');
const cartSubtotal = document.getElementById('cartSubtotal');
const cartTotal = document.getElementById('cartTotal');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutModalContent = document.getElementById('checkoutModalContent');

/**
 * Busca un producto por id en localStorage (o en los datos por defecto).
 * Se usa para obtener la imagen actualizada del producto al renderizar el carrito.
 * @param {string} id - ID del producto.
 * @returns {Object|undefined}
 */
function findProduct(id) {
  return loadProducts(defaultProducts).find((p) => p.id === id);
}

/**
 * Formatea un número como precio con símbolo y dos decimales.
 * @param {number} value
 * @returns {string} Ej: "$52.00"
 */
function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

/**
 * Convierte un objeto Date a una cadena legible en formato:
 * "DD/MM/AAAA - H:MM AM/PM"
 * @param {Date} date
 * @returns {string} Ej: "23/05/2026 - 7:45 PM"
 */
function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  let h = date.getHours();
  const min = String(date.getMinutes()).padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${d}/${m}/${y} - ${h}:${min} ${ampm}`;
}

/**
 * Muestra el estado de carrito vacío:
 * un mensaje con enlace para volver a la tienda y desactiva el botón de checkout.
 */
function renderEmptyCart() {
  cartList.innerHTML = `
    <div class="detail-card">
      <p class="section-text">Tu carrito está vacío por ahora.</p>
      <a class="btn btn-secondary" href="index.html">Volver a la tienda</a>
    </div>
  `;
  checkoutButton.disabled = true;
  cartSubtotal.textContent = '$0.00';
  cartTotal.textContent = '$0.00';
}

/**
 * Recalcula el subtotal del carrito y actualiza los elementos del DOM.
 * El envío es $0 (gratis), por lo que subtotal = total.
 * @param {Array} cart - Arreglo de items del carrito.
 */
function updateSummary(cart) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  cartSubtotal.textContent = formatPrice(subtotal);
  cartTotal.textContent = formatPrice(subtotal);
}

/**
 * Guarda el carrito en localStorage, actualiza el badge del navbar
 * y vuelve a renderizar la lista del carrito.
 * @param {Array} cart - Arreglo actualizado del carrito.
 */
function saveCart(cart) {
  setCart(cart);
  updateCartBadge();
  renderCart();
}

/**
 * Renderiza todos los productos del carrito en la lista.
 * Por cada item crea una tarjeta con imagen, nombre, precio, cantidad
 * y botones para aumentar, disminuir o eliminar el producto.
 * Si el carrito está vacío, llama a renderEmptyCart().
 */
function renderCart() {
  const cart = getCart();
  if (!cart.length) { renderEmptyCart(); return; }

  cartList.innerHTML = '';
  cart.forEach((item) => {
    const product = findProduct(item.id) || item;
    const el = document.createElement('div');
    el.className = 'cart-item';
    el.innerHTML = `
      <img src="${product.image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'}" alt="${item.name}">
      <div class="cart-item-details">
        <p class="cart-item-title">${item.name}</p>
        <div class="cart-item-meta">${product.category || ''}</div>
        <p class="cart-item-meta">${formatPrice(item.price)} x ${item.quantity}</p>
      </div>
      <div class="cart-actions">
        <div class="quantity-control">
          <button type="button" data-action="decrease" data-id="${item.id}">-</button>
          <span>${item.quantity}</span>
          <button type="button" data-action="increase" data-id="${item.id}">+</button>
        </div>
        <button class="btn btn-secondary" type="button" data-action="remove" data-id="${item.id}">Quitar</button>
      </div>
    `;

    // Disminuir cantidad (mínimo 1).
    el.querySelector('[data-action="decrease"]').addEventListener('click', () => {
      const c = getCart();
      const i = c.find((e) => e.id === item.id);
      if (i) { i.quantity = Math.max(1, i.quantity - 1); saveCart(c); }
    });

    // Aumentar cantidad.
    el.querySelector('[data-action="increase"]').addEventListener('click', () => {
      const c = getCart();
      const i = c.find((e) => e.id === item.id);
      if (i) { i.quantity += 1; saveCart(c); }
    });

    // Eliminar el producto del carrito.
    el.querySelector('[data-action="remove"]').addEventListener('click', () => {
      saveCart(getCart().filter((e) => e.id !== item.id));
    });

    cartList.appendChild(el);
  });

  updateSummary(cart);
  checkoutButton.disabled = false;
}

/**
 * Construye y renderiza el contenido del modal de checkout.
 * El modal tiene tres vistas que se alternan:
 *  1. #coSummary  → Resumen de productos y totales + botón "Comprar".
 *  2. #coForm     → Formulario de datos del cliente.
 *  3. #coSuccess  → Pantalla de confirmación exitosa.
 *
 * También configura:
 *  - El botón "Comprar" para pasar del resumen al formulario.
 *  - La validación visual en tiempo real de cada campo.
 *  - El bloqueo de caracteres inválidos en identificación, teléfono y nombre.
 *
 * @param {Array} cart - Items del carrito.
 * @param {number} subtotal - Suma de precios × cantidades.
 * @param {number} envio - Costo de envío (0 = gratis).
 */
function renderOrderSummary(cart, subtotal, envio) {
  const itemsMarkup = cart.map((item) => {
    const product = findProduct(item.id) || item;
    return `
      <div class="co-item">
        <img src="${product.image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=120&q=80'}" alt="${item.name}">
        <div class="co-item-info">
          <p class="co-item-name">${item.name}</p>
          <p class="co-item-meta">${formatPrice(item.price)} &times; ${item.quantity}</p>
        </div>
        <p class="co-item-subtotal">${formatPrice(item.price * item.quantity)}</p>
      </div>
    `;
  }).join('');

  checkoutModalContent.innerHTML = `
    <div id="coSummary">
      <div class="co-items-list">${itemsMarkup}</div>
      <div class="co-totals">
        <div class="co-total-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
        <div class="co-total-row"><span>Envío</span><span>${envio === 0 ? 'Gratis' : formatPrice(envio)}</span></div>
        <div class="co-total-row co-total-final"><strong>Total</strong><strong>${formatPrice(subtotal + envio)}</strong></div>
      </div>
      <button id="coBuyBtn" class="btn btn-primary co-buy-btn">Comprar</button>
    </div>
    <div id="coForm" style="display:none">
      <form id="checkoutForm" class="checkout-form" novalidate>
        <div class="field-group">
          <label for="customerId">Identificación</label>
          <input id="customerId" name="customerId" type="text" required pattern="[0-9]+" inputmode="numeric" placeholder="Ej: 1234567890">
          <span class="field-error">Solo se permiten números.</span>
        </div>
        <div class="field-group">
          <label for="customerPhone">Teléfono</label>
          <input id="customerPhone" name="customerPhone" type="tel" required pattern="[0-9]+" inputmode="numeric" placeholder="Ej: 3001234567">
          <span class="field-error">Solo se permiten números.</span>
        </div>
        <div class="field-group field-full">
          <label for="customerName">Nombre completo</label>
          <input id="customerName" name="customerName" type="text" required pattern="[A-Za-zà-žÀ-ž\\s]+" placeholder="Ej: Juan Pérez">
          <span class="field-error">Solo se permiten letras.</span>
        </div>
        <div class="field-group field-full">
          <label for="customerAddress">Dirección</label>
          <input id="customerAddress" name="customerAddress" type="text" required placeholder="Ej: Calle 123 #45-67">
          <span class="field-error">Campo obligatorio.</span>
        </div>
        <div class="field-group field-full">
          <label for="customerEmail">E-mail</label>
          <input id="customerEmail" name="customerEmail" type="email" required placeholder="Ej: correo@ejemplo.com">
          <span class="field-error">Ingresa un correo válido.</span>
        </div>
        <div class="modal-actions">
          <button type="submit" class="btn btn-primary">Finalizar compra</button>
        </div>
      </form>
    </div>
    <div id="coSuccess" style="display:none" class="co-success">
      <div class="co-success-icon">✓</div>
      <h3>¡Pedido confirmado!</h3>
      <p>Tu pedido ha sido guardado exitosamente.</p>
    </div>
  `;

  // Botón "Comprar": oculta el resumen y muestra el formulario.
  document.getElementById('coBuyBtn').addEventListener('click', () => {
    document.getElementById('coSummary').style.display = 'none';
    document.getElementById('coForm').style.display = 'block';
    checkoutModal.setTitle('Datos del cliente');
  });

  const form = document.getElementById('checkoutForm');
  form.addEventListener('submit', (e) => handleCheckoutSubmit(e, subtotal, envio));

  // Validación visual en tiempo real: marca el campo como inválido mientras el usuario escribe.
  form.querySelectorAll('input').forEach((input) => {
    input.addEventListener('input', () => {
      input.closest('.field-group').classList.toggle('field-invalid', !input.validity.valid);
    });
  });

  // Bloquea teclas no numéricas en los campos de identificación y teléfono.
  ['customerId', 'customerPhone'].forEach((id) => {
    const el = document.getElementById(id);
    el.addEventListener('keypress', (e) => { if (!/[0-9]/.test(e.key)) e.preventDefault(); });
    el.addEventListener('paste', (e) => { if (!/^[0-9]+$/.test(e.clipboardData.getData('text'))) e.preventDefault(); });
  });

  // Bloquea números y símbolos en el campo de nombre.
  const nameEl = document.getElementById('customerName');
  nameEl.addEventListener('keypress', (e) => { if (!/[A-Za-zà-žÀ-ž\s]/.test(e.key)) e.preventDefault(); });
  nameEl.addEventListener('paste', (e) => { if (!/^[A-Za-zà-žÀ-ž\s]+$/.test(e.clipboardData.getData('text'))) e.preventDefault(); });
}

/**
 * Abre el modal de checkout con el resumen del carrito actual.
 * Calcula el subtotal y pasa los datos a renderOrderSummary.
 */
function openCheckoutModal() {
  const cart = getCart();
  if (!cart.length) return;
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  checkoutModal.setTitle('Confirmar pedido');
  renderOrderSummary(cart, subtotal, 0);
  checkoutModal.open();
}

/**
 * Maneja el envío del formulario de datos del cliente.
 * Pasos:
 *  1. Previene el envío por defecto.
 *  2. Valida todos los campos con la API de validez del navegador.
 *  3. Si hay errores, los marca visualmente y detiene el proceso.
 *  4. Construye el objeto pedido con todos los datos requeridos.
 *  5. Agrega el pedido al arreglo de pedidos en localStorage.
 *  6. Limpia el carrito y actualiza el badge.
 *  7. Muestra la pantalla de éxito y cierra el modal tras 2.2 segundos.
 *
 * @param {Event} event - Evento submit del formulario.
 * @param {number} subtotal - Subtotal calculado antes de abrir el modal.
 * @param {number} envio - Costo de envío.
 */
function handleCheckoutSubmit(event, subtotal, envio) {
  event.preventDefault();
  const form = event.target;
  let valid = true;

  // Marca cada campo inválido con la clase field-invalid.
  form.querySelectorAll('input').forEach((input) => {
    const group = input.closest('.field-group');
    if (!input.validity.valid) { group.classList.add('field-invalid'); valid = false; }
  });
  if (!valid) return;

  const fd = new FormData(form);
  const cart = getCart();

  // Construye el objeto pedido con el esquema estándar de la aplicación.
  saveOrders([...loadOrders(), {
    idPedido: Date.now(),           // Timestamp usado como ID único y para ordenar.
    fecha: formatDate(new Date()),  // Fecha legible para mostrar en el admin.
    cliente: {
      identificacion: fd.get('customerId').trim(),
      nombre: fd.get('customerName').trim(),
      direccion: fd.get('customerAddress').trim(),
      telefono: fd.get('customerPhone').trim(),
      email: fd.get('customerEmail').trim(),
    },
    productos: cart,
    subtotal,
    envio,
    total: subtotal + envio,
  }]);

  setCart([]);
  updateCartBadge();

  // Muestra la pantalla de éxito y cierra el modal automáticamente.
  document.getElementById('coForm').style.display = 'none';
  document.getElementById('coSuccess').style.display = 'flex';
  checkoutModal.setTitle('¡Listo!');
  setTimeout(() => { checkoutModal.close(); renderCart(); }, 2200);
}

window.addEventListener('DOMContentLoaded', () => {
  renderCart();
  checkoutButton.addEventListener('click', openCheckoutModal);
});
