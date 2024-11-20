import React, { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import Layout from "../layout";
import { useDataContextProvider } from "../../../contexts/dataContextUser";
import { format, getDay } from "date-fns";

const timeRanges = [
  { start: 7, end: 9 },
  { start: 9, end: 11 },
  { start: 11, end: 13 },
  { start: 14, end: 16 },
  { start: 16, end: 18 },
  { start: 18, end: 20 },
  { start: 20, end: 22 },
];

const dayOfWeek = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
];

function SolicitarAccesoDocente() {
  const [cursos, setCursos] = useState([]);
  const [solicitud, setSolicitud] = useState({
    curso: "",
    fecha: "",
    horaRange: "",
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();
  const data = useDataContextProvider();

  useEffect(() => {
    fetchCursos();
  }, []);

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
    setSolicitud({
      ...solicitud,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { curso, fecha, horaRange } = solicitud;
    const id_user = data.uid; // Obtener el uid del usuario desde el contexto

    if (!curso || !fecha || !horaRange || !id_user) {
      setError("Todos los campos son obligatorios.");
      return;
    }

    try {
      // Verificar y formatear la fecha
      const date = fecha;

      console.log("formattedfecha", fecha);
      const dia = getDay(date); // Obtener el día de la semana (0: Domingo, 1: Lunes, etc.)
      console.log("dia", dia);
      // Obtener el rango de horas
      const [hora_inicio, hora_fin] = horaRange.split("-").map(Number);

      // Consultar por fecha y hora
      const accessCollection = collection(db, "acceso");
      const accessQuery = query(
        accessCollection,
        where("fecha", "==", fecha),
        where("hora_inicio", "==", hora_inicio),
        where("hora_fin", "==", hora_fin)
      );
      const accessSnapshot = await getDocs(accessQuery);
      const existingAccesses = accessSnapshot.docs.map((doc) => doc.data());

      // Consultar por día de la semana
      const accessQueryByDay = query(
        accessCollection,
        where("dia", "==", dia),
        where("hora_inicio", "==", hora_inicio),
        where("hora_fin", "==", hora_fin)
      );
      const accessSnapshotByDay = await getDocs(accessQueryByDay);
      const existingAccessesByDay = accessSnapshotByDay.docs.map((doc) =>
        doc.data()
      );

      if (
        existingAccesses.length > 0 ||
        existingAccessesByDay.length > 0
      ) {
        setError(
          `Ya existe un acceso para el ${dayOfWeek[dia]} ${fecha} o en un rango horario similar (${hora_inicio}:00 - ${hora_fin}:00).`
        );
        return;
      }

      await addDoc(collection(db, "solicitudes"), {
        curso,
        fecha: fecha,
        hora_inicio,
        hora_fin,
        id_user,
        estado: "pendiente",
      });

      setSuccess("Solicitud enviada exitosamente. Esperando aprobación.");
    } catch (error) {
      console.error("Error al enviar la solicitud:", error);
      setError("Error al enviar la solicitud. Inténtelo de nuevo.");
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Solicitar Acceso
        </h2>
        <form
          onSubmit={handleSubmit}
          className="max-w-lg mx-auto bg-white p-6 rounded-md shadow-md"
        >
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
              value={solicitud.curso}
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
            <label
              htmlFor="fecha"
              className="block text-gray-700 font-bold mb-2"
            >
              Fecha:
            </label>
            <input
              type="date"
              id="fecha"
              name="fecha"
              value={solicitud.fecha}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
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
              value={solicitud.horaRange}
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
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {success && (
            <p className="text-green-500 text-center mb-4">{success}</p>
          )}
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
            >
              Solicitar Acceso
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}

export default SolicitarAccesoDocente;
