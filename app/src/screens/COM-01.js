import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Icon from "../components/Icon";
import * as K from "../components/kit";
import { colors, spacing, typography } from "../tokens";
import useApi from "../hooks/useApi";
import { anunciar, focoVisible } from "../lib/a11y";
import {
  getCompras,
  setCompraListo,
  generarListaCompras,
} from "../lib/api";

const NOMBRE = "Ingredientes faltantes";

// "500 g" + "gr" → "500 g" (evita duplicar la unidad cuando ya está en la cantidad).
// "2" + "kg" → "2 kg".
function valorDe(it) {
  const cant = it.cantidad != null ? String(it.cantidad).trim() : "";
  const unidad = it.unidad_medida ? String(it.unidad_medida).trim() : "";
  if (!cant) return unidad;
  if (!unidad) return cant;
  return /\s+[a-zA-Z]/.test(cant) ? cant : `${cant} ${unidad}`;
}

export default function COM_01() {
  const { data, loading, error, recargar } = useApi(getCompras);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState("");

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      const generar = async () => {
        try {
          await generarListaCompras();
          if (activo) recargar({ silencioso: true });
        } catch {
          // La generación en segundo plano no debe interrumpir la vista.
        }
      };
      generar();
      return () => {
        activo = false;
      };
    }, [recargar])
  );

  if (loading) {
    return (
      <Screen id="COM-01" name={NOMBRE}>
        <K.Loading text="Cargando tu lista…" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen id="COM-01" name={NOMBRE}>
        <K.ErrorState onRetry={recargar} />
      </Screen>
    );
  }

  const { items, prog } = data;

  const conError = (e) => setAviso((e && e.message) || "Algo salió mal. Revisa tu conexión con la API.");

  const toggle = async (it) => {
    if (ocupado) return;
    setOcupado(true);
    try {
      await setCompraListo(it.id, !it.listo);
      anunciar(it.listo ? `${it.nombre} sin marcar` : `${it.nombre} marcado como comprado`);
      setAviso("");
      recargar({ silencioso: true });
    } catch (e) {
      conError(e);
    } finally {
      setOcupado(false);
    }
  };

  return (
    <Screen id="COM-01" name={NOMBRE}>
      <Text style={styles.pageTitle} accessibilityRole="header">Ingredientes faltantes</Text>
      <K.Progress
        label="Ingredientes faltantes"
        right={`${prog.listos} de ${prog.total} ingredientes`}
        pct={prog.pct}
      />

      {items.length === 0 ? (
        <K.EmptyState
          title="No tienes ingredientes faltantes"
          sub="Planifica una receta para generar la lista."
        />
      ) : (
        <View style={styles.rows}>
          {items.map((it) => (
            <ItemRow
              key={it.id}
              it={it}
              valor={valorDe(it)}
              onToggle={() => toggle(it)}
              disabled={ocupado}
            />
          ))}
        </View>
      )}
      {aviso ? <K.Banner title={aviso} tone="RED" /> : null}
    </Screen>
  );
}

// Fila de ítem: checkbox explícito a la izquierda (toca para marcar/desmarcar)
// + ícono de basura a la derecha (toca para eliminar de la lista).
function ItemRow({ it, valor, onToggle, disabled }) {
  const done = !!it.listo;
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: done, disabled }}
      accessibilityLabel={`${it.nombre}, ${valor}`}
      accessibilityHint={done ? "Toca para desmarcar" : "Toca para marcar como comprado"}
      style={(state) => [
        styles.itemRow,
        state.pressed && styles.pressed,
        focoVisible(state),
      ]}
    >
      <View style={[styles.checkbox, done && styles.checkboxDone]}>
        {done ? <Icon name="checkmark" size={14} color={colors.white} /> : null}
      </View>
      <View style={styles.itemMain}>
        <Text style={[styles.itemName, done && styles.itemNameDone]}>
          {it.nombre}
        </Text>
        <Text style={[styles.itemValor, done && styles.itemValorDone]}>
          {valor}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pageTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  rows: { gap: 0 },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 56,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    backgroundColor: colors.white,
  },
  pressed: { opacity: 0.6 },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    borderColor: colors.borderStrong,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  itemMain: { flex: 1, gap: 2 },
  itemName: {
    fontSize: 15,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  itemNameDone: {
    color: colors.muted,
    textDecorationLine: "line-through",
  },
  itemValor: {
    fontSize: 13,
    color: colors.sub,
  },
  itemValorDone: {
    color: colors.muted,
    textDecorationLine: "line-through",
  },
});
