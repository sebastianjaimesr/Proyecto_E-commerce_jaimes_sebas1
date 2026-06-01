/**
 * orders-admin.js
 * Módulo de visualización de pedidos para el panel administrativo.
 *
 * Responsabilidades:
 *  - Cargar y ordenar los pedidos de más reciente a más antiguo.
 *  - Renderizar la tabla de pedidos con los datos del cliente y el total.
 *  - Abrir un modal con el detalle completo de cada pedido:
 *    datos del cliente, lista de productos comprados y resumen de precios.
 *
 * Compatible con dos esquemas de pedido:
 *  - Esquema nuevo: { idPedido, fecha, cliente: { nombre, ... }, productos, subtotal, envio, total }
 *  - Esquema viejo: { id, createdAt, customerName, items, total } (pedidos anteriores)
 */

import { loadOrders } from './storage.js';

const orderTableBody    = document.getElementById('orderTableBody');
const orderModal        = document.getElementById('orderModal');
const orderModalContent = document.getElementById('orderModalContent');

/**
 * Formatea un número como precio con símbolo y dos decimales.
 * @param {number} value
 * @returns {string} Ej: "$52.00"
 */
function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

/**
 * Retorna la fecha del pedido como cadena legible.
 * Soporta el campo 'fecha' (esquema nuevo, ya formateado)
 * y el campo 'createdAt' (esquema viejo, ISO string) convirtiéndolo al formato
 * "DD/MM/AAAA - H:MM AM/PM".
 * @param {Object} order
 * @returns {string}
 */
function getOrderDate(order) {
  if (order.fecha) return order.fecha;
  if (order.createdAt) {
    const d = new Date(order.createdAt);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    let h = d.getHours();
    const min = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${dd}/${mm}/${yyyy} - ${h}:${min} ${ampm}`;
  }
  return '—';
}

// Funciones de compatibilidad: leen el campo correcto según el esquema del pedido.
const getClientName    = (o) => o.cliente?.nombre       || o.customerName    || 'Sin nombre';
const getClientPhone   = (o) => o.cliente?.telefono     || o.customerPhone   || '—';
const getClientAddress = (o) => o.cliente?.direccion    || o.customerAddress || '—';
const getClientEmail   = (o) => o.cliente?.email        || o.customerEmail   || '—';
const getClientId      = (o) => o.cliente?.identificacion || o.customerId    || '—';
const getOrderItems    = (o) => o.productos || o.items  || [];

/**
 * Construye y muestra el modal de detalle de un pedido.
 * El modal tiene tres secciones:
 *  1. Fecha del pedido.
 *  2. Datos del cliente (identificación, nombre, dirección, teléfono, email).
 *  3. Lista de productos comprados con imagen, nombre, precio × cantidad y subtotal.
 *  4. Resumen de precios (subtotal, envío, total).
 *
 * @param {Object} order - Objeto pedido completo.
 */
function openOrderDetail(order) {
  const items    = getOrderItems(order);
  const subtotal = order.subtotal ?? order.total ?? 0;
  const envio    = order.envio ?? 0;
  const total    = order.total ?? subtotal + envio;

  const productsMarkup = items.map((item) => {
    const img = item.image || 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=80&q=80';
    return `
      <div class="order-detail-item">
        <img src="${img}" alt="${item.name}">
        <div class="order-detail-item-info">
          <p class="order-detail-item-name">${item.name}</p>
          <p class="order-detail-item-meta">${formatPrice(item.price)} &times; ${item.quantity}</p>
        </div>
        <p class="order-detail-item-sub">${formatPrice(item.price * item.quantity)}</p>
      </div>
    `;
  }).join('');

  orderModalContent.innerHTML = `
    <div class="order-detail">
      <p class="order-detail-date">📅 ${getOrderDate(order)}</p>

      <div class="order-detail-section">
        <p class="order-detail-label">Datos del cliente</p>
        <div class="order-detail-client">
          <div class="order-detail-row"><span>Identificación</span><span>${getClientId(order)}</span></div>
          <div class="order-detail-row"><span>Nombre</span><span>${getClientName(order)}</span></div>
          <div class="order-detail-row"><span>Dirección</span><span>${getClientAddress(order)}</span></div>
          <div class="order-detail-row"><span>Teléfono</span><span>${getClientPhone(order)}</span></div>
          <div class="order-detail-row"><span>Email</span><span>${getClientEmail(order)}</span></div>
        </div>
      </div>

      <div class="order-detail-section">
        <p class="order-detail-label">Productos</p>
        <div class="order-detail-items">${productsMarkup}</div>
      </div>

      <div class="order-detail-totals">
        <div class="order-detail-row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
        <div class="order-detail-row"><span>Envío</span><span>${envio === 0 ? 'Gratis' : formatPrice(envio)}</span></div>
        <div class="order-detail-row order-detail-total-final">
          <strong>Total</strong><strong>${formatPrice(total)}</strong>
        </div>
      </div>
    </div>
  `;

  orderModal.setTitle(`Pedido #${order.idPedido || order.id || '—'}`);
  orderModal.open();
}

/**
 * Carga los pedidos de localStorage, los ordena de más reciente a más antiguo
 * y los renderiza en la tabla.
 *
 * El ordenamiento usa idPedido (timestamp numérico) para pedidos nuevos
 * o createdAt (ISO string) para pedidos del esquema viejo.
 *
 * Cada fila muestra: ID, fecha, nombre del cliente, teléfono, dirección,
 * total, cantidad de productos y botón "Ver detalle".
 *
 * Guarda el arreglo ordenado en orderTableBody._sorted para que el
 * handler de clics pueda acceder al pedido correcto por índice.
 */
function renderOrders() {
  const orders = loadOrders();
  orderTableBody.innerHTML = '';

  if (!orders.length) {
    orderTableBody.innerHTML = '<tr><td colspan="8" class="table-empty">No hay pedidos aún.</td></tr>';
    return;
  }

  const sorted = orders.slice().sort((a, b) => {
    const ta = a.idPedido || new Date(a.createdAt).getTime() || 0;
    const tb = b.idPedido || new Date(b.createdAt).getTime() || 0;
    return tb - ta; // Descendente: más reciente primero.
  });

  sorted.forEach((order, idx) => {
    const items = getOrderItems(order);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${order.idPedido || order.id || '—'}</td>
      <td>${getOrderDate(order)}</td>
      <td>${getClientName(order)}</td>
      <td>${getClientPhone(order)}</td>
      <td>${getClientAddress(order)}</td>
      <td>${formatPrice(order.total ?? 0)}</td>
      <td>${items.length} producto${items.length !== 1 ? 's' : ''}</td>
      <td><button class="table-action" data-action="detail" data-idx="${idx}">Ver detalle</button></td>
    `;
    orderTableBody.appendChild(row);
  });

  // Guardamos la referencia al arreglo ordenado para usarla en el click handler.
  orderTableBody._sorted = sorted;
}

/**
 * Maneja el clic en el botón "Ver detalle" de cada fila.
 * Usa el índice guardado en data-idx para encontrar el pedido
 * en el arreglo ordenado y abre el modal de detalle.
 * @param {Event} event
 */
function handleTableClick(event) {
  const button = event.target.closest('button[data-action="detail"]');
  if (!button) return;
  const order = orderTableBody._sorted?.[Number(button.dataset.idx)];
  if (order) openOrderDetail(order);
}

/**
 * Exporta todos los pedidos a formato CSV descargable.
 * Genera un archivo con encabezados y datos tabulados.
 * Descarga automáticamente con nombre: pedidos-AAAA-MM-DD.csv
 */
export function exportOrdersToCSV() {
  const orders = loadOrders();
  if (!orders.length) {
    alert('No hay pedidos para exportar.');
    return;
  }

  // Encabezados del CSV
  const headers = [
    'ID Pedido',
    'Fecha',
    'Cliente',
    'Identificación',
    'Teléfono',
    'Dirección',
    'Email',
    'Productos (cantidad)',
    'Subtotal',
    'Envío',
    'Total',
  ];

  // Convierte cada pedido a una fila CSV
  const rows = orders.map((order) => {
    const items = getOrderItems(order);
    const itemsText = items.map((i) => `${i.name} (x${i.quantity})`).join('; ');
    return [
      order.idPedido || order.id || '',
      getOrderDate(order),
      getClientName(order),
      getClientId(order),
      getClientPhone(order),
      getClientAddress(order),
      getClientEmail(order),
      itemsText,
      formatPrice(order.subtotal ?? order.total ?? 0).substring(1),
      formatPrice(order.envio ?? 0).substring(1),
      formatPrice(order.total ?? 0).substring(1),
    ];
  });

  // Construye el contenido CSV (escapando comillas)
  const csvContent = [
    headers.map((h) => `"${h}"`).join(','),
    ...rows.map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')),
  ].join('\n');

  // Crea un blob y descarga
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  const today = new Date().toISOString().split('T')[0]; // AAAA-MM-DD
  link.setAttribute('href', url);
  link.setAttribute('download', `pedidos-${today}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Inicializa el módulo de pedidos.
 * Conecta el delegado de eventos de la tabla, el botón exportar y renderiza los pedidos.
 * Llamado desde dashboard.js al cargar el panel.
 */
export function initOrdersModule() {
  orderTableBody.addEventListener('click', handleTableClick);
  const exportBtn = document.getElementById('exportOrdersButton');
  if (exportBtn) exportBtn.addEventListener('click', exportOrdersToCSV);
  renderOrders();
}
