import React, { useState, useEffect } from "react";
import { db } from "../../config/firebase";
import { collection, getDocs } from "firebase/firestore";

const dayOfWeek = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

function ListaAccesos() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);

    try {
      const accesoCollection = collection(db, "acceso");
      const accesoSnapshot = await getDocs(accesoCollection);
      const accesoData = accesoSnapshot.docs.map((doc) => doc.data());

      const usuariosCollection = collection(db, "usuarios");
      const usuariosSnapshot = await getDocs(usuariosCollection);
      const usuariosData = usuariosSnapshot.docs.map((doc) => doc.data());

      // Combinar datos de acceso y usuarios por código de tarjeta
      const combinedData = accesoData.map((accesoItem) => {
        const matchingUsuario = usuariosData.find(
          (usuario) => usuario.codigoTarjeta === accesoItem.codigoTarjeta
        );
        return matchingUsuario
          ? { ...accesoItem, ...matchingUsuario }
          : accesoItem;
      });

      setData(combinedData);
      setLoading(false);
    } catch (error) {
      console.error("Error al obtener los datos:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lista de Accesos</h2>
      {loading ? (
        <p>Cargando datos...</p>
      ) : data.length === 0 ? (
        <p className="text-center text-gray-500">No hay registros disponibles.</p>
      ) : (
        <div>
          <h2 className="text-2xl font-bold mb-4 text-center">Registros de Acceso</h2>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="px-4 py-2 border border-gray-300">Código Tarjeta</th>
                <th className="px-4 py-2 border border-gray-300">Nombre</th>
                <th className="px-4 py-2 border border-gray-300">Apellido</th>
                <th className="px-4 py-2 border border-gray-300">Rol</th>
                <th className="px-4 py-2 border border-gray-300">Curso</th>
                <th className="px-4 py-2 border border-gray-300">Día</th>
              </tr>
            </thead>
            <tbody>
              {data.map((registro, index) => (
                <tr key={index} className="hover:bg-gray-100">
                  <td className="border px-4 py-2 text-center">{registro.codigoTarjeta}</td>
                  <td className="border px-4 py-2 text-center">{registro.nombre}</td>
                  <td className="border px-4 py-2 text-center">{registro.apellido}</td>
                  <td className="border px-4 py-2 text-center">{registro.rol}</td>
                  <td className="border px-4 py-2 text-center">{registro.curso}</td>
                  <td className="border px-4 py-2 text-center">{dayOfWeek[registro.dia]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default ListaAccesos;
