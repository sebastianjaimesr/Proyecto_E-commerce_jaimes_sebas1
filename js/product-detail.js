/**
 * product-detail.js
 * Controla la página de detalle de un producto individual (product.html).
 *
 * Lee el parámetro 'id' de la URL para identificar qué producto mostrar.
 * Busca el producto en localStorage (o en los datos por defecto) y
 * renderiza su imagen, nombre, precio, descripción y botón de agregar al carrito.
 * Si el id no existe o no se encuentra el producto, muestra un mensaje de error.
 */

import { loadProducts } from './storage.js';
import { products as defaultProducts } from './products.js';
import { addToCart, updateCartBadge } from './ui.js';

const productImageCard = document.getElementById('productImageCard');
const productInfoCard = document.getElementById('productInfoCard');

/**
 * Lee el parámetro 'id' de la query string de la URL actual.
 * Ejemplo: product.html?id=undr-camisa-01 → retorna 'undr-camisa-01'
 * @returns {string|null}
 */
function getProductId() {
  return new URLSearchParams(window.location.search).get('id');
}

/**
 * Busca un producto por su id en los productos guardados en localStorage.
 * Si localStorage está vacío, usa los productos por defecto de products.js.
 * @param {string} id - ID del producto a buscar.
 * @returns {Object|undefined}
 */
function findProductById(id) {
  return loadProducts(defaultProducts).find((p) => p.id === id);
}

/**
 * Renderiza el mensaje de "producto no encontrado" en ambas columnas
 * de la página de detalle, con un enlace para volver a la tienda.
 */
function renderNotFound() {
  productImageCard.innerHTML = `
    <div class="detail-card">
      <p class="section-text">Producto no encontrado.</p>
      <a class="btn btn-secondary" href="index.html">Volver a la tienda</a>
    </div>
  `;
  productInfoCard.innerHTML = '';
}

/**
 * Renderiza la imagen del producto en la columna izquierda
 * y la información (nombre, precio, descripción, acciones) en la derecha.
 * Conecta el botón "Agregar al carrito" con la función addToCart de ui.js.
 * @param {Object} product - Objeto producto a renderizar.
 */
function renderProduct(product) {
  // Columna izquierda: imagen del producto.
  productImageCard.innerHTML = `
    <div class="detail-image">
      <img src="${product.image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80'}"
           alt="${product.name}">
    </div>
  `;

  // Columna derecha: información y acciones.
  productInfoCard.innerHTML = `
    <p class="section-kicker">Colección UNDERGOLD</p>
    <h1>${product.name}</h1>
    <p class="detail-price">$${product.price}</p>
    <p class="section-text detail-description">${product.description}</p>
    <div class="detail-actions">
      <button id="addToCartButton" class="btn btn-primary">Agregar al carrito</button>
      <a class="btn btn-secondary" href="index.html">Seguir comprando</a>
    </div>
  `;

  // Al hacer clic en "Agregar al carrito", agrega el producto y notifica al usuario.
  document.getElementById('addToCartButton').addEventListener('click', () => {
    addToCart(product);
    window.alert(`Agregaste ${product.name} al carrito.`);
  });
}

/**
 * Punto de entrada de la página.
 * Lee el id de la URL, busca el producto y lo renderiza.
 * Si no hay id o no se encuentra el producto, muestra el estado de error.
 */
function init() {
  const id = getProductId();
  if (!id) { renderNotFound(); return; }

  const product = findProductById(id);
  if (!product) { renderNotFound(); return; }

  renderProduct(product);
  updateCartBadge(); // Sincroniza el contador del carrito en el navbar.
}

window.addEventListener('DOMContentLoaded', init);
