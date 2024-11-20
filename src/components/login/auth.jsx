import React, { useState, useEffect } from "react";
import {
  getAuth,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "../../config/firebase";
import { useDataContextProvider } from "../../contexts/dataContextUser";
import { useNavigate, Link } from "react-router-dom";
import usfxImage from "../../assets/logoUSFX.png";

const auth = getAuth(app);

function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const contextData = useDataContextProvider();
  const { updateContextData } = useDataContextProvider();
  const navigate = useNavigate();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUser(usuarioFirebase);
        setUserWithFirebaseAndRol(usuarioFirebase);
      } else {
        setUser(null); // Asegurarse de marcar al usuario como no autenticado si no está logueado
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Limpiar el error previo antes de intentar un nuevo inicio de sesión
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const usuarioFirebase = userCredential.user;
      const userData = await getUserData(usuarioFirebase.uid);
      if (!userData.activo) {
        alert("Error: " + "Tu cuenta ha sido eliminada o está inactiva. Por favor contacta al administrador.");
        setError("Tu cuenta ha sido eliminada o está inactiva. Por favor contacta al administrador.");
        await auth.signOut();
        return;
      }
      setUserWithFirebaseAndRol(usuarioFirebase);
      console.log("Inicio de sesión exitoso");
    } catch (err) {
      setError("Correo electrónico o contraseña incorrectos. Por favor intenta de nuevo.");
      console.error(err);
    }
  };

  async function getUserData(uid) {
    const docuRef = doc(db, `usuarios/${uid}`);
    const docuCifrada = await getDoc(docuRef);
    const data = docuCifrada.data();
    return {
      uid: uid,
      email: data.email,
      rol: data.rol,
      activo: data.activo
    };
  }

  function setUserWithFirebaseAndRol(usuarioFirebase) {
    getUserData(usuarioFirebase.uid).then((userData) => {
      if (!userData.activo) {
        setError("Tu cuenta ha sido eliminada o está inactiva. Por favor contacta al administrador.");
        auth.signOut();
        return;
      }
      setUser(userData);
      updateContextData({
        uid: userData.uid,
        email: userData.email,
        rol: userData.rol,
      });
      redirectToCorrectPage(userData.rol);
    });
  }

  const redirectToCorrectPage = (rol) => {
    if (rol === "Admin") {
      navigate("/admin");
    } else if (rol === "Administrativo") {
      navigate("/administrativo");
    } else if (rol === "Docente") {
      navigate("/docente");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <div className="flex items-center justify-center mb-8">
          <img src={usfxImage} alt="Logo" className="w-24 h-24 rounded-full" />
        </div>
        <h2 className="text-2xl font-bold mb-4 text-center">Iniciar sesión</h2>
        <form onSubmit={handleSubmit}>
          {error && (
            <div className="mb-4 text-red-500">{error}</div>
          )}
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 font-bold">
              Email:
            </label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              id="email"
              className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Email"
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 font-bold">
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Contraseña"
            />
          </div>
          <div>
            <button
              type="submit"
              className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Ingresar
            </button>
          </div>
          <div className="mt-4 text-center">
            <Link to="/reset-password" className="text-blue-500 hover:underline">
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Auth;

