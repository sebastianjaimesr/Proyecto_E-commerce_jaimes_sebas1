/**
 * history.js
 * Módulo para mostrar el historial de compras del cliente.
 *
 * Responsabilidades:
 *  - Cargar pedidos de localStorage (orden: más reciente a más antiguo).
 *  - Renderizar cada pedido como una tarjeta con resumen.
 *  - Abrir modal con detalle completo al hacer clic en un pedido.
 */

import { loadOrders } from './storage.js';
import { updateCartBadge } from './ui.js';

const historyContainer = document.getElementById('historyContainer');
const modal = document.getElementById('historyDetailModal');
const modalContent = document.getElementById('historyDetailContent');

/**
 * Formatea un número como precio.
 */
function formatPrice(value) {
  return `$${Number(value).toFixed(2)}`;
}

/**
 * Retorna la fecha del pedido formateada.
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

/**
 * Extrae datos del cliente según el esquema.
 */
const getClientName = (o) => o.cliente?.nombre || o.customerName || 'Sin nombre';
const getOrderItems = (o) => o.productos || o.items || [];

/**
 * Abre un modal con el detalle completo del pedido.
 */
function openOrderDetail(order) {
  const items = getOrderItems(order);
  const subtotal = order.subtotal ?? order.total ?? 0;
  const envio = order.envio ?? 0;
  const total = order.total ?? subtotal + envio;

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

  modalContent.innerHTML = `
    <div class="order-detail">
      <p class="order-detail-date">📅 ${getOrderDate(order)}</p>

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

  modal.setTitle(`Pedido #${order.idPedido || order.id || '—'}`);
  modal.open();
}

/**
 * Renderiza el historial de compras.
 */
function renderHistory() {
  const orders = loadOrders();
  historyContainer.innerHTML = '';

  if (!orders.length) {
    historyContainer.innerHTML = `
      <div class="detail-card">
        <p class="section-text">Aún no tienes pedidos. 🛍️</p>
        <a class="btn btn-secondary" href="index.html">Ir a la tienda</a>
      </div>
    `;
    return;
  }

  // Ordena de más reciente a más antiguo
  const sorted = orders.slice().sort((a, b) => {
    const ta = a.idPedido || new Date(a.createdAt).getTime() || 0;
    const tb = b.idPedido || new Date(b.createdAt).getTime() || 0;
    return tb - ta;
  });

  sorted.forEach((order) => {
    const items = getOrderItems(order);
    const card = document.createElement('div');
    card.className = 'detail-card history-order-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="history-order-header">
        <div>
          <p class="history-order-id">Pedido #${order.idPedido || order.id || '—'}</p>
          <p class="history-order-date">${getOrderDate(order)}</p>
        </div>
        <div class="history-order-total">
          <p class="history-order-amount">${formatPrice(order.total ?? 0)}</p>
          <p class="history-order-items">${items.length} producto${items.length !== 1 ? 's' : ''}</p>
        </div>
      </div>
      <div class="history-order-items-preview">
        ${items.slice(0, 3).map((i) => `<span class="badge">${i.name}</span>`).join('')}
        ${items.length > 3 ? `<span class="badge">+${items.length - 3} más</span>` : ''}
      </div>
      <p class="history-order-customer">Cliente: ${getClientName(order)}</p>
    `;

    card.addEventListener('click', () => openOrderDetail(order));
    historyContainer.appendChild(card);
  });
}

window.addEventListener('DOMContentLoaded', () => {
  renderHistory();
  updateCartBadge();
});
