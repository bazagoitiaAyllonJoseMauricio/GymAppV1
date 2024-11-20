import Layout from "../layout";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app, db } from "../../../config/firebase";
import { getDocs, collection } from "firebase/firestore";
import { format } from "date-fns";
import { FaSyncAlt } from "react-icons/fa";

const auth = getAuth(app);

function ListaRegistrosDocente() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [uid, setUid] = useState(null);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    const user = auth.currentUser;
    if (user) {
      setUid(user.uid);
      setUserName(user.displayName || "Usuario");
    }
  }, []);

  useEffect(() => {
    if (uid) {
      fetchData();
    }
  }, [selectedDate, uid]);

  const fetchData = async () => {
    setLoading(true);

    const usuariosCollection = collection(db, "usuarios");
    const usuariosSnapshot = await getDocs(usuariosCollection);
    const usuariosData = usuariosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    const registroCollection = collection(db, selectedDate);
    const registroSnapshot = await getDocs(registroCollection);
    const combinedData = registroSnapshot.docs.map((doc) => doc.data());

    const enrichedData = combinedData.map((registroItem) => {
      const matchingUsuario = usuariosData.find(
        (usuario) => usuario.codigoTarjeta === registroItem.codigo_tarjeta
      );
      return matchingUsuario
        ? { ...registroItem, ...matchingUsuario }
        : registroItem;
    });

    const dataWithUser = enrichedData.filter((dato) => dato.id_user === uid);

    dataWithUser.sort((a, b) => new Date(b.hora) - new Date(a.hora));
    setData(dataWithUser);

    setLoading(false);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const encriptarCodigoTarjeta = (codigoTarjeta) => {
    return btoa(codigoTarjeta);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 bg-white shadow-lg rounded-lg">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6">
          Vista {userName}
        </h2>
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="datePicker" className="text-gray-700 font-medium">
              Seleccionar fecha:
            </label>
            <input
              type="date"
              id="datePicker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <button
            className="flex items-center bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
            onClick={handleRefresh}
          >
            <FaSyncAlt className="mr-2" /> Actualizar datos
          </button>
        </div>
        {loading ? (
          <p className="text-center text-gray-500">Cargando datos...</p>
        ) : data.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay registros para la fecha seleccionada.
          </p>
        ) : (
          <div>
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Registros</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-300 rounded-lg shadow-md">
                <thead className="bg-gray-100 border-b border-gray-300">
                  <tr>
                    {[
                      "Código Tarjeta",
                      "Curso",
                      "Estado",
                      "Hora",
                    ].map((header) => (
                      <th
                        key={header}
                        className="px-6 py-3 text-left text-gray-600 font-medium"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((dato, index) => (
                    <tr
                      key={index}
                      className="hover:bg-gray-50 transition duration-150 ease-in-out"
                      style={{
                        backgroundColor:
                          dato.estado === "Admin" || dato.estado === "UsuarioAutorizado"
                            ? "#e6ffed"  // Verde claro
                            : "#ffe6e6",  // Rojo claro
                      }}
                    >
                      <td className="px-6 py-4 border-b border-gray-200 text-gray-700">
                        {`${dato.codigo_tarjeta} (${dato.tipoT})`}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-gray-700">
                        {dato.curso}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-gray-700">
                        {dato.estado}
                      </td>
                      <td className="px-6 py-4 border-b border-gray-200 text-gray-700">
                        {new Date(dato.hora).toLocaleTimeString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ListaRegistrosDocente;
