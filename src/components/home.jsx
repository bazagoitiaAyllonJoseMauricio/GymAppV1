import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { app } from "../config/firebase";
import { getAuth, signOut } from "firebase/auth";
import { useDataContextProvider } from "../contexts/dataContextUser";
import usfxImage from "../assets/logoUSFX.png";
const auth = getAuth(app);
function Home() {
  const data = useDataContextProvider();
  console.log(data.rol);
  const roles = data.rol;
  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        // Realizar cualquier acción adicional después de cerrar la sesión, como redireccionar
        console.log("Cerraste la sesión correctamente");
        // Puedes redirigir al usuario a la página de inicio de sesión u otra página aquí si es necesario
      })
      .catch((error) => {
        // Manejar errores si ocurrieron al cerrar la sesión
        console.error("Error al cerrar la sesión:", error);
      });
  };
  return (
    <div>
      <nav className="bg-red-700 text-white p-4">
        <div className="flex items-center justify-between">
          <img src={usfxImage} alt="Logo" className="w-12 h-12 rounded-full" />
          <div className="flex space-x-4">
            <Link to="/adminView" className="hover:underline">
              Inicio
            </Link>
            <Link to="/listaUsuarios" className="hover:underline">
              Usuarios
            </Link>
            <Link to="/listaAccesos" className="hover:underline">
              Accesos
            </Link>
            <Link
              to="/auth"
              onClick={handleSignOut}
              className="hover:underline"
            >
              Log Out
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}
export default Home;
