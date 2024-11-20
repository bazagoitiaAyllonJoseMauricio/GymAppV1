import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../../../config/firebase";
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import Layout from "../layout";

function UsuarioDetails() {
  const { codigo_tarjeta, tipoT } = useParams(); // Obtener los parámetros de la URL
  const [usuario, setUsuario] = useState(null);
  const codigoTarjeta = atob(codigo_tarjeta); // Decodificar el código de tarjeta
  const navigate = useNavigate(); // Hook para navegación

  useEffect(() => {
    fetchUserData();
  }, [codigoTarjeta, tipoT]);

  /**
   * Fetch user data from Firestore based on the card code and type
   */
  const fetchUserData = async () => {
    try {
      const usuariosCollection = collection(db, "usuarios");
      let q;

      if (tipoT === "RFID") {
        q = query(usuariosCollection, where("tarjetaRFID", "==", codigoTarjeta));
      } else if (tipoT === "NFC") {
        q = query(usuariosCollection, where("dispositivoCodigo", "==", codigoTarjeta));
      }

      const usuariosSnapshot = await getDocs(q);

      if (!usuariosSnapshot.empty) {
        const userData = usuariosSnapshot.docs[0].data();
        setUsuario({ id: usuariosSnapshot.docs[0].id, ...userData });
      } else {
        console.log("No existe el usuario con el código de tarjeta especificado");
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  };

  const handleCambiarAcceso = async (userId, newAcceso) => {
    try {
      const userDocRef = doc(db, "usuarios", userId);
      await updateDoc(userDocRef, { acceso: newAcceso });
      setUsuario((prevUsuario) => ({ ...prevUsuario, acceso: newAcceso }));
    } catch (error) {
      console.error("Error al cambiar el acceso del usuario:", error);
    }
  };

  const handleEliminarUsuario = async (userId) => {
    try {
      const userDocRef = doc(db, "usuarios", userId);
      await deleteDoc(userDocRef);
      setUsuario(null);
    } catch (error) {
      console.error("Error al eliminar el usuario:", error);
    }
  };

  const getSpanClass = (acceso) => {
    if (acceso === "Aceptado") return "text-green-500 font-semibold";
    if (acceso === "Denegado") return "text-red-500 font-semibold";
    return "text-gray-500 font-semibold";
  };

  const getButtonClass = (acceso) => {
    if (acceso === "Aceptado") return "bg-red-500 hover:bg-red-700";
    if (acceso === "Denegado") return "bg-green-500 hover:bg-green-700";
    return "bg-gray-500 hover:bg-gray-700";
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold text-center text-cyan-600">Detalles del Usuario</h2>
          <button
            onClick={() => navigate("/admin")}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver a Administración
          </button>
        </div>
        {usuario ? (
          <div className="bg-white shadow-lg rounded-lg p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Nombre:</label>
                <p className="text-lg">{usuario.nombre}</p>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Apellido:</label>
                <p className="text-lg">{usuario.apellido}</p>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Correo Electrónico:</label>
                <p className="text-lg">{usuario.email}</p>
              </div>
              <div>
                <label className="block text-gray-700 text-sm font-bold mb-2">Rol:</label>
                <p className="text-lg">{usuario.rol}</p>
              </div>
              <div>
                {usuario.codigoTarjeta && (
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Código Tarjeta RFID:</label>
                    <p className="text-lg">
                      {usuario.codigoTarjeta}{" ("}
                      <span className={`${getSpanClass(usuario.accesoRfid)}`}>
                        {usuario.accesoRfid === "Aceptado" ? "Activo" : "Bloqueado"}
                      </span>{")"}
                    </p>
                  </div>
                )}
              </div>
              <div>
                {usuario.dispositivoCodigo && (
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Código Dispositivo NFC:</label>
                    <p className="text-lg">
                      {usuario.dispositivoCodigo}{" ("}
                      <span className={`${getSpanClass(usuario.accesoNFC)}`}>
                        {usuario.accesoNFC === "Aceptado" ? "Activo" : "Bloqueado"}
                      </span>{")"}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-700">Cargando usuario...</p>
        )}
      </div>
    </Layout>
  );
}

export default UsuarioDetails;
