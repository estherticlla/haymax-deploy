import { useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Button from "../components/Button";
import Icon from "../components/Icon";
import * as K from "../components/kit";
import { go } from "../lib/nav";
import { colors, radius, spacing, typography } from "../tokens";
import { getPlanesEntre } from "../lib/api";
import { cuadriculaMes, hoyIso, deIso, MESES_ES } from "../lib/fechas";

const NOMBRE = "Calendario de planificación";
const COMIDAS = ["desayuno", "almuerzo", "cena"];

function fechaAccesible(iso) {
  const fecha = new Intl.DateTimeFormat("es-PE", { weekday: "long", day: "numeric", month: "long" }).format(deIso(iso));
  return fecha.charAt(0).toUpperCase() + fecha.slice(1);
}

// Grilla de 6 semanas x 7 días (arranca en lunes) — ver lib/fechas.js.
function armarGrilla(anio, mes0) {
  const celdas = cuadriculaMes(anio, mes0);
  const filas = [];
  for (let i = 0; i < celdas.length; i += 7) filas.push(celdas.slice(i, i + 7));
  return { filas, desde: celdas[0].iso, hasta: celdas[celdas.length - 1].iso };
}

// Calendario mensual interactivo: marca los días completos y permite abrir
// el plan existente o planificar comidas en una fecha disponible.
export default function PLA_05() {
  const hoy = hoyIso();
  const dHoy = deIso(hoy);
  const [anio, setAnio] = useState(dHoy.getFullYear());
  const [mes0, setMes0] = useState(dHoy.getMonth());

  const vista = armarGrilla(anio, mes0);
  const [marcas, setMarcas] = useState({});
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);

  // Recarga del plan cada vez que cambia el mes/año visible (o al volver al
  // foco), para que las marcas "F" reflejen lo guardado en la API.
  useEffect(() => {
    let vivo = true;
    Promise.resolve()
      .then(() => {
        if (!vivo) return undefined;
        setCargando(true);
        setError(null);
        setMarcas({});
        return getPlanesEntre(vista.desde, vista.hasta);
      })
      .then((planes) => {
        if (!vivo) return;
        const porDia = {};
        (planes || []).forEach((p) => {
          porDia[p.fecha] = porDia[p.fecha] || new Set();
          porDia[p.fecha].add(p.comida);
        });
        const marcasNuevas = {};
        Object.keys(porDia).forEach((fecha) => {
          const comidas = porDia[fecha];
          const cuantas = COMIDAS.filter((c) => comidas.has(c)).length;
          marcasNuevas[fecha] = { cuantas, completo: cuantas >= COMIDAS.length };
        });
        setMarcas(marcasNuevas);
        setCargando(false);
      })
      .catch((e) => {
        if (!vivo) return;
        setError((e && e.message) || "No se pudo cargar el calendario.");
        setCargando(false);
      });
    return () => {
      vivo = false;
    };
  }, [vista.desde, vista.hasta]);

  const moverMes = (d) => {
    const t = new Date(anio, mes0 + d, 1);
    setAnio(t.getFullYear());
    setMes0(t.getMonth());
  };
  return (
    <Screen id="PLA-05" name={NOMBRE}>
      <Text style={styles.pageTitle} accessibilityRole="header">Mi planificación</Text>
      <View style={styles.cabecera}>
        <View style={styles.mesFila}>
          <Flecha icon="chevron-back" accessibilityLabel="Mes anterior" onPress={() => moverMes(-1)} />
          <Text style={styles.mesTitulo}>
            {MESES_ES[mes0].charAt(0).toUpperCase() + MESES_ES[mes0].slice(1)} {anio}
          </Text>
          <Flecha icon="chevron-forward" accessibilityLabel="Mes siguiente" onPress={() => moverMes(1)} />
        </View>
      </View>

      <View style={styles.semanaRow}>
        {["LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB", "DOM"].map((l) => (
          <Text key={l} style={styles.semanaDia}>
            {l}
          </Text>
        ))}
      </View>

      {error ? (
        <K.ErrorState text={error} onRetry={hoyBtn} />
      ) : (
        <View style={styles.grilla}>
          {vista.filas.map((fila, fi) => (
            <View key={`fila-${fi}`} style={styles.fila}>
              {fila.map((celda) => {
                const marca = marcas[celda.iso];
                const completo = !!(marca && marca.completo);
                const pasada = celda.iso < hoy;
                const deshabilitada = celda.fuera || pasada;
                const etiquetaDia = pasada
                  ? `${fechaAccesible(celda.iso)}, Fecha pasada`
                  : celda.fuera
                    ? `${fechaAccesible(celda.iso)}, fuera del mes`
                    : completo
                      ? `${fechaAccesible(celda.iso)}, Día completo, toca para ver el plan`
                      : `${fechaAccesible(celda.iso)}, Día disponible, toca para planificar`;
                return (
                  <Pressable
                    key={celda.iso}
                    onPress={deshabilitada ? undefined : () => go(completo ? "PLA-09" : "PLA-06", { fecha: celda.iso })}
                    disabled={deshabilitada}
                    accessibilityRole="button"
                    accessibilityLabel={etiquetaDia}
                    accessibilityState={{ disabled: deshabilitada }}
                    accessibilityElementsHidden={celda.fuera}
                    importantForAccessibility={celda.fuera ? "no-hide-descendants" : undefined}
                    style={[
                      styles.celda,
                      completo && !pasada && !celda.fuera && styles.celdaCompleta,
                      celda.iso === hoy && styles.celdaHoy,
                    ]}
                  >
                    {!celda.fuera ? (
                      <Text style={[styles.num, pasada && styles.numPasada, celda.iso === hoy && styles.numHoy]}>
                        {celda.dia}
                      </Text>
                    ) : null}
                    {celda.fuera ? null : completo ? (
                      <Icon name="✓" size={typography.sizes.subtitle} color={celda.iso === hoy ? colors.white : colors.green} />
                    ) : (
                      <View style={styles.puntos}>
                        {marca &&
                          Array.from({ length: marca.cuantas }).map((_, k) => (
                            <View key={k} style={styles.punto} />
                          ))}
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>
      )}

      {cargando ? <K.Loading text="Cargando tu plan…" /> : null}

      <View style={styles.pie}>
        <K.Note text="El check indica los días completos: desayuno, almuerzo y cena ya planificados." />
        <Button label="Ver mi plan de la semana" variant="primary" full onPress={() => go("PLA-09", { fecha: hoy })} />
      </View>
    </Screen>
  );
}

function Flecha({ icon, accessibilityLabel, onPress }) {
  return (
    <Pressable onPress={onPress} accessibilityRole="button" accessibilityLabel={accessibilityLabel} accessibilityState={{ disabled: false }} hitSlop={10} style={({ pressed }) => [styles.flecha, pressed && styles.flechaPresionada]}>
      <Icon name={icon} size={typography.sizes.label} color={colors.primary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  cabecera: {
    paddingTop: spacing.xs,
    marginBottom: spacing.md,
  },
  mesFila: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  mesTitulo: { flex: 1, textAlign: "center", fontSize: typography.sizes.title, fontWeight: typography.weights.semibold, color: colors.text },
  flecha: { width: spacing.xl, alignItems: "center", justifyContent: "center" },
  flechaPresionada: { opacity: 0.5 },
  semanaRow: { flexDirection: "row", marginBottom: spacing.xs },
  semanaDia: { flex: 1, textAlign: "center", fontSize: typography.sizes.caption, fontWeight: typography.weights.semibold, color: colors.muted },

  grilla: { gap: spacing.md },
  fila: { flexDirection: "row", gap: spacing.xs },
  celda: {
    flex: 1,
    aspectRatio: 0.9,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
  },
  celdaCompleta: { backgroundColor: colors.greenBg },
  celdaHoy: { backgroundColor: colors.primary },
  num: { fontSize: typography.sizes.label, fontWeight: typography.weights.semibold, color: colors.text },
  numFuera: { color: colors.muted },
  numPasada: { color: colors.muted },
  numHoy: { color: colors.white },
  puntos: { flexDirection: "row", gap: 2 },
  punto: { width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary },
  pie: { gap: spacing.md, marginTop: spacing.sm },
});
