import { useState, useEffect } from "react";
import {
  leerExcelNotas,
  cargarEstudiantes,
  prepararSubida,
  subirNotas,
} from "../services/excelNotasService";

const GRADOS = [
  { value: "primeroA", label: "Primero A" },
  { value: "primeroB", label: "Primero B" },
  { value: "primeroC", label: "Primero C" },
  { value: "segundoA", label: "Segundo A" },
  { value: "segundoB", label: "Segundo B" },
  { value: "segundoC", label: "Segundo C" },
  { value: "terceroA", label: "Tercero A" },
  { value: "terceroB", label: "Tercero B" },
  { value: "terceroC", label: "Tercero C" },
  { value: "cuartoA", label: "Cuarto A" },
  { value: "cuartoB", label: "Cuarto B" },
  { value: "cuartoC", label: "Cuarto C" },
  { value: "quintoA", label: "Quinto A" },
  { value: "quintoB", label: "Quinto B" },
  { value: "quintoC", label: "Quinto C" },
  { value: "sextoA", label: "Sexto A" },
  { value: "sextoB", label: "Sexto B" },
  { value: "sextoC", label: "Sexto C" },
];

const MATERIAS = [
  { value: "matematica", label: "Matemática" },
  { value: "lenguaje", label: "Lenguaje" },
  { value: "ciencia", label: "Ciencia" },
  { value: "historia", label: "Historia" },
  { value: "ingles", label: "Inglés" },
];

export default function CargarNotasExcel() {
  const [grado, setGrado] = useState("primeroC");
  const [materia, setMateria] = useState("matematica");
  const [archivo, setArchivo] = useState(null);

  const [estudiantes, setEstudiantes] = useState([]);
  const [cargandoEstudiantes, setCargandoEstudiantes] = useState(true);

  const [preview, setPreview] = useState(null);
  const [procesando, setProcesando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    cargarEstudiantes()
      .then(setEstudiantes)
      .catch((err) =>
        setError(`Error al cargar estudiantes: ${err.message}`)
      )
      .finally(() => setCargandoEstudiantes(false));
  }, []);

  async function handleRevisar() {
    if (!archivo) {
      setError("Selecciona un archivo Excel");
      return;
    }
    setError("");
    setMensaje("");
    setPreview(null);
    setProcesando(true);

    try {
      const datosExcel = await leerExcelNotas(archivo);
      const resultado = prepararSubida(datosExcel, estudiantes, grado, materia);
      setPreview(resultado);

      if (resultado.encontrados.length === 0) {
        setError(
          "No se encontró ningún estudiante del Excel en Firebase. Revisa los nombres."
        );
      } else {
        setMensaje(
          `Listo: ${resultado.encontrados.length} estudiantes, ` +
          `${Object.keys(resultado.updates).length} valores a escribir.`
        );
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setProcesando(false);
    }
  }

  async function handleSubir() {
    if (!preview || Object.keys(preview.updates).length === 0) return;

    setSubiendo(true);
    setError("");
    setMensaje("");

    try {
      const cantidad = await subirNotas(preview.updates, "calificaciones");
      setMensaje(`✅ Se subieron ${cantidad} valores a Firebase.`);
      setPreview(null);
      setArchivo(null);
    } catch (err) {
      console.error(err);
      setError(`Error al subir: ${err.message}`);
    } finally {
      setSubiendo(false);
    }
  }

  return (
    <section className="cargar-notas-card">
      <h2>📥 Cargar notas desde Excel</h2>
      <p>
        El Excel debe tener las hojas <code>trimestre1</code>,{" "}
        <code>trimestre2</code> y <code>trimestre3</code>, con la primera
        columna llamada <code>estudiante</code>.
      </p>

      <div className="cargar-notas-grid">
        <label>
          <span>Grado *</span>
          <select value={grado} onChange={(e) => setGrado(e.target.value)}>
            {GRADOS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Materia *</span>
          <select value={materia} onChange={(e) => setMateria(e.target.value)}>
            {MATERIAS.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </label>

        <label>
          <span>Archivo Excel *</span>
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              setArchivo(e.target.files?.[0] || null);
              setPreview(null);
              setMensaje("");
              setError("");
            }}
          />
        </label>
      </div>

      {cargandoEstudiantes && (
        <p>Cargando estudiantes desde Firebase...</p>
      )}

      <button
        onClick={handleRevisar}
        disabled={!archivo || procesando || cargandoEstudiantes}
      >
        {procesando ? "Revisando..." : "🔍 Revisar archivo"}
      </button>

      {error && <p className="form-error">{error}</p>}
      {mensaje && <p className="form-success">{mensaje}</p>}

      {preview && (
        <div className="preview">
          <h3>Vista previa</h3>
          <p>✅ Encontrados: <strong>{preview.encontrados.length}</strong></p>
          {preview.noEncontrados.length > 0 && (
            <p>⚠️ No encontrados: <strong>{preview.noEncontrados.length}</strong></p>
          )}
          <p>📝 Valores: <strong>{Object.keys(preview.updates).length}</strong></p>

          {preview.noEncontrados.length > 0 && (
            <details>
              <summary>Ver nombres no encontrados</summary>
              <ul>
                {preview.noEncontrados.map((n, i) => (
                  <li key={i}>{n}</li>
                ))}
              </ul>
            </details>
          )}

          <details>
            <summary>Ver estudiantes encontrados</summary>
            <table>
              <thead>
                <tr>
                  <th>Nombre en Excel</th>
                  <th>Nombre en Firebase</th>
                  <th>UID</th>
                  <th>Trimestres</th>
                </tr>
              </thead>
              <tbody>
                {preview.encontrados.map((e, i) => (
                  <tr key={i}>
                    <td>{e.nombreExcel}</td>
                    <td>{e.nombre}</td>
                    <td><code>{e.uid}</code></td>
                    <td>{e.filas}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>

          <div>
            <button
              onClick={handleSubir}
              disabled={subiendo || preview.encontrados.length === 0}
            >
              {subiendo
                ? "Subiendo a Firebase..."
                : "🚀 Confirmar y subir a Firebase"}
            </button>
            <button
              onClick={() => setPreview(null)}
              disabled={subiendo}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
import "./CargarNotasExcel.css";