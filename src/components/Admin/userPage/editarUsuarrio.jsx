import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../../config/firebase";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../layout";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const EditarUsuario = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dispositivoCodigo, setDispositivoCodigo] = useState("");
  const [tarjetaRFID, setTarjetaRFID] = useState("");
  const [rol, setRol] = useState("");
  const [accesoRfid, setAccesoRfid] = useState("");
  const [accesoNFC, setAccesoNFC] = useState("");

  const [showRFIDFields, setShowRFIDFields] = useState(false);
  const [showNFCFields, setShowNFCFields] = useState(false);

  useEffect(() => {
    const fetchUsuario = async () => {
      const docRef = doc(db, "usuarios", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setEmail(data.email);
        setNombre(data.nombre);
        setApellido(data.apellido);
        setDispositivoCodigo(data.dispositivoCodigo || "");
        setTarjetaRFID(data.tarjetaRFID || "");
        setRol(data.rol);
        setAccesoRfid(data.accesoRfid || "");
        setAccesoNFC(data.accesoNFC || "");
        setShowRFIDFields(!!data.tarjetaRFID);
        setShowNFCFields(!!data.dispositivoCodigo);
      }
    };
    fetchUsuario();
  }, [id]);

  const handleActualizarUsuario = async (e) => {
    e.preventDefault();
    try {
      const usuarioRef = doc(db, "usuarios", id);
      await updateDoc(usuarioRef, {
        nombre,
        apellido,
        dispositivoCodigo,
        tarjetaRFID,
        email,
        rol,
        accesoRfid,
        accesoNFC,
      });
      const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
      await updateDoc(refrescarDocRef, {
        refrescar: true
      });
      toast.success("¡Usuario actualizado exitosamente!", {
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
      console.error("Error al actualizar el usuario:", error.message);
      toast.error("Error al actualizar el usuario.", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleEliminarRFID = async () => {
    setTarjetaRFID("");
    setAccesoRfid("");
    setShowRFIDFields(false);
  };

  const handleEliminarNFC = async () => {
    setDispositivoCodigo("");
    setAccesoNFC("");
    setShowNFCFields(false);
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-cyan-600">
            Editar Usuario
          </h2>
          <form onSubmit={handleActualizarUsuario}>
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-gray-700 font-semibold mb-2">
                Nombre:
              </label>
              <input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="input-field"
                placeholder="Nombre"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="apellido" className="block text-gray-700 font-semibold mb-2">
                Apellido:
              </label>
              <input
                id="apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                className="input-field"
                placeholder="Apellido"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-semibold mb-2">
                Email:
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Email"
                required
                autoComplete="off"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="roles" className="block text-gray-700 font-semibold mb-2">
                Rol:
              </label>
              <select
                id="roles"
                className="select-field"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                required
              >
                <option disabled>Elige Rol</option>
                <option value="Admin">Admin</option>
                <option value="Docente">Docente</option>
              </select>
            </div>
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowRFIDFields(!showRFIDFields)}
                className="button-secondary"
              >
                {showRFIDFields ? "Ocultar" : "Agregar"} Acceso RFID
              </button>
              {showRFIDFields && (
                <button
                  type="button"
                  onClick={handleEliminarRFID}
                  className="button-danger ml-4"
                >
                  Eliminar RFID
                </button>
              )}
            </div>
            {showRFIDFields && (
              <>
                <div className="mb-4">
                  <label htmlFor="tarjetaRFID" className="block text-gray-700 font-semibold mb-2">
                    Tarjeta RFID:
                  </label>
                  <input
                    id="tarjetaRFID"
                    value={tarjetaRFID}
                    onChange={(e) => setTarjetaRFID(e.target.value)}
                    className="input-field"
                    placeholder="Tarjeta RFID"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="accesoRfid" className="block text-gray-700 font-semibold mb-2">
                    Acceso RFID:
                  </label>
                  <select
                    id="accesoRfid"
                    className="select-field"
                    value={accesoRfid}
                    onChange={(e) => setAccesoRfid(e.target.value)}
                  >
                    <option disabled>Elige Acceso</option>
                    <option value="Denegado">Denegado</option>
                    <option value="Aceptado">Aceptado</option>
                  </select>
                </div>
              </>
            )}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowNFCFields(!showNFCFields)}
                className="button-secondary"
              >
                {showNFCFields ? "Ocultar" : "Agregar"} Acceso NFC
              </button>
              {showNFCFields && (
                <button
                  type="button"
                  onClick={handleEliminarNFC}
                  className="button-danger ml-4"
                >
                  Eliminar NFC
                </button>
              )}
            </div>
            {showNFCFields && (
              <>
                <div className="mb-4">
                  <label htmlFor="dispositivoCodigo" className="block text-gray-700 font-semibold mb-2">
                    Código Dispositivo:
                  </label>
                  <input
                    id="dispositivoCodigo"
                    value={dispositivoCodigo}
                    onChange={(e) => setDispositivoCodigo(e.target.value)}
                    className="input-field"
                    placeholder="Código Dispositivo"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="accesoNFC" className="block text-gray-700 font-semibold mb-2">
                    Acceso NFC:
                  </label>
                  <select
                    id="accesoNFC"
                    className="select-field"
                    value={accesoNFC}
                    onChange={(e) => setAccesoNFC(e.target.value)}
                  >
                    <option disabled>Elige Acceso</option>
                    <option value="Denegado">Denegado</option>
                    <option value="Aceptado">Aceptado</option>
                  </select>
                </div>
              </>
            )}
            <div className="text-center">
              <button type="submit" className="button-primary">
                Actualizar
              </button>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    </Layout>
  );
};

export default EditarUsuario;
