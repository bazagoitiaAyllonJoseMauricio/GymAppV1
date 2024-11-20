import React, { useState } from "react";
import { db } from "../../../config/firebase";
import { collection, addDoc, query, where, getDocs } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import Layout from "../layout";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const bloques = ["A", "B", "C", "D", "E", "F"];

function CursoAgregar() {
  const [bloque, setBloque] = useState("A");
  const [numero, setNumero] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (numero.trim() === "") {
      toast.error("Por favor, ingrese un número de curso válido.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return;
    }

    setLoading(true);

    try {
      const ubicacion = `${bloque}-${numero}`;
      const cursosCollection = collection(db, "curso");

      // Verificar si ya existe un curso con la misma ubicación
      const q = query(cursosCollection, where("ubicacion", "==", ubicacion));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        toast.error("Ya existe un curso con esta ubicación.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        setLoading(false);
        return;
      }

      // Agregar el nuevo curso si no existe
      await addDoc(cursosCollection, {
        ubicacion,
        activo: true, // Agregar el campo activo
      });

      setLoading(false);
      toast.success("Curso agregado correctamente", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        onClose: () => navigate("/admin/cursosList"), // Redirigir a la lista de cursos después de agregar el curso
      });
    } catch (error) {
      console.error("Error al agregar el curso:", error);
      toast.error("Error al agregar el curso.", {
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
        <h2 className="text-2xl font-bold mb-4 text-center">Agregar Curso</h2>
        <form onSubmit={handleSubmit} className="max-w-md mx-auto">
          <div className="mb-4">
            <label htmlFor="bloque" className="block text-gray-700 font-bold mb-2">
              Bloque:
            </label>
            <select
              id="bloque"
              value={bloque}
              onChange={(e) => setBloque(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            >
              {bloques.map((bloque) => (
                <option key={bloque} value={bloque}>
                  {bloque}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="numero" className="block text-gray-700 font-bold mb-2">
              Número:
            </label>
            <input
              type="text"
              id="numero"
              value={numero}
              onChange={(e) => setNumero(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Ej: 209"
            />
          </div>
          <div className="flex justify-end">
            <Link to="/admin/cursos" className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 mr-2">
              Cancelar
            </Link>
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600"
              disabled={loading}
            >
              {loading ? "Agregando..." : "Agregar Curso"}
            </button>
          </div>
        </form>
      </div>
      <ToastContainer />
    </Layout>
  );
}

export default CursoAgregar;
