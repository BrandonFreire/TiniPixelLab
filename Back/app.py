from pathlib import Path
import sqlite3

from flask import Flask, jsonify, request
from flask_cors import CORS

from create_db import create_db, seed_orders, seed_products

app = Flask(__name__)
CORS(app)

DB_PATH = Path(__file__).resolve().parent / "tini.db"
ESTADOS_PEDIDO = ("Pendiente", "En preparación", "Completado", "Entregado", "Cancelado")


def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def inicializar_datos_si_hacen_falta():
    create_db()
    conn = get_db_connection()
    productos_count = conn.execute("SELECT COUNT(*) FROM productos").fetchone()[0]
    pedidos_count = conn.execute("SELECT COUNT(*) FROM pedidos").fetchone()[0]
    conn.close()

    if productos_count == 0:
        seed_products()
    if pedidos_count == 0:
        seed_orders()


def producto_desde_request(data):
    campos_obligatorios = ("nombre", "precio", "categoria")
    faltantes = [campo for campo in campos_obligatorios if not data.get(campo)]
    if "stock" not in data:
        faltantes.append("stock")
    if faltantes:
        return None, f"Faltan campos obligatorios: {', '.join(faltantes)}"

    try:
        precio = float(data["precio"])
    except (TypeError, ValueError):
        return None, "El precio debe ser un número válido"

    if precio <= 0:
        return None, "El precio debe ser mayor a 0"

    try:
        stock = int(data["stock"])
    except (TypeError, ValueError):
        return None, "El stock debe ser un número entero válido"

    if stock < 0:
        return None, "El stock no puede ser negativo"

    return {
        "nombre": data["nombre"].strip(),
        "precio": precio,
        "descripcion": data.get("descripcion", "").strip(),
        "imagen": data.get("imagen", "").strip(),
        "categoria": data["categoria"],
        "disponible": 1 if data.get("disponible", 1) else 0,
        "stock": stock,
    }, None


def obtener_bitacora_pedido(conn, pedido_id):
    registros = conn.execute(
        """
        SELECT id, pedido_id, estado_anterior, estado_nuevo, cambiado_at
        FROM pedido_estado_bitacora
        WHERE pedido_id = ?
        ORDER BY cambiado_at ASC, id ASC
        """,
        (pedido_id,),
    ).fetchall()
    return [dict(registro) for registro in registros]


def obtener_pedido_por_id(conn, pedido_id):
    pedido = conn.execute("SELECT * FROM pedidos WHERE id = ?", (pedido_id,)).fetchone()
    if not pedido:
        return None

    pedido_dict = dict(pedido)
    items = conn.execute(
        """
        SELECT
            pi.id,
            pi.pedido_id,
            pi.producto_id,
            pi.cantidad,
            pi.precio_unitario,
            COALESCE(p.nombre, 'Producto eliminado') AS nombre
        FROM pedido_items pi
        LEFT JOIN productos p ON pi.producto_id = p.id
        WHERE pi.pedido_id = ?
        """,
        (pedido_id,),
    ).fetchall()
    pedido_dict["items"] = [dict(item) for item in items]
    pedido_dict["bitacora"] = obtener_bitacora_pedido(conn, pedido_id)
    return pedido_dict


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/api/productos", methods=["GET"])
def get_productos():
    conn = get_db_connection()
    admin = request.args.get("admin") == "true"
    consulta = "SELECT * FROM productos ORDER BY categoria, nombre"
    if not admin:
        consulta = "SELECT * FROM productos WHERE disponible = 1 AND stock > 0 ORDER BY categoria, nombre"
    productos = conn.execute(consulta).fetchall()
    conn.close()
    return jsonify([dict(row) for row in productos])


@app.route("/api/productos", methods=["POST"])
def crear_producto():
    data = request.get_json(silent=True) or {}
    producto, error = producto_desde_request(data)
    if error:
        return jsonify({"error": error}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        INSERT INTO productos (nombre, precio, descripcion, imagen, categoria, disponible, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (
            producto["nombre"],
            producto["precio"],
            producto["descripcion"],
            producto["imagen"],
            producto["categoria"],
            producto["disponible"],
            producto["stock"],
        ),
    )
    conn.commit()
    producto_id = cur.lastrowid
    conn.close()
    return jsonify({"mensaje": "Producto creado", "id": producto_id}), 201


@app.route("/api/productos/<int:producto_id>", methods=["PUT"])
def actualizar_producto(producto_id):
    data = request.get_json(silent=True) or {}
    producto, error = producto_desde_request(data)
    if error:
        return jsonify({"error": error}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
        """
        UPDATE productos
        SET nombre = ?, precio = ?, descripcion = ?, imagen = ?, categoria = ?, disponible = ?, stock = ?
        WHERE id = ?
        """,
        (
            producto["nombre"],
            producto["precio"],
            producto["descripcion"],
            producto["imagen"],
            producto["categoria"],
            producto["disponible"],
            producto["stock"],
            producto_id,
        ),
    )
    conn.commit()
    actualizado = cur.rowcount
    conn.close()

    if actualizado == 0:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify({"mensaje": "Producto actualizado"})


@app.route("/api/productos/<int:producto_id>", methods=["DELETE"])
def eliminar_producto(producto_id):
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("DELETE FROM productos WHERE id = ?", (producto_id,))
    conn.commit()
    eliminado = cur.rowcount
    conn.close()

    if eliminado == 0:
        return jsonify({"error": "Producto no encontrado"}), 404
    return jsonify({"mensaje": "Producto eliminado"})


@app.route("/api/pedidos", methods=["GET"])
def get_pedidos():
    conn = get_db_connection()
    pedidos = conn.execute("SELECT * FROM pedidos ORDER BY creado_at DESC, id DESC").fetchall()
    resultado = []

    for pedido in pedidos:
        resultado.append(obtener_pedido_por_id(conn, pedido["id"]))

    conn.close()
    return jsonify(resultado)


@app.route("/api/pedidos/<int:pedido_id>", methods=["GET"])
def get_pedido(pedido_id):
    conn = get_db_connection()
    pedido = obtener_pedido_por_id(conn, pedido_id)
    conn.close()

    if not pedido:
        return jsonify({"error": "Pedido no encontrado"}), 404
    return jsonify(pedido)


@app.route("/api/pedidos/<int:pedido_id>/bitacora", methods=["GET"])
def get_bitacora_pedido(pedido_id):
    conn = get_db_connection()
    pedido = conn.execute("SELECT id FROM pedidos WHERE id = ?", (pedido_id,)).fetchone()
    if not pedido:
        conn.close()
        return jsonify({"error": "Pedido no encontrado"}), 404

    bitacora = obtener_bitacora_pedido(conn, pedido_id)
    conn.close()
    return jsonify(bitacora)


@app.route("/api/pedidos/<int:pedido_id>/estado", methods=["PUT"])
def actualizar_estado_pedido(pedido_id):
    data = request.get_json(silent=True) or {}
    nuevo_estado = data.get("estado")

    if nuevo_estado not in ESTADOS_PEDIDO:
        return jsonify({"error": "Estado no permitido", "estados_permitidos": ESTADOS_PEDIDO}), 400

    conn = get_db_connection()
    cur = conn.cursor()
    pedido = cur.execute("SELECT estado FROM pedidos WHERE id = ?", (pedido_id,)).fetchone()
    if not pedido:
        conn.close()
        return jsonify({"error": "Pedido no encontrado"}), 404

    estado_anterior = pedido["estado"]
    if estado_anterior == nuevo_estado:
        conn.close()
        return jsonify({"mensaje": "El pedido ya tiene ese estado", "estado": nuevo_estado})

    cur.execute("UPDATE pedidos SET estado = ? WHERE id = ?", (nuevo_estado, pedido_id))
    cur.execute(
        """
        INSERT INTO pedido_estado_bitacora (pedido_id, estado_anterior, estado_nuevo)
        VALUES (?, ?, ?)
        """,
        (pedido_id, estado_anterior, nuevo_estado),
    )
    conn.commit()
    conn.close()
    return jsonify({"mensaje": "Estado de pedido actualizado", "estado": nuevo_estado})


@app.route("/api/pedido", methods=["POST"])
def crear_pedido():
    data = request.get_json(silent=True) or {}

    if not data.get("items"):
        return jsonify({"error": "Pedido vacío"}), 400

    cliente_nombre = data.get("cliente_nombre", "").strip()
    telefono = data.get("telefono", "").strip()
    direccion = data.get("direccion", "").strip()
    referencia = data.get("referencia", "").strip()

    if not cliente_nombre or not telefono or not direccion:
        return jsonify({"error": "Nombre, teléfono y dirección son obligatorios"}), 400

    conn = get_db_connection()
    cur = conn.cursor()

    cantidades_por_producto = {}
    for item in data["items"]:
        try:
            producto_id = int(item["id"])
            cantidad = int(item["cantidad"])
        except (KeyError, TypeError, ValueError):
            conn.close()
            return jsonify({"error": "Los productos del pedido no son válidos"}), 400

        if cantidad <= 0:
            conn.close()
            return jsonify({"error": "La cantidad de cada producto debe ser mayor a 0"}), 400

        cantidades_por_producto[producto_id] = cantidades_por_producto.get(producto_id, 0) + cantidad

    items_validados = []
    for producto_id, cantidad in cantidades_por_producto.items():
        producto = cur.execute(
            """
            SELECT id, nombre, precio, disponible, stock
            FROM productos
            WHERE id = ?
            """,
            (producto_id,),
        ).fetchone()

        if not producto:
            conn.close()
            return jsonify({"error": "Uno de los productos no existe"}), 400

        if not producto["disponible"] or producto["stock"] <= 0:
            conn.close()
            return jsonify({"error": f"{producto['nombre']} no está disponible"}), 400

        if cantidad > producto["stock"]:
            conn.close()
            return jsonify({"error": f"Solo quedan {producto['stock']} unidades de {producto['nombre']}"}), 400

        items_validados.append(
            {
                "id": producto["id"],
                "cantidad": cantidad,
                "precio": float(producto["precio"]),
            }
        )

    total = sum(item["cantidad"] * item["precio"] for item in items_validados)

    # Se valida el stock antes de guardar el pedido y descontar unidades.
    cur.execute(
        """
        INSERT INTO pedidos
        (cliente_nombre, mesa, telefono, direccion, referencia, total, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """,
        (cliente_nombre, "Domicilio", telefono, direccion, referencia, total, "Pendiente"),
    )
    pedido_id = cur.lastrowid

    for item in items_validados:
        cur.execute(
            """
            INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
            VALUES (?, ?, ?, ?)
            """,
            (pedido_id, item["id"], item["cantidad"], item["precio"]),
        )
        cur.execute(
            """
            UPDATE productos
            SET stock = stock - ?,
                disponible = CASE WHEN stock - ? <= 0 THEN 0 ELSE disponible END
            WHERE id = ?
            """,
            (item["cantidad"], item["cantidad"], item["id"]),
        )

    conn.commit()
    conn.close()

    return jsonify({"mensaje": "Pedido realizado con éxito", "pedido_id": pedido_id}), 201


inicializar_datos_si_hacen_falta()

if __name__ == "__main__":
    app.run(debug=True, port=5000)
