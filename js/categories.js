/**
 * categories.js
 * Módulo CRUD de categorías para el panel administrativo.
 *
 * Responsabilidades:
 *  - Renderizar la tabla de categorías con los datos de localStorage.
 *  - Abrir un modal con formulario para crear o editar una categoría.
 *  - Validar los campos del formulario antes de guardar.
 *  - Guardar, actualizar o eliminar categorías en localStorage.
 *  - Mostrar confirmación de eliminación directamente en la fila de la tabla
 *    (sin usar window.confirm).
 */

import { loadCategories, saveCategories } from './storage.js';
import { categories as defaultCategories } from './products.js';
import { confirmDeletion } from './ui.js';

const categoryTableBody = document.getElementById('categoryTableBody');
const addCategoryButton = document.getElementById('addCategoryButton');
const modalDialog       = document.getElementById('categoryModal');
const modalContent      = document.getElementById('categoryModalContent');

/**
 * Genera un ID limpio a partir del nombre de la categoría.
 * Convierte a minúsculas, reemplaza espacios por guiones y elimina
 * caracteres especiales. Ej: "Camisas Premium" → "camisas-premium"
 * @param {string} value
 * @returns {string}
 */
function createId(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

/**
 * Retorna las categorías guardadas en localStorage, excluyendo la
 * categoría especial 'all' que solo se usa en el filtro del e-commerce.
 * @returns {Array}
 */
function getCategories() {
  return loadCategories(defaultCategories).filter((c) => c.id !== 'all');
}

/** Guarda el arreglo de categorías en localStorage. */
function persist(categories) {
  saveCategories(categories);
}

/**
 * Renderiza la tabla de categorías en el dashboard.
 * Cada fila muestra un badge con la inicial, el nombre, la descripción
 * y los botones de editar y eliminar.
 * Si no hay categorías, muestra una fila con mensaje de estado vacío.
 */
function renderCategories() {
  const categories = getCategories();
  categoryTableBody.innerHTML = '';

  if (!categories.length) {
    categoryTableBody.innerHTML = `
      <tr><td colspan="3" class="table-empty">No hay categorías registradas.</td></tr>
    `;
    return;
  }

  categories.forEach((cat) => {
    const row = document.createElement('tr');
    row.dataset.id = cat.id; // Guardamos el id en el dataset para identificar la fila.
    row.innerHTML = `
      <td><span class="cat-badge">${cat.name.charAt(0).toUpperCase()}</span> ${cat.name}</td>
      <td class="td-muted">${cat.description}</td>
      <td class="td-actions">
        <button class="table-action" data-action="edit" data-id="${cat.id}">Editar</button>
        <button class="table-action danger" data-action="delete" data-id="${cat.id}">Eliminar</button>
      </td>
    `;
    categoryTableBody.appendChild(row);
  });
}

/**
 * Abre el modal con el formulario de categoría.
 * Si se pasa un objeto category, el formulario se pre-llena para edición.
 * Si no se pasa nada, el formulario aparece vacío para crear una nueva categoría.
 * @param {Object|null} category - Categoría a editar, o null para crear.
 */
function openCategoryModal(category = null) {
  const isEdit = Boolean(category);
  modalDialog.setTitle(isEdit ? 'Editar categoría' : 'Nueva categoría');
  modalContent.innerHTML = `
    <form id="categoryForm" class="modal-form" novalidate>
      <div class="field-group">
        <label for="categoryName">Nombre</label>
        <input id="categoryName" name="name" type="text"
          value="${category ? category.name : ''}" required placeholder="Ej: Camisetas">
        <span class="admin-field-error">El nombre es obligatorio.</span>
      </div>
      <div class="field-group">
        <label for="categoryDescription">Descripción</label>
        <textarea id="categoryDescription" name="description" rows="3"
          required placeholder="Describe brevemente esta categoría...">${category ? category.description : ''}</textarea>
        <span class="admin-field-error">La descripción es obligatoria.</span>
      </div>
      <div class="modal-actions">
        <button type="button" class="btn btn-secondary" id="cancelCategory">Cancelar</button>
        <button type="submit" class="btn btn-primary">${isEdit ? 'Guardar cambios' : 'Crear categoría'}</button>
      </div>
    </form>
  `;

  modalContent.querySelector('#cancelCategory').addEventListener('click', () => modalDialog.close());
  modalContent.querySelector('#categoryForm').addEventListener('submit', (e) => {
    e.preventDefault();
    handleSubmit(category);
  });

  modalDialog.open();
}

/**
 * Procesa el envío del formulario de categoría.
 * Valida que todos los campos requeridos estén llenos.
 * Si es edición, actualiza la categoría existente.
 * Si es creación, verifica que el ID no esté duplicado y agrega la nueva categoría.
 * @param {Object|null} existing - Categoría existente (edición) o null (creación).
 */
function handleSubmit(existing) {
  const form = document.getElementById('categoryForm');
  const name = form.name.value.trim();
  const description = form.description.value.trim();
  let valid = true;

  // Marca visualmente los campos vacíos como inválidos.
  form.querySelectorAll('[required]').forEach((el) => {
    const group = el.closest('.field-group');
    const empty = !el.value.trim();
    group.classList.toggle('admin-field-invalid', empty);
    if (empty) valid = false;
  });

  if (!valid) return;

  const categories = getCategories();
  const id = createId(name);

  if (existing) {
    // Actualiza la categoría manteniendo el mismo índice en el arreglo.
    persist(categories.map((c) => c.id === existing.id ? { ...c, id, name, description } : c));
  } else {
    if (categories.some((c) => c.id === id)) return; // Evita IDs duplicados.
    persist([...categories, { id, name, description }]);
  }

  renderCategories();
  modalDialog.close();
}

/**
 * Maneja los clics en los botones de acción de la tabla (editar, eliminar).
 * Para eliminar, abre un modal de confirmación.
 * @param {Event} e
 */
function handleTableClick(e) {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;

  const { action, id } = btn.dataset;
  const cat = getCategories().find((c) => c.id === id);
  if (!cat) return;

  if (action === 'edit') {
    openCategoryModal(cat);
    return;
  }

  if (action === 'delete') {
    confirmDeletion(`¿Deseas eliminar la categoría "${cat.name}"?`).then((confirmed) => {
      if (confirmed) {
        persist(getCategories().filter((c) => c.id !== id));
        renderCategories();
      }
    });
  }
}

/**
 * Inicializa el módulo de categorías.
 * Conecta el botón "Nueva categoría" y el delegado de eventos de la tabla.
 * Llamado desde dashboard.js al cargar el panel.
 */
export function initCategoryModule() {
  addCategoryButton.addEventListener('click', () => openCategoryModal());
  categoryTableBody.addEventListener('click', handleTableClick);
  renderCategories();
}
