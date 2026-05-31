// ============================================
// BASE DE DATOS DEL MENÚ (DINÁMICA DESDE API)
// ============================================
let productosDisponibles = [];
let menuData = {
  todos: [],
  entradas: [],
  "platos-fuertes": [],
  postres: [],
  bebidas: []
};

async function cargarProductosDesdeAPI() {
  try {
    const response = await fetch('http://localhost:5000/api/productos');
    productosDisponibles = await response.json();
    
    menuData = {
      todos: productosDisponibles.filter(p => p.disponible),
      entradas: productosDisponibles.filter(p => p.categoria === "entradas" && p.disponible),
      "platos-fuertes": productosDisponibles.filter(p => p.categoria === "platos-fuertes" && p.disponible),
      postres: productosDisponibles.filter(p => p.categoria === "postres" && p.disponible),
      bebidas: productosDisponibles.filter(p => p.categoria === "bebidas" && p.disponible)
    };
    
    cambiarCategoria('todos'); // Recargar vista con datos frescos
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarNotificacion('❌ Error al conectar con el servidor');
  }
}

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

  // Cargar menú desde API al inicio
  cargarProductosDesdeAPI();
});
