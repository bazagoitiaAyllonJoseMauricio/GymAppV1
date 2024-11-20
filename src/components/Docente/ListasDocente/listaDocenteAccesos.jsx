import React, { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { useDataContextProvider } from "../../../contexts/dataContextUser";
import Layout from "../layout";

const dayOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function ListaDocenteAccesos() {
  const [dataNormales, setDataNormales] = useState([]);
  const [dataEspeciales, setDataEspeciales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cursos, setCursos] = useState([]);
  const [filtroCurso, setFiltroCurso] = useState("");
  const [filtroDia, setFiltroDia] = useState("");
  const [currentPageNormales, setCurrentPageNormales] = useState(0);
  const [currentPageEspeciales, setCurrentPageEspeciales] = useState(0);
  const itemsPerPage = 4;
  const { uid } = useDataContextProvider();
  const formatHour = (hour) => {
    return `${hour}:00`;
  };

  useEffect(() => {
    fetchData();
    fetchCursos();
  }, [uid, filtroCurso, filtroDia]);

  const fetchCursos = async () => {
    try {
      const cursosCollection = collection(db, "curso");
      const cursosSnapshot = await getDocs(cursosCollection);
      const cursosData = cursosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCursos(cursosData);
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
    }
  };

  const fetchData = async () => {
    setLoading(true);

    try {
      const accesoCollection = collection(db, "acceso");
      const accesoSnapshot = await getDocs(accesoCollection);
      const accesoData = accesoSnapshot.docs.map((doc) => doc.data());

      const usuariosCollection = collection(db, "usuarios");
      const usuariosSnapshot = await getDocs(usuariosCollection);
      const usuariosData = usuariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Combinar datos de acceso y usuarios por código de tarjeta
      const combinedData = accesoData.map((accesoItem) => {
        const matchingUsuario = usuariosData.find(
          (usuario) => usuario.id === accesoItem.id_user
        );
        return matchingUsuario
          ? { ...accesoItem, ...matchingUsuario }
          : accesoItem;
      });

      // Filtrar datos para mostrar solo los accesos del docente con el UID actual
      let filteredData = combinedData.filter((item) => item.id_user === uid);

      if (filtroCurso) {
        filteredData = filteredData.filter((item) => item.curso === filtroCurso);
      }
      if (filtroDia !== "") {
        filteredData = filteredData.filter((item) => item.dia === parseInt(filtroDia));
      }

      // Separar accesos normales y especiales
      const normales = filteredData.filter(item => item.dia !== undefined);
      const especiales = filteredData.filter(item => item.fecha !== undefined);

      setDataNormales(normales);
      setDataEspeciales(especiales);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setLoading(false);
    }
  };

  const renderTable = (data, currentPage, setCurrentPage, type) => {
    const startIndex = currentPage * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = data.slice(startIndex, endIndex);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
      <>
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2 border border-gray-300">Nombre</th>
              <th className="px-4 py-2 border border-gray-300">Apellido</th>
              <th className="px-4 py-2 border border-gray-300">Rol</th>
              <th className="px-4 py-2 border border-gray-300">Curso</th>
              {type === "normal" ? (
                <>
                  <th className="px-4 py-2 border border-gray-300">Día</th>
                  <th className="px-4 py-2 border border-gray-300">Hora de Entrada</th>
                  <th className="px-4 py-2 border border-gray-300">Hora de Salida</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-2 border border-gray-300">Fecha</th>
                  <th className="px-4 py-2 border border-gray-300">Hora de Entrada</th>
                  <th className="px-4 py-2 border border-gray-300">Hora de Salida</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((registro, index) => (
              <tr key={index} className="hover:bg-gray-100">
                <td className="border px-4 py-2 text-center">{registro.nombre}</td>
                <td className="border px-4 py-2 text-center">{registro.apellido}</td>
                <td className="border px-4 py-2 text-center">{registro.rol}</td>
                <td className="border px-4 py-2 text-center">{registro.curso}</td>
                {type === "normal" ? (
                  <>
                    <td className="border px-4 py-2 text-center">{dayOfWeek[registro.dia]}</td>
                    <td className="border px-4 py-2 text-center">{formatHour(registro.hora_inicio)}</td>
                <td className="border px-4 py-2 text-center">{formatHour(registro.hora_fin)}</td>
                  </>
                ) : (
                  <>
                    <td className="border px-4 py-2 text-center">{registro.fecha}</td>
                    <td className="border px-4 py-2 text-center">{formatHour(registro.hora_inicio)}</td>
                <td className="border px-4 py-2 text-center">{formatHour(registro.hora_fin)}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-between mt-4">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 0))}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Anterior
          </button>
          <span>
            Página {currentPage + 1} de {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages - 1))}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Siguiente
          </button>
        </div>
      </>
    );
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4">Lista de Accesos del Docente</h2>
        <div className="flex mb-6 space-x-4">
          <div className="w-1/2">
            <label htmlFor="filtroCurso" className="block text-gray-700 font-semibold mb-2">
              Filtrar por Curso:
            </label>
            <select
              id="filtroCurso"
              value={filtroCurso}
              onChange={(e) => setFiltroCurso(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos los cursos</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.ubicacion}>
                  {curso.ubicacion}
                </option>
              ))}
            </select>
          </div>
          <div className="w-1/2">
            <label htmlFor="filtroDia" className="block text-gray-700 font-semibold mb-2">
              Filtrar por Día:
            </label>
            <select
              id="filtroDia"
              value={filtroDia}
              onChange={(e) => setFiltroDia(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Todos los días</option>
              {dayOfWeek.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>
        </div>
        {loading ? (
          <p>Cargando datos...</p>
        ) : dataNormales.length === 0 && dataEspeciales.length === 0 ? (
          <p className="text-center text-gray-500">No hay registros disponibles.</p>
        ) : (
          <>
            {dataNormales.length > 0 && (
              <div className="mb-8">
                <h3 className="text-2xl font-bold mb-4 text-center">Accesos Normales</h3>
                {renderTable(dataNormales, currentPageNormales, setCurrentPageNormales, "normal")}
              </div>
            )}
            {dataEspeciales.length > 0 && (
              <div>
                <h3 className="text-2xl font-bold mb-4 text-center">Accesos Especiales</h3>
                {renderTable(dataEspeciales, currentPageEspeciales, setCurrentPageEspeciales, "especial")}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export default ListaDocenteAccesos;
