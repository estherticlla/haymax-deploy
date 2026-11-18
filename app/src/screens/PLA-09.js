import { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView, StyleSheet } from "react-native";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import Screen from "../components/Screen";
import Button from "../components/Button";
import Icon from "../components/Icon";
import * as K from "../components/kit";
import { colors, layout, radius, spacing, typography, shadows } from "../tokens";
import { anunciar, focoVisible } from "../lib/a11y";
import { getPlanSemanaDe, eliminarPlan, getMotor, actualizarPlan, planificarPlato } from "../lib/api";
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

function imagenDe(receta) {
  if (!receta) return null;
  return receta.imagen || receta.imagen_url || receta.imagenUrl || receta.foto_url || receta.foto || null;
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
  const recetaSeleccionadaId = filaSeleccionada
    ? filaSeleccionada.recetaId ?? filaSeleccionada.receta_id ?? filaSeleccionada.receta?.id
    : null;
  const recomendaciones = recetaSeleccionadaId == null
    ? recetas
    : recetas.filter((receta) => String(receta.id) !== String(recetaSeleccionadaId));
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

  const seleccionarReceta = async (receta) => {
    if (ocupado) return;
    const yaPlanificado = !!filaSeleccionada;
    setOcupado(true);
    setAviso("");
    try {
      if (filaSeleccionada) {
        await actualizarPlan(filaSeleccionada.id, {
          recetaId: receta.id,
          fecha: diaSel,
          comida: comidaActiva,
          porciones: filaSeleccionada.porciones,
        });
      } else {
        await planificarPlato({
          recetaId: receta.id,
          fecha: diaSel,
          comida: comidaActiva,
          porciones: receta.porciones || 1,
        });
      }
      recargar();
      anunciar(yaPlanificado ? `${receta.nombre} reemplazó el plato seleccionado.` : `${receta.nombre} se agregó a tu plan.`);
    } catch (e) {
      setAviso((e && e.message) || (yaPlanificado ? "No se pudo cambiar el platillo." : "No se pudo planificar el platillo."));
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
      <K.Header
        title="Plan de la semana"
        sub={`${etiquetaSemana(lunes, finSemana)} · Semana ${semanaNumero(lunes)}`}
        subIcon="calendar-outline"
        showTop={false}
      />

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
        text={`${recomendaciones.length} recetas recomendadas para esta comida.`}
      />
      {cargandoRecetas ? (
        <K.Loading text="Buscando recetas recomendadas…" />
      ) : errorRecetas ? (
        <K.ErrorState text={errorRecetas} />
      ) : recomendaciones.length > 0 ? (
        recomendaciones.map((receta) => (
          <TarjetaReceta
            key={receta.id}
            imagen={imagenDe(receta)}
            titulo={receta.nombre}
            tiempo={receta.minutos}
            porciones={receta.porciones}
            cobertura={receta.cobertura}
            disponible={receta.disponible}
            precio={receta.precio}
            yaPlanificado={!!filaSeleccionada}
            ocupado={ocupado}
            onElegir={() => seleccionarReceta(receta)}
            onVerDetalle={() => router.push({
              pathname: "/planificar/[id]",
              params: {
                id: String(receta.id),
              fecha: diaSel,
              comida: comidaActiva,
              planId: filaSeleccionada && filaSeleccionada.id,
              yaPlanificado: !!filaSeleccionada,
              },
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
  const fuente = resolverImagen(imagenDe(r));

  return (
    <View style={styles.bloque}>
      <Pressable
        onPress={() => router.push({
          pathname: "/planificar/[id]",
          params: { id: String(r.id), fecha: fila.fecha, comida: fila.comida, planId: fila.id },
        })}
        accessibilityRole="button"
        accessibilityLabel={`${r.nombre}. Ver receta`}
        accessibilityState={{ disabled: false }}
        style={(state) => [styles.planDetalleTappable, state.pressed && styles.pressOn, focoVisible(state)]}
      >
        <View style={styles.fotoWrap}>
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
          <View style={styles.seleccionadoBadge}>
            <Icon name="checkmark-circle" size={typography.sizes.subtitle} color={colors.green} />
            <Text style={styles.seleccionadoText}>Seleccionado</Text>
          </View>
          <View style={styles.pillEstado}>
            <Icon name={listos > 0 ? "checkmark" : "alert-circle-outline"} size={12} color={listos > 0 ? colors.green : colors.amber} />
            <Text style={[styles.pillEstadoText, listos === 0 && { color: colors.amber }]}>
              {listos === 0 ? "Ningún insumo en casa" : listos === total ? "Todos los insumos disponibles" : `${listos} de ${total} insumos listos`}
            </Text>
          </View>
        </View>

        <Text style={styles.titulo}>{r.nombre}</Text>
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
      </Pressable>

      <Button
        label="Eliminar de planificación"
        iconName="trash-outline"
        iconColor={colors.red}
        iconPosition="right"
        variant="outline"
        rounded
        full
        disabled={ocupado}
        loading={ocupado}
        onPress={() => quitar(fila.id)}
        accessibilityLabel={`Eliminar ${r.nombre} de la planificación`}
      />
    </View>
  );
}

function TarjetaReceta({ imagen, titulo, tiempo, porciones, cobertura, disponible, precio, yaPlanificado, ocupado, onElegir, onVerDetalle }) {
  const fuente = resolverImagen(imagen);
  const todosListos = disponible || Number(cobertura) >= 100;
  const estado = todosListos
    ? "Tienes todos los ingredientes"
    : cobertura > 0
      ? `${cobertura}% de ingredientes disponibles`
      : "Te faltan ingredientes";

  return (
    <View style={styles.recetaTarjeta}>
      <Pressable
        onPress={onVerDetalle}
        accessibilityRole="button"
        accessibilityLabel={`${titulo}. Ver detalles de la receta`}
        accessibilityHint="Abre el detalle de esta receta"
        accessibilityState={{ disabled: false }}
        style={(state) => [state.pressed && styles.pressOn, focoVisible(state)]}
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
        </View>
      </Pressable>
      <View style={[styles.recetaCuerpo, styles.recetaAccionCuerpo]}>
        <Button
          label={yaPlanificado ? "Cambiar a este platillo" : "Planificar este platillo"}
          iconName={yaPlanificado ? "swap-horizontal" : "calendar-outline"}
          variant="outline"
          rounded
          full
          disabled={ocupado}
          loading={ocupado}
          onPress={onElegir}
          accessibilityLabel={`${yaPlanificado ? "Cambiar a" : "Planificar"} ${titulo}`}
          accessibilityHint={yaPlanificado ? "Reemplaza el plato seleccionado sin salir de esta pantalla" : "Agrega este plato al plan"}
        />
      </View>
    </View>
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
  recetaAccionCuerpo: { paddingTop: 0 },
  bloque: { gap: 6 },
  planDetalleTappable: { gap: spacing.xs },
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
  seleccionadoBadge: {
    position: "absolute",
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.greenBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  seleccionadoText: { fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold, color: colors.green },
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

});
