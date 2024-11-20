import React, { useState } from "react";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { app } from "../../config/firebase";
import { Link } from "react-router-dom";

const auth = getAuth(app);

function ResetPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous error
    setMessage(null); // Clear previous message

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Email de restablecimiento de contraseña enviado. Por favor revisa tu bandeja de entrada.");
    } catch (err) {
      setError(err.message);
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Restablecer contraseña</h2>
        <form onSubmit={handlePasswordReset}>
          {error && (
            <div className="mb-4 text-red-500">{error}</div>
          )}
          {message && (
            <div className="mb-4 text-green-500">{message}</div>
          )}
          <div className="mb-4">
            <label htmlFor="resetEmail" className="block text-gray-700 font-bold">
              Email:
            </label>
            <input
              type="email"
              onChange={(e) => setEmail(e.target.value)}
              id="resetEmail"
              className="block w-full rounded-md border border-gray-300 py-1.5 px-3 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              placeholder="Email"
            />
          </div>
          <div>
            <button
              type="submit"
              className="block w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:bg-blue-600"
            >
              Restablecer contraseña
            </button>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-blue-500 hover:underline">
              Volver al inicio de sesión
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
