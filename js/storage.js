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
