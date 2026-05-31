if (localStorage.getItem('adminAuth') !== 'true') {
    window.location.href = 'login.html';
}

const API_URL = 'http://localhost:5000/api';
const ESTADOS_PEDIDO = ['Pendiente', 'En preparación', 'Completado', 'Entregado', 'Cancelado'];
let productosGlobal = [];

function logout() {
    localStorage.removeItem('adminAuth');
    window.location.href = 'login.html';
}

function escapeHTML(value = '') {
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function mostrarMensaje(mensaje, tipo = 'success') {
    const contenedor = document.getElementById('adminMessage');
    contenedor.textContent = mensaje;
    contenedor.className = `admin-message ${tipo}`;
    contenedor.hidden = false;
    setTimeout(() => {
        contenedor.hidden = true;
    }, 3000);
}

function estadoClase(estado) {
    return estado
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');
}

function opcionesEstado(estadoActual) {
    return ESTADOS_PEDIDO.map(estado => `
        <option value="${estado}" ${estado === estadoActual ? 'selected' : ''}>${estado}</option>
    `).join('');
}

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

async function cargarPedidos() {
    const lista = document.getElementById('listaPedidos');
    lista.innerHTML = '<tr><td colspan="7" class="table-empty">Cargando pedidos...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/pedidos`);
        if (!res.ok) throw new Error('No se pudo cargar la lista de pedidos');

        const pedidos = await res.json();
        if (pedidos.length === 0) {
            lista.innerHTML = '<tr><td colspan="7" class="table-empty">Todavía no hay pedidos recibidos.</td></tr>';
            return;
        }

        lista.innerHTML = pedidos.map(p => `
            <tr>
                <td>#${p.id}</td>
                <td>
                    <strong>${escapeHTML(p.cliente_nombre || 'Cliente')}</strong><br>
                    <small>Tel: ${escapeHTML(p.telefono || '-')}</small><br>
                    <small>${escapeHTML(p.direccion || p.mesa || 'Sin dirección')}</small>
                    ${p.referencia ? `<br><small>Ref: ${escapeHTML(p.referencia)}</small>` : ''}
                </td>
                <td class="order-items">
                    ${p.items.map(i => `${i.cantidad}x ${escapeHTML(i.nombre)} <small>($${Number(i.precio_unitario).toFixed(2)})</small>`).join('<br>')}
                </td>
                <td>$${Number(p.total).toFixed(2)}</td>
                <td>${escapeHTML(p.creado_at || '-')}</td>
                <td>
                    <span class="status-badge status-${estadoClase(p.estado)}">${escapeHTML(p.estado)}</span>
                </td>
                <td>
                    <div class="status-editor">
                        <select id="estado-${p.id}" aria-label="Estado del pedido ${p.id}">
                            ${opcionesEstado(p.estado)}
                        </select>
                        <button class="btn-action btn-status" onclick="guardarEstadoPedido(${p.id})">Guardar</button>
                    </div>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error al cargar pedidos:', err);
        lista.innerHTML = '<tr><td colspan="7" class="table-empty error">No se pudieron cargar los pedidos. Verifica que el servidor esté activo.</td></tr>';
    }
}

async function guardarEstadoPedido(id) {
    const select = document.getElementById(`estado-${id}`);
    const nuevoEstado = select.value;

    try {
        const res = await fetch(`${API_URL}/pedidos/${id}/estado`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ estado: nuevoEstado })
        });

        if (!res.ok) {
            const data = await res.json();
            throw new Error(data.error || 'No se pudo actualizar el estado');
        }

        mostrarMensaje(`Pedido #${id} actualizado a "${nuevoEstado}".`);
        cargarPedidos();
    } catch (err) {
        console.error('Error al cambiar estado:', err);
        mostrarMensaje(err.message, 'error');
    }
}

async function cargarProductos() {
    const lista = document.getElementById('listaProductos');
    lista.innerHTML = '<tr><td colspan="6" class="table-empty">Cargando productos...</td></tr>';

    try {
        const res = await fetch(`${API_URL}/productos?admin=true`);
        if (!res.ok) throw new Error('No se pudo cargar la lista de productos');

        productosGlobal = await res.json();
        if (productosGlobal.length === 0) {
            lista.innerHTML = '<tr><td colspan="6" class="table-empty">No hay productos registrados.</td></tr>';
            return;
        }

        lista.innerHTML = productosGlobal.map(p => `
            <tr>
                <td>
                    <img class="product-thumb" src="${escapeHTML(p.imagen || '../Front/img/logo_empresa.png')}" alt="${escapeHTML(p.nombre)}">
                </td>
                <td>
                    <strong>${escapeHTML(p.nombre)}</strong><br>
                    <small>${escapeHTML(p.descripcion || 'Sin descripción')}</small>
                </td>
                <td>${escapeHTML(p.categoria)}</td>
                <td>$${Number(p.precio).toFixed(2)}</td>
                <td>${p.disponible ? '<span class="available-dot">Disponible</span>' : '<span class="unavailable-dot">No disponible</span>'}</td>
                <td>
                    <button class="btn-action btn-edit" onclick="abrirModalProducto(${p.id})">Editar</button>
                    <button class="btn-action btn-delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        console.error('Error al cargar productos:', err);
        lista.innerHTML = '<tr><td colspan="6" class="table-empty error">No se pudieron cargar los productos. Verifica que el servidor esté activo.</td></tr>';
    }
}

function abrirModalProducto(id = null) {
    const modal = document.getElementById('modalProducto');
    const form = document.getElementById('formProducto');
    const title = document.getElementById('modalTitle');

    form.reset();
    document.getElementById('prodId').value = id || '';
    document.getElementById('prodDisponible').checked = true;

    if (id) {
        const producto = productosGlobal.find(p => p.id === id);
        if (!producto) return;

        title.innerText = 'Editar producto';
        document.getElementById('prodNombre').value = producto.nombre;
        document.getElementById('prodPrecio').value = producto.precio;
        document.getElementById('prodCategoria').value = producto.categoria;
        document.getElementById('prodDescripcion').value = producto.descripcion || '';
        document.getElementById('prodImagen').value = producto.imagen || '';
        document.getElementById('prodDisponible').checked = Boolean(producto.disponible);
    } else {
        title.innerText = 'Nuevo producto';
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
        precio: Number(document.getElementById('prodPrecio').value),
        categoria: document.getElementById('prodCategoria').value,
        descripcion: document.getElementById('prodDescripcion').value,
        imagen: document.getElementById('prodImagen').value,
        disponible: document.getElementById('prodDisponible').checked ? 1 : 0
    };

    try {
        const url = id ? `${API_URL}/productos/${id}` : `${API_URL}/productos`;
        const method = id ? 'PUT' : 'POST';

        const res = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || 'No se pudo guardar el producto');
        }

        cerrarModal();
        mostrarMensaje(id ? 'Producto actualizado.' : 'Producto agregado.');
        cargarProductos();
    } catch (err) {
        console.error('Error al guardar producto:', err);
        mostrarMensaje(err.message, 'error');
    }
});

async function eliminarProducto(id) {
    if (!confirm('¿Seguro que deseas eliminar este producto?')) return;

    try {
        const res = await fetch(`${API_URL}/productos/${id}`, { method: 'DELETE' });
        if (!res.ok) {
            const result = await res.json();
            throw new Error(result.error || 'No se pudo eliminar el producto');
        }

        mostrarMensaje('Producto eliminado.');
        cargarProductos();
    } catch (err) {
        console.error('Error al eliminar producto:', err);
        mostrarMensaje(err.message, 'error');
    }
}

window.addEventListener('click', (event) => {
    const modal = document.getElementById('modalProducto');
    if (event.target === modal) cerrarModal();
});

cargarPedidos();
