// ============================================
// BASE DE DATOS DEL MENÚ (LOCAL)
// ============================================
const productosDisponibles = [
  { id: 1, nombre: "Bruschetta italiana", precio: 5.90, descripcion: "Pan tostado con tomate, albahaca y queso fresco.", disponible: true, imagen: "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80", categoria: "entradas" },
  { id: 2, nombre: "Nachos supremos", precio: 6.20, descripcion: "Nachos con queso, salsa de la casa y jalapeños.", disponible: true, imagen: "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80", categoria: "entradas" },
  { id: 3, nombre: "Alitas BBQ", precio: 7.10, descripcion: "Alitas bañadas en salsa BBQ con toque ahumado.", disponible: true, imagen: "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80", categoria: "entradas" },
  { id: 4, nombre: "Lomo en salsa", precio: 11.90, descripcion: "Lomo jugoso acompañado de papas y vegetales.", disponible: true, imagen: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80", categoria: "platos-fuertes" },
  { id: 5, nombre: "Hamburguesa especial", precio: 8.40, descripcion: "Hamburguesa artesanal con queso, tocino y papas.", disponible: true, imagen: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", categoria: "platos-fuertes" },
  { id: 6, nombre: "Pasta cremosa", precio: 9.50, descripcion: "Pasta artesanal con salsa cremosa y toque de hierbas.", disponible: true, imagen: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80", categoria: "platos-fuertes" },
  { id: 7, nombre: "Pescado a la plancha", precio: 10.90, descripcion: "Filete de pescado con ensalada fresca.", disponible: true, imagen: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", categoria: "platos-fuertes" },
  { id: 8, nombre: "Cheesecake de frutos rojos", precio: 4.80, descripcion: "Postre suave y fresco con cobertura de frutos rojos.", disponible: true, imagen: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80", categoria: "postres" },
  { id: 9, nombre: "Brownie tibio", precio: 3.95, descripcion: "Brownie de chocolate con textura suave y centro húmedo.", disponible: true, imagen: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80", categoria: "postres" },
  { id: 10, nombre: "Helado artesanal", precio: 2.80, descripcion: "Helado servido en copa con toppings de fruta.", disponible: true, imagen: "https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80", categoria: "postres" },
  { id: 11, nombre: "Tarta de frutos rojos", precio: 4.50, descripcion: "Base crujiente con crema pastelera y frutos rojos.", disponible: true, imagen: "https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=800&q=80", categoria: "postres" },
  { id: 12, nombre: "Limonada de mora", precio: 2.75, descripcion: "Bebida fría de mora con un toque cítrico y hielo.", disponible: true, imagen: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80", categoria: "bebidas" },
  { id: 13, nombre: "Milkshake de fresa", precio: 3.70, descripcion: "Batido espeso de fresa con crema y salsa dulce.", disponible: true, imagen: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80", categoria: "bebidas" },
  { id: 14, nombre: "Café americano", precio: 2.00, descripcion: "Café de origen colombiano recién preparado.", disponible: true, imagen: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80", categoria: "bebidas" },
  { id: 15, nombre: "Jugo de naranja natural", precio: 2.50, descripcion: "Jugo recién exprimido sin conservantes.", disponible: true, imagen: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80", categoria: "bebidas" }
];

const menuData = {
  todos: productosDisponibles.filter(p => p.disponible),
  entradas: productosDisponibles.filter(p => p.categoria === "entradas" && p.disponible),
  "platos-fuertes": productosDisponibles.filter(p => p.categoria === "platos-fuertes" && p.disponible),
  postres: productosDisponibles.filter(p => p.categoria === "postres" && p.disponible),
  bebidas: productosDisponibles.filter(p => p.categoria === "bebidas" && p.disponible)
};

// ============================================
// ESTADO DEL CARRITO
// ============================================
let carrito = [];

// ============================================
// FUNCIONES DEL CARRITO
// ============================================

function agregarAlCarrito(id) {
  const producto = productosDisponibles.find(p => p.id === id);
  if (!producto) return;

  const itemExistente = carrito.find(item => item.id === id);
  if (itemExistente) {
    itemExistente.cantidad++;
  } else {
    carrito.push({ ...producto, cantidad: 1 });
  }

  actualizarCarritoUI();
  mostrarNotificacion(`✅ ${producto.nombre} agregado al carrito`);
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(item => item.id === id);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(i => i.id !== id);
  }
  actualizarCarritoUI();
}

function eliminarDelCarrito(id) {
  carrito = carrito.filter(item => item.id !== id);
  actualizarCarritoUI();
}

function calcularTotal() {
  return carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
}

function actualizarCarritoUI() {
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalSpan = document.getElementById('cartTotal');
  const confirmBtn = document.getElementById('confirmOrderBtn');
  const cartBadge = document.getElementById('cartBadge');

  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
  cartBadge.textContent = totalItems;
  cartBadge.style.display = totalItems > 0 ? 'flex' : 'none';

  if (carrito.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="empty-state" style="grid-column: span 1; padding: 20px; font-size: 14px;">
        Tu carrito está vacío. <br> ¡Agrega algo delicioso!
      </div>
    `;
    confirmBtn.disabled = true;
  } else {
    cartItemsContainer.innerHTML = carrito.map(item => `
      <div class="cart-item">
        <div class="cart-item-info">
          <h5>${item.nombre}</h5>
          <p>$${item.precio.toFixed(2)} x ${item.cantidad}</p>
        </div>
        <div class="cart-item-actions">
          <button class="btn-qty" onclick="cambiarCantidad(${item.id}, -1)">-</button>
          <span>${item.cantidad}</span>
          <button class="btn-qty" onclick="cambiarCantidad(${item.id}, 1)">+</button>
          <button class="btn-remove" onclick="eliminarDelCarrito(${item.id})">🗑️</button>
        </div>
      </div>
    `).join('');
    confirmBtn.disabled = false;
  }

  cartTotalSpan.textContent = `$${calcularTotal().toFixed(2)}`;
}

async function confirmarPedido() {
  if (carrito.length === 0) return;

  const pedidoData = {
    cliente_nombre: "Usuario Demo",
    mesa: "42",
    items: carrito.map(item => ({
      id: item.id,
      cantidad: item.cantidad,
      precio: item.precio
    })),
    total: calcularTotal()
  };

  try {
    const response = await fetch('http://localhost:5000/api/pedido', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });

    if (response.ok) {
      const result = await response.json();
      mostrarNotificacion(`🎉 Pedido realizado con éxito! ID: ${result.pedido_id}`);
      carrito = [];
      actualizarCarritoUI();
    } else {
      mostrarNotificacion('❌ Error al confirmar el pedido');
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ No se pudo conectar con el servidor');
  }
}

// ============================================
// FUNCIONES DE INTERFAZ ORIGINALES (MEJORADAS)
// ============================================

function mostrarNotificacion(mensaje) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = mensaje;
  document.body.appendChild(toast);
  
  setTimeout(() => toast.remove(), 2500);
}

function renderizarProductos(categoria) {
  const productos = menuData[categoria] || [];
  const productsContainer = document.getElementById('products');
  const productCountSpan = document.getElementById('productCount');
  
  productCountSpan.textContent = `${productos.length} ${productos.length === 1 ? 'producto' : 'productos'}`;
  
  if (productos.length === 0) {
    productsContainer.innerHTML = '<div class="empty-state">🍽️ No hay productos disponibles en esta categoría.</div>';
    return;
  }
  
  productsContainer.innerHTML = productos.map(producto => `
    <article class="product-card">
      <div class="product-info">
        <h4>${producto.nombre}</h4>
        <div class="price">$${producto.precio.toFixed(2)}</div>
        <p>${producto.descripcion}</p>
        <button class="btn-add-cart" onclick="agregarAlCarrito(${producto.id})">
          ➕ Agregar al pedido
        </button>
      </div>
      <div class="product-media">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <span class="available-badge">✓ Disponible</span>
      </div>
    </article>
  `).join('');
}

function actualizarHero(categoria) {
  const heroTitle = document.getElementById('heroTitle');
  const heroText = document.getElementById('heroText');
  const heroImage = document.getElementById('heroImage');
  
  const contenido = {
    todos: {
      title: '📋 Menú Completo',
      text: `Tenemos ${menuData.todos.length} productos disponibles para ti.`,
      image: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80'
    },
    entradas: {
      title: '🥗 Entradas',
      text: 'Platillos ligeros para abrir el apetito.',
      image: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80'
    },
    'platos-fuertes': {
      title: '🍖 Platos Fuertes',
      text: 'Nuestros principales platillos, preparados al momento.',
      image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=900&q=80'
    },
    postres: {
      title: '🍰 Postres',
      text: 'El final perfecto para cualquier comida.',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=900&q=80'
    },
    bebidas: {
      title: '🥤 Bebidas',
      text: 'Refrescantes naturales para acompañar tu pedido.',
      image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?auto=format&fit=crop&w=900&q=80'
    }
  };
  
  const data = contenido[categoria] || contenido.todos;
  heroTitle.textContent = data.title;
  heroText.textContent = data.text;
  heroImage.src = data.image;
}

function actualizarTituloSeccion(categoria) {
  const sectionTitle = document.getElementById('sectionTitle');
  const sectionSubtitle = document.getElementById('sectionSubtitle');
  
  const titulos = {
    todos: '🍽️ Todos los productos disponibles',
    entradas: '🥗 Entradas disponibles',
    'platos-fuertes': '🍖 Platos fuertes disponibles',
    postres: '🍰 Postres disponibles',
    bebidas: '🥤 Bebidas disponibles'
  };
  
  sectionTitle.textContent = titulos[categoria] || 'Productos disponibles';
  sectionSubtitle.textContent = 'Solo productos disponibles hoy.';
}

function marcarBotonActivo(categoria) {
  const buttons = document.querySelectorAll('#sidebarNav button');
  buttons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === categoria);
  });
}

function cambiarCategoria(categoria) {
  marcarBotonActivo(categoria);
  actualizarHero(categoria);
  actualizarTituloSeccion(categoria);
  renderizarProductos(categoria);
}

// ============================================
// LÓGICA DE APERTURA/CIERRE DEL CARRITO
// ============================================

function toggleCarrito() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Configurar botones del sidebar
  const sidebarButtons = document.querySelectorAll('#sidebarNav button');
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      cambiarCategoria(btn.dataset.section);
    });
  });

  // Configurar botón "Ver menú" del hero
  const verMenuBtn = document.getElementById('verMenuBtn');
  if (verMenuBtn) {
    verMenuBtn.addEventListener('click', () => cambiarCategoria('todos'));
  }

  // Configurar botón de confirmar pedido
  const confirmBtn = document.getElementById('confirmOrderBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmarPedido);
  }

  // Configurar toggle del carrito
  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartOverlay = document.getElementById('cartOverlay');

  if (openCartBtn) openCartBtn.addEventListener('click', toggleCarrito);
  if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCarrito);
  if (cartOverlay) cartOverlay.addEventListener('click', toggleCarrito);

  // Cargar menú completo al inicio
  cambiarCategoria('todos');
});
