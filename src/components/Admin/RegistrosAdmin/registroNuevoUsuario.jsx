import React, { useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { app, db } from "../../../config/firebase";
import { toast, ToastContainer } from 'react-toastify';
import { useParams, useNavigate } from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import Layout from "../layout";

const auth = getAuth(app);

const RegistroNuevoUsuario = () => {
  const { codigoTarjeta1, tipoT, idRegistro, fecha } = useParams();
  const fecha1 = atob(fecha); // Desencriptar la fecha
  const idRegistro1 = atob(idRegistro); // Desencriptar el id del registro
  const codigoTarjeta2 = atob(codigoTarjeta1); // Desencriptar el código de la tarjeta
  const codigoTarjeta = atob(codigoTarjeta2); // Desencriptar el código de la tarjeta
  const tipoT1 = atob(tipoT); // Desencriptar el tipo de tarjeta
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [rol, setRol] = useState("");
  const [acceso, setAcceso] = useState("");
  const [accesoRfid, setAccesoRfid] = useState("");
  const [accesoNFC, setAccesoNFC] = useState("");
  const navigate = useNavigate();

  async function registrarUsuario(e) {
    e.preventDefault();

    try {
      const infoUsuario = await createUserWithEmailAndPassword(auth, email, password);
      const docuRef = doc(db, `usuarios/${infoUsuario.user.uid}`);

      const userData = {
        apellido: apellido,
        email: email,
        nombre: nombre,
        rol: rol,
        acceso: acceso,
      };

      if (tipoT1 === "RFID") {
        userData.codigoTarjeta = codigoTarjeta;
        userData.accesoRfid = accesoRfid || "Denegado"; // Default value if not set
      } else if (tipoT1 === "NFC") {
        userData.dispositivoCodigo = codigoTarjeta;
        userData.accesoNFC = accesoNFC || "Denegado"; // Default value if not set
      }

      await setDoc(docuRef, userData);

      // Actualizar el documento en la colección "fecha"
      const fechaDocRef = doc(db, `${fecha1}/${idRegistro1}`);
      await updateDoc(fechaDocRef, {
        id_user: infoUsuario.user.uid
      });
      const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
      await updateDoc(refrescarDocRef, {
        refrescar: true
      });
      toast.success("¡Registro exitoso!", {
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
      if (error.code === "auth/email-already-in-use") {
        alert("Error: Este correo electrónico ya está en uso. Por favor, usa una dirección de correo electrónico diferente.");
      } else {
        alert("Error: " + error.message);
      }
    }
  }

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-white p-6 rounded shadow-md w-full max-w-4xl">
          <h2 className="text-3xl font-bold mb-4 text-center text-indigo-700">
            Registrar Usuario
          </h2>
          <form onSubmit={registrarUsuario}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label htmlFor="nombre" className="block text-gray-700 font-bold mb-2">
                  Nombre:
                </label>
                <input
                  id="nombre"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="input-field w-full"
                  placeholder="Nombre"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="apellido" className="block text-gray-700 font-bold mb-2">
                  Apellido:
                </label>
                <input
                  id="apellido"
                  value={apellido}
                  onChange={(e) => setApellido(e.target.value)}
                  className="input-field w-full"
                  placeholder="Apellido"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 font-bold mb-2">
                  Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  id="email"
                  className="input-field w-full"
                  placeholder="Email"
                />
              </div>
              <div className="mb-6">
                <label htmlFor="password" className="block text-gray-700 font-bold mb-2">
                  Contraseña:
                </label>
                <input
                  type="password"
                  id="password"
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field w-full"
                  placeholder="Contraseña"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="roles" className="block text-gray-700 font-bold mb-2">
                  Rol:
                </label>
                <select
                  id="roles"
                  className="select-field w-full"
                  value={rol}
                  onChange={(e) => setRol(e.target.value)}
                >
                  <option disabled value="">
                    Elige Rol
                  </option>
                  <option value="Admin">Admin</option>
                  <option value="Docente">Docente</option>
                </select>
              </div>
              
              {tipoT1 === "RFID" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="accesoRfid" className="block text-gray-700 font-bold mb-2">
                      Acceso RFID:
                    </label>
                    <input
                      id="accesoRfid"
                      value={accesoRfid}
                      onChange={(e) => setAccesoRfid(e.target.value)}
                      className="input-field w-full"
                      placeholder="Acceso RFID"
                    />
                  </div>
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setAccesoRfid(codigoTarjeta)}
                      className="button-secondary w-full"
                    >
                      Asignar Código RFID
                    </button>
                  </div>
                </>
              )}
              {tipoT1 === "NFC" && (
                <>
                  <div className="mb-4">
                    <label htmlFor="accesoNFC" className="block text-gray-700 font-bold mb-2">
                      Acceso NFC:
                    </label>
                    <input
                      id="accesoNFC"
                      value={accesoNFC}
                      onChange={(e) => setAccesoNFC(e.target.value)}
                      className="input-field w-full"
                      placeholder="Acceso NFC"
                    />
                  </div>
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => setAccesoNFC(codigoTarjeta)}
                      className="button-secondary w-full"
                    >
                      Asignar Código NFC
                    </button>
                  </div>
                </>
              )}
            </div>
            <div className="text-center mt-6">
              <button type="submit" className="button-primary w-full md:w-auto">
                Registrar
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </Layout>
  );
};

export default RegistroNuevoUsuario;
