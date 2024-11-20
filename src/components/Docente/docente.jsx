import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../config/firebase";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { useDataContextProvider } from "../../contexts/dataContextUser";
import Layout from "./layout";

function Docente() {
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

  const getSpanClass = (acceso) => {
    if (acceso === "Aceptado") return "text-green-500 font-semibold";
    if (acceso === "Denegado") return "text-red-500 font-semibold";
    return "text-gray-500 font-semibold";
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 flex justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">Perfil de Usuario</h2>
          {usuario ? (
            <>
              <div className="flex flex-col items-center mb-6">
                <img
                  src={`https://ui-avatars.com/api/?name=${usuario.nombre}+${usuario.apellido}&background=0071c5&color=fff&size=128`}
                  alt="Avatar"
                  className="rounded-full mb-4 shadow-md"
                />
                <h3 className="text-xl font-semibold text-gray-800">{`${usuario.nombre} ${usuario.apellido}`}</h3>
                <p className="text-gray-600"><strong>Email:</strong> {usuario.email}</p>
                <p className="text-gray-600"><strong>Rol:</strong> {usuario.rol}</p>
              </div>
              <div className="space-y-4">
                {usuario.codigoTarjeta && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Código Tarjeta RFID:</span> {usuario.codigoTarjeta}{" ("}
                    <span className={`${getSpanClass(usuario.accesoRfid)}`}>
                      {usuario.accesoRfid === "Aceptado" ? "Activo" : "Bloqueado"}
                    </span>{")"}
                  </p>
                )}
                {usuario.dispositivoCodigo && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Código Dispositivo NFC:</span> {usuario.dispositivoCodigo}{" ("}
                    <span className={`${getSpanClass(usuario.accesoNFC)}`}>
                      {usuario.accesoNFC === "Aceptado" ? "Activo" : "Bloqueado"}
                    </span>{")"}
                  </p>
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
}

export default Docente;
