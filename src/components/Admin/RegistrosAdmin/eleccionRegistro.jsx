import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../layout';

const encriptarCodigoTarjeta = (codigoTarjeta) => {
  return btoa(codigoTarjeta);
};

const EleccionRegistro = () => {
  const { codigoTarjeta1, tipoT, idRegistro, fecha } = useParams();
  const navigate = useNavigate();
  const codigoEncriptado = encriptarCodigoTarjeta(codigoTarjeta1);

  const handleRegistrarNuevo = () => {
    navigate(`/admin/registroNuevoUsuario/${codigoEncriptado}/${tipoT}/${idRegistro}/${fecha}`);
  };

  const handleAsignarExistente = () => {
    navigate(`/admin/asignarTarjetaExistente/${codigoEncriptado}/${tipoT}/${idRegistro}/${fecha}`);
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="bg-paleta-blanco p-10 rounded-lg shadow-lg w-full max-w-lg">
          <h2 className="text-3xl font-bold mb-6 text-center text-paleta-azul-oscuro">
            Elige una opción
          </h2>
          <div className="flex justify-around mt-6">
            <button
              onClick={handleRegistrarNuevo}
              className="bg-paleta-azul-claro text-paleta-blanco py-2 px-4 rounded-lg shadow-md hover:bg-paleta-azul-hover transition duration-300"
            >
              Registrar Nuevo Usuario
            </button>
            <button
              onClick={handleAsignarExistente}
              className="bg-paleta-verde-claro text-paleta-blanco py-2 px-4 rounded-lg shadow-md hover:bg-paleta-verde-hover transition duration-300"
            >
              Asignar a Usuario Existente
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default EleccionRegistro;
