import React, { useState, useEffect } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { app, db } from "../../../config/firebase";
import { toast, ToastContainer } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Layout from "../layout";

const auth = getAuth(app);

const RegistroNewUser = () => {
  const { id, codigoTarjeta1, tipoT } = useParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [codigoTarjeta, setCodigoTarjeta] = useState(codigoTarjeta1 || "");
  const [rol, setRol] = useState("");
  const [acceso, setAcceso] = useState("");
  const [isNewUser, setIsNewUser] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      // Fetch user data if editing an existing user
      const fetchUserData = async () => {
        const userDoc = await getDoc(doc(db, "usuarios", id));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setEmail(userData.email);
          setNombre(userData.nombre);
          setApellido(userData.apellido);
          setCodigoTarjeta(userData.codigoTarjeta || "");
          setRol(userData.rol);
          setAcceso(userData.acceso);
          setIsNewUser(false);
        }
      };
      fetchUserData();
    }
  }, [id]);

  async function registrarUsuario(e) {
    e.preventDefault();

    try {
      if (isNewUser) {
        const infoUsuario = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const docuRef = doc(db, `usuarios/${infoUsuario.user.uid}`);

        const userData = {
          apellido: apellido,
          email: email,
          nombre: nombre,
          rol: rol,
          acceso: acceso,
        };

        if (tipoT === "rfid") {
          userData.codigoTarjeta = codigoTarjeta;
          userData.accesoRfid = "Denegado"; // or another default value
        } else if (tipoT === "nfc") {
          userData.dispositivoCodigo = codigoTarjeta;
          userData.accesoNFC = "Denegado"; // or another default value
        }

        await setDoc(docuRef, userData);
        const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
        await updateDoc(refrescarDocRef, {
          refrescar: true,
        });
        toast.success("¡Registro exitoso!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClose: () => navigate("/listaUsuarios"),
        });
      } else {
        const docuRef = doc(db, `usuarios/${id}`);
        const userData = {
          apellido: apellido,
          email: email,
          nombre: nombre,
          rol: rol,
          acceso: acceso,
        };

        if (tipoT === "rfid") {
          userData.codigoTarjeta = codigoTarjeta;
          userData.accesoRfid = "Denegado"; // or another default value
        } else if (tipoT === "nfc") {
          userData.dispositivoCodigo = codigoTarjeta;
          userData.accesoNFC = "Denegado"; // or another default value
        }

        await updateDoc(docuRef, userData);
        await setDoc(docuRef, userData);
        const refrescarDocRef = doc(db, "refrescar", "Dbmut9yeBWbs1bJkWurJ");
        await updateDoc(refrescarDocRef, {
          refrescar: true,
        });
        toast.success("¡Usuario actualizado exitosamente!", {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          onClose: () => navigate("/listaUsuarios"),
        });
      }
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        alert(
          "Error: Este correo electrónico ya está en uso. Por favor, usa una dirección de correo electrónico diferente."
        );
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
            {isNewUser ? "Registrar Usuario" : "Editar Usuario"}
          </h2>
          <form onSubmit={registrarUsuario}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="mb-4">
                <label
                  htmlFor="nombre"
                  className="block text-gray-700 font-bold mb-2"
                >
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
                <label
                  htmlFor="apellido"
                  className="block text-gray-700 font-bold mb-2"
                >
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
                <label
                  htmlFor="email"
                  className="block text-gray-700 font-bold mb-2"
                >
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
              {isNewUser && (
                <div className="mb-6">
                  <label
                    htmlFor="password"
                    className="block text-gray-700 font-bold mb-2"
                  >
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
              )}
              <div className="mb-4">
                <label
                  htmlFor="codigoTarjeta"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Código {tipoT.toUpperCase()}:
                </label>
                <input
                  id="codigoTarjeta"
                  value={codigoTarjeta}
                  onChange={(e) => setCodigoTarjeta(e.target.value)}
                  className="input-field w-full"
                  placeholder={`Código ${tipoT.toUpperCase()}`}
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="roles"
                  className="block text-gray-700 font-bold mb-2"
                >
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
              <div className="mb-4">
                <label
                  htmlFor="acceso"
                  className="block text-gray-700 font-bold mb-2"
                >
                  Acceso:
                </label>
                <select
                  id="acceso"
                  className="select-field w-full"
                  value={acceso}
                  onChange={(e) => setAcceso(e.target.value)}
                >
                  <option disabled value="">
                    Elige Acceso
                  </option>
                  <option value="Denegado">Denegado</option>
                  <option value="Aceptado">Aceptado</option>
                </select>
              </div>
            </div>
            <div className="text-center mt-6">
              <button type="submit" className="button-primary w-full md:w-auto">
                {isNewUser ? "Registrar" : "Actualizar"}
              </button>
            </div>
          </form>
        </div>
      </div>
      <ToastContainer />
    </Layout>
  );
};

export default RegistroNewUser;
