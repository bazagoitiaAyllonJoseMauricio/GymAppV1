import React, { useState, useEffect } from "react";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import Layout from "../layout";
import { useDataContextProvider } from "../../../contexts/dataContextUser";
import { FaRegCreditCard, FaMobileAlt } from "react-icons/fa";

const BloqueoAcceso = () => {
  const data = useDataContextProvider();
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    if (data.uid) {
      fetchUserData();
    }
  }, [data.uid]);

  const fetchUserData = async () => {
    try {
      const userDocRef = doc(db, "usuarios", data.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        setUsuario({ id: userDoc.id, ...userDoc.data() });
      } else {
        console.log("No existe el usuario con el UID especificado");
      }
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
    }
  };

  const handleCambiarAcceso = async (campo, nuevoAcceso) => {
    if (usuario) {
      try {
        const usuarioRef = doc(db, "usuarios", usuario.id);
        await updateDoc(usuarioRef, { [campo]: nuevoAcceso });
        setUsuario((prevState) => ({ ...prevState, [campo]: nuevoAcceso }));
        console.log("Acceso actualizado correctamente");
      } catch (error) {
        console.error("Error al actualizar el acceso:", error.message);
      }
    }
  };

  const getButtonClass = (acceso) => {
    if (acceso === "Aceptado") return "bg-red-500 hover:bg-red-600";
    if (acceso === "Denegado") return "bg-green-500 hover:bg-green-600";
    return "bg-gray-500 hover:bg-gray-600";
  };

  const getSpanClass = (acceso) => {
    if (acceso === "Aceptado") return "text-green-700";
    if (acceso === "Denegado") return "text-red-700";
    return "";
  };

  return (
    <Layout>
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
          {usuario ? (
            <>
              <div className="space-y-8">
                {usuario.tarjetaRFID && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <FaRegCreditCard className="text-blue-700" size={24} />
                      <p>
                        <span className="font-semibold">Código Tarjeta RFID:</span>{" "}
                        {usuario.tarjetaRFID}
                        {" ("}
                        <span className={`${getSpanClass(usuario.accesoRfid)}`}>
                          {usuario.accesoRfid === "Aceptado" ? "Activo" : "Bloqueado"}
                        </span>
                        {")"}
                      </p>
                    </div>
                    <button
                      className={`ml-2 py-2 px-4 rounded ${getButtonClass(usuario.accesoRfid)} text-white`}
                      onClick={() =>
                        handleCambiarAcceso(
                          "accesoRfid",
                          usuario.accesoRfid === "Aceptado" ? "Denegado" : "Aceptado"
                        )
                      }
                    >
                      {usuario.accesoRfid === "Aceptado" ? "Bloquear" : "Activar"}
                    </button>
                  </div>
                )}
                {usuario.dispositivoCodigo && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <FaMobileAlt className="text-blue-700" size={24} />
                      <p>
                        <span className="font-semibold">Código Dispositivo NFC:</span>{" "}
                        {usuario.dispositivoCodigo}
                        {" ("}
                        <span className={`${getSpanClass(usuario.accesoNFC)}`}>
                          {usuario.accesoNFC === "Aceptado" ? "Activo" : "Bloqueado"}
                        </span>
                        {")"}
                      </p>
                    </div>
                    <button
                      className={`ml-2 py-2 px-4 rounded ${getButtonClass(usuario.accesoNFC)} text-white`}
                      onClick={() =>
                        handleCambiarAcceso(
                          "accesoNFC",
                          usuario.accesoNFC === "Aceptado" ? "Denegado" : "Aceptado"
                        )
                      }
                    >
                      {usuario.accesoNFC === "Aceptado" ? "Bloquear" : "Activar"}
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <p className="text-center text-gray-600">Cargando usuario...</p>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default BloqueoAcceso;
