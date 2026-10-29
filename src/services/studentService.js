
import {
  ref,
  onValue,
  push,
  set,
} from "firebase/database";

import { database } from "../firebase/config";

const estudiantesRef = ref(database, "estudiantes");

// Escuchar los estudiantes existentes
export function escucharEstudiantes(callback, onError) {
  return onValue(
    estudiantesRef,
    (snapshot) => {
      const valor = snapshot.val() || {};

      const estudiantes = Object.entries(valor).map(
        ([id, datos]) => ({
          id,
          ...datos,
        })
      );

      callback(estudiantes);
    },
    (error) => {
      if (onError) onError(error);
    }
  );
}

// Registrar un estudiante nuevo
export async function crearEstudiante(datos) {
  const nuevoEstudianteRef = push(estudiantesRef);

  const estudiante = {
    nombre: datos.nombre.trim(),
    nombreCompleto: datos.nombre.trim(),
    grado: datos.grado.trim(),
    email: datos.email.trim(),
    fechaNacimiento: datos.fechaNacimiento,
    direccion: datos.direccion.trim(),
    telefono: datos.telefono.trim(),
    apoderado: datos.apoderado.trim(),
    telefonoApoderado: datos.telefonoApoderado.trim(),
  };

  await set(nuevoEstudianteRef, estudiante);

  return nuevoEstudianteRef.key;
}
