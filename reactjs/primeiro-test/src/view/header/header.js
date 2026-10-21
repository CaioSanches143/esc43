import "./Header.css";
import logo from "../img/logo_aep.png";
import { useAuth } from "../../context/AuthContext";

const reactAppApiUrl = process.env.REACT_APP_URL_FLASK;

function Header({ onNavegar }) {
  const { user, logout } = useAuth();

  async function sair() {
    try {
      await logout();
    } finally {
      onNavegar("home");
    }
  }

    function iniciarLoginSSO() {
    window.location.href = `${reactAppApiUrl}/login`;
  }

  return (
    <header>
      <nav>
        <img
          src={logo}
          alt="Logo AEP"
          className="logo"
          onClick={() => onNavegar("home")}
        />

        <button onClick={() => onNavegar("home")}>Home</button>
        {user && (
          <>
            <button onClick={() => onNavegar("produto")}>Produto</button>
            <button onClick={() => onNavegar("cliente")}>Cliente</button>
            <button onClick={() => onNavegar("comprovante")}>Comprovante</button>
          </>
        )}
        <button onClick={user ? sair : iniciarLoginSSO}>
          {user ? "Sair" : "Login"}
        </button>
      </nav>
    </header>
  );
}

export default Header;