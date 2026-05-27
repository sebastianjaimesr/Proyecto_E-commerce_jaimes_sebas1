/**
 * dashboard.js
 * Controla la página principal del panel administrativo (dashboard.html).
 *
 * Responsabilidades:
 *  - Verificar que haya una sesión activa al cargar la página.
 *    Si no hay sesión, redirige al login (admin.html).
 *  - Mostrar las métricas del sistema: total de productos, categorías y pedidos.
 *  - Mostrar la fecha y hora del último inicio de sesión.
 *  - Inicializar los módulos de categorías, productos y pedidos.
 *  - Manejar el cierre de sesión.
 */

import { loadSession, clearSession, loadCategories, loadProducts, loadOrders } from './storage.js';
import { categories as defaultCategories } from './products.js';
import { initCategoryModule } from './categories.js';
import { initProductModule } from './products-admin.js';
import { initOrdersModule } from './orders-admin.js';

const productCountElement  = document.getElementById('productCount');
const categoryCountElement = document.getElementById('categoryCount');
const orderCountElement    = document.getElementById('orderCount');
const lastSessionText      = document.getElementById('lastSessionText');
const logoutButton         = document.getElementById('logoutButton');

/**
 * Verifica si hay una sesión de administrador activa en sessionStorage.
 * Si no la hay, redirige inmediatamente al login para proteger el dashboard.
 * @returns {Object|null} Objeto de sesión o null si no hay sesión.
 */
function checkSession() {
  const session = loadSession();
  if (!session) { window.location.href = 'admin.html'; return null; }
  return session;
}

/**
 * Actualiza las tarjetas de métricas con los datos reales de localStorage:
 *  - Cantidad de productos registrados.
 *  - Cantidad de categorías (excluyendo la categoría especial 'all').
 *  - Cantidad de pedidos realizados.
 *  - Fecha y hora del último inicio de sesión del administrador.
 *
 * @param {Object} session - Objeto de sesión con la propiedad loggedAt (ISO string).
 */
function renderDashboard(session) {
  const orders     = loadOrders();
  const categories = loadCategories(defaultCategories).filter((c) => c.id !== 'all');
  const products   = loadProducts();

  productCountElement.textContent  = products.length;
  categoryCountElement.textContent = categories.length;
  orderCountElement.textContent    = orders.length;

  // Formatea la fecha de la sesión en español con día, mes, año, hora y minutos.
  lastSessionText.textContent = `Última sesión: ${new Date(session.loggedAt).toLocaleString('es-ES', {
    day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })}`;
}

/**
 * Inicializa el dashboard:
 *  1. Verifica la sesión (redirige si no hay).
 *  2. Renderiza las métricas.
 *  3. Inicializa los módulos CRUD de categorías, productos y pedidos.
 *  4. Conecta el botón de cerrar sesión.
 */
function init() {
  const session = checkSession();
  if (!session) return;

  renderDashboard(session);
  initCategoryModule();  // Tabla de categorías con CRUD.
  initProductModule();   // Tabla de productos con CRUD.
  initOrdersModule();    // Tabla de pedidos con vista de detalle.

  // Al cerrar sesión: elimina la sesión de sessionStorage y redirige al login.
  logoutButton.addEventListener('click', () => {
    clearSession();
    window.location.href = 'admin.html';
  });
}

window.addEventListener('DOMContentLoaded', init);
