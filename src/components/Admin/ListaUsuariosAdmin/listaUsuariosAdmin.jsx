import React, { useState, useEffect } from "react";
import { collection, onSnapshot, writeBatch, doc, updateDoc, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../layout";

const ListaUsuariosAdmin = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [usuariosEliminados, setUsuariosEliminados] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [mostrarEliminados, setMostrarEliminados] = useState(false);
  const itemsPerPage = 5;
  const navigate = useNavigate();

  const obtenerUsuarios = () => {
    const unsubscribe = onSnapshot(collection(db, "usuarios"), (snapshot) => {
      const usuariosData = [];
      const usuariosEliminadosData = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.activo !== false) {
          usuariosData.push({ id: doc.id, ...data });
        } else {
          usuariosEliminadosData.push({ id: doc.id, ...data });
        }
      });
      usuariosData.sort((a, b) => a.apellido.localeCompare(b.apellido));
      setUsuarios(usuariosData);
      setUsuariosEliminados(usuariosEliminadosData);
    });
    return () => unsubscribe();
  };

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const handleClickActualizarUsuarios = () => {
    obtenerUsuarios();
  };

  const handleCambiarAcceso = async (usuarioId, campo, nuevoAcceso) => {
    try {
      const usuarioRef = doc(db, "usuarios", usuarioId);
      await updateDoc(usuarioRef, { [campo]: nuevoAcceso });
      
      console.log("Acceso actualizado correctamente");
      const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
      await updateDoc(refrescarDocRef, {
        refrescar: true
      });
    } catch (error) {
      console.error("Error al actualizar el acceso:", error.message);
    }
  };

  const handleEliminarUsuario = async (usuarioId) => {
    try {
      const usuarioRef = doc(db, "usuarios", usuarioId);
      await updateDoc(usuarioRef, { activo: false });
      await eliminarAccesosDeUsuario(usuarioId);const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
      await updateDoc(refrescarDocRef, {
        refrescar: true
      });
      console.log("Usuario y accesos marcados como inactivos correctamente");
    } catch (error) {
      console.error("Error al marcar el usuario como inactivo:", error.message);
    }
  };

  const eliminarAccesosDeUsuario = async (usuarioId) => {
    try {
      const q = query(collection(db, "acceso"), where("id_user", "==", usuarioId));
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log("Accesos del usuario eliminados correctamente");
    } catch (error) {
      console.error("Error al eliminar accesos del usuario:", error.message);
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

  const handleFiltroChange = (e) => {
    setFiltro(e.target.value);
  };

  const usuariosFiltrados = usuarios.filter((usuario) =>
    `${usuario.nombre} ${usuario.apellido}`
      .toLowerCase()
      .includes(filtro.toLowerCase())
  );

  const usuariosMostrados = mostrarEliminados
    ? usuariosEliminados
    : usuariosFiltrados;

  const paginatedUsuarios = usuariosMostrados.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-semibold mb-6 text-center">
          {mostrarEliminados ? "Usuarios Eliminados" : "Lista de Usuarios"}
        </h2>
        <div className="flex justify-between items-center mb-6">
          {!mostrarEliminados && (
            <input
              type="text"
              placeholder="Buscar por nombre o apellido"
              value={filtro}
              onChange={handleFiltroChange}
              className="py-2 px-4 border border-gray-300 rounded-lg w-1/3 placeholder-gray-500"
            />
          )}
          <div className="flex space-x-2">
            <Link
              to="/registroUser"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Registrar Usuario
            </Link>
            <button
              onClick={handleClickActualizarUsuarios}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Actualizar Usuarios
            </button>
            <button
              onClick={() => setMostrarEliminados(!mostrarEliminados)}
              className="bg-yellow-500 text-white py-2 px-4 rounded-md hover:bg-yellow-600"
            >
              {mostrarEliminados ? "Usuarios Activos" : "Usuarios Eliminados"}
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          {mostrarEliminados && usuariosEliminados.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Sin usuarios eliminados</div>
          ) : (
            <>
              <table className="min-w-full bg-white border border-gray-300">
                <thead className="bg-gray-100">
                  <tr>
                    {mostrarEliminados ? (
                      <>
                        {["Nombre", "Email", "Rol", "Restaurar Usuario"].map(
                          (header) => (
                            <th key={header} className="py-3 px-4 border-b text-left text-gray-600">
                              {header}
                            </th>
                          )
                        )}
                      </>
                    ) : (
                      <>
                        {[
                          "Nombre",
                          "Email",
                          "Rol",
                          "Código Tarjeta RFID",
                          "Acción RFID",
                          "Código Dispositivo NFC",
                          "Acción NFC",
                          "Editar",
                          "Eliminar",
                        ].map((header) => (
                          <th key={header} className="py-3 px-4 border-b text-left text-gray-600">
                            {header}
                          </th>
                        ))}
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {!mostrarEliminados ? (
                    <>
                      {paginatedUsuarios.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{`${usuario.nombre} ${usuario.apellido}`}</td>
                          <td className="py-2 px-4 border-b">{usuario.email}</td>
                          <td className="py-2 px-4 border-b">{usuario.rol}</td>
                          <td className="py-2 px-4 border-b">
                            {usuario.tarjetaRFID && (
                              <>
                                {usuario.tarjetaRFID} (
                                <span className={getSpanClass(usuario.accesoRfid)}>
                                  {usuario.accesoRfid === "Aceptado"
                                    ? "Activo"
                                    : "Bloqueado"}
                                </span>
                                )
                              </>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {usuario.tarjetaRFID && (
                              <button
                                className={`${getButtonClass(
                                  usuario.accesoRfid
                                )} text-white py-1 px-3 rounded`}
                                onClick={() =>
                                  handleCambiarAcceso(
                                    usuario.id,
                                    "accesoRfid",
                                    usuario.accesoRfid === "Aceptado"
                                      ? "Denegado"
                                      : "Aceptado"
                                  )
                                }
                              >
                                {usuario.accesoRfid === "Aceptado"
                                  ? "Denegar Acceso RFID"
                                  : "Permitir Acceso RFID"}
                              </button>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b">
                            {usuario.dispositivoCodigo && (
                              <>
                                {usuario.dispositivoCodigo} (
                                <span className={getSpanClass(usuario.accesoNFC)}>
                                  {usuario.accesoNFC === "Aceptado"
                                    ? "Activo"
                                    : "Bloqueado"}
                                </span>
                                )
                              </>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            {usuario.dispositivoCodigo && (
                              <button
                                className={`${getButtonClass(
                                  usuario.accesoNFC
                                )} text-white py-1 px-3 rounded`}
                                onClick={() =>
                                  handleCambiarAcceso(
                                    usuario.id,
                                    "accesoNFC",
                                    usuario.accesoNFC === "Aceptado"
                                      ? "Denegado"
                                      : "Aceptado"
                                  )
                                }
                              >
                                {usuario.accesoNFC === "Aceptado"
                                  ? "Denegar Acceso NFC"
                                  : "Permitir Acceso NFC"}
                              </button>
                            )}
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <button
                              className="bg-yellow-500 text-white py-1 px-3 rounded hover:bg-yellow-600"
                              onClick={() =>
                                navigate(`/admin/editarUsuario/${usuario.id}`)
                              }
                            >
                              Editar
                            </button>
                          </td>
                          <td className="py-2 px-4 border-b text-center">
                            <button
                              className="bg-red-600 text-white py-1 px-3 rounded hover:bg-red-700"
                              onClick={() => handleEliminarUsuario(usuario.id)}
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </>
                  ) : (
                    <>
                      {paginatedUsuarios.map((usuario) => (
                        <tr key={usuario.id} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{`${usuario.nombre} ${usuario.apellido}`}</td>
                          <td className="py-2 px-4 border-b">{usuario.email}</td>
                          <td className="py-2 px-4 border-b">{usuario.rol}</td>
                          <td className="py-2 px-4 border-b text-center">
                            <button
                              className="bg-green-500 text-white py-1 px-3 rounded hover:bg-green-600"
                              onClick={() =>
                                handleCambiarAcceso(usuario.id, "activo", true)
                              }
                            >
                              Activar Usuario
                            </button>
                          </td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
              <div className="flex justify-center items-center mt-6">
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md mr-2"
                  onClick={() =>
                    setCurrentPage((prevPage) => Math.max(prevPage - 1, 0))
                  }
                  disabled={currentPage === 0}
                >
                  Anterior
                </button>
                <span className="mx-4">Página {currentPage + 1}</span>
                <button
                  className="bg-blue-500 text-white py-2 px-4 rounded-md ml-2"
                  onClick={() =>
                    setCurrentPage((prevPage) =>
                      Math.min(
                        prevPage + 1,
                        Math.ceil(usuariosMostrados.length / itemsPerPage) - 1
                      )
                    )
                  }
                  disabled={
                    currentPage ===
                    Math.ceil(usuariosMostrados.length / itemsPerPage) - 1
                  }
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ListaUsuariosAdmin;
