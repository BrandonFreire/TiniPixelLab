let productosDisponibles = [];
const API_URL = 'http://localhost:5000/api';
let menuData = {
  todos: [],
  entradas: [],
  "platos-fuertes": [],
  postres: [],
  bebidas: []
};

async function cargarProductosDesdeAPI() {
  try {
    const response = await fetch(`${API_URL}/productos`);
    productosDisponibles = await response.json();
    
    menuData = {
      todos: productosDisponibles.filter(productoDisponible),
      entradas: productosDisponibles.filter(p => p.categoria === "entradas" && productoDisponible(p)),
      "platos-fuertes": productosDisponibles.filter(p => p.categoria === "platos-fuertes" && productoDisponible(p)),
      postres: productosDisponibles.filter(p => p.categoria === "postres" && productoDisponible(p)),
      bebidas: productosDisponibles.filter(p => p.categoria === "bebidas" && productoDisponible(p))
    };
    
    cambiarCategoria('todos');
  } catch (error) {
    console.error('Error al cargar productos:', error);
    mostrarNotificacion('❌ Error al conectar con el servidor');
  }
}

let carrito = [];

function productoDisponible(producto) {
  return Boolean(producto.disponible) && Number(producto.stock) > 0;
}

function agregarAlCarrito(id) {
  const producto = productosDisponibles.find(p => p.id === id);
  if (!producto) return;

  if (!productoDisponible(producto)) {
    mostrarNotificacion('Este producto no tiene stock disponible');
    return;
  }

  const itemExistente = carrito.find(item => item.id === id);
  if (itemExistente) {
    if (itemExistente.cantidad >= Number(producto.stock)) {
      mostrarNotificacion(`Solo quedan ${producto.stock} unidades de ${producto.nombre}`);
      return;
    }
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

  if (delta > 0 && item.cantidad >= Number(item.stock)) {
    mostrarNotificacion(`Solo quedan ${item.stock} unidades de ${item.nombre}`);
    return;
  }

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

function escapeHTML(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
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
          <small>Stock: ${item.stock}</small>
        </div>
        <div class="cart-item-actions">
          <button class="btn-qty" onclick="cambiarCantidad(${item.id}, -1)">-</button>
          <span>${item.cantidad}</span>
          <button class="btn-qty" onclick="cambiarCantidad(${item.id}, 1)" ${item.cantidad >= Number(item.stock) ? 'disabled' : ''}>+</button>
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

  const clienteNombre = document.getElementById('clienteNombre').value.trim();
  const clienteTelefono = document.getElementById('clienteTelefono').value.trim();
  const clienteDireccion = document.getElementById('clienteDireccion').value.trim();
  const clienteReferencia = document.getElementById('clienteReferencia').value.trim();

  if (!clienteNombre || !clienteTelefono || !clienteDireccion) {
    mostrarNotificacion('Completa nombre, teléfono y dirección');
    return;
  }

  const pedidoData = {
    cliente_nombre: clienteNombre,
    telefono: clienteTelefono,
    direccion: clienteDireccion,
    referencia: clienteReferencia,
    items: carrito.map(item => ({
      id: item.id,
      cantidad: item.cantidad,
      precio: item.precio
    })),
    total: calcularTotal()
  };

  try {
    const response = await fetch(`${API_URL}/pedido`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(pedidoData)
    });

    if (response.ok) {
      const result = await response.json();
      mostrarNotificacion(`🎉 Pedido realizado con éxito! ID: ${result.pedido_id}`);
      mostrarResultadoPedido(result.pedido_id, 'Pendiente');
      document.getElementById('pedidoConsultaId').value = result.pedido_id;
      document.getElementById('clienteNombre').value = '';
      document.getElementById('clienteTelefono').value = '';
      document.getElementById('clienteDireccion').value = '';
      document.getElementById('clienteReferencia').value = '';
      carrito = [];
      actualizarCarritoUI();
      cargarProductosDesdeAPI();
    } else {
      const result = await response.json();
      mostrarNotificacion(result.error || 'Error al confirmar el pedido');
      cargarProductosDesdeAPI();
    }
  } catch (error) {
    console.error('Error:', error);
    mostrarNotificacion('❌ No se pudo conectar con el servidor');
  }
}

function mostrarResultadoPedido(id, estado, direccion = '') {
  const resultContainer = document.getElementById('pedidoEstadoResultado');
  resultContainer.innerHTML = `
    <strong>Pedido #${id}</strong><br>
    Estado actual: <strong>${escapeHTML(estado)}</strong>
    ${direccion ? `<br><small>Entrega: ${escapeHTML(direccion)}</small>` : ''}
  `;
  resultContainer.hidden = false;
}

async function consultarEstadoPedido() {
  const pedidoId = document.getElementById('pedidoConsultaId').value.trim();
  const resultContainer = document.getElementById('pedidoEstadoResultado');

  if (!pedidoId) {
    resultContainer.textContent = 'Ingresa un número de pedido.';
    resultContainer.hidden = false;
    return;
  }

  try {
    const response = await fetch(`${API_URL}/pedidos/${pedidoId}`);
    if (!response.ok) {
      resultContainer.textContent = 'No se encontró un pedido con ese número.';
      resultContainer.hidden = false;
      return;
    }

    const pedido = await response.json();
    mostrarResultadoPedido(pedido.id, pedido.estado, pedido.direccion || '');
  } catch (error) {
    console.error('Error:', error);
    resultContainer.textContent = 'No se pudo consultar el estado del pedido.';
    resultContainer.hidden = false;
  }
}

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
        <p class="stock-text">Stock disponible: ${producto.stock}</p>
        <button class="btn-add-cart" onclick="agregarAlCarrito(${producto.id})">
          ➕ Agregar al pedido
        </button>
      </div>
      <div class="product-media">
        <img src="${producto.imagen}" alt="${producto.nombre}">
        <span class="available-badge">Stock: ${producto.stock}</span>
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

function toggleCarrito() {
  const sidebar = document.getElementById('cartSidebar');
  const overlay = document.getElementById('cartOverlay');
  sidebar.classList.toggle('open');
  overlay.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
  const sidebarButtons = document.querySelectorAll('#sidebarNav button');
  sidebarButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      cambiarCategoria(btn.dataset.section);
    });
  });

  const verMenuBtn = document.getElementById('verMenuBtn');
  if (verMenuBtn) {
    verMenuBtn.addEventListener('click', () => cambiarCategoria('todos'));
  }

  const confirmBtn = document.getElementById('confirmOrderBtn');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmarPedido);
  }

  const consultarPedidoBtn = document.getElementById('consultarPedidoBtn');
  if (consultarPedidoBtn) {
    consultarPedidoBtn.addEventListener('click', consultarEstadoPedido);
  }

  const openCartBtn = document.getElementById('openCartBtn');
  const closeCartBtn = document.getElementById('closeCartBtn');
  const cartOverlay = document.getElementById('cartOverlay');

  if (openCartBtn) openCartBtn.addEventListener('click', toggleCarrito);
  if (closeCartBtn) closeCartBtn.addEventListener('click', toggleCarrito);
  if (cartOverlay) cartOverlay.addEventListener('click', toggleCarrito);

  cargarProductosDesdeAPI();
});
