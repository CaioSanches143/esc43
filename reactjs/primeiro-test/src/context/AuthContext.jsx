import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const url_flask = process.env.REACT_APP_URL_FLASK;


export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    fetch(`${url_flask}/api/me`, {
      credentials: "include",
    })
      .then((response) => (response.ok ? response.json() : null))
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function logout() {
    try {
      await fetch(`${url_flask}/logout`, {
        credentials: "include",
      });
    } finally {
      setUser(null);
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve ser usado dentro de AuthProvider");
  }

  return context;
}