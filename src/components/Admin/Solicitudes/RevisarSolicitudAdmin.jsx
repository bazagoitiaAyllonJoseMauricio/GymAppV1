import React, { useState, useEffect } from "react";
import { db } from "../../../config/firebase";
import {
  collection,
  getDocs,
  getDoc,
  updateDoc,
  doc,
  addDoc,
  query,
  where,
  deleteDoc,
} from "firebase/firestore";
import Layout from "../layout";
import { format, getDay } from "date-fns";// Importar la función format de date-fns

function RevisarSolicitudesAdmin() {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError(null);
        setSuccess(null);
      }, 5000); // Oculta el mensaje después de 5 segundos

      return () => clearTimeout(timer); // Limpiar el temporizador si el componente se desmonta
    }
  }, [error, success]);

  const getUserDetails = async (userId) => {
    try {
      const userDocRef = doc(db, "usuarios", userId);
      const userDoc = await getDoc(userDocRef);
      if (userDoc.exists()) {
        return { id: userDoc.id, ...userDoc.data() };
      } else {
        console.error("No se encontró el usuario");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener detalles del usuario:", error);
      return null;
    }
  };

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const solicitudesCollection = collection(db, "solicitudes");
      const q = query(
        solicitudesCollection,
        where("estado", "==", "pendiente")
      );
      const solicitudesSnapshot = await getDocs(q);
      const solicitudesData = await Promise.all(
        solicitudesSnapshot.docs.map(async (doc) => {
          const solicitud = { id: doc.id, ...doc.data() };
          const user = await getUserDetails(solicitud.id_user);
          return { ...solicitud, user };
        })
      );
      setSolicitudes(solicitudesData);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener las solicitudes:", error);
      setError("Error al obtener las solicitudes.");
      setLoading(false);
    }
  };

  const handleDecision = async (id, estado) => {
    setLoading(true);
    try {
      const solicitud = solicitudes.find((solicitud) => solicitud.id === id);
      const { curso, fecha, hora_inicio, hora_fin, id_user } = solicitud;

      const formattedDate = fecha;
      const dia = getDay(formattedDate);

      if (estado === "aprobada") {
        // Consultar si ya existe un acceso para la fecha y hora
        const accessCollection = collection(db, "acceso");
        const accessQuery = query(
          accessCollection,
          where("fecha", "==", formattedDate),
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

        if (existingAccesses.length > 0 || existingAccessesByDay.length > 0) {
          setError(
            `Ya existe un acceso para el ${dayOfWeek[dia]} ${fecha} o en un rango horario similar (${hora_inicio}:00 - ${hora_fin}:00).`
          );
          return;
        }

        // Crear un nuevo acceso
        await addDoc(collection(db, "acceso"), {
          curso,
          fecha: formattedDate,
          hora_inicio,
          hora_fin,
          id_user,
        });
        const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
        await updateDoc(refrescarDocRef, {
          refrescar: true,
        });
      }

      // Actualizar el estado de la solicitud
      const solicitudRef = doc(db, "solicitudes", id);
      await updateDoc(solicitudRef, { estado });

      // Eliminar la solicitud si se aprobó
      if (estado === "aprobada") {
        await deleteDoc(solicitudRef);
      }

      // Actualizar el estado local
      setSolicitudes(solicitudes.filter((solicitud) => solicitud.id !== id));
      setSuccess(`Solicitud ${estado} exitosamente.`);
    } catch (error) {
      console.error("Error al actualizar la solicitud:", error);
      setError("Error al actualizar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Revisar Solicitudes
        </h2>
        {loading && <p className="text-center">Cargando...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}
        {success && <p className="text-green-500 text-center">{success}</p>}
        <div className="max-w-lg mx-auto bg-white p-6 rounded-md shadow-md">
          {solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="mb-4">
              <p>
                <strong>Curso:</strong> {solicitud.curso}
              </p>
              <p>
                <strong>Fecha:</strong> {solicitud.fecha}
              </p>
              <p>
                <strong>Rango Horario:</strong>{" "}
                {`${solicitud.hora_inicio}:00 - ${solicitud.hora_fin}:00`}
              </p>
              <p>
                <strong>Docente:</strong>{" "}
                {solicitud.user
                  ? `${solicitud.user.nombre} (${solicitud.user.email})`
                  : "Desconocido"}
              </p>
              <p>
                <strong>Estado:</strong> {solicitud.estado}
              </p>
              <div className="flex justify-between mt-4">
                <button
                  onClick={() => handleDecision(solicitud.id, "aprobada")}
                  className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600"
                >
                  Aprobar
                </button>
                <button
                  onClick={() => handleDecision(solicitud.id, "rechazada")}
                  className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
                >
                  Rechazar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default RevisarSolicitudesAdmin;
