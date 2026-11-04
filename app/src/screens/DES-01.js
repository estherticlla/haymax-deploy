import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Button from "../components/Button";
import Icon from "../components/Icon";
import * as K from "../components/kit";
import { go } from "../lib/nav";
import { colors, spacing, typography } from "../tokens";
import useApi from "../hooks/useApi";
import { getDespensa } from "../lib/api";
import { focoVisible } from "../lib/a11y";
import { leerPreferencias, resumenVencimientos, diasRestantesVencimiento } from "../lib/preferencias";
import { textoVencimiento } from "../lib/fechas";

const NOMBRE = "Mi despensa";
const CATS = ["Todos", "Verduras", "Lácteos", "Secos", "Carnes"];
const CAT_ICON = {
  Verduras: "leaf-outline",
  Lácteos: "water-outline",
  Secos: "cube-outline",
  Carnes: "restaurant-outline",
};

const ESTADO = {
  ok: { label: null },
  "por-vencer": { label: "Por vencer", color: colors.amber, bg: colors.amberBg },
  vencido: { label: "Vencido", color: colors.red, bg: colors.redBg },
};

function cantidadTexto(p) {
  const cant = p.cantidad != null ? String(p.cantidad).trim() : "";
  const unidad = p.unidad ? String(p.unidad).trim() : "";
  if (!cant) return unidad;
  if (!unidad) return cant;
  return /\s+[a-zA-Z]/.test(cant) ? cant : `${cant} ${unidad}`;
}

export default function DES_01() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Todos");
  const { data, loading, error, recargar } = useApi(async () => {
    const [despensa, preferencias] = await Promise.all([getDespensa(), leerPreferencias()]);
    const vencimientos = resumenVencimientos(despensa.items, preferencias.diasAvisoVencimiento);
    return {
      ...despensa,
      alertas: vencimientos.total,
      diasAviso: Number(preferencias.diasAvisoVencimiento) === 1 ? 1 : 2,
      stats: { ...despensa.stats, porVencer: vencimientos.porVencer, vencidos: vencimientos.vencidos },
    };
  });

  if (loading) {
    return (
      <Screen id="DES-01" name={NOMBRE}>
        <K.Loading text="Cargando tu despensa…" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen id="DES-01" name={NOMBRE}>
        <K.ErrorState onRetry={recargar} />
      </Screen>
    );
  }

const { items } = data;
  const lista = items.filter((p) => {
    const okCat = cat === "Todos" || p.categoria === cat;
    const okQ = p.nombre.toLowerCase().includes(q.trim().toLowerCase());
    return okCat && okQ;
  });

  const alertas = data.alertas;
  const plazoAviso = data.diasAviso === 1 ? "dentro del próximo día" : `dentro de los próximos ${data.diasAviso} días`;
  const textoAlertas = alertas === 1
    ? `1 insumo requiere atención: vence ${plazoAviso} o ya venció. Toca para revisar.`
    : `${alertas} insumos requieren atención: vencen ${plazoAviso} o ya vencieron. Toca para revisar.`;

  return (
    <Screen id="DES-01" name={NOMBRE}>
      <Text style={styles.pageTitle} accessibilityRole="header">Mi despensa</Text>
    <K.InputField
        label="Buscar insumo"
        placeholder="Ej. pollo, tomate…"
        value={q}
        onChangeText={setQ}
      />
      <K.Chips
        items={CATS}
        active={cat}
        onPressItem={setCat}
        hintItem="Filtra por categoría"
      />
      <Button label="Agregar insumos" full onPress={() => go("DES-03")} />

      <Text style={styles.hint}>
        {lista.length} insumo{lista.length === 1 ? "" : "s"} · Toca uno para editar
      </Text>
      {lista.length === 0 ? (
        <K.EmptyState
          title="Sin resultados"
          sub="Prueba otra categoría o limpia la búsqueda."
        />
      ) : (
        lista.map((p) => (
          <InsumoRow
            key={p.id}
            insumo={p}
            diasAviso={data.diasAviso}
            onPress={() => go("DES-02", { insumo: p.id })}
          />
        ))
      )}

      <K.Note
        text={
          alertas > 0 ? textoAlertas : `Ningún insumo vence en los próximos ${data.diasAviso} ${data.diasAviso === 1 ? "día" : "días"}.`
        }
        onPress={alertas > 0 ? () => go("PRE-03") : undefined}
        alerta={alertas > 0}
      />
      <K.LinkText
        label="Lo que falta está en tu lista de compras →"
        align="CENTER"
        onPress={() => go("COM-01")}
      />
    </Screen>
  );
}

function InsumoRow({ insumo, diasAviso, onPress }) {
  const dias = diasRestantesVencimiento(insumo);
  const vencimiento = dias == null ? null : textoVencimiento(dias);
  const est = dias == null
    ? insumo.estado === "vencido" ? ESTADO.vencido : ESTADO.ok
    : dias < 0 ? ESTADO.vencido : dias <= diasAviso ? ESTADO["por-vencer"] : ESTADO.ok;
  const valor = cantidadTexto(insumo);
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${insumo.nombre}, ${valor}${est.label ? `, ${est.label}` : ""}`}
      accessibilityState={{ disabled: false }}
      accessibilityHint="Abre los detalles para editar"
      style={(state) => [
        styles.row,
        state.pressed && styles.pressed,
        focoVisible(state),
      ]}
    >
      <View style={styles.iconBox}>
        <Icon
          name={CAT_ICON[insumo.categoria] || "cube-outline"}
          size={18}
          color={colors.primary}
        />
      </View>
      <View style={styles.main}>
        <Text style={styles.name}>
          {insumo.nombre}
        </Text>
        <Text style={styles.valor}>{valor}</Text>
        {vencimiento ? <Text style={styles.vencimiento}>{vencimiento}</Text> : null}
      </View>
      {est.label ? (
        <View style={[styles.badge, { backgroundColor: est.bg }]}>
          <Text style={[styles.badgeText, { color: est.color }]}>{est.label}</Text>
        </View>
      ) : null}
      <Icon name="chevron-forward" size={20} color={colors.muted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  hint: {
    fontSize: typography.sizes.small,
    color: colors.muted,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 60,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pressed: { opacity: 0.6 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  main: { flex: 1, gap: 2 },
  name: {
    fontSize: 15,
    fontWeight: typography.weights.semibold,
    color: colors.text,
  },
  valor: {
    fontSize: 13,
    color: colors.sub,
  },
  vencimiento: {
    fontSize: typography.sizes.caption,
    color: colors.sub,
  },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginRight: 4,
  },
  badgeText: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
  },
});
