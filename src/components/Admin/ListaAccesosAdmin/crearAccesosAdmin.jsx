import React, { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection,doc, addDoc,updateDoc, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Layout from "../layout";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const dayOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

const timeRanges = [
  { start: 7, end: 9 },
  { start: 9, end: 11 },
  { start: 11, end: 13 },
  { start: 14, end: 16 },
  { start: 16, end: 18 },
  { start: 18, end: 20 },
  { start: 20, end: 22 },
];

function CrearAccesosAdmin() {
  const [usuarios, setUsuarios] = useState([]);
  const [cursos, setCursos] = useState([]);
  const [accesos, setAccesos] = useState([]);
  const [newAcceso, setNewAcceso] = useState({
    curso: "",
    dia: "",
    horaRange: "",
    id_user: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsuarios();
    fetchCursos();
  }, []);

  const fetchUsuarios = async () => {
    try {
      const usuariosCollection = collection(db, "usuarios");
      const activeUsersQuery = query(usuariosCollection, where("activo", "==", true));
      const usuariosSnapshot = await getDocs(activeUsersQuery);
      const usuariosData = usuariosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al obtener los usuarios:", error);
      toast.error("Error al obtener los usuarios.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const fetchCursos = async () => {
    try {
      const cursosCollection = collection(db, "curso");
      // Filtrar los cursos que tienen el campo estado igual a "activo"
      const cursosQuery = query(cursosCollection, where("activo", "==", true));
      const cursosSnapshot = await getDocs(cursosQuery);
      
      const cursosData = cursosSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      
      setCursos(cursosData);
    } catch (error) {
      console.error("Error al obtener los cursos:", error);
      toast.error("Error al obtener los cursos.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewAcceso({
      ...newAcceso,
      [name]: value,
    });
  };

  const addAcceso = () => {
    const { curso, dia, horaRange, id_user } = newAcceso;
    if (!curso || !dia || !horaRange || !id_user) {
      toast.error("Todos los campos son obligatorios para cada acceso.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setAccesos([...accesos, newAcceso]);
    setNewAcceso({ ...newAcceso, curso: "", dia: "", horaRange: "" });
    setError(null);
  };

  const removeAcceso = (index) => {
    setAccesos(accesos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      for (let acceso of accesos) {
        const { curso, dia, horaRange, id_user } = acceso;
        const [hora_inicio, hora_fin] = horaRange.split("-").map(Number);

        const accessCollection = collection(db, "acceso");
        const accessQuery = query(
          accessCollection,
          where("curso", "==", curso),
          where("dia", "==", parseInt(dia)),
          where("hora_inicio", "==", hora_inicio),
          where("hora_fin", "==", hora_fin)
        );
        const accessSnapshot = await getDocs(accessQuery);
        const existingAccesses = accessSnapshot.docs.map((doc) => doc.data());

        if (existingAccesses.length > 0) {
          toast.error(
            `Ya existe un acceso con el curso ${curso}, día ${dayOfWeek[dia]} y rango de hora ${hora_inicio}:00 - ${hora_fin}:00.`,
            {
              position: "top-right",
              autoClose: 5000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          setLoading(false);
          return;
        }

        await addDoc(collection(db, "acceso"), {
          curso,
          dia: parseInt(dia),
          hora_inicio,
          hora_fin,
          id_user,
        });
      }
      const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
      await updateDoc(refrescarDocRef, {
        refrescar: true
      });
      setLoading(false);
      toast.success("Accesos creados exitosamente", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        pauseOnHover: true,
        draggable: true,
        onClose: () => navigate("/admin/listaAccesos"),
      });
    } catch (error) {
      console.error("Error al crear los accesos:", error);
      toast.error("Error al crear los accesos. Inténtelo de nuevo.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Crear Nuevos Accesos
        </h2>
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-white p-6 rounded-md shadow-md"
        >
          <div className="mb-4">
            <label
              htmlFor="id_user"
              className="block text-gray-700 font-bold mb-2"
            >
              Usuario:
            </label>
            <select
              id="id_user"
              name="id_user"
              value={newAcceso.id_user}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Seleccione un usuario</option>
              {usuarios.map((usuario) => (
                <option key={usuario.id} value={usuario.id}>
                  {usuario.apellido}, {usuario.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="curso"
              className="block text-gray-700 font-bold mb-2"
            >
              Curso:
            </label>
            <select
              id="curso"
              name="curso"
              value={newAcceso.curso}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Seleccione un curso</option>
              {cursos.map((curso) => (
                <option key={curso.id} value={curso.ubicacion}>
                  {curso.ubicacion}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="dia" className="block text-gray-700 font-bold mb-2">
              Día:
            </label>
            <select
              id="dia"
              name="dia"
              value={newAcceso.dia}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Seleccione un día</option>
              {dayOfWeek.map((day, index) => (
                <option key={index} value={index}>
                  {day}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label
              htmlFor="horaRange"
              className="block text-gray-700 font-bold mb-2"
            >
              Rango Horario:
            </label>
            <select
              id="horaRange"
              name="horaRange"
              value={newAcceso.horaRange}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">Seleccione un rango horario</option>
              {timeRanges.map((range, index) => (
                <option key={index} value={`${range.start}-${range.end}`}>
                  {`${range.start}:00 - ${range.end}:00`}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <button
              type="button"
              onClick={addAcceso}
              className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
            >
              Añadir Acceso
            </button>
          </div>
          {accesos.length > 0 && (
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-2">Accesos Añadidos:</h3>
              <ul>
                {accesos.map((acceso, index) => (
                  <li key={index} className="mb-2">
                    {`Curso: ${acceso.curso}, Día: ${
                      dayOfWeek[acceso.dia]
                    }, Horario: ${acceso.horaRange}`}
                    <button
                      type="button"
                      onClick={() => removeAcceso(index)}
                      className="ml-4 bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600"
                    >
                      Quitar
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {accesos.length > 0 && (
            <div className="flex justify-center">
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Crear Accesos"}
              </button>
            </div>
          )}
        </form>
        <ToastContainer />
      </div>
    </Layout>
  );
}

export default CrearAccesosAdmin;
