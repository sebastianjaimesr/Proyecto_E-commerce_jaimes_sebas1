// modal-dialog.js
// Componente web que muestra un modal para los formularios del dashboard.

const modalTemplate = document.createElement('template');
modalTemplate.innerHTML = `
  <style>
    :host {
      position: fixed;
      inset: 0;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(4, 8, 18, 0.75);
      z-index: 40;
    }

    :host([open]) {
      display: grid;
    }

    .modal-panel {
      width: min(680px, calc(100% - 32px));
      border-radius: 28px;
      background: rgba(15, 20, 32, 0.98);
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35);
      overflow: hidden;
      animation: fadeIn 0.25s ease;
    }

    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.5rem 1.75rem;
    }

    .modal-title {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .close-button {
      border: none;
      background: transparent;
      color: var(--text);
      font-size: 1.2rem;
      cursor: pointer;
    }

    .modal-body {
      padding: 1.5rem 1.75rem 2rem;
      max-height: 80vh;
      overflow-y: auto;
      scrollbar-width: none;
    }

    .modal-body::-webkit-scrollbar {
      display: none;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }
  </style>
  <div class="modal-panel" role="dialog" aria-modal="true">
    <header class="modal-header">
      <h2 class="modal-title">Modal</h2>
      <button class="close-button" type="button" aria-label="Cerrar">×</button>
    </header>
    <div class="modal-body">
      <slot></slot>
    </div>
  </div>
`;

class ModalDialog extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.appendChild(modalTemplate.content.cloneNode(true));
    this.closeButton = this.shadowRoot.querySelector('.close-button');
    this.modalPanel = this.shadowRoot.querySelector('.modal-panel');
  }

  connectedCallback() {
    this.handleClose = () => this.close();
    this.handleBackdrop = (event) => { if (event.target === this) this.close(); };
    this.handleKeydown = (event) => { if (event.key === 'Escape') this.close(); };

    this.closeButton.addEventListener('click', this.handleClose);
    this.addEventListener('click', this.handleBackdrop);
    document.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback() {
    this.closeButton.removeEventListener('click', this.handleClose);
    this.removeEventListener('click', this.handleBackdrop);
    document.removeEventListener('keydown', this.handleKeydown);
  }

  open() {
    this.setAttribute('open', '');
  }

  close() {
    this.removeAttribute('open');
  }

  setTitle(value) {
    this.shadowRoot.querySelector('.modal-title').textContent = value;
  }
}

customElements.define('modal-dialog', ModalDialog);
