from flask import Flask, jsonify, request, send_file

from flask_cors import CORS

from io import BytesIO

from reportlab.pdfgen import canvas

from datetime import datetime

from reportlab.lib.utils import ImageReader

import sql_load
import os
from flask import Flask, request, jsonify
#import jwt
from functools import wraps
from flask import Flask, redirect, url_for, session, jsonify
from authlib.integrations.flask_client import OAuth
from dotenv import load_dotenv
from pathlib import Path
import requests

load_dotenv(Path(__file__).resolve().parent.parent / "reactjs" / "primeiro-test" / ".env")

app = Flask(__name__)

CORS(app)

# =========================================================
# SSO (CONFIGURAÇÃO INTEGRAL E CORRIGIDA)
# =========================================================

# Força o Python a ignorar barreiras ou instabilidades de proxy local
os.environ["HTTP_PROXY"] = ""
os.environ["HTTPS_PROXY"] = ""
os.environ["NO_PROXY"] = "localhost,127.0.0.1,accounts.google.com"

# Permitir apenas a porta 3000 e autorizar o envio de cookies de sessão
CORS(app, origins=["http://localhost:3000"], supports_credentials=True) 

app.secret_key = "uma_chave_aleatoria_e_muito_segura"

# Inicializa o gerenciador OAuth
oauth = OAuth(app)

# Cria uma sessão HTTP customizada para contornar problemas rígidos de SSL/TLS locais
custom_session = requests.Session()
custom_session.verify = False  
custom_session.headers.update({"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})

client_id = os.getenv("CLIENT_ID")
client_secret = os.getenv("CLIENT_SECRET")

if not client_id or not client_secret:
    raise RuntimeError(
        "CLIENT_ID e CLIENT_SECRET precisam estar definidos em reactjs/primeiro-test/.env"
    )

google = oauth.register(
    name='google',
    client_id=client_id,
    client_secret=client_secret,
    

    server_metadata_url=(
        "https://accounts.google.com/.well-known/openid-configuration"
    ),

    client_kwargs={
        "scope": "openid email profile"
    }
)


# Vincula a nossa sessão de contingência ao cliente do Google Authlib
google.session = custom_session


# 1. Rota que o Frontend chama para iniciar o Login
@app.route('/login')
def login():
    redirect_uri = url_for('auth_callback', _external=True)
    return google.authorize_redirect(redirect_uri)


# 2. Rota de Callback (Onde o login é processado)
@app.route('/auth/callback')
def auth_callback():
    session.pop('user', None)
    token = google.authorize_access_token()
    user_info = token.get('userinfo')

    if not user_info:
        return jsonify({'erro': 'Não foi possível validar o login SSO'}), 401

    email_usuario = user_info.get('email')
    if not email_usuario or not sql_load.is_registered_user_email(
        r"C:\Caio\sql\adm_esc.db",
        email_usuario
    ):
        return redirect('http://localhost:3000/?pagina=login_notAut')

    session['user'] = {
        'id': user_info.get('sub'),
        'email': email_usuario,
        'name': user_info.get('name'),
        'picture': user_info.get('picture')
    }

    return redirect('http://localhost:3000/')


# 3. Rota de verificação utilizada pelo React
@app.route('/api/me')
def get_current_user():
    user = session.get('user')
    if not user:
        return jsonify({'erro': 'Não autenticado'}), 401
    return jsonify(user)


# 4. Rota de encerramento de sessão (Logout)
@app.route('/logout')
def logout():
    session.pop('user', None)
    return jsonify({'mensagem': 'Logout realizado com sucesso'})


# =========================================================
# GET ESCOTEIROS
# =========================================================

@app.route("/get_escoteiros")
def get_escoteiros():

    escoteiros = sql_load.get_escoteiros(
        r"C:\Caio\sql\adm_esc.db"
    )

    return jsonify(escoteiros)


# =========================================================
# ADICIONAR ESCOTEIRO
# =========================================================

@app.route("/add_escoteiro", methods=["POST"])
def add_escoteiro():

    dados = request.get_json()

    nome = dados.get("nome")
    totem = dados.get("totem")
    nome_encarregado = dados.get("nome_encarregado")
    email_encarregado = dados.get("email_encarregado")

    # Validar os dados
    if not nome or not nome_encarregado or not email_encarregado:

        return jsonify({
            "erro": "Todos os campos são obrigatórios"
        }), 400

    try:

        sql_load.add_escoteiro(
            r"C:\Caio\sql\adm_esc.db",
            nome,
            totem,
            nome_encarregado,
            email_encarregado
        )

        return jsonify({
            "mensagem": "Escoteiro adicionado com sucesso"
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500


# =========================================================
# GET ITENS
# =========================================================

@app.route("/get_itens")
def get_itens():

    itens = sql_load.get_itens(
        r"C:\Caio\sql\adm_esc.db"
    )

    return jsonify(itens)


# =========================================================
# ADICIONAR ITEM
# =========================================================

@app.route("/add_item", methods=["POST"])
def add_item():

    dados = request.get_json()

    nome_item = (
        dados.get("nome_item") or ""
    ).strip()

    desc_item = (
        dados.get("desc_item") or ""
    ).strip() or None

    preco_item = dados.get("preco_item")

    # Validar o nome
    if not nome_item:

        return jsonify({
            "erro": "O nome do item é obrigatório"
        }), 400

    # preco_item é REAL
    if preco_item is not None:

        try:

            preco_item = float(preco_item)

        except (TypeError, ValueError):

            return jsonify({
                "erro": "Preço inválido"
            }), 400

    try:

        sql_load.add_item(
            r"C:\Caio\sql\adm_esc.db",
            nome_item,
            desc_item,
            preco_item
        )

        return jsonify({
            "mensagem": "Item adicionado com sucesso"
        }), 201

    except Exception as e:

        return jsonify({
            "erro": str(e)
        }), 500

# =========================================================
# GET USERS
# =========================================================

@app.route("/get_users")
def get_users():

    users = sql_load.get_users(
        r"C:\Caio\sql\adm_esc.db"
    )

    return jsonify(users)


# =========================================================
# GERAR COMPROVANTE
# =========================================================

@app.route("/gerar_comprovante", methods=["POST"])
def gerar_comprovante():

    try:

        # =================================================
        # RECEBER JSON
        # =================================================

        dados = request.get_json()

        if not dados:

            return jsonify({
                "erro": "Nenhum dado foi recebido."
            }), 400

        cliente = dados.get("cliente")

        venda = dados.get("venda")


        # =================================================
        # VALIDAR CLIENTE
        # =================================================

        if not cliente:

            return jsonify({
                "erro": "Cliente não informado."
            }), 400


        # =================================================
        # VALIDAR VENDA
        # =================================================

        if not venda:

            return jsonify({
                "erro": "Dados da venda não informados."
            }), 400


        produtos = venda.get(
            "produtos",
            []
        )


        if not produtos:

            return jsonify({
                "erro": "Nenhum produto foi informado."
            }), 400


        # =================================================
        # CRIAR PDF NA MEMÓRIA
        # =================================================

        buffer = BytesIO()

        pdf = canvas.Canvas(
            buffer
        )

        pdf.setTitle(
            "Comprovante de venda"
        )


        # =================================================
        # CABEÇALHO / LOGO
        # =================================================

        logo = ImageReader(
            "./reactjs/primeiro-test/src/view/img/baner_aep.jpg"
        )

        # -------------------------------------------------
        # TAMANHO DO LOGO
        # -------------------------------------------------

        logo_largura = 180
        logo_altura = 50

        # -------------------------------------------------
        # CENTRALIZAR LOGO
        # -------------------------------------------------

        pagina_largura = 595

        logo_x = (
            pagina_largura - logo_largura
        ) / 2

        logo_y = 750

        # -------------------------------------------------
        # DESENHAR LOGO
        # -------------------------------------------------

        pdf.drawImage(
            logo,
            logo_x,
            logo_y,
            width=logo_largura,
            height=logo_altura,
            preserveAspectRatio=True,
            anchor="sw",
            mask="auto"
        )


        # =================================================
        # LINHA ABAIXO DO LOGO
        # =================================================

        pdf.line(
            50,
            735,
            545,
            735
        )

        # =================================================
        # DADOS DO GRUPO ESCOTEIRO
        # =================================================

        pdf.setFont(
            "Helvetica-Bold",
            11
        )

        pdf.drawString(
            50,
            710,
            "43º Grupo Escoteiro de Leça da Palmeira"
        )

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            50,
            693,
            "Rua Guilherme Gomes Fernandes 136, 4450-592 Leça da Palmeira"
        )

        pdf.drawString(
            50,
            676,
            "NIF: 500 989 109"
        )

        # =================================================
        # DATA E HORA
        # =================================================

        data_hora = datetime.now().strftime(
            "%d/%m/%Y %H:%M"
        )

        pdf.setFont(
            "Helvetica-Bold",
            11
        )

        pdf.drawString(
            50,
            650,
            "Data"
        )

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            50,
            633,
            data_hora
        )




        # =================================================
        # DADOS DO CLIENTE
        # =================================================

        nome_cliente = (
            cliente.get("nome")
            or "-"
        )

        nome_encarregado = (
            cliente.get("nome_encarregado")
            or "-"
        )

        totem_cliente = (
            cliente.get("totem")
            or "-"
        )


        # =================================================
        # TÍTULO CLIENTE
        # =================================================

        pdf.setFont(
            "Helvetica-Bold",
            11
        )

        pdf.drawString(
            50,
            605,
            "Cliente"
        )


        # =================================================
        # DADOS DO CLIENTE
        # =================================================

        pdf.setFont(
            "Helvetica",
            10
        )

        pdf.drawString(
            50,
            585,
            f"Nome: {nome_cliente}"
        )

        pdf.drawString(
            50,
            568,
            f"Totem: {totem_cliente}"
        )

        pdf.drawString(
            50,
            551,
            f"Encarregado: {nome_encarregado}"
        )


        # =================================================
        # PRODUTOS
        # =================================================

        y = 510


        # =================================================
        # CABEÇALHO DOS PRODUTOS
        # =================================================

        pdf.setFont(
            "Helvetica-Bold",
            10
        )

        pdf.drawString(
            50,
            y,
            "Produto"
        )

        pdf.drawString(
            330,
            y,
            "Qtd."
        )

        pdf.drawString(
            380,
            y,
            "V. Unit."
        )

        pdf.drawString(
            460,
            y,
            "Subtotal"
        )


        # =================================================
        # LINHA DOS PRODUTOS
        # =================================================

        y -= 10

        pdf.line(
            50,
            y,
            545,
            y
        )

        y -= 20


        pdf.setFont(
            "Helvetica",
            10
        )


        # =================================================
        # PERCORRER PRODUTOS
        # =================================================

        total_calculado = 0


        for produto in produtos:

            nome = (
                produto.get("nome_item")
                or "Produto"
            )


            quantidade = int(
                produto.get(
                    "quantidade",
                    0
                )
            )


            preco = float(
                produto.get(
                    "preco_unitario",
                    0
                )
            )


            subtotal = (
                quantidade * preco
            )


            total_calculado += subtotal


            # ---------------------------------------------
            # NOME DO PRODUTO
            # ---------------------------------------------

            pdf.drawString(
                50,
                y,
                str(nome)[:40]
            )


            # ---------------------------------------------
            # QUANTIDADE
            # ---------------------------------------------

            pdf.drawString(
                330,
                y,
                str(quantidade)
            )


            # ---------------------------------------------
            # PREÇO
            # ---------------------------------------------

            pdf.drawString(
                380,
                y,
                f"€ {preco:.2f}"
            )


            # ---------------------------------------------
            # SUBTOTAL
            # ---------------------------------------------

            pdf.drawString(
                460,
                y,
                f"€ {subtotal:.2f}"
            )


            y -= 22


            # ---------------------------------------------
            # NOVA PÁGINA
            # ---------------------------------------------

            if y < 80:

                pdf.showPage()

                y = 800

                pdf.setFont(
                    "Helvetica",
                    10
                )


        # =================================================
        # TOTAL
        # =================================================

        y -= 10


        pdf.line(
            350,
            y,
            545,
            y
        )


        y -= 30


        pdf.setFont(
            "Helvetica-Bold",
            14
        )


        total = round(
            total_calculado,
            2
        )


        pdf.drawString(
            350,
            y,
            f"TOTAL: € {total:.2f}"
        )


        # =================================================
        # RODAPÉ
        # =================================================

        y -= 50


        pdf.setFont(
            "Helvetica",
            9
        )


        pdf.drawString(
            50,
            y,
            "Comprovante gerado automaticamente pelo sistema."
        )


        # =================================================
        # FINALIZAR PDF
        # =================================================

        pdf.save()


        # =================================================
        # VOLTAR PARA O INÍCIO DO ARQUIVO
        # =================================================

        buffer.seek(0)


        # =================================================
        # DEVOLVER PDF AO REACT
        # =================================================

        return send_file(
            buffer,
            mimetype="application/pdf",
            as_attachment=False,
            download_name="comprovante.pdf"
        )


    except Exception as erro:

        print(
            "ERRO AO GERAR COMPROVANTE:"
        )

        print(
            repr(erro)
        )

        return jsonify({
            "erro": str(erro)
        }), 500


# =========================================================
# INICIAR SERVIDOR
# =========================================================

if __name__ == "__main__":

    app.run(
        debug=True
    )