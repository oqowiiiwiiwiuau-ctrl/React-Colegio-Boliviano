import * as XLSX from "xlsx";
import { ref, get, update } from "firebase/database";
import { database } from "../firebase/config";   // ← tu export real

const HOJAS_ESPERADAS = ["trimestre1", "trimestre2", "trimestre3"];

// ============================================================
// LEER EXCEL
// ============================================================
export async function leerExcelNotas(archivo) {
  const data = await archivo.arrayBuffer();
  const workbook = XLSX.read(data, { type: "array" });

  const resultado = {};
  for (const nombreHoja of workbook.SheetNames) {
    if (!HOJAS_ESPERADAS.includes(nombreHoja)) continue;
    const hoja = workbook.Sheets[nombreHoja];
    const filas = XLSX.utils.sheet_to_json(hoja, { defval: "" });
    resultado[nombreHoja] = filas;
  }

  if (Object.keys(resultado).length === 0) {
    throw new Error(
      "El Excel debe tener al menos una hoja llamada trimestre1, trimestre2 o trimestre3"
    );
  }

  return resultado;
}

// ============================================================
// NORMALIZAR NOMBRE (para comparar flexible)
// ============================================================
export function normalizarNombre(nombre) {
  if (!nombre) return "";
  return String(nombre)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // tildes
    .toLowerCase()
    .replace(/[.,\-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .sort()
    .join(" ");
}

// ============================================================
// CARGAR ESTUDIANTES DESDE FIREBASE
// ============================================================
export async function cargarEstudiantes() {
  const snap = await get(ref(database, "estudiantes"));
  const data = snap.val() || {};
  return Object.entries(data).map(([uid, est]) => ({ uid, ...est }));
}

// ============================================================
// BUSCAR ESTUDIANTE POR NOMBRE
// ============================================================
export function buscarEstudiantePorNombre(nombreExcel, estudiantes) {
  const normExcel = normalizarNombre(nombreExcel);
  if (!normExcel) return null;

  // 1) Exacto normalizado
  let encontrado = estudiantes.find(
    (e) => normalizarNombre(e.nombreCompleto || e.nombre) === normExcel
  );
  if (encontrado) return encontrado;

  // 2) Todas las palabras del Excel están en el nombre de Firebase
  const palabrasExcel = normExcel.split(" ");
  encontrado = estudiantes.find((e) => {
    const normFirebase = normalizarNombre(e.nombreCompleto || e.nombre);
    const palabrasFirebase = normFirebase.split(" ");
    return palabrasExcel.every((p) => palabrasFirebase.includes(p));
  });

  return encontrado || null;
}

// ============================================================
// CONVERTIR FILA DEL EXCEL AL OBJETO MULTI-PATH
// ============================================================
export function convertirFilaAFirebase(fila, uid, grado, materia, trimestre) {
  const base = `calificaciones/${grado}/${uid}/${trimestre}/${materia}`;
  const obj = {};

  const CAMPOS_DIRECTOS = [
    "total",
    "autoevaluacion",
    "nota_parcial",
    "ponderacion",
    "nota_trimestral",
  ];

  for (const [clave, valor] of Object.entries(fila)) {
    if (clave === "estudiante") continue;
    if (valor === "" || valor === null || valor === undefined) continue;

    const num = Number(valor);
    if (Number.isNaN(num)) continue;

    if (CAMPOS_DIRECTOS.includes(clave)) {
      const claveFirebase = clave.replace(/_/g, " ");
      obj[`${base}/${claveFirebase}`] = num;
      continue;
    }

    const partes = clave.split("_");
    if (partes.length < 2) continue;

    const padre = partes[0];
    const hija = partes.slice(1).join("_");

    if (hija === "promedio") {
      obj[`${base}/${padre}`] = num;
    } else {
      obj[`${base}/${padre}_componentes/${hija}`] = num;
    }
  }

  return obj;
}

// ============================================================
// PREPARAR TODA LA SUBIDA
// ============================================================
export function prepararSubida(datosExcel, estudiantes, grado, materia) {
  const encontrados = [];
  const noEncontrados = [];
  const updates = {};

  for (const [trimestre, filas] of Object.entries(datosExcel)) {
    for (const fila of filas) {
      const nombreExcel = (fila.estudiante || "").trim();
      if (!nombreExcel) continue;

      const est = buscarEstudiantePorNombre(nombreExcel, estudiantes);
      if (!est) {
        if (!noEncontrados.includes(nombreExcel)) {
          noEncontrados.push(nombreExcel);
        }
        continue;
      }

      const obj = convertirFilaAFirebase(fila, est.uid, grado, materia, trimestre);
      Object.assign(updates, obj);

      const yaEnLista = encontrados.find((e) => e.uid === est.uid);
      if (yaEnLista) {
        yaEnLista.filas++;
      } else {
        encontrados.push({
          uid: est.uid,
          nombre: est.nombreCompleto || est.nombre,
          nombreExcel,
          filas: 1,
        });
      }
    }
  }

  return { encontrados, noEncontrados, updates };
}

// ============================================================
// SUBIR A FIREBASE
// ============================================================
export async function subirNotas(updates, nodoDestino = "calificaciones") {
  const cantidad = Object.keys(updates).length;
  if (cantidad === 0) return 0;

  await update(ref(database, nodoDestino), updates);
  return cantidad;
}