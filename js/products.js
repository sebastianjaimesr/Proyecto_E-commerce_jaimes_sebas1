/**
 * products.js
 * Datos iniciales (semilla) del catálogo de la tienda.
 *
 * Estos arreglos se usan como valores por defecto cuando localStorage
 * no tiene datos guardados aún (primera visita del usuario).
 * Una vez que el administrador agrega o edita productos/categorías
 * desde el panel, los datos de localStorage tienen prioridad sobre estos.
 */

/**
 * Categorías por defecto de la tienda.
 * La categoría con id 'all' es especial: representa "todas las categorías"
 * y se usa en el filtro del e-commerce pero no se muestra en el admin.
 */
export const categories = [
  { id: 'all',     name: 'Todas'  },
  { id: 'camisas', name: 'Camisas' },
  { id: 'buzos',   name: 'Buzos'   },
  { id: 'jeans',   name: 'Jeans'   },
  { id: 'shorts',  name: 'Shorts'  },
];

/**
 * Productos por defecto del catálogo.
 * Cada producto tiene:
 *  - id:          Identificador único (usado como clave en el carrito).
 *  - name:        Nombre visible en la tienda.
 *  - category:    Debe coincidir con el id de una categoría existente.
 *  - price:       Precio en la moneda local (número).
 *  - description: Texto corto que describe el producto.
 *  - image:       URL de la imagen del producto.
 *  - stock:       Cantidad disponible en inventario.
 *  - destacado:   Boolean si se muestra en sección destacados.
 */
export const products = [
  {
    id: 'undr-camisa-01',
    name: 'Camiseta Helios Black',
    category: 'camisas',
    price: 52,
    description: 'Camiseta streetwear premium con corte suave y estampado minimal.',
    image: 'http://dropstore.com.co/cdn/shop/files/1_6996224d-ca1f-4702-9591-45608d2b4646.jpg?v=1762860080',
    stock: 15,
    destacado: true,
  },
  {
    id: 'undr-buzo-01',
    name: 'Buzo Core Navy',
    category: 'buzos',
    price: 129,
    description: 'Buzo con capucha oversized y tejido suave, ideal para looks urbanos.',
    image: 'https://undergoldapparel.com/cdn/shop/files/11_38d559aa-9708-499a-832f-d05012509ac4.jpg?v=1745591981&width=2575',
    stock: 8,
    destacado: true,
  },
  {
    id: 'undr-jean-01',
    name: 'Jean Ripped Regular',
    category: 'jeans',
    price: 94,
    description: 'Jean premium con roturas sutiles y lavado oscuro para estilo moderno.',
    image: 'https://undergoldapparel.com/cdn/shop/files/2_5c95ca66-29bb-48e7-9dc0-6658d253f11e.jpg?v=1740153616&width=2575',
    stock: 12,
    destacado: false,
  },
  {
    id: 'undr-shorts-01',
    name: 'Shorts Street Essential',
    category: 'shorts',
    price: 68,
    description: 'Shorts de tela técnica, corte relajado y detalles urbanos sobrios.',
    image: 'https://youngshop.com.do/cdn/shop/files/Photoroom_20260329_140812.png?v=1774808986&width=533',
    stock: 20,
    destacado: false,
  },
];
