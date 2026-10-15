from io import BytesIO
from datetime import datetime

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import (
    getSampleStyleSheet,
    ParagraphStyle
)
from reportlab.lib.units import mm
from reportlab.platypus import (
    SimpleDocTemplate,
    Paragraph,
    Spacer,
    Table,
    TableStyle,
    Image
)


def gerar_comprovante_pdf(venda, cliente, produtos):

    buffer = BytesIO()

    documento = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        rightMargin=20 * mm,
        leftMargin=20 * mm,
        topMargin=20 * mm,
        bottomMargin=20 * mm
    )

    estilos = getSampleStyleSheet()

    titulo = ParagraphStyle(
        "Titulo",
        parent=estilos["Title"],
        alignment=TA_CENTER,
        fontSize=18,
        spaceAfter=8
    )

    centralizado = ParagraphStyle(
        "Centralizado",
        parent=estilos["Normal"],
        alignment=TA_CENTER,
        fontSize=9
    )

    direita = ParagraphStyle(
        "Direita",
        parent=estilos["Normal"],
        alignment=TA_RIGHT,
        fontSize=11
    )

    elementos = []

    # =========================
    # TÍTULO
    # =========================

    logo = Image(
        "./view/img/baner_aep.jpg",
        width=60 * mm,
        height=30 * mm
    )

    logo.hAlign = "CENTER"

    elementos.append(logo)

    elementos.append(
        Paragraph(
            "Organização de Escoteiros",
            centralizado
        )
    )

    elementos.append(
        Spacer(1, 8)
    )

    # =========================
    # DATA
    # =========================

    elementos.append(
        Paragraph(
            f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M')}",
            estilos["Normal"]
        )
    )

    elementos.append(
        Spacer(1, 15)
    )

    # =========================
    # CLIENTE
    # =========================

    elementos.append(
        Paragraph(
            "<b>Cliente</b>",
            estilos["Heading3"]
        )
    )

    dados_cliente = [
        [
            "ID:",
            str(cliente.get("id_escoteiro", "-"))
        ],
        [
            "Nome:",
            cliente.get("nome", "-")
        ],
        [
            "Totem:",
            cliente.get("totem") or "-"
        ],
        [
            "Encarregado:",
            cliente.get("nome_encarregado") or "-"
        ]
    ]

    tabela_cliente = Table(
        dados_cliente,
        colWidths=[
            35 * mm,
            125 * mm
        ]
    )

    tabela_cliente.setStyle(
        TableStyle([
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "TOP"
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                5
            ),
            (
                "FONTNAME",
                (0, 0),
                (0, -1),
                "Helvetica-Bold"
            )
        ])
    )

    elementos.append(
        tabela_cliente
    )

    elementos.append(
        Spacer(1, 15)
    )

    # =========================
    # PRODUTOS
    # =========================

    elementos.append(
        Paragraph(
            "<b>Produtos</b>",
            estilos["Heading3"]
        )
    )

    # Cria um dicionário para encontrar
    # rapidamente os dados de cada produto
    mapa_produtos = {
        produto["id_item"]: produto
        for produto in produtos
    }

    dados_produtos = [
        [
            "Produto",
            "Qtd.",
            "Preço",
            "Subtotal"
        ]
    ]

    for item in venda.get("produtos", []):

        id_item = item.get("id_item")

        produto = mapa_produtos.get(
            id_item,
            {}
        )

        nome = produto.get(
            "nome_item",
            f"Produto {id_item}"
        )

        quantidade = int(
            item.get("quantidade", 0)
        )

        preco = float(
            item.get("preco_unitario", 0)
        )

        subtotal = quantidade * preco

        dados_produtos.append(
            [
                nome,
                str(quantidade),
                f"€ {preco:.2f}",
                f"€ {subtotal:.2f}"
            ]
        )

    tabela_produtos = Table(
        dados_produtos,
        colWidths=[
            85 * mm,
            20 * mm,
            30 * mm,
            30 * mm
        ],
        repeatRows=1
    )

    tabela_produtos.setStyle(
        TableStyle([
            (
                "BACKGROUND",
                (0, 0),
                (-1, 0),
                colors.HexColor("#eeeeee")
            ),
            (
                "FONTNAME",
                (0, 0),
                (-1, 0),
                "Helvetica-Bold"
            ),
            (
                "GRID",
                (0, 0),
                (-1, -1),
                0.5,
                colors.grey
            ),
            (
                "ALIGN",
                (1, 1),
                (-1, -1),
                "RIGHT"
            ),
            (
                "VALIGN",
                (0, 0),
                (-1, -1),
                "MIDDLE"
            ),
            (
                "LEFTPADDING",
                (0, 0),
                (-1, -1),
                6
            ),
            (
                "RIGHTPADDING",
                (0, 0),
                (-1, -1),
                6
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                6
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                6
            )
        ])
    )

    elementos.append(
        tabela_produtos
    )

    elementos.append(
        Spacer(1, 15)
    )

    # =========================
    # TOTAL
    # =========================

    total = float(
        venda.get("total", 0)
    )

    tabela_total = Table(
        [
            [
                Paragraph(
                    "<b>TOTAL</b>",
                    estilos["Normal"]
                ),
                Paragraph(
                    f"<b>€ {total:.2f}</b>",
                    direita
                )
            ]
        ],
        colWidths=[
            130 * mm,
            35 * mm
        ]
    )

    tabela_total.setStyle(
        TableStyle([
            (
                "LINEABOVE",
                (0, 0),
                (-1, 0),
                1,
                colors.black
            ),
            (
                "TOPPADDING",
                (0, 0),
                (-1, -1),
                8
            ),
            (
                "BOTTOMPADDING",
                (0, 0),
                (-1, -1),
                8
            ),
            (
                "ALIGN",
                (1, 0),
                (1, 0),
                "RIGHT"
            )
        ])
    )

    elementos.append(
        tabela_total
    )

    elementos.append(
        Spacer(1, 25)
    )

    # =========================
    # MENSAGEM FINAL
    # =========================

    elementos.append(
        Paragraph(
            "Obrigado pela sua compra!",
            centralizado
        )
    )

    # =========================
    # GERAR PDF EM MEMÓRIA
    # =========================

    documento.build(
        elementos
    )

    buffer.seek(0)

    return buffer