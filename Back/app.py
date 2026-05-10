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
    productos = conn.execute('SELECT * FROM productos WHERE disponible = 1').fetchall()
    conn.close()
    return jsonify([dict(row) for row in productos])

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
