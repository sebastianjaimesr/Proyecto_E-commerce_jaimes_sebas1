/**
 * products-admin.js
 * Módulo CRUD de productos para el panel administrativo.
 *
 * Responsabilidades:
 *  - Renderizar la tabla de productos con imagen miniatura, nombre,
 *    categoría, precio y acciones.
 *  - Abrir un modal con formulario para crear o editar un producto.
 *  - Mostrar una vista previa de la imagen en tiempo real al ingresar la URL.
 *  - Validar los campos requeridos antes de guardar.
 *  - Guardar, actualizar o eliminar productos en localStorage.
 *  - Mostrar confirmación de eliminación inline en la fila de la tabla.
 */

import { loadCategories, loadProducts, saveProducts } from './storage.js';
import { categories as defaultCategories, products as defaultProducts } from './products.js';
import { confirmDeletion } from './ui.js';

const productTableBody    = document.getElementById('productTableBody');
const addProductButton    = document.getElementById('addProductButton');
const productModal        = document.getElementById('productModal');
const productModalContent = document.getElementById('productModalContent');

/**
 * Genera un ID limpio a partir del código del producto.
 * Ej: "CAM-001" → "cam-001"
 * @param {string} value
 * @returns {string}
 */
function createId(value) {
  return String(value).trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Retorna las categorías disponibles para el selector del formulario,
 * excluyendo la categoría especial 'all'.
 * @returns {Array}
 */
function getCategories() {
  return loadCategories(defaultCategories).filter((c) => c.id !== 'all');
}

/**
 * Retorna los productos guardados en localStorage.
 * Si no hay ninguno, usa los productos por defecto de products.js.
 * @returns {Array}
 */
function getProducts() {
  return loadProducts(defaultProducts);
}

/**
 * Busca un producto por su ID en el catálogo actual.
 * @param {string} id
 * @returns {Object|undefined}
 */
function getProductById(id) {
  return getProducts().find((p) => p.id === id);
}

/**
 * Renderiza la tabla de productos en el dashboard.
 * Cada fila muestra: código, nombre, categoría con badge, precio,
 * imagen miniatura y botones de editar/eliminar.
 * Si no hay productos, muestra una fila con mensaje de estado vacío.
 */
function renderProducts() {
  const products = getProducts();
  productTableBody.innerHTML = '';

  if (!products.length) {
    productTableBody.innerHTML = `<tr><td colspan="6" class="table-empty">No hay productos registrados.</td></tr>`;
    return;
  }

  products.forEach((p) => {
    const row = document.createElement('tr');
    row.dataset.id = p.id;
    row.innerHTML = `
      <td class="td-muted">${p.id}</td>
      <td><strong>${p.name}</strong></td>
      <td><span class="cat-badge">${p.category.charAt(0).toUpperCase()}</span> ${p.category}</td>
      <td><strong class="price-cell">$${Number(p.price).toFixed(2)}</strong></td>
      <td>${p.image ? `<img src="${p.image}" alt="${p.name}" class="product-thumb">` : '<span class="td-muted">—</span>'}</td>
      <td class="td-actions">
        <button class="table-action" data-action="edit" data-id="${p.id}">Editar</button>
        <button class="table-action danger" data-action="delete" data-id="${p.id}">Eliminar</button>
      </td>
    `;
    productTableBody.appendChild(row);
  });
}

/**
 * Abre el modal con el formulario de producto.
 * El formulario tiene dos secciones:
 *  - Izquierda: vista previa de la imagen (se actualiza en tiempo real).
 *  - Derecha: campos del producto en un layout de grilla.
 *
 * Si se pasa un objeto product, el formulario se pre-llena para edición
 * y el campo de código queda en modo solo lectura.
 * Si no se pasa nada, el formulario aparece vacío para crear un nuevo producto.
 *
 * @param {Object|null} product - Producto a editar, o null para crear.
 */
function openProductModal(product = null) {
  const isEdit = Boolean(product);
  const categories = getCategories();

  productModal.setTitle(isEdit ? 'Editar producto' : 'Nuevo producto');
  productModalContent.innerHTML = `
    <form id="productForm" class="modal-form product-form" novalidate>

      <div class="product-form-preview">
        <img id="imagePreview" src="${product?.image || ''}"
          alt="Vista previa"
          style="${product?.image ? '' : 'display:none'}">
        <span id="imagePreviewEmpty" class="image-preview-empty"
          style="${product?.image ? 'display:none' : ''}">Vista previa de imagen</span>
      </div>

      <div class="product-form-fields">
        <div class="form-row-2">
          <div class="field-group">
            <label for="productCode">Código</label>
            <input id="productCode" name="code" type="text"
              value="${product ? product.id : ''}" required placeholder="Ej: CAM-001"
              ${isEdit ? 'readonly' : ''}>
            <span class="admin-field-error">Campo obligatorio.</span>
          </div>
          <div class="field-group">
            <label for="productPrice">Precio</label>
            <input id="productPrice" name="price" type="number" min="0" step="0.01"
              value="${product ? product.price : ''}" required placeholder="Ej: 52.00">
            <span class="admin-field-error">Campo obligatorio.</span>
          </div>
        </div>

        <div class="field-group">
          <label for="productName">Nombre</label>
          <input id="productName" name="name" type="text"
            value="${product ? product.name : ''}" required placeholder="Ej: Camiseta Helios Black">
          <span class="admin-field-error">Campo obligatorio.</span>
        </div>

        <div class="field-group">
          <label for="productCategory">Categoría</label>
          <select id="productCategory" name="category" required>
            <option value="">Selecciona una categoría</option>
            ${categories.map((c) => `
              <option value="${c.id}" ${product?.category === c.id ? 'selected' : ''}>${c.name}</option>
            `).join('')}
          </select>
          <span class="admin-field-error">Selecciona una categoría.</span>
        </div>

        <div class="field-group">
          <label for="productImage">URL de imagen</label>
          <input id="productImage" name="image" type="url"
            value="${product ? product.image : ''}" placeholder="https://...">
        </div>

        <div class="field-group">
          <label for="productDescription">Descripción</label>
          <textarea id="productDescription" name="description" rows="3"
            required placeholder="Breve descripción del producto...">${product ? product.description : ''}</textarea>
          <span class="admin-field-error">Campo obligatorio.</span>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn btn-secondary" id="cancelProduct">Cancelar</button>
          <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar cambios' : 'Agregar producto'}</button>
        </div>
      </div>
    </form>
  `;

  // Vista previa de imagen en tiempo real: actualiza la imagen al escribir la URL.
  const imageInput  = productModalContent.querySelector('#productImage');
  const preview     = productModalContent.querySelector('#imagePreview');
  const previewEmpty = productModalContent.querySelector('#imagePreviewEmpty');

  imageInput.addEventListener('input', () => {
    const url = imageInput.value.trim();
    if (url) {
      preview.src = url;
      preview.style.display = 'block';
      previewEmpty.style.display = 'none';
    } else {
      preview.style.display = 'none';
      previewEmpty.style.display = '';
    }
  });

  productModalContent.querySelector('#cancelProduct').addEventListener('click', () => productModal.close());
  productModalContent.querySelector('#productForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(product);
  });

  productModal.open();
}

/**
 * Procesa el envío del formulario de producto.
 * Valida todos los campos requeridos y marca los inválidos visualmente.
 * Si es edición, reemplaza el producto existente en el arreglo.
 * Si es creación, verifica que el código no esté duplicado y agrega el producto.
 * @param {Object|null} existing - Producto existente (edición) o null (creación).
 */
function handleSubmit(existing) {
  const form = document.getElementById('productForm');
  let valid = true;

  form.querySelectorAll('[required]').forEach((el) => {
    const group = el.closest('.field-group');
    const empty = !el.value.trim();
    group.classList.toggle('admin-field-invalid', empty);
    if (empty) valid = false;
  });

  if (!valid) return;

  const fd = new FormData(form);
  const code        = fd.get('code').trim();
  const name        = fd.get('name').trim();
  const category    = fd.get('category').trim();
  const price       = parseFloat(fd.get('price'));
  const image       = fd.get('image').trim();
  const description = fd.get('description').trim();
  const id          = createId(code);
  const products    = getProducts();

  if (existing) {
    saveProducts(products.map((p) =>
      p.id === existing.id ? { id, code, name, category, price, image, description } : p
    ));
  } else {
    if (products.some((p) => p.id === id)) return; // Evita códigos duplicados.
    saveProducts([...products, { id, code, name, category, price, image, description }]);
  }

  renderProducts();
  productModal.close();
}

/**
 * Maneja los clics en los botones de acción de la tabla.
 * Para eliminar, abre un modal de confirmación.
 * @param {Event} e
 */
function handleTableClick(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;
  const product = getProductById(id);

  if (action === 'edit' && product) {
    openProductModal(product);
    return;
  }

  if (action === 'delete' && product) {
    confirmDeletion(`¿Deseas eliminar el producto "${product.name}"?`).then((confirmed) => {
      if (confirmed) {
        saveProducts(getProducts().filter((p) => p.id !== id));
        renderProducts();
      }
    });
  }
}

/**
 * Inicializa el módulo de productos.
 * Conecta el botón "Nuevo producto" y el delegado de eventos de la tabla.
 * Llamado desde dashboard.js al cargar el panel.
 */
export function initProductModule() {
  addProductButton.addEventListener('click', () => openProductModal());
  productTableBody.addEventListener('click', handleTableClick);
  renderProducts();
}
