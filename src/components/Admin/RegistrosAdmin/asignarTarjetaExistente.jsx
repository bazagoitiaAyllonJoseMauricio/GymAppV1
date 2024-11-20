import React, { useState, useEffect } from "react";
import { doc, getDocs, updateDoc, collection } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { toast, ToastContainer } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Layout from "../layout";

const AsignarTarjetaExistente = () => {
  const { codigoTarjeta1, tipoT,idRegistro, fecha  } = useParams();
  const fecha1 = atob(fecha); // Desencriptar la fecha
  const idRegistro1 = atob(idRegistro); // Desencriptar el id del registro
  const codigoTarjeta = atob(atob(codigoTarjeta1)); // Doble desencriptación del código de la tarjeta
  const tipoTarjeta = atob(tipoT); // Desencriptar el tipo de la tarjeta
  const [usuarios, setUsuarios] = useState([]);
  const [selectedUser, setSelectedUser] = useState("");
  const [userDetails, setUserDetails] = useState({});
  const [userId, setUserId] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      const usuariosSnapshot = await getDocs(collection(db, "usuarios"));
      const usuariosList = usuariosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usuariosList);
    };
    fetchUsers();
  }, []);

  const handleUserChange = (e) => {
    const selectedUserId = e.target.value;
    setSelectedUser(selectedUserId);
    const user = usuarios.find(u => u.id === selectedUserId);
    if (user) {
      setUserId(user.id);
      setUserDetails({
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        rol: user.rol,
        acceso: user.acceso,
        codigoTarjeta: user.codigoTarjeta,
        dispositivoCodigo: user.dispositivoCodigo,
      });
    }
  };

  async function asignarTarjeta(e) {
    e.preventDefault();

    try {
      const docuRef = doc(db, `usuarios/${userId}`);
      const userData = {
        apellido: userDetails.apellido || "",
        email: userDetails.email || "",
        nombre: userDetails.nombre || "",
        rol: userDetails.rol || "",
      };

      if (tipoTarjeta === "RFID") {
        userData.tarjetaRFID = codigoTarjeta;
        userData.accesoRfid = "Denegado";
      } else if (tipoTarjeta === "NFC") {
        userData.dispositivoCodigo = codigoTarjeta;
        userData.accesoNFC = "Denegado";
      }
      const fechaDocRef = doc(db, `${fecha1}/${idRegistro1}`);
      
      await updateDoc(docuRef, userData);
      await updateDoc(fechaDocRef, {
        id_user: userId
      });
      const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
      await updateDoc(refrescarDocRef, {
        refrescar: true
      });
      toast.success("¡Tarjeta asignada exitosamente!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: () => navigate("/admin/listaUsuarios"),
      });
    } catch (error) {
      alert("Error: " + error.message);
    }
  }

  const renderField = (label, value, field) => (
    <div className="mb-4">
      <label htmlFor={field} className="block text-gray-700 font-bold mb-2">
        {label}:
      </label>
      <input
        id={field}
        value={value}
        className="input-field w-full"
        readOnly
      />
    </div>
  );

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl">
          <h2 className="text-3xl font-bold mb-4 text-center text-indigo-700">
            Asignar Tarjeta a Usuario Existente
          </h2>
          <form onSubmit={asignarTarjeta}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="usuario" className="block text-gray-700 font-bold mb-2">
                  Seleccionar Usuario:
                </label>
                <select
                  id="usuario"
                  className="select-field w-full"
                  value={selectedUser}
                  onChange={handleUserChange}
                >
                  <option value="" disabled>Selecciona un usuario</option>
                  {usuarios.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.email}
                    </option>
                  ))}
                </select>
              </div>
              {userDetails.nombre && renderField("Nombre", userDetails.nombre, "nombre")}
              {userDetails.apellido && renderField("Apellido", userDetails.apellido, "apellido")}
              {userDetails.email && renderField("Email", userDetails.email, "email")}
              {userDetails.rol && renderField("Rol", userDetails.rol, "rol")}
              <div className="mb-4">
                <label htmlFor="codigoTarjeta" className="block text-gray-700 font-bold mb-2">
                  Código {tipoTarjeta.toUpperCase()}:
                </label>
                <input
                  id="codigoTarjeta"
                  value={codigoTarjeta}
                  className="input-field w-full"
                  readOnly
                  placeholder={`Código ${tipoTarjeta.toUpperCase()}`}
                />
              </div>
              {userDetails.acceso && renderField("Acceso", userDetails.acceso, "acceso")}
            </div>
            <div className="text-center mt-6">
              <button type="submit" className="button-primary w-full md:w-auto">
                {userDetails.codigoTarjeta || userDetails.dispositivoCodigo ? "Reemplazar" : "Asignar"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </Layout>
  );
};

export default AsignarTarjetaExistente;
