const { norm } = require("./utils");

function diasVerduraDeMayorDuracion(producto) {
  if (/^(papa|papas)\b/.test(producto) || producto.includes("cebolla") || producto === "ajo") return 30;
  if (producto === "camote" || producto === "olluco") return 15;
  return null;
}

function diasVidaUtilPorProducto(categoria, nombre) {
  const cat = norm(categoria);
  const producto = norm(nombre);

  if (cat === "carnes") {
    if (/pollo|gallina|pavo|mondongo/.test(producto)) return 2;
    if (producto.includes("cecina")) return 5;
    return 3;
  }
  if (cat === "mariscos") {
    return /camaron|langostino/.test(producto) ? 3 : 2;
  }
  if (cat === "lacteos") return 7;
  if (cat === "verduras") return diasVerduraDeMayorDuracion(producto) || 5;
  if (cat === "frutas") return producto === "limon" ? 7 : 5;
  if (producto === "huevo") return 21;
  if (cat === "congelados") return 180;
  if (cat === "menestras" || cat === "pastas") return 365;
  if (cat === "secos") {
    if (/nueces|galletas|aceite|salsa de soya|sillao/.test(producto)) return 180;
    return 365;
  }
  if (cat === "condimentos") return 365;
  if (cat === "bebidas") return 30;
  return 30;
}

module.exports = { diasVidaUtilPorProducto };
