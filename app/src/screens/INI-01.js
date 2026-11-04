import Screen from "../components/Screen";
import * as K from "../components/kit";
import { go } from "../lib/nav";
import useApi from "../hooks/useApi";
import { getInicio } from "../lib/api";

const NOMBRE = "Inicio: plato planeado hoy";

export default function INI_01() {
  const { data, loading, error, recargar } = useApi(getInicio);

  if (loading) {
    return (
      <Screen id="INI-01" name={NOMBRE}>
        <K.Loading text="Cargando tu inicio…" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen id="INI-01" name={NOMBRE}>
        <K.ErrorState onRetry={recargar} />
      </Screen>
    );
  }

  const { hoy, primerNombre, inicial, plan, recetaHoy, stats, shop, balance, atencion } = data;
  const comida = (plan && plan.comida) || "almuerzo";
  const porciones = (plan && plan.porciones) || recetaHoy.porciones;
  const hayPlan = !!plan;
  const preparado = !!(plan && plan.completado);

  return (
    <Screen id="INI-01" name={NOMBRE}>
      <K.Header iniciales={inicial} title={`Hola, ${primerNombre}`} sub={hoy.fecha} alertas={atencion} />

      <K.Card
        thumb={hayPlan ? recetaHoy.imagen : undefined}
        title={hayPlan ? "Plato planeado hoy" : "Sin plato planeado hoy"}
        sub={
          hayPlan
            ? `${comida} · ${recetaHoy.nombre} · ${porciones} porciones${preparado ? " · preparado" : ""}`
            : "Planifica uno para poder descontar sus insumos al cocinar"
        }
        right={hayPlan ? "Ver" : "Planificar"}
        onPress={() => (hayPlan ? go("REC-02", { receta: recetaHoy.id }) : go("PLA-05"))}
      />
      <K.Card
        title="Ingredientes faltantes"
        sub={`${shop.listos} de ${shop.total} ingredientes listos`}
        right="Ver"
        onPress={() => go("COM-01")}
      />

      <K.SectionTitle title="Acciones rápidas" />
      {preparado ? (
        <K.QuickAction
          icon="checkmark-done-outline"
          label="Plato de hoy preparado"
          sub="Revisa o corrige lo que se descontó"
          onPress={() => go("PRE-02", { receta: recetaHoy.id, porciones: String(porciones) })}
        />
      ) : (
        <K.QuickAction
          icon="checkmark-done-outline"
          label="Ya lo preparé"
          sub={hayPlan ? "Descontar insumos de mi despensa" : "Elige el plato que cocinaste"}
          onPress={() => (hayPlan ? go("PRE-01", { receta: recetaHoy.id }) : go("REC-01"))}
        />
      )}
      <K.QuickAction
        icon="restaurant-outline"
        label="Planificar un plato nuevo"
        sub="Abre el calendario de planificación"
        variant="primary"
        onPress={() => go("PLA-05")}
      />
      <K.QuickAction
        icon="calendar-outline"
        label="Ver mi plan de la semana"
        onPress={() => go("PLA-09")}
      />

      <K.SectionTitle title="Tu despensa" action="Ver todo" onPress={() => go("DES-01")} />
      <K.Chips
        items={[
          { label: `${stats.disponibles} disponibles`, tone: "green" },
          { label: `${stats.porVencer} por vencer`, tone: "amber" },
          { label: `${stats.vencidos} vencidos`, tone: "red" },
        ]}
      />

      <K.SectionTitle title="Tu impacto" />
      <K.Stat
        value="S/ 42"
        eyebrow="Ahorro vs delivery"
        label="Ahorro acumulado"
        delta="+ S/ 12"
      />
      <K.BalanceCard
        label="BALANCE DE LA SEMANA"
        pct={`${balance.pct}%`}
        text={balance.texto}
        link="Ver resumen nutricional →"
        onPress={() => go("SAL-01")}
      />
    </Screen>
  );
}
