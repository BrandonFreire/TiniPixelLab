# Tini Restaurant - Menú digital

Aplicación web para un restaurante pequeño desarrollada por el equipo **Tini Pixel Lab**. Permite ver productos por categoría, agregar productos al carrito, confirmar pedidos y administrarlos desde un panel local.

## Funcionalidades

- Menú dinámico con categorías: entradas, platos fuertes, postres y bebidas.
- Carrito lateral con cantidades, total y confirmación de pedido.
- Control de stock por producto con descuento automático al confirmar pedidos.
- Datos básicos de entrega para pedidos a domicilio.
- Consulta de estado por número de pedido.
- Persistencia local con SQLite.
- Panel de administrador con:
  - listado de pedidos recibidos;
  - cambio y guardado del estado del pedido;
  - consulta de bitácora de cambios de estado;
  - listado, creación, edición y eliminación de productos.
- Datos iniciales de productos y pedidos de prueba para demostración.

## Estructura

- `Front/TiniRestaurant.html`: pantalla principal del menú y carrito.
- `Front/login.html`: acceso al panel de administración.
- `Front/admin.html`: panel administrativo.
- `Front/script.js`: lógica del menú y carrito.
- `Front/admin.js`: lógica de pedidos y productos del administrador.
- `CSS/style.css`: estilos compartidos.
- `Back/app.py`: API Flask.
- `Back/create_db.py`: crea la base SQLite y carga datos de prueba.

## Requisitos

- Python 3.10 o superior.
- Dependencias de `requirements.txt`.

Instalación:

```bash
pip install -r requirements.txt
```

## Ejecución local

Opción rápida en Windows:

```bat
start.bat
```

También puedes ejecutar paso a paso:

```bash
python Back/create_db.py
python Back/app.py
```

Luego abre:

- Menú: `Front/TiniRestaurant.html`
- Admin: `Front/login.html`

Credenciales del panel admin:

- Usuario: `admin`
- Contraseña: `admin`

La API corre en:

```text
http://localhost:5000
```

## Endpoints principales

- `GET /api/productos`: productos disponibles para el menú.
- `GET /api/productos?admin=true`: todos los productos para administración.
- `POST /api/productos`: crear producto.
- `PUT /api/productos/<id>`: editar producto.
- `DELETE /api/productos/<id>`: eliminar producto.
- `POST /api/pedido`: registrar pedido desde el carrito.
- `GET /api/pedidos`: listar pedidos recibidos.
- `GET /api/pedidos/<id>`: consultar el estado y detalle de un pedido.
- `PUT /api/pedidos/<id>/estado`: actualizar estado de un pedido.
- `GET /api/pedidos/<id>/bitacora`: consultar la bitácora de cambios de estado.

Estados disponibles:

```text
Pendiente, En preparación, Completado, Entregado, Cancelado
```

## Notas para presentación

`Back/tini.db` es una base local generada. Si no existe, `Back/app.py` y `Back/create_db.py` pueden recrearla con productos y pedidos de prueba. Esto permite mover el proyecto y ejecutarlo en otra máquina sin depender de datos manuales previos.
