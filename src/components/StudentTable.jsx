
import { useMemo, useState } from "react";

export default function StudentTable({ estudiantes = [], cargando }) {
  const [busqueda, setBusqueda] = useState("");
  const [gradoFiltro, setGradoFiltro] = useState("");
  const [paraleloFiltro, setParaleloFiltro] = useState("");

  const grados = useMemo(() => {
    return [
      ...new Set(
        estudiantes
          .map((estudiante) => estudiante.grado)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [estudiantes]);

  const paralelos = useMemo(() => {
    return [
      ...new Set(
        estudiantes
          .filter((estudiante) =>
            !gradoFiltro || estudiante.grado === gradoFiltro
          )
          .map((estudiante) => estudiante.paralelo)
          .filter(Boolean)
      ),
    ].sort((a, b) => a.localeCompare(b, "es"));
  }, [estudiantes, gradoFiltro]);

  const estudiantesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return estudiantes.filter((estudiante) => {
      const nombre = (
        estudiante.nombreCompleto ||
        estudiante.nombre ||
        ""
      ).toLowerCase();

      const email = (estudiante.email || "").toLowerCase();
      const apoderado = (estudiante.apoderado || "").toLowerCase();
      const id = (estudiante.id || "").toLowerCase();

      const coincideBusqueda =
        !texto ||
        nombre.includes(texto) ||
        email.includes(texto) ||
        apoderado.includes(texto) ||
        id.includes(texto);

      const coincideGrado =
        !gradoFiltro || estudiante.grado === gradoFiltro;

      const coincideParalelo =
        !paraleloFiltro || estudiante.paralelo === paraleloFiltro;

      return coincideBusqueda && coincideGrado && coincideParalelo;
    });
  }, [estudiantes, busqueda, gradoFiltro, paraleloFiltro]);

  function limpiarFiltros() {
    setBusqueda("");
    setGradoFiltro("");
    setParaleloFiltro("");
  }

  if (cargando) {
    return (
      <section className="student-table-card">
        <p className="table-message">Cargando estudiantes...</p>
      </section>
    );
  }

  return (
    <section className="student-table-card student-table-wide">
      <div className="student-table-heading">
        <div>
          <span className="eyebrow">GESTIÓN ACADÉMICA</span>
          <h2>Estudiantes registrados</h2>
          <p>
            Consulta y filtra los estudiantes guardados en Firebase.
          </p>
        </div>

        <div className="student-table-summary">
          <strong>{estudiantes.length}</strong>
          <span>Estudiantes registrados</span>
        </div>
      </div>

      <div className="student-toolbar">
        <div className="student-search">
          <span aria-hidden="true">⌕</span>
          <input
            type="search"
            value={busqueda}
            onChange={(evento) => setBusqueda(evento.target.value)}
            placeholder="Buscar por nombre, correo, apoderado o ID..."
            aria-label="Buscar estudiantes"
          />
        </div>

        <select
          value={gradoFiltro}
          onChange={(evento) => {
            setGradoFiltro(evento.target.value);
            setParaleloFiltro("");
          }}
          aria-label="Filtrar por grado"
        >
          <option value="">Todos los grados</option>
          {grados.map((grado) => (
            <option key={grado} value={grado}>
              {grado}
            </option>
          ))}
        </select>

        <select
          value={paraleloFiltro}
          onChange={(evento) => setParaleloFiltro(evento.target.value)}
          aria-label="Filtrar por paralelo"
        >
          <option value="">Todos los paralelos</option>
          {paralelos.map((paralelo) => (
            <option key={paralelo} value={paralelo}>
              Paralelo {paralelo}
            </option>
          ))}
        </select>

        {(busqueda || gradoFiltro || paraleloFiltro) && (
          <button
            type="button"
            className="table-clear-button"
            onClick={limpiarFiltros}
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="student-results-info">
        <span>
          Mostrando <strong>{estudiantesFiltrados.length}</strong> de{" "}
          <strong>{estudiantes.length}</strong> estudiantes
        </span>
      </div>

      {estudiantesFiltrados.length === 0 ? (
        <div className="table-empty-state">
          <span className="empty-icon">⌕</span>
          <h3>
            {estudiantes.length === 0
              ? "Todavía no hay estudiantes"
              : "No se encontraron resultados"}
          </h3>
          <p>
            {estudiantes.length === 0
              ? "Cuando registres estudiantes, aparecerán en este listado."
              : "Prueba con otro nombre o cambia los filtros seleccionados."}
          </p>
          {estudiantes.length > 0 && (
            <button
              type="button"
              className="secondary-button"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="table-scroll">
          <table className="student-table student-table-expanded">
            <thead>
              <tr>
                <th className="col-student">Estudiante</th>
                <th className="col-course">Grado</th>
                <th className="col-parallel">Paralelo</th>
                <th className="col-email">Correo registrado</th>
                <th className="col-phone">Teléfono</th>
                <th className="col-guardian">Apoderado</th>
                <th className="col-id">Identificador</th>
              </tr>
            </thead>

            <tbody>
              {estudiantesFiltrados.map((estudiante) => {
                const nombre =
                  estudiante.nombreCompleto ||
                  estudiante.nombre ||
                  "Sin nombre";

                const id = estudiante.id || "";

                return (
                  <tr key={id}>
                    <td className="student-name">
                      <div className="student-identity">
                        <div className="student-avatar" aria-hidden="true">
                          {nombre.charAt(0).toUpperCase()}
                        </div>
                        <div className="student-identity-info">
                          <strong>{nombre}</strong>
                          <span>{estudiante.direccion || "Sin dirección"}</span>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="grade-label">
                        {estudiante.grado || "—"}
                      </span>
                    </td>

                    <td>
                      {estudiante.paralelo ? (
                        <span className="parallel-label">
                          {estudiante.paralelo}
                        </span>
                      ) : (
                        <span className="muted-value">—</span>
                      )}
                    </td>

                    <td className="student-email">
                      {estudiante.email || "—"}
                    </td>

                    <td>{estudiante.telefono || "—"}</td>

                    <td>{estudiante.apoderado || "—"}</td>

                    <td>
                      <button
                        type="button"
                        className="student-id-button"
                        title={`Copiar identificador: ${id}`}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(id);
                          } catch (error) {
                            console.error(
                              "No se pudo copiar el identificador:",
                              error
                            );
                          }
                        }}
                        disabled={!id}
                      >
                        <code>
                          {id.length > 15
                            ? `${id.slice(0, 12)}...`
                            : id || "—"}
                        </code>
                        <span aria-hidden="true">▢</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
