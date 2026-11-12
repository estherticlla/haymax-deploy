const { db } = require("./db");
const { norm } = require("./utils");
const { sumarCantidades } = require("./unidades");

function agruparPorProducto(rows) {
  const padres = rows.map((_, i) => i);
  const buscar = (i) => {
    while (padres[i] !== i) {
      padres[i] = padres[padres[i]];
      i = padres[i];
    }
    return i;
  };
  const unir = (a, b) => {
    const raizA = buscar(a);
    const raizB = buscar(b);
    if (raizA !== raizB) padres[raizB] = raizA;
  };
  const claves = new Map();

  rows.forEach((row, i) => {
    const hogar = String(row.hogar_id);
    const rowKeys = [];
    if (row.producto_id != null) rowKeys.push(`${hogar}:producto:${row.producto_id}`);
    const nombre = norm(row.nombre);
    if (nombre) rowKeys.push(`${hogar}:nombre:${nombre}`);
    for (const key of rowKeys) {
      if (claves.has(key)) unir(i, claves.get(key));
      else claves.set(key, i);
    }
  });

  const grupos = new Map();
  rows.forEach((row, i) => {
    const raiz = buscar(i);
    if (!grupos.has(raiz)) grupos.set(raiz, []);
    grupos.get(raiz).push(row);
  });
  return [...grupos.values()].filter((grupo) => grupo.length > 1);
}

async function limpiarDuplicadosDespensa() {
  return db.transaction(async (tx) => {
    const hogares = await tx.all("SELECT DISTINCT hogar_id FROM despensa ORDER BY hogar_id");
    for (const hogar of hogares) {
      await tx.get("SELECT pg_advisory_xact_lock(?)", hogar.hogar_id);
    }
    const rows = await tx.all(
      `SELECT id, hogar_id, producto_id, nombre, cantidad, unidad_medida, fecha_vencimiento, ubicacion
       FROM despensa ORDER BY hogar_id, id`
    );
    let gruposConsolidados = 0;
    let filasEliminadas = 0;
    const incompatibles = [];

    for (const grupo of agruparPorProducto(rows)) {
      let total;
      try {
        total = sumarCantidades(grupo);
      } catch (error) {
        incompatibles.push({ hogar_id: grupo[0].hogar_id, nombre: grupo[0].nombre, error: error.message });
        continue;
      }
      const principal = grupo[0];
      const fechas = grupo.map((fila) => fila.fecha_vencimiento).filter(Boolean).sort();
      await tx.run(
        `UPDATE despensa
         SET producto_id = ?, cantidad = ?, unidad_medida = ?, fecha_vencimiento = ?,
             actualizado_en = CURRENT_TIMESTAMP
         WHERE id = ? AND hogar_id = ?`,
        principal.producto_id || grupo.find((fila) => fila.producto_id != null)?.producto_id || null,
        total.cantidad,
        total.unidad,
        fechas[0] || null,
        principal.id,
        principal.hogar_id
      );
      for (const duplicado of grupo.slice(1)) {
        await tx.run("DELETE FROM despensa WHERE id = ? AND hogar_id = ?", duplicado.id, principal.hogar_id);
        filasEliminadas += 1;
      }
      gruposConsolidados += 1;
    }

    return { gruposConsolidados, filasEliminadas, incompatibles };
  });
}

if (require.main === module) {
  limpiarDuplicadosDespensa()
    .then((resultado) => {
      console.log(JSON.stringify(resultado, null, 2));
    })
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => db.pool.end());
}

module.exports = { agruparPorProducto, limpiarDuplicadosDespensa };
