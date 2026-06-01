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

// ============== FUNCIONES DE ORDENAMIENTO ==============

/**
 * Ordena un arreglo de productos según el criterio especificado.
 * @param {Array} products - Productos a ordenar.
 * @param {string} sortBy - Criterio: 'price-asc', 'price-desc', 'name-asc', 'name-desc'
 * @returns {Array} Nuevo arreglo ordenado (no modifica el original).
 */
export function sortProducts(products, sortBy) {
  const sorted = [...products]; // Copia para no modificar original
  
  switch (sortBy) {
    case 'price-asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price-desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'name-asc':
      return sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    case 'name-desc':
      return sorted.sort((a, b) => b.name.localeCompare(a.name, 'es'));
    default:
      return sorted;
  }
}

// ============== FUNCIONES DE PAGINACIÓN ==============

/**
 * Obtiene una página específica de un arreglo.
 * @param {Array} items - Arreglo completo.
 * @param {number} pageNumber - Número de página (comenzando en 1).
 * @param {number} itemsPerPage - Cantidad de items por página.
 * @returns {Array} Items de la página solicitada.
 */
export function getPaginatedItems(items, pageNumber, itemsPerPage) {
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const page = Math.max(1, Math.min(pageNumber, totalPages));
  const startIndex = (page - 1) * itemsPerPage;
  return items.slice(startIndex, startIndex + itemsPerPage);
}

/**
 * Calcula el total de páginas.
 * @param {number} totalItems - Total de items.
 * @param {number} itemsPerPage - Items por página.
 * @returns {number} Total de páginas.
 */
export function calculateTotalPages(totalItems, itemsPerPage) {
  return Math.max(1, Math.ceil(totalItems / itemsPerPage));
}

// ============== FUNCIONES DE FAVORITOS ==============

/**
 * Renderiza productos favoritos desde sus IDs.
 * @param {Array} favoriteIds - Arreglo con IDs de favoritos.
 * @param {Array} allProducts - Todos los productos disponibles.
 * @param {HTMLElement} container - Elemento donde renderizar.
 */
export function renderFavorites(favoriteIds, allProducts, container) {
  const favorites = allProducts.filter((p) => favoriteIds.includes(p.id));
  renderProducts(favorites, container);
}

// ============== FUNCIONES DE VALIDACIÓN ==============

/**
 * Valida un email con regex.
 * @param {string} email - Email a validar.
 * @returns {boolean}
 */
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * Valida un teléfono (10 dígitos).
 * @param {string} phone - Teléfono a validar.
 * @returns {boolean}
 */
export function isValidPhone(phone) {
  const regex = /^\d{10}$/;
  return regex.test(phone.replace(/\D/g, ''));
}

/**
 * Valida una identificación (cédula).
 * @param {string} id - Identificación a validar.
 * @returns {boolean}
 */
export function isValidID(id) {
  const regex = /^\d{6,12}$/;
  return regex.test(id.replace(/[^\d]/g, ''));
}

/**
 * Valida que un campo de texto no esté vacío.
 * @param {string} value - Valor a validar.
 * @returns {boolean}
 */
export function isNotEmpty(value) {
  return value.trim().length > 0;
}

/**
 * Valida que un campo sea un número mayor a 0.
 * @param {any} value - Valor a validar.
 * @returns {boolean}
 */
export function isPositiveNumber(value) {
  return !isNaN(value) && parseFloat(value) > 0;
}

// ============== FUNCIONES DE SISTEMA TOAST ==============

/**
 * Muestra un mensaje flotante temporal (toast).
 * @param {string} message - Mensaje a mostrar.
 * @param {string} type - Tipo: 'success', 'error', 'info', 'warning'
 * @param {number} duration - Duración en ms (default 3000).
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer') || createToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Animar entrada
  setTimeout(() => toast.classList.add('show'), 10);
  
  // Remover después del tiempo especificado
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

/**
 * Crea el contenedor de toasts si no existe.
 * @returns {HTMLElement}
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toastContainer';
  container.className = 'toast-container';
  document.body.appendChild(container);
  return container;
}

// ============== FUNCIONES DE CONTROL DE STOCK ==============

/**
 * Verifica si un producto tiene stock disponible.
 * @param {Object} product - Producto a verificar.
 * @returns {boolean}
 */
export function hasStock(product) {
  return product.stock && product.stock > 0;
}

/**
 * Verifica si se puede agregar la cantidad especificada al carrito.
 * @param {Object} product - Producto.
 * @param {number} quantity - Cantidad a agregar.
 * @returns {boolean}
 */
export function canAddToCart(product, quantity = 1) {
  if (!product.stock) return true; // Compatibilidad con productos sin stock definido
  const cart = getCart();
  const existing = cart.find((item) => item.id === product.id);
  const currentQuantity = existing ? existing.quantity : 0;
  return currentQuantity + quantity <= product.stock;
}

/**
 * Filtra productos por rango de precio.
 * @param {Array} products - Productos a filtrar.
 * @param {string} priceRange - Rango: '0-50', '50-100', '100-200', '200-999', o '' para todos.
 * @returns {Array} Productos dentro del rango.
 */
export function filterByPriceRange(products, priceRange) {
  if (!priceRange || priceRange === '') return products;
  
  const [min, max] = priceRange.split('-').map(Number);
  return products.filter((p) => p.price >= min && p.price <= max);
}

// ============== FUNCIONES DE CONFIRMACIÓN ==============

/**
 * Abre un modal de confirmación reutilizable. Requiere un elemento
 * <modal-dialog id="confirmModal"> presente en el DOM (dashboard.html).
 * @param {string} message - Mensaje a mostrar en el modal.
 * @returns {Promise<boolean>} Resuelve true si el usuario confirma, false si cancela.
 */
export function confirmDeletion(message) {
  return new Promise((resolve) => {
    const modal = document.getElementById('confirmModal');
    if (!modal) {
      // Fallback a window.confirm si no existe el modal.
      resolve(window.confirm(message));
      return;
    }

    modal.setTitle('Confirmar eliminación');
    modal.innerHTML = `
      <div class="confirm-body">
        <p>${message}</p>
        <div class="modal-actions">
          <button id="confirmYes" class="btn btn-danger">Sí, eliminar</button>
          <button id="confirmNo" class="btn btn-secondary">Cancelar</button>
        </div>
      </div>
    `;

    const yes = modal.querySelector('#confirmYes');
    const no = modal.querySelector('#confirmNo');

    const cleanup = () => {
      if (yes) yes.removeEventListener('click', onYes);
      if (no) no.removeEventListener('click', onNo);
      modal.close();
    };

    const onYes = () => { cleanup(); resolve(true); };
    const onNo = () => { cleanup(); resolve(false); };

    yes.addEventListener('click', onYes);
    no.addEventListener('click', onNo);
    modal.open();
  });
}
