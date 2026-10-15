import "./Header.css";
import logo from "../img/logo_aep.png";
import { useAuth } from "../../context/AuthContext";

function Header({ onNavegar }) {
  const { user, logout } = useAuth();
  const a = true;

  async function sair() {
    try {
      await logout();
    } finally {
      onNavegar("home");
    }
  }

    function iniciarLoginSSO() {
    window.location.href = "http://localhost:5000/login";
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
          <button
            onClick={() => {
              if (user) {
                onNavegar("produto");
              } else {
                onNavegar("loginOff");
              }
            }}
          >
            Produto
          </button>
        {a && <button onClick={() => onNavegar("cliente")}>Cliente</button>}
        {a && <button onClick={() => onNavegar("comprovante")}>Comprovante</button>}
        {a && (
        <button onClick={user ? sair : iniciarLoginSSO}>
          {user ? "Sair" : "Login"}
        </button>
        )}
      </nav>
    </header>
  );
}

export default Header;