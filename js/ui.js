/**
 * ui.js
 * Funciones compartidas de interfaz de usuario.
 * Maneja la renderización de productos, el carrito y
 * el filtrado de productos por texto y categoría.
 * Es importado tanto por app.js como por cart.js y product-detail.js.
 */

import { getCart, setCart } from './storage.js';

/**
 * Dispara un evento personalizado 'cartCountUpdate' en el window.
 * El componente premium-navbar escucha este evento para actualizar
 * el número visible en el botón del carrito.
 * @param {number} count - Cantidad total de unidades en el carrito.
 */
export function dispatchCartCount(count) {
  window.dispatchEvent(new CustomEvent('cartCountUpdate', { bubbles: true, detail: count }));
}

/**
 * Calcula la cantidad total de unidades en el carrito
 * y dispara el evento para actualizar el badge del navbar.
 * Se llama cada vez que el carrito cambia.
 */
export function updateCartBadge() {
  const cart = getCart();
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  dispatchCartCount(count);
}

/**
 * Agrega un producto al carrito.
 * Si el producto ya existe, incrementa su cantidad en 1.
 * Si es nuevo, lo agrega con quantity: 1.
 * Guarda el carrito actualizado y refresca el badge.
 * @param {Object} product - Objeto producto a agregar.
 */
export function addToCart(product) {
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  setCart(cart);
  updateCartBadge();
}

/**
 * Filtra un arreglo de productos según texto de búsqueda y categoría.
 * El texto busca coincidencias en el nombre y la descripción del producto.
 * La categoría 'all' muestra todos los productos sin filtrar.
 * @param {Array} products - Lista completa de productos.
 * @param {string} query - Texto ingresado por el usuario en el buscador.
 * @param {string} category - ID de la categoría seleccionada.
 * @returns {Array} Productos que cumplen ambos criterios.
 */
export function filterProducts(products, query, category) {
  const q = query.trim().toLowerCase();
  return products.filter((p) => {
    const matchesText = p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchesCategory = category === 'all' || p.category === category;
    return matchesText && matchesCategory;
  });
}

/**
 * Renderiza una lista de productos en el contenedor del DOM indicado.
 * Crea un componente <product-card> por cada producto y escucha
 * el evento 'add-to-cart' que emite la card al hacer clic en el botón.
 * Si la lista está vacía, muestra un mensaje de estado vacío.
 * @param {Array} products - Productos a renderizar.
 * @param {HTMLElement} container - Elemento del DOM donde se insertan las cards.
 */
export function renderProducts(products, container) {
  container.innerHTML = '';

  if (!products.length) {
    container.innerHTML = '<p class="empty-state">No encontramos productos que coincidan.</p>';
    return;
  }

  products.forEach((product) => {
    const card = document.createElement('product-card');
    card.product = product; // La propiedad 'product' es leída por el Web Component.
    card.addEventListener('add-to-cart', () => addToCart(product));
    container.appendChild(card);
  });
}
