import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';
import Layout from "../layout";
import { db } from '../../../config/firebase'; // Asegúrate de ajustar la ruta si es necesario
import { 
  collection, getDocs, query, where
} from "firebase/firestore";

const InformesMainPageDocente = () => {
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [accessReport, setAccessReport] = useState([]);
  const [requestsReport, setRequestsReport] = useState([]);
  const [activityReport, setActivityReport] = useState([]);
  const [courseStatusReport, setCourseStatusReport] = useState([]);

  const handleDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  const getDatesInRange = (startDate, endDate) => {
    const date = new Date(startDate.getTime());
    const dates = [];

    while (date <= endDate) {
      dates.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }

    return dates;
  };

  const handleGenerateReport = async () => {
    const datesInRange = getDatesInRange(startDate, endDate);

    const accessData = [];
    const requestsData = [];
    const activityData = [];
    const courseStatusData = [];

    // Consulta de Acceso
    for (const date of datesInRange) {
      const formattedDate = format(date, 'yyyy-MM-dd');
      const accessQuery = query(collection(db, 'acceso'), where('fecha', '==', formattedDate));
      const accessSnapshot = await getDocs(accessQuery);
      accessSnapshot.forEach(doc => {
        accessData.push(doc.data());
      });

      // Consulta de Solicitudes
      const requestsQuery = query(collection(db, 'solicitudes'), where('fecha', '==', formattedDate));
      const requestsSnapshot = await getDocs(requestsQuery);
      requestsSnapshot.forEach(doc => {
        requestsData.push(doc.data());
      });

      // Consulta de Actividad
      const activityQuery = query(collection(db, formattedDate));
      const activitySnapshot = await getDocs(activityQuery);
      activitySnapshot.forEach(doc => {
        activityData.push(doc.data());
      });
    }

    // Consulta de Estado de Cursos
    const courseStatusQuery = query(collection(db, 'curso'));
    const courseStatusSnapshot = await getDocs(courseStatusQuery);
    courseStatusSnapshot.forEach(doc => {
      courseStatusData.push(doc.data());
    });

    setAccessReport(accessData);
    setRequestsReport(requestsData);
    setActivityReport(activityData);
    setCourseStatusReport(courseStatusData);
  };

  return (
    <Layout>
      <div className="flex flex-col items-center p-6 bg-gray-100 rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-gray-800">Informes Docentes</h1>
        <div className="mb-6">
          <DatePicker
            selected={startDate}
            onChange={handleDateChange}
            startDate={startDate}
            endDate={endDate}
            selectsRange
            inline
            dateFormat="yyyy-MM-dd"
            className="bg-white p-2 rounded-lg shadow-sm"
          />
        </div>
        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Generar Informe
        </button>
        <div className="mt-6 w-full max-w-2xl">


          <h2 className="text-xl font-semibold text-gray-700 mt-6">Informe de Acceso por Curso</h2>
          <ul className="list-none p-0 mt-4">
            {accessReport.map((entry, index) => (
              <li key={index} className="py-2 border-b border-gray-200">
                {entry.fecha} - {entry.curso} - {entry.hora_inicio} a {entry.hora_fin} - {entry.id_user}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold text-gray-700 mt-6">Informe de Solicitudes de Acceso</h2>
          <ul className="list-none p-0 mt-4">
            {requestsReport.map((entry, index) => (
              <li key={index} className="py-2 border-b border-gray-200">
                {entry.fecha} - {entry.curso} - {entry.hora_inicio} a {entry.hora_fin} - {entry.id_user} - {entry.estado}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold text-gray-700 mt-6">Informe de Actividad de Usuarios</h2>
          <ul className="list-none p-0 mt-4">
            {activityReport.map((entry, index) => (
              <li key={index} className="py-2 border-b border-gray-200">
                {entry.fecha} - {entry.id_user} - {entry.codigo_tarjeta} - {entry.curso} - {entry.estado} - {entry.hora} - {entry.tipoT}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-semibold text-gray-700 mt-6">Informe de Estado de Cursos</h2>
          <ul className="list-none p-0 mt-4">
            {courseStatusReport.map((entry, index) => (
              <li key={index} className="py-2 border-b border-gray-200">
                {entry.curso} - {entry.ubicacion}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default InformesMainPageDocente;
