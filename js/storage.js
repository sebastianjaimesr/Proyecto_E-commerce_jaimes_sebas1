/**
 * storage.js
 * Capa de persistencia de la aplicación.
 * Centraliza todas las operaciones de lectura y escritura en localStorage
 * y sessionStorage, evitando que otros módulos accedan directamente al storage.
 */

// Claves únicas usadas en localStorage para cada tipo de dato.
const STORAGE_KEYS = {
  cart: 'undergold_cart',
  categories: 'undergold_categories',
  orders: 'undergold_orders',
  products: 'undergold_products',
  favorites: 'undergold_favorites',
  theme: 'undergold_theme',
  itemsPerPage: 'undergold_items_per_page',
  orderNumber: 'undergold_order_counter',
};

/**
 * Intenta parsear una cadena JSON de forma segura.
 * Si el valor es inválido o nulo, retorna un arreglo vacío
 * para evitar errores en el resto de la aplicación.
 */
function safeParse(value) {
  try {
    return JSON.parse(value) || [];
  } catch {
    return [];
  }
}

/** Lee y parsea un valor del localStorage por su clave. */
export function loadFromStorage(key) {
  return safeParse(localStorage.getItem(key));
}

/** Serializa y guarda un valor en localStorage por su clave. */
export function saveToStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

/**
 * Carga las categorías guardadas en localStorage.
 * Si no hay ninguna guardada, usa las categorías por defecto
 * definidas en products.js.
 */
export function loadCategories(defaultCategories = []) {
  const saved = loadFromStorage(STORAGE_KEYS.categories);
  return saved.length ? saved : defaultCategories;
}

/** Guarda el arreglo de categorías en localStorage. */
export function saveCategories(categories) {
  saveToStorage(STORAGE_KEYS.categories, categories);
}

/**
 * Carga los productos guardados en localStorage.
 * Si no hay ninguno guardado, usa los productos por defecto
 * definidos en products.js.
 */
export function loadProducts(defaultProducts = []) {
  const saved = loadFromStorage(STORAGE_KEYS.products);
  return saved.length ? saved : defaultProducts;
}

/** Guarda el arreglo de productos en localStorage. */
export function saveProducts(products) {
  saveToStorage(STORAGE_KEYS.products, products);
}

/** Carga todos los pedidos guardados en localStorage. */
export function loadOrders() {
  return loadFromStorage(STORAGE_KEYS.orders);
}

/** Guarda el arreglo de pedidos en localStorage. */
export function saveOrders(orders) {
  saveToStorage(STORAGE_KEYS.orders, orders);
}

/**
 * Carga la sesión del administrador desde sessionStorage.
 * Se usa sessionStorage (no localStorage) para que la sesión
 * se elimine automáticamente al cerrar el navegador.
 * Retorna null si no hay sesión activa.
 */
export function loadSession() {
  try {
    return JSON.parse(sessionStorage.getItem('undergold_admin_session')) || null;
  } catch {
    return null;
  }
}

/** Guarda el objeto de sesión del administrador en sessionStorage. */
export function saveSession(session) {
  sessionStorage.setItem('undergold_admin_session', JSON.stringify(session));
}

/** Elimina la sesión del administrador del sessionStorage (logout). */
export function clearSession() {
  sessionStorage.removeItem('undergold_admin_session');
}

/** Retorna el arreglo actual del carrito desde localStorage. */
export function getCart() {
  return loadFromStorage(STORAGE_KEYS.cart);
}

/** Reemplaza el carrito completo en localStorage con el nuevo arreglo. */
export function setCart(cart) {
  saveToStorage(STORAGE_KEYS.cart, cart);
}

// ============== FUNCIONES PARA FAVORITOS ==============

/**
 * Carga los IDs de productos marcados como favoritos.
 * @returns {Array} Arreglo de IDs de productos favoritos.
 */
export function loadFavorites() {
  return loadFromStorage(STORAGE_KEYS.favorites);
}

/**
 * Guarda los IDs de productos favoritos en localStorage.
 * @param {Array} favorites - Arreglo con IDs de productos favoritos.
 */
export function saveFavorites(favorites) {
  saveToStorage(STORAGE_KEYS.favorites, favorites);
}

/**
 * Verifica si un producto está en favoritos.
 * @param {string} productId - ID del producto.
 * @returns {boolean}
 */
export function isFavorite(productId) {
  const favorites = loadFavorites();
  return favorites.includes(productId);
}

/**
 * Agrega un producto a favoritos si no está,
 * o lo elimina si ya está (comportamiento toggle).
 * @param {string} productId - ID del producto.
 * @returns {boolean} true si se agregó, false si se eliminó.
 */
export function toggleFavorite(productId) {
  const favorites = loadFavorites();
  const index = favorites.indexOf(productId);
  if (index > -1) {
    favorites.splice(index, 1);
    saveFavorites(favorites);
    return false;
  } else {
    favorites.push(productId);
    saveFavorites(favorites);
    return true;
  }
}

// ============== FUNCIONES PARA TEMA (DARK MODE) ==============

/**
 * Carga el tema preferido del usuario ('light' o 'dark').
 * @returns {string} 'light' por defecto.
 */
export function loadTheme() {
  const saved = localStorage.getItem(STORAGE_KEYS.theme);
  return saved || 'light';
}

/**
 * Guarda la preferencia de tema del usuario.
 * @param {string} theme - 'light' o 'dark'.
 */
export function saveTheme(theme) {
  localStorage.setItem(STORAGE_KEYS.theme, theme);
}

/**
 * Alterna entre tema claro y oscuro.
 * @returns {string} El nuevo tema activo.
 */
export function toggleTheme() {
  const current = loadTheme();
  const newTheme = current === 'light' ? 'dark' : 'light';
  saveTheme(newTheme);
  return newTheme;
}

// ============== FUNCIONES PARA PAGINACIÓN ==============

/**
 * Carga la cantidad de items por página.
 * @returns {number} 6 por defecto.
 */
export function loadItemsPerPage() {
  const saved = localStorage.getItem(STORAGE_KEYS.itemsPerPage);
  return saved ? parseInt(saved, 10) : 6;
}

/**
 * Guarda la cantidad de items por página.
 * @param {number} count - Cantidad de items por página.
 */
export function saveItemsPerPage(count) {
  localStorage.setItem(STORAGE_KEYS.itemsPerPage, count.toString());
}

// ============== FUNCIONES PARA NÚMERO DE PEDIDO ==============

/**
 * Genera un número de pedido automático con formato: PED-AAAA-0001
 * @returns {string} Ej: "PED-2026-0001"
 */
export function generateOrderNumber() {
  let counter = parseInt(localStorage.getItem(STORAGE_KEYS.orderNumber) || '0', 10);
  counter += 1;
  localStorage.setItem(STORAGE_KEYS.orderNumber, counter.toString());
  const year = new Date().getFullYear();
  return `PED-${year}-${String(counter).padStart(4, '0')}`;
}
