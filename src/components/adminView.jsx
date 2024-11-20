import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { app, db } from "../config/firebase";
import { getDocs, collection } from "firebase/firestore";
import { format } from "date-fns";
import { FaSyncAlt } from "react-icons/fa";

const auth = getAuth(app);

export function AdminView() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [filtroNombre, setFiltroNombre] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedDate, filtroNombre]);

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
    const combinedData = registroSnapshot.docs.map((doc) => ({
      id_Registro: doc.id,
      ...doc.data(),
    }));

    const enrichedData = combinedData.map((registroItem) => {
      const matchingUsuario = usuariosData.find(
        (usuario) => usuario.id === registroItem.id_user
      );
      return matchingUsuario
        ? { ...registroItem, ...matchingUsuario }
        : registroItem;
    });

    let filteredData = enrichedData;
    if (filtroNombre) {
      filteredData = filteredData.filter((item) =>
        `${item.nombre} ${item.apellido}`
          .toLowerCase()
          .includes(filtroNombre.toLowerCase())
      );
    }

    filteredData.sort((a, b) => new Date(b.hora) - new Date(a.hora));
    setData(filteredData);

    setLoading(false);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const dataNoUser = data.filter((dato) => !dato.id_user);
  const dataWithUser = data.filter((dato) => dato.id_user);
  const encriptarCodigoTarjeta = (codigoTarjeta) => btoa(codigoTarjeta);

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-bold mb-6 text-center">Vista de Administrador</h2>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <label htmlFor="datePicker" className="mr-2 font-semibold">
              Seleccionar fecha:
            </label>
            <input
              type="date"
              id="datePicker"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 shadow-sm"
            />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre o apellido"
            value={filtroNombre}
            onChange={(e) => setFiltroNombre(e.target.value)}
            className="py-2 px-4 border border-gray-300 rounded-lg shadow-sm"
          />
        </div>
        <button
          className="flex items-center bg-blue-600 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded shadow-md"
          onClick={handleRefresh}
        >
          <FaSyncAlt className="mr-2" /> Actualizar datos
        </button>
      </div>
      {loading ? (
        <p className="text-center text-gray-600">Cargando datos...</p>
      ) : dataWithUser.length === 0 && dataNoUser.length === 0 ? (
        <p className="text-center text-gray-500">No hay registros para la fecha seleccionada.</p>
      ) : (
        <div>
          {dataWithUser.length > 0 && (
            <>
              <h2 className="text-2xl font-bold mb-4 text-center">Registros</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse border border-gray-300 bg-white shadow-sm">
                  <thead className="bg-gray-200">
                    <tr>
                      <th className="px-4 py-2 border border-gray-300">Código Tarjeta</th>
                      <th className="px-4 py-2 border border-gray-300">Nombre</th>
                      <th className="px-4 py-2 border border-gray-300">Apellido</th>
                      <th className="px-4 py-2 border border-gray-300">Curso</th>
                      <th className="px-4 py-2 border border-gray-300">Estado</th>
                      <th className="px-4 py-2 border border-gray-300">Hora</th>
                      <th className="px-4 py-2 border border-gray-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataWithUser.map((dato, index) => (
                      <tr key={index} 
                      className="hover:bg-gray-100"
                      style={{
                        backgroundColor:
                          dato.estado === "Admin" || dato.estado === "UsuarioAutorizado"
                            ? "#e6ffed"  // Verde claro
                            : "#ffe6e6",  // Rojo claro
                      }}
                      >
                        <td className="border px-4 py-2 text-center">{`${dato.codigo_tarjeta} (${dato.tipoT})`}</td>
                        <td className="border px-4 py-2 text-center">{dato.nombre}</td>
                        <td className="border px-4 py-2 text-center">{dato.apellido}</td>
                        <td className="border px-4 py-2 text-center">{dato.curso}</td>
                        <td className="border px-4 py-2 text-center font-semibold">
                        {dato.estado}
                      </td>
                        <td className="border px-4 py-2 text-center">
                          {new Date(dato.hora).toLocaleTimeString()}
                        </td>
                        <td className="border px-4 py-2 text-center">
                          <Link
                            to={`/usuario/${encriptarCodigoTarjeta(dato.codigo_tarjeta)}/${dato.tipoT}`}
                            className="text-blue-600 hover:underline"
                          >
                            Ver detalles de usuario
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          {dataNoUser.length > 0 && (
            <div className="mt-8">
              <h2 className="text-2xl font-bold mb-4 text-center">Registros No Registrados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {dataNoUser.map((dato) => (
                  <div key={dato.codigo_tarjeta} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-lg font-bold mb-2">{`${dato.codigo_tarjeta} (${dato.tipoT})`}</h3>
                    <p className="mb-2">
                      <span className="font-semibold">Curso:</span> {dato.curso}
                    </p>
                    <p className="mb-2">
                      <span className="font-semibold">Hora Registro:</span>{" "}
                      {new Date(dato.hora).toLocaleTimeString()}
                    </p>
                    <p>
                      <Link
                        to={`/admin/eleccionRegistro/${encriptarCodigoTarjeta(dato.codigo_tarjeta)}/${encriptarCodigoTarjeta(dato.tipoT)}/${encriptarCodigoTarjeta(dato.id_Registro)}/${encriptarCodigoTarjeta(selectedDate)}`}
                        className="text-blue-600 hover:underline"
                      >
                        Asignar Codigo
                      </Link>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
