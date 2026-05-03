# Back/create_db.py
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "tini.db"

SCHEMA = """
CREATE TABLE IF NOT EXISTS productos (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL,
    precio REAL NOT NULL,
    descripcion TEXT,
    imagen TEXT,
    categoria TEXT,
    disponible INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_nombre TEXT,
    mesa TEXT,
    total REAL,
    estado TEXT,
    creado_at TEXT DEFAULT (datetime('now'))
);  

CREATE TABLE IF NOT EXISTS pedido_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    precio_unitario REAL NOT NULL,
    FOREIGN KEY(pedido_id) REFERENCES pedidos(id),
    FOREIGN KEY(producto_id) REFERENCES productos(id)
);
"""

SAMPLE_PRODUCTS = [
    (1, "Bruschetta italiana", 5.90, "Pan tostado con tomate, albahaca y queso fresco.", "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80", "entradas", 1),
    (2, "Nachos supremos", 6.20, "Nachos con queso, salsa de la casa y jalapeños.", "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80", "entradas", 1),
]

def create_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(SCHEMA)
    conn.commit()
    conn.close()
    print("Base de datos creada en:", DB_PATH)

def seed_products(products=SAMPLE_PRODUCTS):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executemany(
        "INSERT OR REPLACE INTO productos (id, nombre, precio, descripcion, imagen, categoria, disponible) VALUES (?, ?, ?, ?, ?, ?, ?)",
        products
    )
    conn.commit()
    conn.close()
    print(f"Insertados {len(products)} productos de ejemplo")

if __name__ == "__main__":
    create_db()
    seed_products()