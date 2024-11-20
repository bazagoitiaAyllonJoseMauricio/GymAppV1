import React, {useEffect} from "react";
import { getAuth, signOut } from "firebase/auth";
import { app } from "../config/firebase";
//import { useNavigate } from "react-router-dom";
const auth = getAuth(app);
export function AdministradorView() {
  const [data, setData] = useState([]);
  const [usuariosData, setUsuariosData] = useState([]);  // Definir usuariosData aquí

  useEffect(() => {
    // Obtener datos de "usuarios"
    const usuariosCollection = collection(db, "usuarios");
    const unsubscribeUsuarios = onSnapshot(usuariosCollection, (snapshot) => {
      const usuariosData = snapshot.docs.map((doc) => doc.data());
      setUsuariosData(usuariosData);  // Establecer usuariosData en el estado
    });

    // Obtener datos de "registro"
    const registroCollection = collection(db, "registro");
    const unsubscribeRegistro = onSnapshot(registroCollection, (snapshot) => {
      const combinedData = [];
      snapshot.docs.forEach((doc) => {
        const registroItem = doc.data();
        // Buscar el usuario correspondiente por el código de tarjeta
        const matchingUsuario = usuariosData.find(
          (usuario) => usuario.codigoTarjeta === registroItem.codigo_tarjeta
        );

        if (matchingUsuario) {
          // Combinar los datos de "registro" y "usuarios"
          const combinedItem = { ...registroItem, ...matchingUsuario };
          combinedData.push(combinedItem);
        }
      });
      combinedData.sort((a, b) => new Date(b.hora) - new Date(a.hora));
      setData(combinedData);
    });

    return () => {
      unsubscribeRegistro();
      unsubscribeUsuarios();
    };
  }, [usuariosData]); 


  return (
    <div className="mx-auto max-w-6xl mt-20">
      <table className="min-w-full divide-y divide-gray-200 border">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Curso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Último Acceso
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Nombre
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Apellido
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Rol
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Código de Tarjeta
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">{item.curso}</td>
              <td className="px-6 py-4 whitespace-nowrap">{new Date(item.hora).toLocaleString()} </td>
              <td className="px-6 py-4 whitespace-nowrap">{item.nombre}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.apellido}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.rol}</td>
              <td className="px-6 py-4 whitespace-nowrap">{item.codigo_tarjeta}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};