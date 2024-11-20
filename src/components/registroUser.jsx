import React, { useState } from "react";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, setDoc, getDocs, collection, query, where } from "firebase/firestore";
import { app, db } from "../config/firebase";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Layout from "./Admin/layout";
import { useNavigate } from "react-router-dom";

const auth = getAuth(app);

const RegistroUser = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [dispositivoCodigo, setDispositivoCodigo] = useState("");
  const [tarjetaRFID, setTarjetaRFID] = useState("");
  const [rol, setRol] = useState("");
  const [accesoRfid, setAccesoRfid] = useState("");
  const [accesoNFC, setAccesoNFC] = useState("");

  const [showRFIDFields, setShowRFIDFields] = useState(false);
  const [showNFCFields, setShowNFCFields] = useState(false);

  async function verificarUnicidad(field, value) {
    const q = query(collection(db, "usuarios"), where(field, "==", value));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  async function registrarUsuario(e) {
    e.preventDefault();

    try {
      console.log(email, password, nombre, apellido, dispositivoCodigo, tarjetaRFID, rol, accesoRfid, accesoNFC);

      // Verificar unicidad de tarjetaRFID y dispositivoCodigo
      if (tarjetaRFID && await verificarUnicidad("tarjetaRFID", tarjetaRFID)) {
        toast.error("La tarjeta RFID ya está en uso.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      if (dispositivoCodigo && await verificarUnicidad("dispositivoCodigo", dispositivoCodigo)) {
        toast.error("El código del dispositivo ya está en uso.", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
        return;
      }

      // Crear usuario con email y contraseña
      const infoUsuario = await createUserWithEmailAndPassword(auth, email, password);
      console.log(infoUsuario.user.uid);

      // Referencia al documento en Firestore
      const docuRef = doc(db, `usuarios/${infoUsuario.user.uid}`);

      // Establecer datos del usuario en Firestore
      await setDoc(docuRef, {
        apellido: apellido,
        dispositivoCodigo: dispositivoCodigo,
        tarjetaRFID: tarjetaRFID,
        email: email,
        nombre: nombre,
        rol: rol,
        accesoRfid: accesoRfid,
        accesoNFC: accesoNFC,
        activo: true,
      });

      // Cerrar sesión del usuario inmediatamente después del registro
      await signOut(auth);

      // Mostrar mensaje de éxito
      toast.success("¡Registro exitoso!", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: () => navigate("/"),
      });
    } catch (error) {
      // Manejar errores
      if (error.code === "auth/email-already-in-use") {
        alert("Error: Este email ya está en uso. Por favor, use una dirección de email diferente.");
      } else {
        alert("Error: " + error.message);
      }
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-cyan-600">
            Registrar Usuario
          </h2>
          <form onSubmit={registrarUsuario}>
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-gray-700 font-semibold mb-2">
                Nombre:
              </label>
              <input
                id="nombre"
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
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="Email"
                required
                autoComplete="off"
              />
            </div>
            <div className="mb-6">
              <label htmlFor="password" className="block text-gray-700 font-semibold mb-2">
                Contraseña:
              </label>
              <input
                type="password"
                id="password"
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="Contraseña"
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
                defaultValue="Elige Rol"
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
            </div>
            {showRFIDFields && (
              <>
                <div className="mb-4">
                  <label htmlFor="tarjetaRFID" className="block text-gray-700 font-semibold mb-2">
                    Tarjeta RFID:
                  </label>
                  <input
                    id="tarjetaRFID"
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
                    defaultValue="Elige Acceso"
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
            </div>
            {showNFCFields && (
              <>
                <div className="mb-4">
                  <label htmlFor="dispositivoCodigo" className="block text-gray-700 font-semibold mb-2">
                    Código Dispositivo:
                  </label>
                  <input
                    id="dispositivoCodigo"
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
                    defaultValue="Elige Acceso"
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
                Registrar
              </button>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    </Layout>
  );
};

export default RegistroUser;
