import "./App.css";
import { useAuth } from "./context/AuthContext";

function App_content() {
  const { user } = useAuth();

  return (


    
    <div className="conteudo-centralizado">
            {user && (
        <div className="boas-vindas">
          Bem-vindo, <strong>{user.name}</strong>!
        </div>
      )}
      <div className="sobre-projeto">
        Este projeto foi desenvolvido por <strong>Caio Sanches</strong>{" "}
        (caio.sanches@escoteiros.pt), membro do grupo{" "}
        <strong>Escoteiros de Leça da Palmeira 43</strong>, com o objetivo de
        facilitar o controle financeiro das atividades e venda de itens da nossa lojinha.

        <p>Para utilizar o sistema é necessário que o usuário esteja logado.</p>
        <p>A aplicação tem três secções, acessíveis pelo menu:</p>

        <ul>
          <li><strong>Cliente:</strong> permite registar e consultar clientes.</li>
          <li><strong>Produto:</strong> permite adicionar e consultar os produtos disponíveis.</li>
          <li><strong>Comprovante:</strong> permite criar um comprovante de venda.</li>
        </ul>

        <p className="aviso">
          <strong>Aviso:</strong> este é um projeto pessoal, sem qualquer vínculo
          financeiro, com o grupo de Escoteiros de Leça da Palmeira 43 ou com qualquer
          outra entidade. O autor não se responsabiliza pela utilização da
          aplicação nem pelos dados nela registados.
        </p>
      </div>
    </div>
  );
}

export default App_content;