import "./Comprovante_content.css";
import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

function Comprovante_content() {

    /* =========================
       CLIENTES
    ========================= */

    const [escoteiros, setEscoteiros] = useState([]);
    const [pesquisaCliente, setPesquisaCliente] = useState("");
    const [clienteSelecionado, setClienteSelecionado] = useState(null);


    /* =========================
       PRODUTOS
    ========================= */

    const [itens, setItens] = useState([]);
    const [pesquisaProduto, setPesquisaProduto] = useState("");
    const [produtoSelecionado, setProdutoSelecionado] = useState(null);
    const [quantidade, setQuantidade] = useState(1);


    /* =========================
       COMPROVANTE
    ========================= */

    const [produtosVenda, setProdutosVenda] = useState([]);

    /* =========================
       ESTADO DO PDF
    ========================= */

    const [gerandoPdf, setGerandoPdf] = useState(false);


    /* =========================
       CARREGAR CLIENTES
    ========================= */

    const carregarEscoteiros = () => {

        fetch(`${API_URL}/get_escoteiros`)
            .then((response) => {

                if (!response.ok) {
                    throw new Error(
                        "Erro ao obter os clientes"
                    );
                }

                return response.json();
            })
            .then((data) => {

                setEscoteiros(data);

            })
            .catch((error) => {

                console.error(
                    "Erro ao carregar clientes:",
                    error
                );

                alert(
                    "Não foi possível carregar os clientes."
                );
            });
    };


    /* =========================
       CARREGAR PRODUTOS
    ========================= */

    const carregarItens = () => {

        fetch(`${API_URL}/get_itens`)
            .then((response) => {

                if (!response.ok) {
                    throw new Error(
                        "Erro ao obter os produtos"
                    );
                }

                return response.json();
            })
            .then((data) => {

                setItens(data);

            })
            .catch((error) => {

                console.error(
                    "Erro ao carregar produtos:",
                    error
                );

                alert(
                    "Não foi possível carregar os produtos."
                );
            });
    };


    /* =========================
       CARREGAR DADOS
    ========================= */

    useEffect(() => {

        carregarEscoteiros();
        carregarItens();

    }, []);


    /* =========================
       PESQUISA CLIENTE
    ========================= */

    const clientesFiltrados = escoteiros.filter(
        (escoteiro) => {

            const texto =
                pesquisaCliente.toLowerCase();

            return (

                String(
                    escoteiro.id_escoteiro
                )
                    .toLowerCase()
                    .includes(texto)

                ||

                escoteiro.nome
                    ?.toLowerCase()
                    .includes(texto)

                ||

                escoteiro.totem
                    ?.toLowerCase()
                    .includes(texto)

                ||

                escoteiro.nome_encarregado
                    ?.toLowerCase()
                    .includes(texto)

                ||

                escoteiro.email_encarregado
                    ?.toLowerCase()
                    .includes(texto)
            );
        }
    );


    /* =========================
       PESQUISA PRODUTO
    ========================= */

    const itensFiltrados = itens.filter(
        (item) => {

            const texto =
                pesquisaProduto.toLowerCase();

            return (

                String(item.id_item)
                    .toLowerCase()
                    .includes(texto)

                ||

                item.nome_item
                    ?.toLowerCase()
                    .includes(texto)

                ||

                item.desc_item
                    ?.toLowerCase()
                    .includes(texto)
            );
        }
    );


    /* =========================
       ADICIONAR PRODUTO
    ========================= */

    const adicionarProduto = () => {

        if (!produtoSelecionado) {

            alert(
                "Selecione um produto."
            );

            return;
        }


        const novaQuantidade =
            Number(quantidade);


        if (
            !Number.isInteger(novaQuantidade) ||
            novaQuantidade <= 0
        ) {

            alert(
                "A quantidade deve ser um número inteiro superior a zero."
            );

            return;
        }


        /*
         * Verifica se o produto
         * já existe no comprovante.
         */

        const produtoExistente =
            produtosVenda.find(
                (produto) =>
                    produto.id_item ===
                    produtoSelecionado.id_item
            );


        if (produtoExistente) {

            setProdutosVenda(
                produtosVenda.map(
                    (produto) => {

                        if (
                            produto.id_item ===
                            produtoSelecionado.id_item
                        ) {

                            return {
                                ...produto,

                                quantidade:
                                    produto.quantidade +
                                    novaQuantidade
                            };
                        }

                        return produto;
                    }
                )
            );

        } else {

            setProdutosVenda([
                ...produtosVenda,

                {
                    id_item:
                        produtoSelecionado.id_item,

                    nome_item:
                        produtoSelecionado.nome_item,

                    desc_item:
                        produtoSelecionado.desc_item,

                    preco_item:
                        Number(
                            produtoSelecionado.preco_item || 0
                        ),

                    quantidade:
                        novaQuantidade
                }
            ]);
        }


        /*
         * Limpa a seleção
         * para adicionar outro produto.
         */

        setProdutoSelecionado(null);

        setPesquisaProduto("");

        setQuantidade(1);
    };


    /* =========================
       ALTERAR QUANTIDADE
    ========================= */

    const alterarQuantidade = (
        id_item,
        valor
    ) => {

        const novaQuantidade =
            Number(valor);


        if (
            !Number.isInteger(novaQuantidade) ||
            novaQuantidade < 1
        ) {

            return;
        }


        setProdutosVenda(

            produtosVenda.map(
                (produto) => {

                    if (
                        produto.id_item ===
                        id_item
                    ) {

                        return {
                            ...produto,

                            quantidade:
                                novaQuantidade
                        };
                    }

                    return produto;
                }
            )
        );
    };


    /* =========================
       ALTERAR PREÇO
    ========================= */

    const alterarPreco = (
        id_item,
        valor
    ) => {

        const novoPreco =
            Number(
                String(valor)
                    .replace(",", ".")
            );


        if (
            isNaN(novoPreco) ||
            novoPreco < 0
        ) {

            return;
        }


        setProdutosVenda(

            produtosVenda.map(
                (produto) => {

                    if (
                        produto.id_item ===
                        id_item
                    ) {

                        return {
                            ...produto,

                            preco_item:
                                novoPreco
                        };
                    }

                    return produto;
                }
            )
        );
    };


    /* =========================
       REMOVER PRODUTO
    ========================= */

    const removerProduto = (
        id_item
    ) => {

        setProdutosVenda(

            produtosVenda.filter(
                (produto) =>
                    produto.id_item !==
                    id_item
            )
        );
    };


    /* =========================
       SUBTOTAL
    ========================= */

    const calcularSubtotal = (
        produto
    ) => {

        return (
            Number(
                produto.preco_item || 0
            )

            *

            Number(
                produto.quantidade || 0
            )
        );
    };


    /* =========================
       TOTAL
    ========================= */

    const calcularTotal = () => {

        return produtosVenda.reduce(
            (
                total,
                produto
            ) => {

                return (
                    total +
                    calcularSubtotal(
                        produto
                    )
                );

            },
            0
        );
    };


    /* =========================
       FORMATAR PREÇO
    ========================= */

    const formatarPreco = (
        valor
    ) => {

        return Number(
            valor || 0
        ).toFixed(2);
    };


    /* =========================
       GERAR PDF
    ========================= */

    const finalizarVenda = async () => {

        /* -------------------------
           VALIDAR CLIENTE
        ------------------------- */

        if (!clienteSelecionado) {

            alert(
                "Selecione um cliente."
            );

            return;
        }


        /* -------------------------
           VALIDAR PRODUTOS
        ------------------------- */

        if (
            produtosVenda.length === 0
        ) {

            alert(
                "Adicione pelo menos um produto à venda."
            );

            return;
        }


        /* -------------------------
           EVITAR DUPLO CLIQUE
        ------------------------- */

        if (gerandoPdf) {
            return;
        }


        try {

            setGerandoPdf(true);


            /* =========================
               CONSTRUIR VENDA
            ========================= */

            const venda = {

                id_escoteiro:
                    clienteSelecionado.id_escoteiro,

                produtos:

                    produtosVenda.map(
                        (produto) => ({

                            id_item:
                                produto.id_item,
                            
                            nome_item:
                                produto.nome_item,


                            quantidade:
                                Number(
                                    produto.quantidade
                                ),

                            preco_unitario:
                                Number(
                                    produto.preco_item
                                )
                        })
                    ),

                total:
                    Number(
                        calcularTotal()
                            .toFixed(2)
                    )
            };


            console.log(
                "Dados enviados para gerar PDF:",
                {
                    cliente:
                        clienteSelecionado,

                    venda:
                        venda,

                    produtos:
                        itens
                }
            );


            /* =========================
               PEDIR PDF AO FLASK
            ========================= */

            const response =
                await fetch(
                    `${API_URL}/gerar_comprovante`,
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                cliente:
                                    clienteSelecionado,

                                venda:
                                    venda,

                                produtos:
                                    itens
                            })
                    }
                );


            /* =========================
               VERIFICAR RESPOSTA
            ========================= */

            if (!response.ok) {

                let mensagem =
                    "Erro ao gerar o comprovante.";

                try {

                    const erro =
                        await response.json();

                    if (erro.erro) {
                        mensagem =
                            erro.erro;
                    }

                } catch {
                    // Resposta não era JSON
                }

                throw new Error(
                    mensagem
                );
            }


            /* =========================
               RECEBER PDF
            ========================= */

            const blob =
                await response.blob();


            /* =========================
               CRIAR URL TEMPORÁRIA
            ========================= */

            const url =
                window.URL.createObjectURL(
                    blob
                );


            /* =========================
               ABRIR PDF
            ========================= */

            window.open(
                url,
                "_blank"
            );


            /*
             * Liberta a URL temporária
             * depois de alguns segundos.
             */

            setTimeout(() => {

                window.URL.revokeObjectURL(
                    url
                );

            }, 10000);


        } catch (error) {

            console.error(
                "Erro ao gerar comprovante:",
                error
            );

            alert(
                error.message ||
                "Não foi possível gerar o comprovante."
            );

        } finally {

            setGerandoPdf(false);
        }
    };


    return (

        <div className="vendas-container">


            {/* =================================
                PESQUISA CLIENTE
            ================================= */}

            {!clienteSelecionado && (

                <div className="pesquisa-cliente">

                    <input
                        type="text"

                        placeholder={
                            "Pesquisar cliente..."
                        }

                        value={
                            pesquisaCliente
                        }

                        onChange={(e) => {

                            setPesquisaCliente(
                                e.target.value
                            );

                        }}
                    />

                </div>
            )}


            {/* =================================
                RESULTADOS CLIENTE
            ================================= */}

            {!clienteSelecionado &&
                pesquisaCliente && (

                    <div className="resultados-clientes">

                        {clientesFiltrados.length === 0 ? (

                            <p>
                                Nenhum cliente encontrado.
                            </p>

                        ) : (

                            clientesFiltrados.map(
                                (escoteiro) => (

                                    <div
                                        key={
                                            escoteiro.id_escoteiro
                                        }

                                        className={
                                            "cliente-resultado"
                                        }

                                        onClick={() => {

                                            setClienteSelecionado(
                                                escoteiro
                                            );

                                            setPesquisaCliente(
                                                escoteiro.nome
                                            );

                                        }}
                                    >

                                        <strong>
                                            {
                                                escoteiro.nome
                                            }
                                        </strong>

                                        {escoteiro.totem && (

                                            <span>
                                                Totem:{" "}
                                                {
                                                    escoteiro.totem
                                                }
                                            </span>

                                        )}
                                                                                <span>
                                            Encarregado:{" "}
                                            {
                                                escoteiro.nome_encarregado
                                            }
                                        </span>

                                    </div>
                                )
                            )
                        )}

                    </div>
                )
            }


            {/* =================================
                CLIENTE SELECIONADO
            ================================= */}

            {clienteSelecionado && (

                <div className="cliente-selecionado">

                    <h3>
                        Cliente
                    </h3>

                    <p>

                        <strong>
                            Nome:
                        </strong>{" "}

                        {
                            clienteSelecionado.nome
                        }

                    </p>

                    <p>

                        <strong>
                            Totem:
                        </strong>{" "}

                        {
                            clienteSelecionado.totem ||
                            "-"
                        }

                    </p>

                    <button
                        onClick={() => {

                            setClienteSelecionado(
                                null
                            );

                            setPesquisaCliente(
                                ""
                            );

                        }}
                    >
                        Alterar cliente
                    </button>

                </div>
            )}


            {/* =================================
                PRODUTOS
            ================================= */}

            {clienteSelecionado && (

                <>

                    <div className="produtos-venda">

                        <h3>
                            Adicionar produto
                        </h3>


                        {/* =================================
                            PESQUISA PRODUTO
                        ================================= */}

                        <div className="pesquisa-produto">

                            <input
                                type="text"

                                placeholder={
                                    "Pesquisar produto..."
                                }

                                value={
                                    pesquisaProduto
                                }

                                onChange={(e) => {

                                    setPesquisaProduto(
                                        e.target.value
                                    );

                                    setProdutoSelecionado(
                                        null
                                    );

                                }}
                            />

                        </div>


                        {/* =================================
                            RESULTADOS DOS PRODUTOS
                        ================================= */}

                        {pesquisaProduto &&
                            !produtoSelecionado && (

                                <div className="resultados-produtos">

                                    {itensFiltrados.length === 0 ? (

                                        <p>
                                            Nenhum produto encontrado.
                                        </p>

                                    ) : (

                                        itensFiltrados.map(
                                            (item) => (

                                                <div
                                                    key={
                                                        item.id_item
                                                    }

                                                    className={
                                                        "produto-resultado"
                                                    }

                                                    onClick={() => {

                                                        setProdutoSelecionado(
                                                            item
                                                        );

                                                        setPesquisaProduto(
                                                            item.nome_item
                                                        );

                                                    }}
                                                >

                                                    {/* NOME + DESCRIÇÃO */}

                                                    <div>

                                                        <strong>
                                                            {
                                                                item.nome_item
                                                            }
                                                        </strong>

                                                        {item.desc_item && (

                                                            <span
                                                                className={
                                                                    "produto-descricao"
                                                                }
                                                            >
                                                                {
                                                                    item.desc_item
                                                                }
                                                            </span>

                                                        )}

                                                    </div>


                                                    {/* PREÇO */}

                                                    <span>

                                                        €

                                                        {" "}

                                                        {
                                                            formatarPreco(
                                                                item.preco_item
                                                            )
                                                        }

                                                    </span>

                                                </div>
                                            )
                                        )
                                    )}

                                </div>
                            )
                        }


                        {/* =================================
                            PRODUTO SELECIONADO
                        ================================= */}

                        {produtoSelecionado && (

                            <div className="produto-adicionar">

                                <div>

                                    <strong>
                                        {
                                            produtoSelecionado.nome_item
                                        }
                                    </strong>

                                    {produtoSelecionado.desc_item && (

                                        <span>
                                            {
                                                produtoSelecionado.desc_item
                                            }
                                        </span>

                                    )}

                                    <span>

                                        Preço:

                                        {" "}

                                        €

                                        {" "}

                                        {
                                            formatarPreco(
                                                produtoSelecionado.preco_item
                                            )
                                        }

                                    </span>

                                </div>


                                <input
                                    className={
                                        "input-quantidade-insert"
                                    }

                                    type="number"

                                    min="1"

                                    step="1"

                                    value={
                                        quantidade
                                    }

                                    onChange={(e) =>
                                        setQuantidade(
                                            e.target.value
                                        )
                                    }
                                />


                                <button
                                    onClick={
                                        adicionarProduto
                                    }
                                >
                                    Adicionar
                                </button>

                            </div>
                        )}

                    </div>


                    {/* =================================
                        COMPROVANTE
                    ================================= */}

                    {produtosVenda.length > 0 && (

                        <div className="comprovante">

                            <h3>
                                Lista de Produtos
                            </h3>


                            <table>

                                <thead>

                                    <tr>

                                        <th>
                                            Produto
                                        </th>

                                        <th>
                                            Quantidade
                                        </th>

                                        <th>
                                            Preço
                                        </th>

                                        <th>
                                            Subtotal
                                        </th>

                                        <th>
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {produtosVenda.map(
                                        (produto) => (

                                            <tr
                                                key={
                                                    produto.id_item
                                                }
                                            >

                                                {/* PRODUTO */}

                                                <td>

                                                    <strong>
                                                        {
                                                            produto.nome_item
                                                        }
                                                    </strong>

                                                </td>


                                                {/* QUANTIDADE */}

                                                <td>

                                                    <input
                                                        className={
                                                            "input-quantidade"
                                                        }

                                                        type="number"

                                                        min="1"

                                                        step="1"

                                                        value={
                                                            produto.quantidade
                                                        }

                                                        onChange={(e) =>
                                                            alterarQuantidade(
                                                                produto.id_item,
                                                                e.target.value
                                                            )
                                                        }
                                                    />

                                                </td>


                                                {/* PREÇO */}

                                                <td>

                                                    <div
                                                        className={
                                                            "preco-editavel"
                                                        }
                                                    >

                                                        <span>
                                                            €
                                                        </span>

                                                        <input
                                                            type="number"

                                                            min="0"

                                                            step="0.01"

                                                            value={
                                                                produto.preco_item
                                                            }

                                                            onChange={(e) =>
                                                                alterarPreco(
                                                                    produto.id_item,
                                                                    e.target.value
                                                                )
                                                            }
                                                        />

                                                    </div>

                                                </td>


                                                {/* SUBTOTAL */}

                                                <td>

                                                    <strong>

                                                        €

                                                        {" "}

                                                        {
                                                            formatarPreco(
                                                                calcularSubtotal(
                                                                    produto
                                                                )
                                                            )
                                                        }

                                                    </strong>

                                                </td>


                                                {/* REMOVER */}

                                                <td>

                                                    <button
                                                        className={
                                                            "btn-remover"
                                                        }

                                                        onClick={() =>
                                                            removerProduto(
                                                                produto.id_item
                                                            )
                                                        }
                                                    >
                                                        Remover
                                                    </button>

                                                </td>

                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>


                            {/* =================================
                                TOTAL
                            ================================= */}

                            <div className="total-venda">

                                <span>
                                    Total
                                </span>

                                <strong>

                                    €

                                    {" "}

                                    {
                                        formatarPreco(
                                            calcularTotal()
                                        )
                                    }

                                </strong>

                            </div>


                            {/* =================================
                                FINALIZAR VENDA
                            ================================= */}

                            <div className="finalizar-venda-container">

                                <button
                                    className={
                                        "btn-finalizar-venda"
                                    }

                                    onClick={
                                        finalizarVenda
                                    }

                                    disabled={
                                        gerandoPdf
                                    }
                                >

                                    {gerandoPdf
                                        ? "A gerar comprovante..."
                                        : "Gerar Comprovante"
                                    }

                                </button>

                            </div>

                        </div>
                    )}

                </>
            )}

        </div>
    );
}

export default Comprovante_content;
