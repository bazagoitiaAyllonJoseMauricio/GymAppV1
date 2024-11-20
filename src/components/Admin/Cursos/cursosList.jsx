import React, { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, getDocs, updateDoc, doc, query, where, writeBatch } from "firebase/firestore";
import { Link } from "react-router-dom";
import { BsHouseDoor, BsFillEyeFill, BsFillEyeSlashFill } from "react-icons/bs"; // Iconos de casa, ojo y ojo con barra
import Layout from "../layout";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Cursos() {
  const [cursos, setCursos] = useState([]);
  const [cursosEliminados, setCursosEliminados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mostrarEliminados, setMostrarEliminados] = useState(false);

  useEffect(() => {
    fetchCursos();
  }, [mostrarEliminados]);

  const fetchCursos = async () => {
    setLoading(true);
    try {
      const cursosCollection = collection(db, "curso");
      const cursosSnapshot = await getDocs(cursosCollection);
      const cursosData = cursosSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      const activos = cursosData.filter(curso => curso.activo);
      const eliminados = cursosData.filter(curso => !curso.activo);
      setCursos(activos);
      setCursosEliminados(eliminados);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
      setLoading(false);
    }
  };

  const handleClickActualizarUsuarios = () => {
    fetchCursos();
  };

  const handleEliminarCurso = async (cursoId, ubicacionCurso) => {
    setLoading(true);
    try {
      const cursoRef = doc(db, "curso", cursoId);
      await updateDoc(cursoRef, { activo: false });
      const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
      await updateDoc(refrescarDocRef, {
        refrescar: true
      });
      toast.success("¡Curso desactivado exitosamente!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      const accesosQuery = query(collection(db, "acceso"), where("curso", "==", ubicacionCurso));
      const accesosSnapshot = await getDocs(accesosQuery);
      const batch = writeBatch(db);
      accesosSnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      toast.success("¡Accesos relacionados eliminados exitosamente!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      setCursos(cursos.filter(curso => curso.id !== cursoId));
      setCursosEliminados([...cursosEliminados, { id: cursoId, ubicacion: ubicacionCurso, activo: false }]);
    } catch (error) {
      console.error("Error al desactivar el curso:", error.message);
      toast.error("Error al desactivar el curso.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setLoading(false);
  };

  const handleReactivarCurso = async (cursoId) => {
    setLoading(true);
    try {
      const cursoRef = doc(db, "curso", cursoId);
      await updateDoc(cursoRef, { activo: true });
      toast.success("¡Curso reactivado exitosamente!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      fetchCursos(); // Actualizar la lista de cursos

    } catch (error) {
      console.error("Error al reactivar el curso:", error.message);
      toast.error("Error al reactivar el curso.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
    setLoading(false);
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Gestión de Cursos</h2>
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <div className="flex space-x-2 mb-4 md:mb-0">
            <Link to="/admin/curso/agregar-curso" className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
              <span>Agregar curso</span>
            </Link>
            <button
              onClick={handleClickActualizarUsuarios}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
            >
              <span>Actualizar Usuarios</span>
            </button>
          </div>
          <button
            onClick={() => setMostrarEliminados(!mostrarEliminados)}
            className="bg-yellow-600 text-white py-2 px-6 rounded-lg hover:bg-yellow-700 flex items-center space-x-2"
          >
            <span>{mostrarEliminados ? "Ver Cursos Activos" : "Ver Cursos Eliminados"}</span>
            {mostrarEliminados ? <BsFillEyeFill /> : <BsFillEyeSlashFill />}
          </button>
        </div>
        {loading ? (
          <p className="text-center text-gray-600">Cargando cursos...</p>
        ) : (mostrarEliminados ? cursosEliminados : cursos).length === 0 ? (
          <p className="text-center text-gray-600">No hay cursos disponibles.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {(mostrarEliminados ? cursosEliminados : cursos).map((curso) => (
              <div key={curso.id} className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center border border-gray-200">
                <div className="text-4xl text-blue-600 mb-4">
                  <BsHouseDoor />
                </div>
                <div className="text-xl font-semibold text-gray-800 mb-2">{curso.ubicacion}</div>
                <Link to={`/admin/curso/${curso.ubicacion}`} className="text-blue-600 hover:underline mb-4">
                  Ver Accesos
                </Link>
                {curso.activo ? (
                  <button
                    onClick={() => handleEliminarCurso(curso.id, curso.ubicacion)}
                    className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                  >
                    Desactivar Curso
                  </button>
                ) : (
                  <button
                    onClick={() => handleReactivarCurso(curso.id)}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
                  >
                    Reactivar Curso
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        <ToastContainer />
      </div>
    </Layout>
  );
}

export default Cursos;
