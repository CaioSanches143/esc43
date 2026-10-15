import "./Cliente_content.css";
import { useEffect, useState } from "react";



const API_URL = process.env.REACT_APP_API_URL;

function Cliente_content() {

    const [list_escoteiros, setListEscoteiros] = useState([]);
    const [pesquisa, setPesquisa] = useState("");

    const [novoEscoteiro, setNovoEscoteiro] = useState({
        nome: "",
        totem: "",
        nome_encarregado: "",
        email_encarregado: ""
    });

    const carregarEscoteiros = () => {
        fetch(`${API_URL}/get_escoteiros`)
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Erro ao obter os escoteiros");
                }

                return response.json();
            })
            .then((data) => {
                setListEscoteiros(data);
            })
            .catch((error) => {
                console.error("Erro:", error);
            });
    };

    useEffect(() => {
        carregarEscoteiros();
    }, []);

    const handleNovoEscoteiro = (e) => {
        setNovoEscoteiro({
            ...novoEscoteiro,
            [e.target.name]: e.target.value
        });
    };

 const adicionarEscoteiro = async () => {

    if (
        !novoEscoteiro.nome ||
        !novoEscoteiro.nome_encarregado ||
        !novoEscoteiro.email_encarregado
    ) {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    try {

        const response = await fetch(`${API_URL}/add_escoteiro`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(novoEscoteiro)
        });

        // Tenta obter a resposta do Flask
        const data = await response.json();

        // Se Flask devolveu erro
        if (!response.ok) {
            console.error("Erro devolvido pelo Flask:", data);

            throw new Error(
                data.erro || 
                data.error || 
                `Erro HTTP ${response.status}`
            );
        }

        console.log("Resposta do Flask:", data);

        alert("Escoteiro adicionado.");

        setNovoEscoteiro({
            nome: "",
            totem: "",
            nome_encarregado: "",
            email_encarregado: ""
        });

        carregarEscoteiros();

    } catch (error) {

        console.error("ERRO AO ADICIONAR ESCOTEIRO:", error);

        alert(`Não foi possível adicionar o escoteiro:\n${error.message}`);
    }
};
    const escoteirosFiltrados = list_escoteiros.filter((escoteiro) => {

        const texto = pesquisa.toLowerCase();

        return (
            String(escoteiro.id_escoteiro)
                .toLowerCase()
                .includes(texto) ||

            escoteiro.nome?.toLowerCase().includes(texto) ||

            escoteiro.totem?.toLowerCase().includes(texto) ||

            escoteiro.nome_encarregado?.toLowerCase().includes(texto) ||

            escoteiro.email_encarregado?.toLowerCase().includes(texto)
        );
    });

    return (
        <div className="cliente-container">

            {/* NOVO ESCOTEIRO */}
            <div className="novo-escoteiro">

                <input
                    type="text"
                    name="nome"
                    placeholder="Nome"
                    value={novoEscoteiro.nome}
                    onChange={handleNovoEscoteiro}
                />

                <input
                    type="text"
                    name="totem"
                    placeholder="Totem"
                    value={novoEscoteiro.totem}
                    onChange={handleNovoEscoteiro}
                />

                <input
                    type="text"
                    name="nome_encarregado"
                    placeholder="Encarregado"
                    value={novoEscoteiro.nome_encarregado}
                    onChange={handleNovoEscoteiro}
                />

                <input
                    type="email"
                    name="email_encarregado"
                    placeholder="Email"
                    value={novoEscoteiro.email_encarregado}
                    onChange={handleNovoEscoteiro}
                />

                <button onClick={adicionarEscoteiro}>
                    Adicionar
                </button>

            </div>


            {/* PESQUISA */}
            <div className="pesquisa-container">

                <input
                    type="text"
                    placeholder="Pesquisar escoteiro..."
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
                        <th>Totem</th>
                        <th>Encarregado</th>
                        <th>Email</th>
                    </tr>
                </thead>

                <tbody>

                    {escoteirosFiltrados.map((escoteiro) => (

                        <tr key={escoteiro.id_escoteiro}>
                            <td>{escoteiro.id_escoteiro}</td>
                            <td>{escoteiro.nome}</td>
                            <td>{escoteiro.totem}</td>
                            <td>{escoteiro.nome_encarregado}</td>
                            <td>{escoteiro.email_encarregado}</td>
                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}

export default Cliente_content;