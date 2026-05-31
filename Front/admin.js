// --- Control de Acceso ---
if (localStorage.getItem('adminAuth') !== 'true') {
    window.location.href = 'login.html';
}

function logout() {
    localStorage.removeItem('adminAuth');
    window.location.href = 'login.html';
}

const API_URL = 'http://localhost:5000/api';

// --- Navegación entre pestañas ---
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        
        btn.classList.add('active');
        const sectionId = btn.getAttribute('data-tab');
        document.getElementById(sectionId).classList.add('active');
        
        if (sectionId === 'pedidos') cargarPedidos();
        if (sectionId === 'productos') cargarProductos();
    });
});

// --- Gestión de Pedidos ---
async function cargarPedidos() {
    try {
        const res = await fetch(`${API_URL}/pedidos`);
        const pedidos = await res.json();
        const lista = document.getElementById('listaPedidos');
        lista.innerHTML = pedidos.map(p => `
            <tr>
                <td>#${p.id}</td>
                <td>
                    <strong>${p.cliente_nombre}</strong><br>
                    <small>Mesa: ${p.mesa}</small>
                </td>
                <td class="order-items">
                    ${p.items.map(i => `${i.cantidad}x ${i.nombre}`).join('<br>')}
                </td>
                <td>$${p.total.toFixed(2)}</td>
                <td>
                    <span class="status-badge status-${p.estado.toLowerCase()}">
                        ${p.estado}
                    </span>
                </td>
                <td>
                    ${p.estado === 'Pendiente' ? 
                        `<button class="btn-action btn-status" onclick="cambiarEstadoPedido(${p.id}, 'Completado')">✅ Completar</button>` : 
                        ''
                    }
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error al cargar pedidos:', err);
    }
}

async function cambiarEstadoPedido(id, nuevoEstado) {
    try {
        await fetch(`${API_URL}/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });
        cargarPedidos();
    } catch (err) {
        console.error('Error al cambiar estado:', err);
    }
}

// --- Gestión de Productos ---
let productosGlobal = [];

async function cargarProductos() {
    try {
        const res = await fetch(`${API_URL}/productos?admin=true`);
        productosGlobal = await res.json();
        const lista = document.getElementById('listaProductos');
        lista.innerHTML = productosGlobal.map(p => `
            <tr>
                <td><img src="${p.imagen}" alt="${p.nombre}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 4px;"></td>
                <td>${p.nombre}</td>
                <td>${p.categoria}</td>
                <td>$${p.precio.toFixed(2)}</td>
                <td>${p.disponible ? '🟢 Sí' : '🔴 No'}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="abrirModalProducto(${p.id})">✏️</button>
                    <button class="btn-action btn-delete" onclick="eliminarProducto(${p.id})">🗑️</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error al cargar productos:', err);
    }
}

function abrirModalProducto(id = null) {
    const modal = document.getElementById('modalProducto');
    const form = document.getElementById('formProducto');
    const title = document.getElementById('modalTitle');
    
    form.reset();
    document.getElementById('prodId').value = id || '';
    
    if (id) {
        title.innerText = 'Editar Producto';
        const p = productosGlobal.find(p => p.id === id);
        document.getElementById('prodNombre').value = p.nombre;
        document.getElementById('prodPrecio').value = p.precio;
        document.getElementById('prodCategoria').value = p.categoria;
        document.getElementById('prodDescripcion').value = p.descripcion;
        document.getElementById('prodImagen').value = p.imagen;
        document.getElementById('prodDisponible').checked = p.disponible === 1;
    } else {
        title.innerText = 'Nuevo Producto';
    }
    
    modal.style.display = 'flex';
}

function cerrarModal() {
    document.getElementById('modalProducto').style.display = 'none';
}

document.getElementById('formProducto').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const data = {
        nombre: document.getElementById('prodNombre').value,
        precio: parseFloat(document.getElementById('prodPrecio').value),
        categoria: document.getElementById('prodCategoria').value,
        descripcion: document.getElementById('prodDescripcion').value,
        imagen: document.getElementById('prodImagen').value,
        disponible: document.getElementById('prodDisponible').checked ? 1 : 0
    };

    try {
        const url = id ? `${API_URL}/productos/${id}` : `${API_URL}/productos`;
        const method = id ? 'PUT' : 'POST';
        
        await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        cerrarModal();
        cargarProductos();
    } catch (err) {
        console.error('Error al guardar producto:', err);
    }
});

async function eliminarProducto(id) {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
        await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
        cargarProductos();
    } catch (err) {
        console.error('Error al eliminar producto:', err);
    }
}

// Inicialización
cargarPedidos();
