
import { useState } from "react";
import { crearEstudiante } from "../services/studentService";

const formularioInicial = {
  nombre: "",
  grado: "Primero",
  paralelo: "C",
  email: "",
  fechaNacimiento: "",
  direccion: "",
  telefono: "",
  apoderado: "",
  telefonoApoderado: "",
};

const campos = [
  {
    name: "nombre",
    label: "Nombre completo del estudiante",
    placeholder: "Apellidos y nombres",
    required: true,
  },
  {
    name: "email",
    label: "Correo electrónico del padre o apoderado",
    type: "email",
    placeholder: "padre@correo.com",
  },
  {
    name: "fechaNacimiento",
    label: "Fecha de nacimiento",
    type: "date",
  },
  {
    name: "telefono",
    label: "Celular del estudiante",
    type: "tel",
    placeholder: "Número de celular",
  },
  {
    name: "direccion",
    label: "Dirección domiciliaria",
    placeholder: "Zona, calle y número",
  },
  {
    name: "apoderado",
    label: "Nombre del padre, madre o apoderado",
    placeholder: "Apellidos y nombres",
  },
  {
    name: "telefonoApoderado",
    label: "Celular del apoderado",
    type: "tel",
    placeholder: "Número de contacto",
  },
];

export default function StudentForm({ onCreado }) {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  function cambiarCampo(evento) {
    const { name, value } = evento.target;

    setFormulario((actual) => ({
      ...actual,
      [name]: value,
    }));

    setMensaje("");
    setError("");
  }

  async function enviarFormulario(evento) {
    evento.preventDefault();
    setMensaje("");
    setError("");

    if (!formulario.nombre.trim()) {
      setError("El nombre completo del estudiante es obligatorio.");
      return;
    }

    if (!formulario.grado.trim() || !formulario.paralelo.trim()) {
      setError("Selecciona el grado y el paralelo del estudiante.");
      return;
    }

    if (
      formulario.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email.trim())
    ) {
      setError("Introduce un correo electrónico válido.");
      return;
    }

    setGuardando(true);

    try {
      const datosEstudiante = {
        ...formulario,
        nombre: formulario.nombre.trim(),
        nombreCompleto: formulario.nombre.trim(),
        grado: formulario.grado.trim(),
        paralelo: formulario.paralelo.trim().toUpperCase(),
        email: formulario.email.trim(),
        direccion: formulario.direccion.trim(),
        telefono: formulario.telefono.trim(),
        apoderado: formulario.apoderado.trim(),
        telefonoApoderado: formulario.telefonoApoderado.trim(),
      };

      const id = await crearEstudiante(datosEstudiante);

      setFormulario({ ...formularioInicial });
      setMensaje(`Estudiante registrado correctamente. ID: ${id}`);

      if (onCreado) {
        await onCreado(id);
      }
    } catch (err) {
      console.error("Error al registrar estudiante:", err);

      setError(
        `No se pudo registrar: ${err.code || "ERROR"} ${
          err.message || "Error desconocido"
        }`
      );
    } finally {
      setGuardando(false);
    }
  }

  return (
    <section className="student-form-card">
      <div className="student-form-heading">
        <div>
          <h2>Registrar estudiante</h2>
          <p>
            Completa los datos personales, académicos y del apoderado.
            Los campos marcados con * son obligatorios.
          </p>
        </div>
      </div>

      <form onSubmit={enviarFormulario}>
        <div className="student-form-grid">
          <label className="student-field">
            <span>Grado *</span>
            <select
              name="grado"
              value={formulario.grado}
              onChange={cambiarCampo}
              required
            >
              <option value="Primero">Primero</option>
              <option value="Segundo">Segundo</option>
              <option value="Tercero">Tercero</option>
              <option value="Cuarto">Cuarto</option>
              <option value="Quinto">Quinto</option>
              <option value="Sexto">Sexto</option>
            </select>
          </label>

          <label className="student-field">
            <span>Paralelo *</span>
            <select
              name="paralelo"
              value={formulario.paralelo}
              onChange={cambiarCampo}
              required
            >
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </label>

          {campos.map((campo) => (
            <label className="student-field" key={campo.name}>
              <span>
                {campo.label}
                {campo.required ? " *" : ""}
              </span>

              <input
                name={campo.name}
                type={campo.type || "text"}
                value={formulario[campo.name]}
                onChange={cambiarCampo}
                placeholder={campo.placeholder || ""}
                required={Boolean(campo.required)}
                autoComplete={
                  campo.name === "email"
                    ? "email"
                    : campo.name === "nombre"
                      ? "name"
                      : "off"
                }
              />
            </label>
          ))}
        </div>

        {mensaje && (
          <p className="form-success" role="status">
            {mensaje}
          </p>
        )}

        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}

        <button
          className="primary-button"
          type="submit"
          disabled={guardando}
        >
          {guardando ? "Guardando estudiante..." : "Guardar estudiante"}
        </button>
      </form>
    </section>
  );
}
