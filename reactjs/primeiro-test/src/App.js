import { useState } from "react";
import "./App.css";
import Header from "./view/header/header";
import Cliente_main from "./view/cliente/Cliente_main";
import Produto_content from "./view/produto/Produto_content";
import Comprovante_content from "./view/comprovante/Comprovante_content";
import App_content from "./App_content";
import Login_content from "./view/login/Login_content";
import LoginOff_content from "./view/loginOff/loginOff_content";
import LoginNotAut_content from "./view/loginNotAut/LoginNotAut_content";
import { useAuth } from "./context/AuthContext";

function App() {
  const [pagina, setPagina] = useState(
    () => new URLSearchParams(window.location.search).get("pagina") || "home"
  );
  const { user } = useAuth();

  return (
    <>
      <Header onNavegar={setPagina} />

      <main>
        {pagina === "home" && <App_content />}

               {pagina === "produto" &&
          (user ? <Produto_content /> : <LoginOff_content />)}

        {pagina === "cliente" &&
          (user ? <Cliente_main /> : <LoginOff_content />)}

        {pagina === "comprovante" &&
          (user ? <Comprovante_content /> : <LoginOff_content />)}
        {pagina === "login" && <Login_content />}
        {pagina === "loginOff" && <LoginOff_content />}
        {pagina === "login_notAut" && <LoginNotAut_content />}
      </main>
    </>
  );
}

export default App;