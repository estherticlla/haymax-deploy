const { norm } = require("./utils");

function unidadComparable(unidad) {
  const original = String(unidad || "und").trim();
  const clave = norm(original);

  if (["kg", "kilo", "kilos", "kilogramo", "kilogramos"].includes(clave)) {
    return { grupo: "peso", factor: 1000, unidad: original };
  }
  if (["g", "gr", "gramo", "gramos"].includes(clave)) {
    return { grupo: "peso", factor: 1, unidad: original };
  }
  if (["l", "lt", "litro", "litros"].includes(clave)) {
    return { grupo: "volumen", factor: 1000, unidad: original };
  }
  if (["ml", "mililitro", "mililitros"].includes(clave)) {
    return { grupo: "volumen", factor: 1, unidad: original };
  }
  if (["und", "unid", "unidad", "unidades"].includes(clave)) {
    return { grupo: "unidades", factor: 1, unidad: original };
  }
  return { grupo: `unidad:${clave}`, factor: 1, unidad: original };
}

function sumarCantidades(filas) {
  if (!filas.length) return { cantidad: 0, unidad: "und" };
  const referencia = unidadComparable(filas[0].unidad_medida);
  let total = 0;
  for (const fila of filas) {
    const actual = unidadComparable(fila.unidad_medida);
    if (actual.grupo !== referencia.grupo) {
      throw new Error("Las unidades del producto no son compatibles para sumar.");
    }
    total += Number(fila.cantidad) * actual.factor / referencia.factor;
  }
  return {
    cantidad: Number(total.toFixed(6)),
    unidad: referencia.unidad,
  };
}

module.exports = { unidadComparable, sumarCantidades };
