// Preferencias locales del hogar (notificaciones, exclusiones, tipos de plato).
// Se guardan en AsyncStorage en el dispositivo. Cuando el backend exponga un
// endpoint de preferencias, este módulo será el único punto a cambiar.
import { diasHasta } from "./fechas";

const CLAVE = "haymax.preferencias";

let memoria = {
  notificaciones: true,
  diasAvisoVencimiento: 2,
  exclusiones: [],
  tiposExcluidos: [],
};

async function obtenerStorage() {
  try {
    return (await import("@react-native-async-storage/async-storage")).default;
  } catch (_e) {
    return null;
  }
}

export async function leerPreferencias() {
  const AS = await obtenerStorage();
  if (!AS) return { ...memoria };
  try {
    const raw = await AS.getItem(CLAVE);
    if (raw) {
      const parsed = JSON.parse(raw);
      memoria = {
        ...memoria,
        ...parsed,
        diasAvisoVencimiento: Number(parsed.diasAvisoVencimiento) === 1 ? 1 : 2,
        exclusiones: Array.isArray(parsed.exclusiones) ? parsed.exclusiones : memoria.exclusiones,
        tiposExcluidos: Array.isArray(parsed.tiposExcluidos) ? parsed.tiposExcluidos : memoria.tiposExcluidos,
      };
    }
    return { ...memoria };
  } catch (_e) {
    return { ...memoria };
  }
}

export async function guardarPreferencias(cambios = {}) {
  const actual = await leerPreferencias();
  memoria = {
    ...actual,
    ...cambios,
    diasAvisoVencimiento:
      cambios.diasAvisoVencimiento == null
        ? actual.diasAvisoVencimiento
        : Number(cambios.diasAvisoVencimiento) === 1
          ? 1
          : 2,
  };
  const AS = await obtenerStorage();
  if (AS) {
    try {
      await AS.setItem(CLAVE, JSON.stringify(memoria));
    } catch (_e) {
      // Si falla el storage, la copia en memoria sigue viva durante la sesión
    }
  }
  return { ...memoria };
}

export function diasRestantesVencimiento(insumo) {
  const fecha = insumo && (insumo.fechaVencimiento || insumo.fecha_vencimiento);
  return fecha ? diasHasta(fecha) : null;
}

export function filtrarVencimientos(items = [], diasAviso = 2) {
  const maxDias = Number(diasAviso) === 1 ? 1 : 2;
  return items.filter((insumo) => {
    const dias = diasRestantesVencimiento(insumo);
    return dias != null && dias <= maxDias;
  });
}

export function resumenVencimientos(items = [], diasAviso = 2) {
  const enAviso = filtrarVencimientos(items, diasAviso);
  const vencidos = enAviso.filter((insumo) => diasRestantesVencimiento(insumo) < 0).length;
  return { items: enAviso, porVencer: enAviso.length - vencidos, vencidos, total: enAviso.length };
}

function normalizarTexto(valor) {
  return String(valor || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");
}

function textosDe(valor) {
  const lista = Array.isArray(valor) ? valor : valor == null ? [] : [valor];
  return lista
    .map((item) => (typeof item === "string" ? item : item && (item.nombre || item.name || item.label || item.tipo)))
    .filter(Boolean)
    .map(normalizarTexto);
}

function contieneFrase(texto, frase) {
  return ` ${texto} `.includes(` ${frase} `);
}

function ingredientesDe(receta) {
  const fuentes = [
    receta.ingredientes_detalle,
    receta.ingredientesDetalle,
    receta.ingredientes,
    receta.ingredient_names,
  ];
  for (const fuente of fuentes) {
    const ingredientes = textosDe(fuente);
    if (ingredientes.length) return ingredientes;
  }
  return textosDe(receta.faltantes);
}

function tiposDe(receta) {
  return [
    ...textosDe(receta.tipo),
    ...textosDe(receta.tipo_plato),
    ...textosDe(receta.tipoPlato),
    ...textosDe(receta.categoria),
    ...textosDe(receta.categorias),
    ...textosDe(receta.tags),
    ...textosDe(receta.etiquetas),
    ...textosDe(receta.caracteristicas),
  ];
}

function coincideTipo(tipoReceta, tipoExcluido) {
  const aliases = {
    pesado: "pesados",
    picante: "picantes",
    frito: "fritos",
    "muy condimentado": "muy condimentados",
  };
  const normalizado = normalizarTexto(tipoReceta);
  const exclusion = normalizarTexto(tipoExcluido);
  return (
    normalizado === exclusion ||
    aliases[normalizado] === exclusion ||
    aliases[exclusion] === normalizado ||
    contieneFrase(normalizado, exclusion)
  );
}

export function filtrarRecetasPorPreferencias(recetas = [], preferencias = {}) {
  const exclusiones = textosDe(preferencias.exclusiones);
  const tiposExcluidos = textosDe(preferencias.tiposExcluidos);
  if (!exclusiones.length && !tiposExcluidos.length) return recetas;

  return recetas.filter((receta) => {
    const ingredientes = ingredientesDe(receta || {});
    const tipos = tiposDe(receta || {});
    const usaIngredienteExcluido = ingredientes.some((ingrediente) =>
      exclusiones.some((exclusion) => contieneFrase(ingrediente, exclusion))
    );
    const coincideTipoExcluido = tipos.some((tipo) => tiposExcluidos.some((exclusion) => coincideTipo(tipo, exclusion)));
    return !usaIngredienteExcluido && !coincideTipoExcluido;
  });
}
