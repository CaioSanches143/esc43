import "./Login_content.css";
import { useAuth } from "../../context/AuthContext";

function Login_content() {
  const { user, loading, logout } = useAuth();

  function iniciarLoginGoogle() {
    window.location.href = "http://localhost:5000/login";
  }

  if (loading) {
    return <div className="login-container">A carregar...</div>;
  }

  return (
    <div className="login-container">
      {user ? (
        <div>
          <h2>Bem-vindo, {user.name || user.email}!</h2>
          <button onClick={logout}>Sair do sistema</button>
        </div>
      ) : (
        <div>
          <h2>Faça Login na Plataforma</h2>
          <button onClick={iniciarLoginGoogle} className="btn-google">
            Entrar com o Google
          </button>
        </div>
      )}
    </div>
  );
}

export default Login_content;