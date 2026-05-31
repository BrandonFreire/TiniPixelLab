from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from pathlib import Path

app = Flask(__name__)
CORS(app)

DB_PATH = Path(__file__).resolve().parent / "tini.db"

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

@app.route('/api/productos', methods=['GET'])
def get_productos():
    conn = get_db_connection()
    # If admin=true is passed, get all products including unavailable ones
    admin = request.args.get('admin') == 'true'
    if admin:
        productos = conn.execute('SELECT * FROM productos').fetchall()
    else:
        productos = conn.execute('SELECT * FROM productos WHERE disponible = 1').fetchall()
    conn.close()
    return jsonify([dict(row) for row in productos])

@app.route('/api/productos', methods=['POST'])
def crear_producto():
    data = request.json
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO productos (nombre, precio, descripcion, imagen, categoria, disponible) VALUES (?, ?, ?, ?, ?, ?)",
            (data['nombre'], data['precio'], data.get('descripcion', ''), data.get('imagen', ''), data['categoria'], data.get('disponible', 1))
        )
        conn.commit()
        new_id = cur.lastrowid
        conn.close()
        return jsonify({"mensaje": "Producto creado", "id": new_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/productos/<int:id>', methods=['PUT'])
def actualizar_producto(id):
    data = request.json
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(
            "UPDATE productos SET nombre=?, precio=?, descripcion=?, imagen=?, categoria=?, disponible=? WHERE id=?",
            (data['nombre'], data['precio'], data.get('descripcion', ''), data.get('imagen', ''), data['categoria'], data.get('disponible', 1), id)
        )
        conn.commit()
        conn.close()
        return jsonify({"mensaje": "Producto actualizado"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/productos/<int:id>', methods=['DELETE'])
def eliminar_producto(id):
    try:
        conn = get_db_connection()
        conn.execute("DELETE FROM productos WHERE id=?", (id,))
        conn.commit()
        conn.close()
        return jsonify({"mensaje": "Producto eliminado"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/pedidos', methods=['GET'])
def get_pedidos():
    conn = get_db_connection()
    pedidos = conn.execute('SELECT * FROM pedidos ORDER BY creado_at DESC').fetchall()
    result = []
    for pedido in pedidos:
        p_dict = dict(pedido)
        items = conn.execute('''
            SELECT pi.*, p.nombre 
            FROM pedido_items pi 
            JOIN productos p ON pi.producto_id = p.id 
            WHERE pi.pedido_id = ?
        ''', (p_dict['id'],)).fetchall()
        p_dict['items'] = [dict(item) for item in items]
        result.append(p_dict)
    conn.close()
    return jsonify(result)

@app.route('/api/pedidos/<int:id>/estado', methods=['PUT'])
def actualizar_estado_pedido(id):
    data = request.json
    try:
        conn = get_db_connection()
        conn.execute("UPDATE pedidos SET estado=? WHERE id=?", (data['estado'], id))
        conn.commit()
        conn.close()
        return jsonify({"mensaje": "Estado de pedido actualizado"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/pedido', methods=['POST'])
def crear_pedido():
    data = request.json
    # data = { "cliente_nombre": "...", "mesa": "...", "items": [{"id": 1, "cantidad": 2, "precio": 5.90}, ...], "total": 11.80 }
    
    if not data or 'items' not in data or not data['items']:
        return jsonify({"error": "Pedido vacío"}), 400

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Insertar pedido
        cur.execute(
            "INSERT INTO pedidos (cliente_nombre, mesa, total, estado) VALUES (?, ?, ?, ?)",
            (data.get('cliente_nombre', 'Cliente'), data.get('mesa', '1'), data['total'], 'Pendiente')
        )
        pedido_id = cur.lastrowid
        
        # Insertar items del pedido
        for item in data['items']:
            cur.execute(
                "INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)",
                (pedido_id, item['id'], item['cantidad'], item['precio'])
            )
        
        conn.commit()
        conn.close()
        
        return jsonify({
            "mensaje": "Pedido realizado con éxito",
            "pedido_id": pedido_id
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
