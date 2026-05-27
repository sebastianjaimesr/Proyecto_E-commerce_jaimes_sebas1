// product-card.js
// Componente web que muestra una tarjeta de producto reutilizable.

class ProductCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.product = null;
  }

  set product(value) {
    this._product = value;
    this.render();
  }

  get product() {
    return this._product;
  }

  render() {
    if (!this._product) return;

    const imageMarkup = this._product.image
      ? `<img class="product-img" src="${this._product.image}" alt="${this._product.name}">`
      : `<div class="product-image-fallback">${this._product.name}</div>`;

    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 25px 50px rgba(15, 23, 42, 0.08);
          background: #ffffff;
          border: 1px solid rgba(15, 23, 42, 0.08);
          transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
        }

        :host(:hover) {
          transform: translateY(-4px);
          border-color: rgba(29, 78, 216, 0.24);
          box-shadow: 0 32px 70px rgba(15, 23, 42, 0.12);
        }

        .card-body {
          display: grid;
          gap: 1.2rem;
          padding: 1.5rem;
        }

        .product-img {
          width: 100%;
          aspect-ratio: 4 / 3;
          object-fit: cover;
          border-radius: 24px;
          background: #f2f4f8;
        }

        .product-title {
          margin: 0;
          font-size: 1.18rem;
          color: #101828;
        }

        .product-price {
          margin: 0.35rem 0 0;
          color: var(--accent);
          font-weight: 700;
          font-size: 1.1rem;
        }

        .product-description {
          margin: 0;
          color: var(--muted);
          line-height: 1.75;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 0.85rem;
        }

        .tag {
          display: inline-flex;
          padding: 0.55rem 0.95rem;
          border-radius: 999px;
          background: rgba(29, 78, 216, 0.08);
          color: var(--accent);
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .add-button {
          flex: 1;
          min-width: 160px;
          border: none;
          border-radius: 18px;
          padding: 0.95rem 1rem;
          background: var(--accent);
          color: #fff;
          font-weight: 700;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .detail-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.95rem 1rem;
          border-radius: 18px;
          border: 1px solid rgba(29, 78, 216, 0.18);
          background: transparent;
          color: var(--accent);
          font-weight: 700;
          text-decoration: none;
          transition: background-color 0.2s ease, transform 0.2s ease;
        }

        .detail-button:hover {
          background: rgba(29, 78, 216, 0.08);
          transform: translateY(-1px);
        }

        .add-button:hover {
          background: #1e40af;
          transform: translateY(-1px);
        }
      </style>
      <div class="card-body">
        ${imageMarkup}
        <div>
          <p class="product-title">${this._product.name}</p>
          <p class="product-price">$${this._product.price}</p>
        </div>
        <p class="product-description">${this._product.description}</p>
        <div class="actions">
          <span class="tag">${this._product.category}</span>
          <a class="detail-button" href="product.html?id=${this._product.id}">Ver detalle</a>
          <button class="add-button" type="button">Agregar al carrito</button>
        </div>
      </div>
    `;

    this.shadowRoot.querySelector('.add-button').addEventListener('click', () => {
      this.dispatchEvent(new CustomEvent('add-to-cart', { bubbles: true, composed: true }));
    });
  }
}

customElements.define('product-card', ProductCard);
