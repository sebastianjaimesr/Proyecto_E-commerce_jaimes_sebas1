/**
 * app.js
 * Punto de entrada de la página principal del e-commerce (index.html).
 *
 * Responsabilidades:
 *  - Poblar el select de categorías con los datos de localStorage.
 *  - Conectar las tarjetas de categorías para que actúen como filtros.
 *  - Aplicar filtros de búsqueda por texto y por categoría.
 *  - Mostrar el conteo real de productos por categoría en las cards.
 *  - Renderizar la grilla de productos al cargar la página.
 */

import { categories as defaultCategories, products as defaultProducts } from './products.js';
import { filterProducts, renderProducts, updateCartBadge } from './ui.js';
import { loadCategories, loadProducts } from './storage.js';

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categorySelect = document.getElementById('categorySelect');

/** Retorna los productos guardados en localStorage o los productos por defecto. */
function getProducts() {
  return loadProducts(defaultProducts);
}

/**
 * Llena el <select> de categorías con las opciones guardadas en localStorage.
 * Siempre incluye "Todas las categorías" como primera opción (valor 'all').
 */
function populateCategoryOptions() {
  const saved = loadCategories(defaultCategories);
  [{ id: 'all', name: 'Todas las categorías' }, ...saved.filter((c) => c.id !== 'all')]
    .forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = c.name;
      categorySelect.appendChild(opt);
    });
}

/**
 * Marca visualmente la tarjeta de categoría que corresponde al filtro activo.
 * Agrega la clase 'active' a la card cuyo data-category-id coincide con el id.
 * @param {string} id - ID de la categoría activa.
 */
function setActiveCategoryCard(id) {
  document.querySelectorAll('.category-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.categoryId === id);
  });
}

/**
 * Lee los valores actuales del buscador y del select de categoría,
 * filtra los productos y los renderiza en la grilla.
 * También actualiza la card activa y hace scroll suave a la sección
 * de productos cuando se selecciona una categoría específica.
 */
function applyFilters() {
  const query = searchInput.value;
  const category = categorySelect.value;
  renderProducts(filterProducts(getProducts(), query, category), productGrid);
  setActiveCategoryCard(category);
  if (category !== 'all') {
    document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' });
  }
}

/**
 * Conecta cada tarjeta de categoría (.category-card) con el filtro.
 * Al hacer clic en una card, actualiza el valor del select y aplica el filtro,
 * logrando que las cards y el select estén siempre sincronizados.
 */
function setupCategoryCards() {
  document.querySelectorAll('.category-card').forEach((card) => {
    card.style.cursor = 'pointer';
    card.addEventListener('click', () => {
      const id = card.dataset.categoryId;
      if (!id) return;
      categorySelect.value = id;
      applyFilters();
    });
  });
}

/**
 * Actualiza el texto de conteo de productos en cada tarjeta de categoría.
 * Cuenta cuántos productos del catálogo pertenecen a cada categoría
 * y actualiza el elemento .category-count de cada card.
 * Se llama al iniciar para reflejar los datos reales de localStorage.
 */
function updateCategoryCounts() {
  const products = getProducts();
  document.querySelectorAll('.category-card[data-category-id]').forEach((card) => {
    const count = products.filter((p) => p.category === card.dataset.categoryId).length;
    const el = card.querySelector('.category-count');
    if (el) el.textContent = `${count} producto${count !== 1 ? 's' : ''}`;
  });
}

/** Inicializa todos los módulos de la página principal. */
function init() {
  populateCategoryOptions();
  searchInput.addEventListener('input', applyFilters);
  categorySelect.addEventListener('change', applyFilters);
  setupCategoryCards();
  updateCategoryCounts();
  renderProducts(getProducts(), productGrid);
  updateCartBadge();
}

window.addEventListener('DOMContentLoaded', init);
