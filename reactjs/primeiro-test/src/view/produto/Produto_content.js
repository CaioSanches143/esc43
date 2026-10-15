import "./Produto_content.css";
import { useEffect, useState } from "react";

const API_URL = process.env.REACT_APP_API_URL;

const ITEM_VAZIO = {
    nome_item: "",
    desc_item: "",
    preco_item: ""
};

function Produto_content() {

    const [list_itens, setListItens] = useState([]);
    const [pesquisa, setPesquisa] = useState("");
    const [novoItem, setNovoItem] = useState(ITEM_VAZIO);

    const carregarItens = () => {
        fetch(`${API_URL}/get_itens`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erro ao obter os itens");
                }

                return response.json();
            })
            .then((data) => {
                setListItens(data);
            })
            .catch((error) => {
                console.error("Erro:", error);
            });
    };

    useEffect(() => {
        carregarItens();
    }, []);

    const handleNovoItem = (e) => {
        setNovoItem({
            ...novoItem,
            [e.target.name]: e.target.value
        });
    };

    const adicionarItem = async () => {

        // Só o nome é obrigatório (NOT NULL na tabela)
        if (!novoItem.nome_item.trim()) {
            alert("Preencha o nome do item.");
            return;
        }

        // preco_item é REAL: envia número (ou null se vazio)
        const preco = novoItem.preco_item === ""
            ? null
            : parseFloat(String(novoItem.preco_item).replace(",", "."));

        if (preco !== null && isNaN(preco)) {
            alert("Preço inválido.");
            return;
        }

        const payload = {
            nome_item: novoItem.nome_item.trim(),
            desc_item: novoItem.desc_item.trim() || null,
            preco_item: preco
        };

        try {

            const response = await fetch(`${API_URL}/add_item`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                console.error("Erro devolvido pelo Flask:", data);

                throw new Error(
                    data.erro ||
                    data.error ||
                    `Erro HTTP ${response.status}`
                );
            }

            console.log("Resposta do Flask:", data);

            alert("Item adicionado.");

            setNovoItem(ITEM_VAZIO);

            carregarItens();

        } catch (error) {

            console.error("ERRO AO ADICIONAR ITEM:", error);

            alert(`Não foi possível adicionar o item:\n${error.message}`);
        }
    };

    const itensFiltrados = list_itens.filter((item) => {

        const texto = pesquisa.toLowerCase();

        return (
            String(item.id_item).toLowerCase().includes(texto) ||
            item.nome_item?.toLowerCase().includes(texto) ||
            item.desc_item?.toLowerCase().includes(texto) ||
            String(item.preco_item ?? "").includes(texto)
        );
    });

    const formatarPreco = (valor) =>
        valor === null || valor === undefined
            ? ""
            : Number(valor).toFixed(2);

    return (
        <div className="cliente-container">

            {/* NOVO ITEM */}
            <div className="novo-escoteiro">

                <input
                    type="text"
                    name="nome_item"
                    placeholder="Nome do item"
                    value={novoItem.nome_item}
                    onChange={handleNovoItem}
                />

                <input
                    type="text"
                    name="desc_item"
                    placeholder="Descrição"
                    value={novoItem.desc_item}
                    onChange={handleNovoItem}
                />

                <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="preco_item"
                    placeholder="Preço"
                    value={novoItem.preco_item}
                    onChange={handleNovoItem}
                />

                <button onClick={adicionarItem}>
                    Adicionar
                </button>

            </div>


            {/* PESQUISA */}
            <div className="pesquisa-container">

                <input
                    type="text"
                    placeholder="Pesquisar item..."
                    value={pesquisa}
                    onChange={(e) => setPesquisa(e.target.value)}
                />

            </div>


            {/* TABELA */}
            <table>

                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Preço</th>
                    </tr>
                </thead>

                <tbody>

                    {itensFiltrados.map((item) => (

                        <tr key={item.id_item}>
                            <td>{item.id_item}</td>
                            <td>{item.nome_item}</td>
                            <td>{item.desc_item}</td>
                            <td>€ {formatarPreco(item.preco_item)}</td>
                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default Produto_content;