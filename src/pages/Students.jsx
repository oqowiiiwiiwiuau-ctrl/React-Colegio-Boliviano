
import { useEffect, useState } from "react";
import { escucharEstudiantes } from "../services/studentService";
import StudentForm from "../components/StudentForm";
import StudentTable from "../components/StudentTable";

export default function Students() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const cancelar = escucharEstudiantes(
      (lista) => {
        setEstudiantes(lista);
        setCargando(false);
        setError("");
      },
      (err) => {
        console.error("Error al leer estudiantes:", err);
        setError(`${err.code || "Error"}: ${err.message}`);
        setCargando(false);
      }
    );

    return cancelar;
  }, []);

  return (
    <main className="students-page">
      <header className="students-page-header">
        <div>
          <span className="page-eyebrow">GESTIÓN ACADÉMICA</span>
          <h1>Estudiantes</h1>
          <p>Registra y consulta los estudiantes del colegio.</p>
        </div>

        <div className="total-students">
          <span>Total de estudiantes</span>
          <strong>{estudiantes.length}</strong>
        </div>
      </header>

      {error && (
        <div className="form-error" role="alert">
          No se pudieron cargar los estudiantes: {error}
        </div>
      )}

      <StudentForm />

      <StudentTable
        estudiantes={estudiantes}
        cargando={cargando}
      />
    </main>
  );
}
