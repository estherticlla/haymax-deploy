import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Image as ExpoImage } from "expo-image";
import Screen from "../components/Screen";
import Button from "../components/Button";
import Icon from "../components/Icon";
import * as K from "../components/kit";
import { go } from "../lib/nav";
import { colors, layout, radius, spacing, typography, shadows } from "../tokens";
import { focoVisible } from "../lib/a11y";
import { getPlanSemanaDe, eliminarPlan, getMotor } from "../lib/api";
import { ingredienteAlcanza, soles } from "../lib/domain";
import { resolverImagen } from "../lib/imagenes";
import { leerPreferencias, filtrarRecetasPorPreferencias } from "../lib/preferencias";
import {
  DIAS_CORTOS,
  hoyIso,
  lunesDeIso,
  sumarDiasIso,
  deIso,
  semanaNumero,
} from "../lib/fechas";

const NOMBRE = "Plan de la semana";
const COMIDAS = [
  { comida: "almuerzo", label: "Almuerzo", icon: "sunny-outline" },
  { comida: "cena", label: "Cena", icon: "moon-outline" },
  { comida: "desayuno", label: "Desayuno", icon: "cafe-outline" },
];
const MESES_ABREV = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

function fechaAccesible(iso) {
  const fecha = new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long" }).format(deIso(iso));
  return fecha.charAt(0).toUpperCase() + fecha.slice(1);
}

function comidaSeleccionable(valor) {
  const comida = Array.isArray(valor) ? valor[0] : valor;
  return COMIDAS.some((opcion) => opcion.comida === comida) ? comida : "almuerzo";
}

export default function PLA_09({ fecha, comida: comidaInicial }) {
  const hoy = hoyIso();
  const [offsetSemana, setOffsetSemana] = useState(0);
  const ancla = fecha || hoy;
  const lunesBase = lunesDeIso(ancla);
  const [sel, setSel] = useState(ancla);
  const [comidaActiva, setComidaActiva] = useState(() => comidaSeleccionable(comidaInicial));
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");

  const [datos, setDatos] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [refresco, setRefresco] = useState(0);
  const recargar = useCallback(() => setRefresco((r) => r + 1), [setRefresco]);
  const [recetas, setRecetas] = useState([]);
  const [cargandoRecetas, setCargandoRecetas] = useState(true);
  const [errorRecetas, setErrorRecetas] = useState("");
  const lunes = sumarDiasIso(lunesBase, offsetSemana * 7);

  useEffect(() => {
    setComidaActiva(comidaSeleccionable(comidaInicial));
  }, [comidaInicial]);

  useEffect(() => {
    let activo = true;
    const cargarRecetas = async () => {
      setCargandoRecetas(true);
      setErrorRecetas("");
      try {
        const [motor, preferencias] = await Promise.all([getMotor(comidaActiva), leerPreferencias()]);
        if (!activo) return;
        setRecetas(filtrarRecetasPorPreferencias(motor.recetas || [], preferencias));
      } catch (e) {
        if (!activo) return;
        setErrorRecetas((e && e.message) || "No se pudieron cargar las recetas recomendadas.");
      } finally {
        if (activo) setCargandoRecetas(false);
      }
    };
    cargarRecetas();
    return () => {
      activo = false;
    };
  }, [comidaActiva, refresco]);

  // Recarga del plan cada vez que cambia la semana visible o al volver al foco.
  useEffect(() => {
    let vivo = true;
    Promise.resolve()
      .then(() => {
        if (!vivo) return undefined;
        setCargando(true);
        setError(null);
        return getPlanSemanaDe(lunes);
      })
      .then((d) => {
        if (!vivo) return;
        setDatos(d);
        setCargando(false);
      })
      .catch((e) => {
        if (!vivo) return;
        setError((e && e.message) || "No se pudo cargar el plan de la semana.");
        setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [lunes, refresco]);

  const finSemana = sumarDiasIso(lunes, 6);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const iso = sumarDiasIso(lunes, i);
    return { iso, num: deIso(iso).getDate(), corto: DIAS_CORTOS[i], esHoy: iso === hoy };
  });

  if (cargando && !datos) {
    return (
      <Screen id="PLA-09" name={NOMBRE}>
        <K.Loading text="Cargando tu plan…" />
      </Screen>
    );
  }
  if (error && !datos) {
    return (
      <Screen id="PLA-09" name={NOMBRE}>
        <K.ErrorState onRetry={recargar} />
      </Screen>
    );
  }
  if (!datos) return null;

  const diaSel = dias.some((d) => d.iso === sel) ? sel : lunes;
  const planesDia = datos.plan.filter((p) => p.fecha === diaSel);
  const comidaSeleccionada = COMIDAS.find((opcion) => opcion.comida === comidaActiva) || COMIDAS[0];
  const filaSeleccionada = planesDia.find((p) => p.comida === comidaActiva);
  const quitar = async (id) => {
    if (ocupado) return;
    setOcupado(true);
    try {
      await eliminarPlan(id);
      setAviso("");
      recargar();
    } catch (e) {
      setAviso((e && e.message) || "No se pudo quitar el plato.");
    } finally {
      setOcupado(false);
    }
  };

  const moverSemana = (d) => {
    setOffsetSemana((o) => o + d);
    setSel(sumarDiasIso(lunes, d * 7));
  };

  return (
    <Screen id="PLA-09" name={NOMBRE}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plan de la semana</Text>
        <View style={styles.headerSub}>
          <Icon name="calendar-outline" size={13} color={colors.primary} />
          <Text style={styles.headerSubText}>{`${etiquetaSemana(lunes, finSemana)} · Semana ${semanaNumero(lunes)}`}</Text>
        </View>
      </View>

      <View style={styles.selRow}>
        <Text style={styles.selLabel}>SELECCIONA EL DÍA</Text>
      </View>
      <View style={styles.diasFila}>
        <Flecha icon="chevron-back" accessibilityLabel="Semana anterior" onPress={() => moverSemana(-1)} disabled={ocupado} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.diasScroll}>
          {dias.map((d) => {
            const activo = d.iso === diaSel;
            return (
              <Pressable
                key={d.iso}
                onPress={() => setSel(d.iso)}
                accessibilityRole="button"
                accessibilityLabel={`${d.corto} ${d.num}, ${fechaAccesible(d.iso)}${d.esHoy ? ", hoy (HOY)" : ""}`}
                accessibilityState={{ selected: activo, disabled: false }}
                style={[styles.diaChip, activo && styles.diaChipSel]}
              >
                {d.esHoy && <Text style={[styles.diaChipHoyTag, activo && styles.diaChipHoyTagSelected]}>HOY</Text>}
                <Text style={[styles.diaChipDow, activo && styles.diaChipTextoOn]}>{d.corto}</Text>
                <Text style={[styles.diaChipNum, activo && styles.diaChipTextoOn]}>{d.num}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
        <Flecha icon="chevron-forward" accessibilityLabel="Semana siguiente" onPress={() => moverSemana(1)} disabled={ocupado} />
      </View>

      <View style={styles.comidas}>
        <Text style={styles.selLabel}>ELIGE UNA COMIDA</Text>
        <K.Chips
          items={COMIDAS.map((opcion) => opcion.label)}
          active={comidaSeleccionada.label}
          onPressItem={(label) => {
            const opcion = COMIDAS.find((item) => item.label === label);
            if (opcion) setComidaActiva(opcion.comida);
          }}
          accessibilityRole="radio"
          groupRole="radiogroup"
          groupLabel="Comida a planificar"
          hintItem="Muestra el platillo planificado para esta comida"
        />
      </View>

      {aviso ? <K.Banner title={aviso} tone="RED" /> : null}

      {filaSeleccionada && filaSeleccionada.receta ? (
        <View style={styles.tarjeta}>
          <BloquePlanificado fila={filaSeleccionada} pantry={datos.pantry} ocupado={ocupado} quitar={quitar} />
        </View>
      ) : null}

      <K.TextLine
        text={`${recetas.length} recetas recomendadas para esta comida.`}
      />
      {cargandoRecetas ? (
        <K.Loading text="Buscando recetas recomendadas…" />
      ) : errorRecetas ? (
        <K.ErrorState text={errorRecetas} />
      ) : recetas.length > 0 ? (
        recetas.map((receta) => (
          <TarjetaReceta
            key={receta.id}
            imagen={receta.imagen}
            titulo={receta.nombre}
            tiempo={receta.minutos}
            porciones={receta.porciones}
            cobertura={receta.cobertura}
            disponible={receta.disponible}
            precio={receta.precio}
            onPress={() => go("REC-02", {
              receta: receta.id,
              fecha: diaSel,
              comida: comidaActiva,
              planId: filaSeleccionada && filaSeleccionada.id,
              yaPlanificado: !!filaSeleccionada,
            })}
          />
        ))
      ) : (
        <K.EmptyState title="No hay recetas recomendadas" sub="Prueba con otra comida o revisa tus preferencias." />
      )}

    </Screen>
  );
}

// "Semana del 18 al 24 de Nov" (meses abreviados; cambia de mes si cruza).
function etiquetaSemana(desde, hasta) {
  const d1 = deIso(desde);
  const d2 = deIso(hasta);
  const mes1 = MESES_ABREV[d1.getMonth()];
  const mes2 = MESES_ABREV[d2.getMonth()];
  if (mes1 === mes2) return `Semana del ${d1.getDate()} al ${d2.getDate()} de ${mes1}`;
  return `Semana del ${d1.getDate()} de ${mes1} al ${d2.getDate()} de ${mes2}`;
}

// Tarjeta de una comida ya planeada: foto con píldoras de precio e insumos,
// título, porciones, nota de faltantes y acciones (cambiar / quitar).
function BloquePlanificado({ fila, pantry, ocupado, quitar }) {
  const r = fila.receta;
  const v = ingredienteAlcanza(r, pantry, fila.porciones);
  const detalle =
    r.ingredientes_detalle && r.ingredientes_detalle.length
      ? r.ingredientes_detalle
      : (r.ingredientes || []).map((t) => ({ nombre: t }));
  const total = detalle.length;
  const listos = Math.max(0, total - v.faltantes.length);
  const fuente = resolverImagen(r.imagen);

  return (
    <View style={styles.bloque}>
      <Pressable
        onPress={() => go("REC-02", { receta: r.id, fecha: fila.fecha, comida: fila.comida, planId: fila.id, yaPlanificado: true })}
        accessibilityRole="button"
        accessibilityLabel={`${r.nombre}. Ver receta`}
        accessibilityState={{ disabled: false }}
        style={({ pressed }) => [styles.fotoWrap, pressed && styles.pressOn]}
      >
        {fuente ? (
          <ExpoImage source={fuente} style={styles.foto} contentFit="cover" transition={150} cachePolicy="memory-disk" />
        ) : (
          <View style={[styles.foto, styles.fotoPh]}>
            <Icon name="restaurant-outline" size={38} color={colors.primary} />
          </View>
        )}
        {r.precio ? (
          <View style={styles.pillPrecio}>
            <Text style={styles.pillPrecioText}>{`${soles(r.precio)} total`}</Text>
          </View>
        ) : null}
        <View style={styles.pillEstado}>
          <Icon name={listos > 0 ? "checkmark" : "alert-circle-outline"} size={12} color={listos > 0 ? colors.green : colors.amber} />
          <Text style={[styles.pillEstadoText, listos === 0 && { color: colors.amber }]}>
            {listos === 0 ? "Ningún insumo en casa" : listos === total ? "Todos los insumos disponibles" : `${listos} de ${total} insumos listos`}
          </Text>
        </View>
      </Pressable>

      <Text style={styles.titulo} onPress={() => go("REC-02", { receta: r.id, fecha: fila.fecha, comida: fila.comida, planId: fila.id, yaPlanificado: true })}>
        {r.nombre}
      </Text>
      <View style={styles.metaFila}>
        <Icon name="restaurant-outline" size={13} color={colors.muted} />
        <Text style={styles.meta}>{`${fila.porciones} porciones`}</Text>
      </View>
      {v.faltantes.length > 0 ? (
        <View style={styles.metaFila}>
          <Icon name="alert-circle-outline" size={13} color={colors.amber} />
          <Text style={[styles.meta, styles.metaFalta]}>
            {`Falta: ${v.faltantes.slice(0, 3).join(", ")}${v.faltantes.length > 3 ? "…" : ""}`}
          </Text>
        </View>
      ) : null}

      <View style={styles.accionRow}>
        <View style={styles.accionBtn}>
          <Button label="⇄  Cambiar plato" variant="outline" onPress={() => go("PLA-06", { fecha: fila.fecha, comida: fila.comida, planId: fila.id, yaPlanificado: true })} />
        </View>
        <Pressable onPress={() => quitar(fila.id)} disabled={ocupado} accessibilityRole="button" accessibilityLabel={`Quitar ${r.nombre} del plan`} accessibilityState={{ disabled: ocupado }} hitSlop={8} style={({ pressed }) => [pressed && styles.pressOn, styles.basuraWrap]}>
          <View style={styles.basura}>
            <Icon name="trash-outline" size={18} color={colors.red} />
          </View>
        </Pressable>
      </View>
    </View>
  );
}

function TarjetaReceta({ imagen, titulo, tiempo, porciones, cobertura, disponible, precio, onPress }) {
  const fuente = resolverImagen(imagen);
  const todosListos = disponible || Number(cobertura) >= 100;
  const estado = todosListos
    ? "Tienes todos los ingredientes"
    : cobertura > 0
      ? `${cobertura}% de ingredientes disponibles`
      : "Te faltan ingredientes";

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${titulo}. Elegir este platillo`}
      accessibilityHint="Abre el detalle para planificar esta receta"
      accessibilityState={{ disabled: false }}
      style={(state) => [styles.recetaTarjeta, state.pressed && styles.pressOn, focoVisible(state)]}
    >
      <View style={styles.recetaImagenWrap}>
        {fuente ? (
          <ExpoImage source={fuente} style={styles.recetaImagen} contentFit="cover" transition={150} cachePolicy="memory-disk" />
        ) : (
          <View style={[styles.recetaImagen, styles.fotoPh]}>
            <Icon name="restaurant-outline" size={38} color={colors.primary} />
          </View>
        )}
        <View style={styles.pillPrecio}>
          <Text style={styles.pillPrecioText}>{`${soles(precio)} total`}</Text>
        </View>
        <View style={[styles.pillEstado, { backgroundColor: todosListos ? colors.greenBg : colors.amberBg }]}>
          <Icon name={todosListos ? "checkmark" : "alert-circle-outline"} size={12} color={todosListos ? colors.green : colors.amber} />
          <Text style={[styles.pillEstadoText, { color: todosListos ? colors.green : colors.amber }]}>{estado}</Text>
        </View>
      </View>
      <View style={styles.recetaCuerpo}>
        <Text style={styles.titulo}>{titulo}</Text>
        <View style={styles.metaFila}>
          <Icon name="time-outline" size={13} color={colors.muted} />
          <Text style={styles.meta}>{`${tiempo} min`}</Text>
          <Icon name="restaurant-outline" size={13} color={colors.muted} />
          <Text style={styles.meta}>{`${porciones} porciones`}</Text>
        </View>
        <Text style={styles.recetaAccion}>Elegir este platillo →</Text>
      </View>
    </Pressable>
  );
}

function Flecha({ icon, accessibilityLabel, onPress, disabled }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: !!disabled }}
      hitSlop={10}
      style={({ pressed }) => [pressed && { opacity: 0.5 }, disabled && { opacity: 0.35 }]}
    >
      <Icon name={icon} size={18} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressOn: { opacity: 0.85 },

  header: {
    backgroundColor: colors.primaryLight,
    marginHorizontal: -spacing.md,
    marginTop: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 4,
  },
  headerTitle: { fontSize: 26, fontWeight: typography.weights.bold, color: colors.text, lineHeight: 31 },
  headerSub: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 4 },
  headerSubText: { fontSize: typography.sizes.body, color: colors.sub },

  selRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: spacing.sm,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  selLabel: { fontSize: 11, letterSpacing: 1, fontWeight: typography.weights.semibold, color: colors.muted },
  diasFila: { flexDirection: "row", alignItems: "center" },
  diasScroll: { flexGrow: 1, gap: 6, paddingHorizontal: 4 },
  diaChip: {
    width: 46,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
  },
  diaChipSel: { backgroundColor: colors.primary, borderColor: colors.primary, borderWidth: 2 },
  diaChipHoyTag: { fontSize: 8, fontWeight: typography.weights.bold, color: colors.primary, letterSpacing: 1 },
  diaChipHoyTagSelected: { color: colors.white },
  diaChipDow: { fontSize: typography.sizes.caption, color: colors.sub },
  diaChipNum: { fontSize: typography.sizes.body, fontWeight: typography.weights.bold, color: colors.text },
  diaChipTextoOn: { color: colors.white },

  comidas: { gap: spacing.xs, marginTop: spacing.md },

  tarjeta: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.sm,
    ...shadows.card,
    marginBottom: spacing.sm,
  },
  recetaTarjeta: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    overflow: "hidden",
    ...shadows.card,
  },
  recetaImagenWrap: { height: layout.emptyStateMinHeight, backgroundColor: colors.primaryLight },
  recetaImagen: { width: "100%", height: "100%" },
  recetaCuerpo: { padding: spacing.sm, gap: spacing.xs },
  recetaAccion: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.primary },
  bloque: { gap: 6 },
  fotoWrap: { height: 150, borderRadius: radius.md, overflow: "hidden", backgroundColor: colors.primaryLight },
  foto: { width: "100%", height: "100%" },
  fotoPh: { alignItems: "center", justifyContent: "center" },
  pillPrecio: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  pillPrecioText: { fontSize: typography.sizes.small, fontWeight: typography.weights.semibold, color: colors.primary },
  pillEstado: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.greenBg,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillEstadoText: { fontSize: typography.sizes.caption, color: colors.green, fontWeight: typography.weights.semibold },

  titulo: { fontSize: 17, fontWeight: typography.weights.bold, color: colors.text, lineHeight: 22 },
  metaFila: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 2 },
  meta: { flex: 1, fontSize: typography.sizes.small, color: colors.sub },
  metaFalta: { color: colors.amber },

  accionRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  accionBtn: { flex: 1 },
  basuraWrap: { width: 44, height: 48, justifyContent: "center" },
  basura: {
    width: 44,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },

});
