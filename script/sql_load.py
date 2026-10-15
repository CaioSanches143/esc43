import sqlite3


def get_escoteiros(db_path):
    conn = sqlite3.connect(db_path)
    
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM escoteiros WHERE ativo = 1")
    # Pega os nomes das colunas
    columns = [column[0] for column in cursor.description]

    # Pega os dados
    rows = cursor.fetchall()

    conn.close()

    # Junta nome da coluna + valor
    escoteiros = [
        dict(zip(columns, row))
        for row in rows
    ]

    return escoteiros

import sqlite3


def add_escoteiro(db_path, nome, totem, nome_encarregado, email_encarregado):
    conn = sqlite3.connect(db_path)

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO escoteiros (
            nome,
            totem,
            nome_encarregado,
            email_encarregado
        )
        VALUES (?, ?, ?, ?)
    """, (
        nome,
        totem,
        nome_encarregado,
        email_encarregado
    ))

    conn.commit()

    id_escoteiro = cursor.lastrowid

    conn.close()

    return id_escoteiro

def get_itens(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    try:
        rows = conn.execute(
            "SELECT id_item, nome_item, desc_item, preco_item FROM itens WHERE ativo = 1"
        ).fetchall()

        return [dict(row) for row in rows]
    finally:
        conn.close()

def get_users(db_path):
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row

    try:
        rows = conn.execute(
            "SELECT id_user, email_user, grupo_user FROM usuarios WHERE ativo = 1"
        ).fetchall()

        return [dict(row) for row in rows]
    finally:
        conn.close()

def is_registered_user_email(db_path, email):
    conn = sqlite3.connect(db_path)

    try:
        row = conn.execute(
            """
            SELECT 1
            FROM usuarios
            WHERE LOWER(email_user) = LOWER(?)
            LIMIT 1
            """,
            (email.strip(),)
        ).fetchone()
        return row is not None
    finally:
        conn.close()


def add_item(db_path, nome_item, desc_item, preco_item):
    conn = sqlite3.connect(db_path)

    try:
        conn.execute(
            "INSERT INTO itens (nome_item, desc_item, preco_item) VALUES (?, ?, ?)",
            (nome_item, desc_item, preco_item)
        )
        conn.commit()
    finally:
        conn.close()
