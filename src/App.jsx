import { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { app, db } from "./config/firebase";

import Home from "./components/home";
import Auth from "./components/login/auth";
import Docente from "./components/Docente/docente";
import Admin from "./components/Admin/admin";
import { DataContextProvider } from "./contexts/dataContextUser";

import RegistroUser from "./components/registroUser";
import ListaUsuariosAdmin from "./components/Admin/ListaUsuariosAdmin/listaUsuariosAdmin";
import ListaAccesosAdmin from "./components/Admin/ListaAccesosAdmin/listaAccesosAdmin";
import UsuarioDetails from "./components/Admin/userPage/usuarioDetails";
import RegistroNewUser from "./components/Admin/userPage/registroNewUser";
import ListaDocenteAccesos from "./components/Docente/ListasDocente/listaDocenteAccesos";
import CrearAccesosAdmin from "./components/Admin/ListaAccesosAdmin/crearAccesosAdmin";
import CursosList from "./components/Admin/Cursos/cursosList";
import CursoDetalles from "./components/Admin/Cursos/cursoDetalles";
import CursoAgregar from "./components/Admin/Cursos/cursoAgregar";
import ListaRegistrosDocente from "./components/Docente/ListaRegistros/listaRegistrosDocente";
import BloqueoAcceso from "./components/Docente/BloqueoAcceso/bloqueoAcceso";
import EditarUsuario from "./components/Admin/userPage/editarUsuarrio";
import EleccionRegistro from "./components/Admin/RegistrosAdmin/eleccionRegistro";
import AsignarTarjetaExistente from "./components/Admin/RegistrosAdmin/asignarTarjetaExistente";
import RegistroNuevoUsuario from "./components/Admin/RegistrosAdmin/registroNuevoUsuario";
import SolicitarAccesoDocente from "./components/Docente/Solicitud de acceso/solicitaraccesoDocente";
import RevisarSolicitudesAdmin from "./components/Admin/Solicitudes/RevisarSolicitudAdmin";
import ResetPassword from "./components/resetPassword/ResetPassword";
import InformesMainPage from "./components/Admin/Informes/informesMainPage";
import InformesDocente from "./components/Docente/Informes/informesMainPageDocente";

const auth = getAuth(app);

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (usuarioFirebase) => {
      if (usuarioFirebase) {
        setUserWithFirebaseAndRol(usuarioFirebase);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  async function getRol(uid) {
    const docuRef = doc(db, `usuarios/${uid}`);
    const docuCifrada = await getDoc(docuRef);
    console.log(docuCifrada.data().rol);
    const infoFinal = docuCifrada.data().rol;
    return infoFinal;
  }

  function setUserWithFirebaseAndRol(usuarioFirebase) {
    getRol(usuarioFirebase.uid).then((rol) => {
      const userData = {
        uid: usuarioFirebase.uid,
        email: usuarioFirebase.email,
        rol: rol,
      };
      setUser(userData);
      console.log("userData final", userData);
    });
  }

  return (
    <div className="app">
      <DataContextProvider user={user}>
        <Routes>
          <Route
            path="/"
            element={
              user ? (
                user.rol === "Admin" ? (
                  <Admin />
                ) : user.rol === "Administrativo" ? (
                  <Administrativo />
                ) : user.rol === "Docente" ? (
                  <Docente />
                ) : (
                  <Home />
                )
              ) : (
                <Auth />
              )
            }
          />
          <Route path="/auth" element={<Auth />} />
          <Route path="/registroUser" element={<RegistroUser />} />
          <Route path="/docente" element={<Docente />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/listaUsuarios" element={<ListaUsuariosAdmin />} />
          <Route path="/admin/listaAccesos" element={<ListaAccesosAdmin />} />
          <Route path="/docente/listaAccesos" element={<ListaDocenteAccesos />} />
          <Route path="/docente/listaRegistros" element={<ListaRegistrosDocente />} />
          <Route path="/docente/bloqueo" element={<BloqueoAcceso />} />
          <Route path="/admin/crearNewAcceso" element={<CrearAccesosAdmin />} />
          <Route path="/admin/cursosList" element={<CursosList />} />
          <Route path="/admin/curso/:codigo_curso" element={<CursoDetalles />} />
          <Route path="/admin/curso/agregar-curso" element={<CursoAgregar />} />
          <Route path="/usuario/:codigo_tarjeta/:tipoT" element={<UsuarioDetails />} />
          <Route path="/admin/editarUsuario/:id" element={<EditarUsuario />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/admin/informes" element={<InformesMainPage />} />
          <Route path="/docente/informes" element={<InformesDocente />} />
          <Route
            path="/registroNewUser/:codigoTarjeta1/:tipoT"
            element={<RegistroNewUser />}
          />
          <Route
            path="/admin/eleccionRegistro/:codigoTarjeta1/:tipoT/:idRegistro/:fecha"
            element={<EleccionRegistro />}
          />
          <Route
            path="/admin/registroNuevoUsuario/:codigoTarjeta1/:tipoT/:idRegistro/:fecha"
            element={<RegistroNuevoUsuario />}
          />
          <Route
            path="/admin/asignarTarjetaExistente/:codigoTarjeta1/:tipoT/:idRegistro/:fecha"
            element={<AsignarTarjetaExistente />}
          />
          <Route
            path="/docente/solicitarAcceso"
            element={<SolicitarAccesoDocente />}
          />
          <Route
            path="/admin/revisarsolicitud"
            element={<RevisarSolicitudesAdmin />}
          />
        </Routes>
      </DataContextProvider>
    </div>
  );
}

export default App;
