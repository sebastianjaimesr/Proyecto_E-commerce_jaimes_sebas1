// navbar.js
// Componente de barra de navegación que incluye un contador del carrito.

const template = document.createElement('template');
template.innerHTML = `
  <style>
    :host {
      display: block;
      position: sticky;
      top: 0;
      z-index: 20;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(18px);
    }

    .navbar {
      width: min(1180px, calc(100% - 32px));
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1rem 0;
      gap: 1rem;
    }

    .logo {
      font-size: 1.1rem;
      letter-spacing: 0.3em;
      text-transform: uppercase;
      font-weight: 700;
      color: #101828;
    }

    nav {
      display: flex;
      gap: 2rem;
      justify-content: center;
      flex: 1;
    }

    .nav-link {
      color: rgba(16, 24, 40, 0.7);
      font-size: 0.95rem;
      font-weight: 600;
      transition: color 0.2s ease, transform 0.2s ease;
    }

    .nav-link:hover {
      color: #0f172a;
      transform: translateY(-1px);
    }

    .cart-button {
      display: inline-flex;
      align-items: center;
      gap: 0.8rem;
      padding: 0.85rem 1rem;
      border-radius: 999px;
      border: 1px solid rgba(29, 78, 216, 0.18);
      background: rgba(29, 78, 216, 0.08);
      color: #0f172a;
      font-weight: 600;
      transition: background-color 0.2s ease, transform 0.2s ease;
    }

    .cart-button:hover {
      transform: translateY(-1px);
      background: rgba(29, 78, 216, 0.18);
    }

    .cart-count {
      min-width: 2rem;
      padding: 0.35rem 0.6rem;
      border-radius: 999px;
      background: rgba(29, 78, 216, 0.16);
      color: #0f172a;
      text-align: center;
      font-size: 0.9rem;
    }

    @media (max-width: 820px) {
      .navbar {
        flex-wrap: wrap;
        justify-content: center;
      }

      nav {
        gap: 1rem;
        order: 3;
      }
    }
  </style>
  <div class="navbar">
    <div class="logo">UNDERGOLD</div>
    <nav>
      <a class="nav-link" href="index.html">Inicio</a>
      <a class="nav-link" href="#productos">Productos</a>
      <a class="nav-link" href="history.html">Historial</a>
      <a class="nav-link" href="dashboard.html">Admin</a>
    </nav>
    <button class="cart-button" type="button">
      Carrito
      <span class="cart-count">0</span>
    </button>
  </div>
`;

class PremiumNavbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    this.countElement = this.shadowRoot.querySelector('.cart-count');
  }

  connectedCallback() {
    window.addEventListener('cartCountUpdate', this.handleCartCount);
    this.shadowRoot.querySelector('.cart-button').addEventListener('click', this.openCartPage);
  }

  disconnectedCallback() {
    window.removeEventListener('cartCountUpdate', this.handleCartCount);
    this.shadowRoot.querySelector('.cart-button').removeEventListener('click', this.openCartPage);
  }

  openCartPage = () => {
    window.location.href = 'cart.html';
  };

  handleCartCount = (event) => {
    this.countElement.textContent = event.detail;
  };
}

customElements.define('premium-navbar', PremiumNavbar);
