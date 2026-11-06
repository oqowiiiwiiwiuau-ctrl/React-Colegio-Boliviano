import { useEffect, useState } from "react";
import { ref, get } from "firebase/database";
import { database } from "./firebase/config";
import Students from "./pages/Students";
import Notas from "./pages/Notas";
import "./App.css";

export default function App() {
  const [pagina, setPagina] = useState("inicio");
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);
  const [estadoFirebase, setEstadoFirebase] = useState("Consultando...");
  const [cargando, setCargando] = useState(true);

  async function consultarResumen() {
    setCargando(true);
    try {
      const snapshot = await get(ref(database, "estudiantes"));
      const estudiantes = snapshot.val() || {};
      setTotalEstudiantes(Object.keys(estudiantes).length);
      setEstadoFirebase("Conectado correctamente");
    } catch (error) {
      console.error("Error consultando Firebase:", error);
      setEstadoFirebase(
        `Error: ${error.code || error.message || "No disponible"}`
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    consultarResumen();
  }, []);

  function irAInicio() {
    setPagina("inicio");
    consultarResumen();
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand brand-button" onClick={irAInicio}>
          <div className="brand-icon">C</div>
          <div className="brand-copy">
            <h1>Panel del Colegio</h1>
            <p>Administración académica</p>
          </div>
        </button>

        <nav className="main-navigation">
          <button
            className={`nav-button ${pagina === "inicio" ? "active" : ""}`}
            onClick={irAInicio}
          >
            Inicio
          </button>

          <button
            className={`nav-button ${pagina === "estudiantes" ? "active" : ""}`}
            onClick={() => setPagina("estudiantes")}
          >
            Estudiantes
          </button>

          {/* ✅ NUEVO BOTÓN: Notas */}
          <button
            className={`nav-button ${pagina === "notas" ? "active" : ""}`}
            onClick={() => setPagina("notas")}
          >
            Notas
          </button>
        </nav>
      </header>

      {pagina === "estudiantes" ? (
        <main>
          <div className="module-toolbar">
            <button className="back-button" onClick={irAInicio}>
              ← Volver al panel principal
            </button>
          </div>
          <Students />
        </main>
      ) : pagina === "notas" ? (
        <main>
          <div className="module-toolbar">
            <button className="back-button" onClick={irAInicio}>
              ← Volver al panel principal
            </button>
          </div>
          <Notas />
        </main>
      ) : (
        <main className="dashboard">
          {/* ... el resto de tu dashboard de inicio ... */}
          <section className="welcome">
            <div className="welcome-content">
              <span className="eyebrow">SISTEMA DE GESTIÓN</span>
              <h2>Bienvenido a tu panel</h2>
              <p>
                Administra la información del colegio desde un solo lugar.
                Consulta tus estudiantes, registra nuevos alumnos y carga sus
                notas.
              </p>

              <button
                className="primary-button dashboard-action"
                onClick={() => setPagina("estudiantes")}
              >
                <span>＋</span>
                Agregar estudiantes
                <span>→</span>
              </button>
            </div>

            <div className="welcome-decoration" aria-hidden="true">
              <div className="decoration-circle">C</div>
            </div>
          </section>

          <section className="stats-grid">
            <article className="stat-card">
              <div className="stat-heading">
                <span>Total de estudiantes</span>
                <span className="stat-icon blue">♙</span>
              </div>
              <div className="stat-number">
                {cargando ? "..." : totalEstudiantes}
              </div>
              <p className="stat-description">
                Registros en Realtime Database
              </p>
            </article>

            <article className="stat-card">
              <div className="stat-heading">
                <span>Estado de Firebase</span>
                <span className="stat-icon purple">↗</span>
              </div>
              <div className="status-line">
                <span
                  className={`status-dot ${
                    estadoFirebase.startsWith("Error") ? "offline" : ""
                  }`}
                />
                <strong>{estadoFirebase}</strong>
              </div>
              <p className="stat-description">
                Estado de la última consulta
              </p>
            </article>
          </section>

          {/* ✅ NUEVO ACCESO RÁPIDO: Cargar notas */}
          <section className="quick-access-card">
            <div className="quick-access-icon">📥</div>
            <div className="quick-access-content">
              <h2>Cargar notas desde Excel</h2>
              <p>
                Sube las calificaciones de un curso desde un archivo Excel.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => setPagina("notas")}
            >
              Cargar notas →
            </button>
          </section>

          <section className="quick-access-card">
            <div className="quick-access-icon">♙</div>
            <div className="quick-access-content">
              <h2>Gestión de estudiantes</h2>
              <p>
                Registra nuevos alumnos, consulta sus datos y revisa el listado.
              </p>
            </div>
            <button
              className="secondary-button"
              onClick={() => setPagina("estudiantes")}
            >
              Entrar al módulo →
            </button>
          </section>

          <footer className="footer">
            <span>Panel del Colegio</span>
            <span>Firebase Realtime Database</span>
          </footer>
        </main>
      )}
    </div>
  );
}