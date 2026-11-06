import CargarNotasExcel from "../components/CargarNotasExcel";

export default function Notas() {
  return (
    <div className="students-page">
      <div className="page-header">
        <div>
          <h1>Cargar notas</h1>
          <p>Sube un Excel para actualizar las calificaciones en Firebase.</p>
        </div>
      </div>

      <CargarNotasExcel />
    </div>
  );
}