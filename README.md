# Proyecto_E-commerce_jaimes_sebas

Aplicación web de comercio electrónico para una tienda de ropa urbana premium, desarrollada íntegramente con **HTML5, CSS3 y JavaScript Vanilla**, sin frameworks ni librerías externas.

---

## Tabla de contenidos

- [Descripción general](#descripción-general)
- [Tecnologías utilizadas](#tecnologías-utilizadas)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Páginas del sistema](#páginas-del-sistema)
- [Módulos JavaScript](#módulos-javascript)
- [Componentes Web](#componentes-web)
- [Estilos](#estilos)
- [Persistencia de datos](#persistencia-de-datos)
- [Credenciales de administrador](#credenciales-de-administrador)
- [Funcionalidades del E-commerce](#funcionalidades-del-e-commerce)
- [Funcionalidades del Panel Admin](#funcionalidades-del-panel-admin)
- [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)

---

## Descripción general

UNDERGOLD es un sistema completo que combina un **e-commerce público** para clientes y un **panel administrativo privado** para gestionar el catálogo y los pedidos.

Toda la información se persiste en el navegador usando `localStorage` y `sessionStorage`, sin necesidad de backend ni base de datos.

---

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de todas las páginas |
| CSS3 | Estilos, animaciones y diseño responsive |
| JavaScript ES6+ (Vanilla) | Lógica de negocio, DOM, módulos |
| Web Components | Navbar, product-card, modal-dialog |
| localStorage | Persistencia de productos, categorías, carrito y pedidos |
| sessionStorage | Sesión del administrador |

---

## Estructura del proyecto

```
proyecto_sebas/
│
├── index.html              # Página principal del e-commerce
├── cart.html               # Carrito de compras
├── product.html            # Detalle de producto
├── admin.html              # Login del panel administrativo
├── dashboard.html          # Panel administrativo
│
├── components/
│   ├── navbar.js           # Web Component: barra de navegación
│   ├── product-card.js     # Web Component: tarjeta de producto
│   └── modal-dialog.js     # Web Component: modal reutilizable
│
├── js/
│   ├── products.js         # Datos semilla de productos y categorías
│   ├── storage.js          # Capa de persistencia (localStorage / sessionStorage)
│   ├── ui.js               # Funciones compartidas de UI (renderizado, carrito, filtros)
│   ├── app.js              # Lógica de la página principal (index.html)
│   ├── cart.js             # Lógica del carrito y checkout (cart.html)
│   ├── product-detail.js   # Lógica del detalle de producto (product.html)
│   ├── auth.js             # Login del administrador (admin.html)
│   ├── dashboard.js        # Inicialización del panel admin (dashboard.html)
│   ├── categories.js       # CRUD de categorías (dashboard.html)
│   ├── products-admin.js   # CRUD de productos (dashboard.html)
│   └── orders-admin.js     # Visualización de pedidos (dashboard.html)
│
└── styles/
    ├── global.css          # Variables CSS, reset, botones, layout base
    ├── ecommerce.css       # Estilos del e-commerce y modal de checkout
    └── admin.css           # Estilos del panel administrativo (tema oscuro)
```

---

## Páginas del sistema

### `index.html` — Tienda principal
Muestra el catálogo de productos con:
- Hero section con llamada a la acción
- Tarjetas de categorías clicables que filtran los productos
- Buscador por texto y selector de categoría sincronizados
- Grilla de productos con conteo dinámico por categoría

### `product.html` — Detalle de producto
Muestra la información completa de un producto individual.
Recibe el ID del producto por parámetro en la URL (`?id=...`).

### `cart.html` — Carrito de compras
Permite revisar los productos agregados, modificar cantidades y confirmar el pedido a través de un modal de checkout en dos pasos.

### `admin.html` — Login administrativo
Formulario de acceso al panel con validación de credenciales.

### `dashboard.html` — Panel administrativo
Vista única que contiene los módulos de categorías, productos y pedidos, con métricas en la cabecera y sidebar de navegación.

---

## Módulos JavaScript

### `storage.js`
Centraliza todas las operaciones de lectura y escritura en el navegador. Ningún otro módulo accede directamente a `localStorage`.

**Claves de localStorage:**
| Clave | Contenido |
|---|---|
| `undergold_cart` | Arreglo de items del carrito |
| `undergold_categories` | Arreglo de categorías |
| `undergold_products` | Arreglo de productos |
| `undergold_orders` | Arreglo de pedidos |

**Clave de sessionStorage:**
| Clave | Contenido |
|---|---|
| `undergold_admin_session` | Objeto de sesión del administrador |

---

### `ui.js`
Funciones compartidas entre múltiples páginas:
- `addToCart(product)` — Agrega o incrementa un producto en el carrito
- `updateCartBadge()` — Actualiza el contador del navbar via evento personalizado
- `filterProducts(products, query, category)` — Filtra por texto y categoría
- `renderProducts(products, container)` — Renderiza tarjetas de producto en el DOM

---

### `app.js`
Controla `index.html`:
- Pobla el select de categorías desde localStorage
- Conecta las tarjetas de categorías con el filtro
- Actualiza el conteo de productos por categoría dinámicamente

---

### `cart.js`
Controla `cart.html`:
- Renderiza los items del carrito con controles de cantidad
- Modal de checkout con dos vistas: resumen del pedido → formulario del cliente
- Validación de campos con bloqueo de caracteres inválidos
- Guarda el pedido en localStorage con fecha legible

**Estructura del objeto pedido:**
```js
{
  idPedido: 1716489600000,       // Timestamp (usado como ID único)
  fecha: "23/05/2026 - 7:45 PM", // Fecha legible
  cliente: {
    identificacion: "1234567890",
    nombre: "Juan Pérez",
    direccion: "Calle 123 #45-67",
    telefono: "3001234567",
    email: "correo@ejemplo.com"
  },
  productos: [...],  // Copia del carrito al momento de la compra
  subtotal: 52,
  envio: 0,
  total: 52
}
```

---

### `auth.js`
Valida las credenciales del administrador y guarda la sesión en `sessionStorage` al iniciar sesión correctamente.

---

### `dashboard.js`
Verifica la sesión activa al cargar el panel. Si no hay sesión, redirige al login. Inicializa los tres módulos CRUD e inicializa las métricas del dashboard.

---

### `categories.js`
CRUD completo de categorías:
- Crear con nombre y descripción
- Editar en modal pre-llenado
- Eliminar con confirmación inline en la fila (sin `window.confirm`)
- Validación visual por campo

---

### `products-admin.js`
CRUD completo de productos:
- Crear con código, nombre, categoría, precio, URL de imagen y descripción
- Vista previa de imagen en tiempo real al ingresar la URL
- Editar con formulario pre-llenado
- Eliminar con confirmación inline
- Validación visual por campo

---

### `orders-admin.js`
Visualización de pedidos:
- Ordenados de más reciente a más antiguo
- Modal de detalle con datos del cliente, productos y resumen de precios
- Compatible con pedidos del esquema nuevo y del esquema anterior

---

## Componentes Web

### `<premium-navbar>`
Barra de navegación sticky con logo, links y botón del carrito con contador.
Escucha el evento personalizado `cartCountUpdate` para actualizar el badge.

### `<product-card>`
Tarjeta de producto con imagen, nombre, precio, descripción, categoría y botones de acción.
Emite el evento `add-to-cart` al hacer clic en "Agregar al carrito".

### `<modal-dialog>`
Modal reutilizable con:
- Fondo oscuro semitransparente
- Animación de entrada suave
- Cierre con botón ×, clic fuera del modal o tecla `ESC`
- Método `setTitle(value)` para cambiar el título dinámicamente

---

## Estilos

### `global.css`
Variables CSS del tema claro (e-commerce), reset básico, clases de botones (`.btn-primary`, `.btn-secondary`) y layout `.page-shell`.

### `ecommerce.css`
Estilos específicos del e-commerce: hero, categorías, buscador, grilla de productos, carrito, modal de checkout y formulario de datos del cliente.

### `admin.css`
Tema oscuro del panel administrativo activado con `body.admin-page`. Incluye estilos para sidebar, tablas, modales de formulario, vista previa de imagen y modal de detalle de pedidos.

---

## Persistencia de datos

```
localStorage
├── undergold_products    → Catálogo de productos
├── undergold_categories  → Categorías de la tienda
├── undergold_cart        → Carrito de compras del cliente
└── undergold_orders      → Historial de pedidos confirmados

sessionStorage
└── undergold_admin_session → Sesión activa del administrador
```

Los datos de `localStorage` persisten entre sesiones del navegador.
Los datos de `sessionStorage` se eliminan al cerrar la pestaña o el navegador.

---

## Credenciales de administrador

```
Email:      admin@mail.com
Contraseña: 123456
```

---

## Funcionalidades del E-commerce

- Catálogo de productos con imagen, nombre, precio y descripción
- Filtro por categoría desde tarjetas clicables o selector desplegable
- Búsqueda por texto en nombre y descripción
- Conteo dinámico de productos por categoría
- Página de detalle individual por producto
- Carrito de compras con control de cantidades
- Modal de confirmación de pedido con resumen visual
- Formulario de datos del cliente con validaciones:
  - Identificación y teléfono: solo números
  - Nombre: solo letras (incluye acentos y ñ)
  - Email: formato válido requerido
- Pantalla de éxito tras confirmar la compra
- Contador del carrito en el navbar actualizado en tiempo real

---

## Funcionalidades del Panel Admin

- Login con validación de credenciales y sesión protegida
- Dashboard con métricas: total de productos, categorías y pedidos
- **Módulo de categorías:** crear, editar y eliminar con confirmación inline
- **Módulo de productos:** crear, editar y eliminar con vista previa de imagen en tiempo real
- **Módulo de pedidos:** lista ordenada por fecha con modal de detalle completo
- Cierre de sesión que elimina la sesión y redirige al login

---

## Cómo ejecutar el proyecto

El proyecto no requiere instalación ni servidor de build. Solo necesita un servidor local para que los módulos ES6 funcionen correctamente.

**Opción 1 — VS Code Live Server:**
1. Instala la extensión **Live Server** en VS Code
2. Clic derecho sobre `index.html` → `Open with Live Server`

**Opción 2 — Python:**
```bash
# Python 3
python -m http.server 5500
```
Luego abre `http://localhost:5500` en el navegador.

**Opción 3 — Node.js (npx):**
```bash
npx serve .
```

> **Nota:** No abrir los archivos HTML directamente con `file://` ya que los módulos ES6 (`type="module"`) requieren un servidor HTTP para funcionar.

---
