import { StyleSheet, Text, View } from "react-native";
import Screen from "../components/Screen";
import * as K from "../components/kit";
import Button from "../components/Button";
import Icon from "../components/Icon";
import { go } from "../lib/nav";
import useApi from "../hooks/useApi";
import { getInicio } from "../lib/api";
import { colors, radius, shadows, spacing, typography } from "../tokens";

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

  const { hoy, primerNombre, inicial, plan, recetaHoy, sugerida, disponibilidadHoy, stats, shop, balance, atencion } = data;
  const comida = (plan && plan.comida) || "almuerzo";
  const hayPlan = !!plan;
  const preparado = !!(plan && plan.completado);
  const platoTarjeta = hayPlan ? recetaHoy : sugerida || recetaHoy;

  return (
    <Screen id="INI-01" name={NOMBRE}>
      <K.Header iniciales={inicial} title={`Hola, ${primerNombre}`} sub={hoy.fecha} alertas={atencion} />

      {platoTarjeta ? (
        <TarjetaPlatoHoy
          receta={platoTarjeta}
          disponibilidad={disponibilidadHoy}
          comida={comida}
          porciones={(plan && plan.porciones) || platoTarjeta.porciones}
          hayPlan={hayPlan}
          preparado={preparado}
          onVerDetalle={() => go("REC-02", { receta: platoTarjeta.id })}
        />
      ) : (
        <K.EmptyState title="Aún no hay recetas disponibles" sub="Vuelve a intentar en unos momentos." />
      )}
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
          onPress={() => go("PRE-01", { receta: recetaHoy.id })}
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
        sub="Abre tu plan semanal"
        variant="primary"
        onPress={() => go("PLA-09")}
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

function resumenInsumos(receta, disponibilidad) {
  const detalle = (receta.ingredientes_detalle || []).filter((ingrediente) => !ingrediente.opcional);
  const ingredientes = detalle.length ? detalle : receta.ingredientes || [];
  const total = ingredientes.length;
  const tieneDisponibilidad = !!disponibilidad && (
    Array.isArray(disponibilidad.faltantes) ||
    disponibilidad.faltantes_count != null ||
    disponibilidad.cobertura != null
  );
  if (!total || !tieneDisponibilidad) return { listos: 0, total, tieneDisponibilidad };

  const faltantes = Array.isArray(disponibilidad && disponibilidad.faltantes)
    ? new Set(disponibilidad.faltantes).size
    : Math.max(0, Number(disponibilidad && disponibilidad.faltantes_count) || 0);
  return { listos: Math.max(0, total - faltantes), total, tieneDisponibilidad };
}

function TarjetaPlatoHoy({ receta, disponibilidad, comida, porciones, hayPlan, preparado, onVerDetalle }) {
  const { listos, total, tieneDisponibilidad } = resumenInsumos(receta, disponibilidad);
  const todosListos = tieneDisponibilidad && total > 0 && listos === total;
  const etiquetaEstado = hayPlan ? "Plato planeado hoy" : "Recomendado para hoy";
  const textoDisponibilidad = tieneDisponibilidad && total ? `${listos} de ${total} insumos listos` : "Ingredientes por revisar";

  return (
    <View style={styles.platoCard}>
      <View style={styles.platoHero}>
        <K.Hero imagen={receta.imagen} title={receta.nombre} time={receta.minutos ? `${receta.minutos} min` : undefined} />
        <View style={styles.tipoBadge} accessible accessibilityLabel={etiquetaEstado}>
          <Icon name={hayPlan ? "calendar" : "sparkles"} size={typography.sizes.caption} color={colors.primaryDark} />
          <Text style={styles.tipoBadgeText}>{etiquetaEstado}</Text>
        </View>
        <View
          style={[styles.disponibilidadBadge, todosListos ? styles.disponibilidadOk : styles.disponibilidadPendiente]}
          accessible
          accessibilityLabel={textoDisponibilidad}
        >
          <Icon name={todosListos ? "checkmark-circle" : "basket-outline"} size={typography.sizes.caption} color={todosListos ? colors.green : colors.amber} />
          <Text style={[styles.disponibilidadText, { color: todosListos ? colors.green : colors.amber }]}>{textoDisponibilidad}</Text>
        </View>
      </View>
      <View style={styles.platoContenido}>
        <View style={styles.metaFila}>
          <Icon name="restaurant-outline" size={typography.sizes.caption} color={colors.muted} />
          <Text style={styles.metaTexto}>{`${comida} · ${porciones || 1} porciones${preparado ? " · preparado" : ""}`}</Text>
        </View>
        <Button
          label={hayPlan ? "Ver preparación" : "Planificar este plato"}
          iconName={hayPlan ? "restaurant-outline" : "calendar-outline"}
          variant={hayPlan ? "outline" : "primary"}
          rounded
          full
          onPress={onVerDetalle}
          accessibilityLabel={`${hayPlan ? "Ver preparación de" : "Planificar"} ${receta.nombre}`}
          accessibilityHint="Abre el detalle de la receta"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  platoCard: { backgroundColor: colors.white, borderRadius: radius.lg, overflow: "hidden", ...shadows.card },
  platoHero: { position: "relative" },
  tipoBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    minHeight: typography.sizes.title,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primaryLight,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  tipoBadgeText: { fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold, color: colors.primaryDark },
  disponibilidadBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    minHeight: typography.sizes.title,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.pill,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  disponibilidadOk: { backgroundColor: colors.greenBg },
  disponibilidadPendiente: { backgroundColor: colors.amberBg },
  disponibilidadText: { fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold },
  platoContenido: { padding: spacing.md, gap: spacing.sm },
  metaFila: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  metaTexto: { fontSize: typography.sizes.body, color: colors.sub },
});
