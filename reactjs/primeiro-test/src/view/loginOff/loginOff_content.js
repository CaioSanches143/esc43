import "../../App.css";
import { useAuth } from "../../context/AuthContext";

function LoginOff_content() {
  const { user } = useAuth();

  if (user) {
    return null;
  }

  return (
    <div className="conteudo-centralizado">
      <div className="boas-vindas">
        Por favor, faça o login no sistema para aceder às funcionalidades da
        aplicação.
      </div>
    </div>
  );
}

export default LoginOff_content;