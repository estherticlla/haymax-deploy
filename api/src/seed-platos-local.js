// Carga exclusiva de catálogo en el PostgreSQL de desarrollo escuchando en localhost.
const { Client } = require("pg");
const { cargarPlatosPeruanos, platos } = require("./platos-peruanos");

async function main() {
  const client = new Client({ host: "127.0.0.1", port: 5432, database: "haymax", user: "haymax", password: "haymax_dev_password" });
  await client.connect();
  const execute = (sql, args) => {
    let n = 0;
    return client.query(sql.replace(/\?/g, () => `$${++n}`), args);
  };
  const tx = {
    get: async (sql, ...args) => (await execute(sql, args)).rows[0],
    run: async (sql, ...args) => execute(sql, args),
  };
  try {
    await client.query("BEGIN");
    // La base puede contener filas insertadas manualmente con IDs explícitos.
    for (const table of ["catalogo_productos", "receta_ingredientes"]) {
      await client.query(`SELECT setval(pg_get_serial_sequence('${table}', 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM ${table}), 1), 1), TRUE)`);
    }
    await cargarPlatosPeruanos(tx, null);
    const ids = platos.map(([codigo]) => `REC-PE-${codigo}`);
    const result = await client.query("SELECT COUNT(*)::int AS recetas, (SELECT COUNT(*)::int FROM receta_ingredientes WHERE receta_id = ANY($1::text[])) AS ingredientes FROM recetas WHERE id = ANY($1::text[])", [ids]);
    await client.query("COMMIT");
    console.log(`Catálogo local: ${result.rows[0].recetas} platos y ${result.rows[0].ingredientes} ingredientes vinculados.`);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    await client.end();
  }
}
main().catch((error) => { console.error(error.message); process.exitCode = 1; });
