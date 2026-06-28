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
    disponible INTEGER NOT NULL DEFAULT 1,
    stock INTEGER NOT NULL DEFAULT 10
);

CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cliente_nombre TEXT,
    mesa TEXT,
    telefono TEXT,
    direccion TEXT,
    referencia TEXT,
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

CREATE TABLE IF NOT EXISTS pedido_estado_bitacora (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pedido_id INTEGER NOT NULL,
    estado_anterior TEXT,
    estado_nuevo TEXT NOT NULL,
    cambiado_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY(pedido_id) REFERENCES pedidos(id)
);
"""

SAMPLE_PRODUCTS = [
    (1, "Bruschetta italiana", 5.90, "Pan tostado con tomate, albahaca y queso fresco.", "https://images.unsplash.com/photo-1572695157366-5e585ab2b69f?auto=format&fit=crop&w=800&q=80", "entradas", 1, 12),
    (2, "Nachos supremos", 6.20, "Nachos con queso, salsa de la casa y jalapeños.", "https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80", "entradas", 1, 10),
    (3, "Alitas BBQ", 7.10, "Alitas bañadas en salsa BBQ con toque ahumado.", "https://images.unsplash.com/photo-1608039829572-78524f79c4c7?auto=format&fit=crop&w=800&q=80", "entradas", 1, 8),
    (4, "Lomo en salsa", 11.90, "Lomo jugoso acompañado de papas y vegetales.", "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=800&q=80", "platos-fuertes", 1, 7),
    (5, "Hamburguesa especial", 8.40, "Hamburguesa artesanal con queso, tocino y papas.", "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80", "platos-fuertes", 1, 15),
    (6, "Pasta cremosa", 9.50, "Pasta artesanal con salsa cremosa y toque de hierbas.", "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80", "platos-fuertes", 1, 9),
    (7, "Pescado a la plancha", 10.90, "Filete de pescado con ensalada fresca.", "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80", "platos-fuertes", 1, 6),
    (8, "Cheesecake de frutos rojos", 4.80, "Postre suave y fresco con cobertura de frutos rojos.", "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=800&q=80", "postres", 1, 10),
    (9, "Brownie tibio", 3.95, "Brownie de chocolate con textura suave y centro húmedo.", "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80", "postres", 1, 12),
    (10, "Helado artesanal", 2.80, "Helado servido en copa con toppings de fruta.", "https://images.unsplash.com/photo-1560008581-09826d1de69e?auto=format&fit=crop&w=800&q=80", "postres", 1, 20),
    (11, "Tarta de frutos rojos", 4.50, "Base crujiente con crema pastelera y frutos rojos.", "https://images.unsplash.com/photo-1464306076886-da185f6a9d05?auto=format&fit=crop&w=800&q=80", "postres", 1, 8),
    (12, "Limonada de mora", 2.75, "Bebida fría de mora con un toque cítrico y hielo.", "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=800&q=80", "bebidas", 1, 25),
    (13, "Milkshake de fresa", 3.70, "Batido espeso de fresa con crema y salsa dulce.", "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80", "bebidas", 1, 14),
    (14, "Café americano", 2.00, "Café de origen colombiano recién preparado.", "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80", "bebidas", 1, 30),
    (15, "Jugo de naranja natural", 2.50, "Jugo recién exprimido sin conservantes.", "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=800&q=80", "bebidas", 1, 18),
]

SAMPLE_ORDERS = [
    {
        "cliente_nombre": "Cliente Demo 1",
        "mesa": "Domicilio",
        "telefono": "0991112222",
        "direccion": "Av. Principal 123",
        "referencia": "Casa de portón negro",
        "estado": "Pendiente",
        "items": [(5, 2, 8.40), (12, 2, 2.75)],
    },
    {
        "cliente_nombre": "Cliente Demo 2",
        "mesa": "Domicilio",
        "telefono": "0993334444",
        "direccion": "Calle Los Álamos y Norte",
        "referencia": "Junto a la farmacia",
        "estado": "En preparación",
        "items": [(4, 1, 11.90), (8, 1, 4.80)],
    },
    {
        "cliente_nombre": "Cliente Demo 3",
        "mesa": "Domicilio",
        "telefono": "0995556666",
        "direccion": "Conjunto Jardines, casa 7",
        "referencia": "Garita principal",
        "estado": "Completado",
        "items": [(1, 1, 5.90), (14, 2, 2.00)],
    },
]

PEDIDOS_EXTRA_COLUMNS = {
    "telefono": "TEXT",
    "direccion": "TEXT",
    "referencia": "TEXT",
}

PRODUCTOS_EXTRA_COLUMNS = {
    "stock": "INTEGER NOT NULL DEFAULT 10",
}


def migrate_db(conn):
    cur = conn.cursor()
    pedido_columns = {
        row[1] for row in cur.execute("PRAGMA table_info(pedidos)").fetchall()
    }
    producto_columns = {
        row[1] for row in cur.execute("PRAGMA table_info(productos)").fetchall()
    }

    for column, column_type in PEDIDOS_EXTRA_COLUMNS.items():
        if column not in pedido_columns:
            cur.execute(f"ALTER TABLE pedidos ADD COLUMN {column} {column_type}")

    for column, column_type in PRODUCTOS_EXTRA_COLUMNS.items():
        if column not in producto_columns:
            cur.execute(f"ALTER TABLE productos ADD COLUMN {column} {column_type}")

    cur.execute(
        """
        UPDATE pedidos
        SET estado = 'Completado'
        WHERE estado NOT IN ('Pendiente', 'En preparación', 'Completado', 'Entregado', 'Cancelado')
        """
    )

    cur.execute(
        """
        UPDATE productos
        SET disponible = 0
        WHERE stock <= 0
        """
    )


def create_db():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executescript(SCHEMA)
    migrate_db(conn)
    conn.commit()
    conn.close()
    print("Base de datos lista en:", DB_PATH)


def seed_products(products=SAMPLE_PRODUCTS):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    cur.executemany(
        """
        INSERT OR REPLACE INTO productos
        (id, nombre, precio, descripcion, imagen, categoria, disponible, stock)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """,
        products,
    )
    conn.commit()
    conn.close()
    print(f"Productos de ejemplo disponibles: {len(products)}")


def seed_orders(orders=SAMPLE_ORDERS):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    for order in orders:
        total = sum(cantidad * precio for _, cantidad, precio in order["items"])
        cur.execute(
            """
            INSERT INTO pedidos
            (cliente_nombre, mesa, telefono, direccion, referencia, total, estado)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (
                order["cliente_nombre"],
                order["mesa"],
                order["telefono"],
                order["direccion"],
                order["referencia"],
                total,
                order["estado"],
            ),
        )
        pedido_id = cur.lastrowid
        cur.executemany(
            """
            INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario)
            VALUES (?, ?, ?, ?)
            """,
            [(pedido_id, producto_id, cantidad, precio) for producto_id, cantidad, precio in order["items"]],
        )

    conn.commit()
    conn.close()
    print(f"Pedidos de prueba insertados: {len(orders)}")


def table_count(table_name):
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    count = cur.execute(f"SELECT COUNT(*) FROM {table_name}").fetchone()[0]
    conn.close()
    return count


if __name__ == "__main__":
    create_db()
    seed_products()
    if table_count("pedidos") == 0:
        seed_orders()
    else:
        print("La base ya tiene pedidos; no se insertaron pedidos de prueba duplicados.")
