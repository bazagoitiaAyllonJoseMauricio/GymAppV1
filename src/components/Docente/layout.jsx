import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { app } from "../../config/firebase";
import { getAuth, signOut } from "firebase/auth";
import { useDataContextProvider } from "../../contexts/dataContextUser";
import usfxImage from "../../assets/logoUSFX.png"; // Ruta correcta al archivo NavLink.jsx

const auth = getAuth(app);

const Layout = ({ children }) => {
  const data = useDataContextProvider();
  const { clearContextData } = useDataContextProvider();
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        console.log("Cerraste la sesión correctamente");
      })
      .catch((error) => {
        console.error("Error al cerrar la sesión:", error);
      });
  };

  return (
    <div className="flex h-screen">
      {/* Barra lateral */}
      <nav className="bg-red-700 w-64 flex-shrink-0 flex flex-col justify-between">
        <div className="p-4">
          <img
            src={usfxImage}
            alt="Logo"
            className="w-15 h-15 rounded-full mb-4"
          />
          <div className="space-y-4">
            <NavLink to="/docente">Inicio</NavLink>
            <NavLink to="/docente/listaAccesos">Accesos</NavLink>
            <NavLink to="/docente/listaRegistros">Registros</NavLink>
            <NavLink to="/docente/bloqueo">Bloqueo de credenciales</NavLink>
            <NavLink to="/docente/solicitarAcceso">Solicitar Accesos</NavLink>
            {/*<NavLink to="/docente/informes">Informes</NavLink>*/}
          </div>
        </div>
        {/* Contenedor para centrar y pegar a la parte inferior */}
        <div className="mt-auto">
          <Link
            to="/"
            onClick={handleSignOut}
            className="block py-2 px-4 rounded text-white hover:bg-red-600 hover:text-white"
          >
            Log Out
          </Link>
        </div>
      </nav>

      {/* Contenido */}
      <main className="flex-1 p-8 overflow-y-auto">{children}</main>
    </div>
  );
};
const NavLink = ({ to, children }) => (
  <Link
    to={to}
    className="block py-2 px-4 rounded text-white hover:bg-red-600 hover:text-white"
  >
    {children}
  </Link>
);
export default Layout;
