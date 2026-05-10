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
    (3, "Alitas BBQ", 7.10, "Alitas bañadas en salsa BBQ con toque ahumado.", "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80", "entradas", 1),
    (4, "Lomo en salsa", 11.90, "Lomo jugoso acompañado de papas y vegetales.", "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80", "platos-fuertes", 1),
    (5, "Hamburguesa especial", 8.40, "Hamburguesa artesanal con queso, tocino y papas.", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", "platos-fuertes", 1),
    (6, "Pasta cremosa", 9.50, "Pasta artesanal con salsa cremosa y toque de hierbas.", "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80", "platos-fuertes", 1),
    (7, "Pescado a la plancha", 10.90, "Filete de pescado con ensalada fresca.", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", "platos-fuertes", 1),
    (8, "Cheesecake de frutos rojos", 4.80, "Postre suave y fresco con cobertura de frutos rojos.", "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80", "postres", 1),
    (9, "Brownie tibio", 3.95, "Brownie de chocolate con textura suave y centro húmedo.", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80", "postres", 1),
    (10, "Helado artesanal", 2.80, "Helado servido en copa con toppings de fruta.", "https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80", "postres", 1),
    (11, "Tarta de frutos rojos", 4.50, "Base crujiente con crema pastelera y frutos rojos.", "https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=800&q=80", "postres", 1),
    (12, "Limonada de mora", 2.75, "Bebida fría de mora con un toque cítrico y hielo.", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80", "bebidas", 1),
    (13, "Milkshake de fresa", 3.70, "Batido espeso de fresa con crema y salsa dulce.", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80", "bebidas", 1),
    (14, "Café americano", 2.00, "Café de origen colombiano recién preparado.", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80", "bebidas", 1),
    (15, "Jugo de naranja natural", 2.50, "Jugo recién exprimido sin conservantes.", "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80", "bebidas", 1)
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