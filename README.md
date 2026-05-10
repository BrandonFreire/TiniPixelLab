# Tini Restaurant - Menú Digital con Carrito de Compras

Este proyecto es una aplicación web de menú digital para restaurantes que permite a los usuarios explorar productos por categorías, agregarlos a un carrito de compras dinámico y confirmar pedidos que se almacenan en una base de datos SQLite.

## 🚀 Características Principales

*   **Menú Dinámico:** Visualización de productos organizados por categorías (Entradas, Platos Fuertes, Postres, Bebidas).
*   **Carrito de Compras Flotante:** Un panel lateral deslizable que permite gestionar productos, cantidades y calcular el total automáticamente.
*   **Notificaciones en Tiempo Real:** Mensajes de confirmación en la esquina superior derecha al interactuar con el carrito.
*   **Backend con Flask:** Una API robusta que maneja la persistencia de los pedidos.
*   **Base de Datos SQLite:** Almacenamiento local de productos y pedidos realizados.

---

## 🛠️ Estructura del Proyecto

### 1. Frontend (`/Front` y `/CSS`)
*   **`TiniRestaurant.html`**: Estructura principal de la aplicación. Incluye el botón flotante del carrito y el sistema de navegación lateral.
*   **`prueba.js`**: Contiene toda la lógica del cliente:
    *   Gestión del estado del carrito (memoria local).
    *   Renderizado dinámico de productos.
    *   Comunicación con la API (Fetch) para registrar pedidos.
    *   Efectos visuales de apertura y cierre del carrito.
*   **`style.css`**: Estilos modernos con variables CSS, diseño responsivo (Grid/Flexbox) y animaciones para el carrito y notificaciones.

### 2. Backend (`/Back`)
*   **`app.py`**: Servidor Flask que expone dos rutas principales:
    *   `GET /api/productos`: Obtiene la lista de productos disponibles.
    *   `POST /api/pedido`: Recibe y guarda los pedidos en la base de datos.
*   **`create_db.py`**: Script de utilidad para inicializar la base de datos `tini.db` con el esquema necesario y productos de ejemplo.
*   **`tini.db`**: Base de datos relacional con tablas para `productos`, `pedidos` y `pedido_items`.

---

## 📋 Requisitos del Sistema

Para ejecutar este proyecto, necesitas tener instalado:

1.  **Python 3.x** (Se recomienda 3.10 o superior).
2.  **Librerías de Python:**
    *   `Flask`: Para el servidor web.
    *   `Flask-CORS`: Para permitir que el HTML se comunique con el servidor.

---

## ⚙️ Instalación y Ejecución

Sigue estos pasos para poner en marcha el proyecto:

### Paso 1: Instalar dependencias
Abre una terminal en la raíz del proyecto y ejecuta:
```bash
pip install flask flask-cors
```

### Paso 2: Inicializar la Base de Datos (Opcional si ya existe)
Si quieres resetear los productos o crear la base de datos desde cero:
```bash
python Back/create_db.py
```

### Paso 3: Iniciar el Servidor Backend
Ejecuta el servidor Flask:
```bash
python Back/app.py
```
*El servidor se iniciará en `http://localhost:5000`. Mantén esta terminal abierta.*

### Paso 4: Abrir la Aplicación
Simplemente abre el archivo **`Front/TiniRestaurant.html`** en tu navegador favorito.

---

## 📝 Notas de Uso
*   **Confirmación de Pedidos:** Al hacer clic en "Confirmar Pedido", los datos se enviarán al servidor y verás un mensaje con el ID del pedido generado.
*   **Modo Demo:** Si el servidor no está encendido, el carrito seguirá funcionando visualmente, pero mostrará un error al intentar guardar el pedido.
*   **Imágenes:** Las imágenes de los productos se cargan dinámicamente desde Unsplash para asegurar una estética moderna sin ocupar espacio en disco.

---
Desarrollado por **Gemini CLI** para **Tini Pixel Lab**.
