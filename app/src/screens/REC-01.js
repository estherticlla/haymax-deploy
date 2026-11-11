import { useState } from "react";
import Screen from "../components/Screen";
import Button from "../components/Button";
import * as K from "../components/kit";
import { go } from "../lib/nav";
import useApi from "../hooks/useApi";
import { getMotor } from "../lib/api";
import { norm, soles } from "../lib/domain";
import { leerPreferencias, filtrarRecetasPorPreferencias } from "../lib/preferencias";

const NOMBRE = "¿Qué puedo cocinar?";
const FILTROS = ["Todas", "Con lo que tengo", "Me falta poco", "Rápidas", "Favoritas"];

export default function REC_01() {
  const [filtro, setFiltro] = useState("Todas");
  const [busqueda, setBusqueda] = useState("");
  const { data, loading, error, recargar } = useApi(async () => {
    const [motor, preferencias] = await Promise.all([getMotor(), leerPreferencias()]);
    return { ...motor, recetas: filtrarRecetasPorPreferencias(motor.recetas || [], preferencias) };
  });

  if (loading) {
    return (
      <Screen id="REC-01" name={NOMBRE}>
        <K.Loading text="Buscando recetas…" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen id="REC-01" name={NOMBRE}>
        <K.ErrorState onRetry={recargar} />
      </Screen>
    );
  }

  const favoritas = new Set(data.favoritos || []);
  const recetas = data.recetas || [];

  const porFiltro =
    filtro === "Todas"
      ? recetas
      : filtro === "Con lo que tengo"
        ? recetas.filter((r) => r.disponible)
      : filtro === "Me falta poco"
        ? recetas.filter((r) => !r.disponible && r.faltantes_count <= 2)
        : filtro === "Rápidas"
          ? recetas.filter((r) => r.minutos <= 30)
          : recetas.filter((r) => favoritas.has(r.id));

  const filtradas = porFiltro.filter((r) => norm(r.nombre).includes(norm(busqueda.trim())));

  const titulo =
    filtro === "Todas"
      ? "Todas las recetas"
      : filtro === "Con lo que tengo"
        ? "Recetas con lo que tienes"
      : filtro === "Me falta poco"
        ? "Te falta poco"
        : filtro === "Rápidas"
          ? "Listas en 30 minutos o menos"
          : "Tus recetas favoritas";

  return (
    <Screen id="REC-01" name={NOMBRE}>
      <K.InputField label="Buscar receta" placeholder="Por ejemplo, causa" value={busqueda} onChangeText={setBusqueda} />
      {busqueda.trim() ? <K.LinkText label="Borrar búsqueda" onPress={() => setBusqueda("")} /> : null}
      <K.Chips items={FILTROS} active={filtro} onPressItem={setFiltro} />
      {filtradas.length > 0 ? <K.SectionTitle title={`${titulo} · ${filtradas.length}`} /> : null}

      {filtradas.length === 0 ? (
        <K.EmptyState
          title={busqueda.trim() ? "No encontramos esa receta" : filtro === "Favoritas" ? "Aún no tienes favoritas" : "Ninguna receta con este filtro"}
          sub={
            busqueda.trim()
              ? "Prueba otro nombre o cambia el filtro."
              : filtro === "Favoritas"
              ? "Marca el corazón en el detalle de una receta."
              : "Prueba con otro filtro o registra más insumos."
          }
        />
      ) : (
        filtradas.map((r) => (
          <K.PhotoCard
            key={r.id}
            imagen={r.imagen}
            title={r.nombre}
            sub={
              r.disponible
                ? `${r.porciones} porciones · ${r.minutos} min · todo disponible`
                : `Falta: ${r.faltantes.slice(0, 2).join(", ")}${r.faltantes_count > 2 ? "…" : ""}`
            }
            price={`${soles(r.precio / (r.porciones || 1))} por porción`}
            time={`${r.minutos} min`}
            status={r.disponible ? "Se puede preparar" : `Falta ${r.faltantes_count} insumo${r.faltantes_count > 1 ? "s" : ""}`}
            statusTone={r.disponible ? undefined : "amber"}
            cta="Ver receta →"
            onPress={() => go("REC-02", { receta: r.id })}
          />
        ))
      )}

      {filtradas.length === 0 && (filtro !== "Todas" || busqueda.trim()) ? (
        <Button label="Ver todas las recetas" variant="outline" full onPress={() => { setFiltro("Todas"); setBusqueda(""); }} />
      ) : null}
      <Button label="Ver recetas por distrito" variant="outline" full onPress={() => go("INI-03")} />
      <K.LinkText
        label="Agregar ingredientes a mi despensa"
        onPress={() => go("DES-03")}
      />
      <K.LinkText label="Planificar con lo que tengo" onPress={() => go("PLA-01")} />
    </Screen>
  );
}
