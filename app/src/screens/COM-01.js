import { useCallback, useRef, useState } from "react";
import { useFocusEffect } from "expo-router";
import { View, Text, Pressable, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Icon from "../components/Icon";
import Button from "../components/Button";
import * as K from "../components/kit";
import { colors, spacing, typography } from "../tokens";
import { anunciar, focoVisible } from "../lib/a11y";
import {
  getCompras,
  getDespensa,
  generarListaCompras,
  confirmarAltaManual,
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

function norm(texto) {
  return String(texto == null ? "" : texto)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

export default function COM_01() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [seleccionados, setSeleccionados] = useState(() => new Set());
  const [procesando, setProcesando] = useState(false);
  const procesandoRef = useRef(false);
  const solicitudRef = useRef(0);
  const [aviso, setAviso] = useState("");
  const [tipoAviso, setTipoAviso] = useState("RED");

  const recargar = useCallback(async ({ silencioso = false } = {}) => {
    const solicitud = ++solicitudRef.current;
    if (!silencioso) {
      setLoading(true);
      setError(null);
    }
    try {
      const [compras, despensa] = await Promise.all([getCompras(), getDespensa()]);
      const nombresEnCasa = new Set(despensa.items.map((it) => norm(it.nombre)).filter(Boolean));
      const items = compras.items.filter((it) => !nombresEnCasa.has(norm(it.nombre)));
      const listos = items.filter((it) => it.listo).length;
      const total = items.length;
      const resultado = { ...compras, items, prog: { listos, total, pct: total ? listos / total : 0 } };
      if (solicitud === solicitudRef.current) {
        setData(resultado);
        setSeleccionados(new Set());
        setError(null);
        setLoading(false);
      }
    } catch (e) {
      if (solicitud === solicitudRef.current) {
        setData(null);
        setError(e);
        setLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      const generar = async () => {
        try {
          await generarListaCompras();
          if (activo) await recargar({ silencioso: true });
        } catch {
          if (activo) await recargar({ silencioso: true });
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

  const { items, prog } = data || { items: [], prog: { listos: 0, total: 0, pct: 0 } };
  const conError = (e) => setAviso((e && e.message) || "Algo salió mal. Revisa tu conexión con la API.");

  const toggleSeleccion = (id) => {
    if (procesandoRef.current) return;
    setSeleccionados((actuales) => {
      const siguientes = new Set(actuales);
      if (siguientes.has(id)) siguientes.delete(id);
      else siguientes.add(id);
      return siguientes;
    });
    setAviso("");
  };

  const agregarSeleccionados = async () => {
    if (procesandoRef.current || seleccionados.size === 0) return;
    procesandoRef.current = true;
    setProcesando(true);
    const lote = items
      .filter((it) => seleccionados.has(it.id))
      .map((it) => ({
        nombre: it.nombre,
        cantidad: it.cantidad == null || it.cantidad === "" ? "1" : it.cantidad,
        unidad_medida: it.unidad_medida || it.unidad || "und",
      }));
    try {
      await confirmarAltaManual(lote);
      setSeleccionados(new Set());
      let errorGeneracion = null;
      try {
        await generarListaCompras();
      } catch (e) {
        errorGeneracion = e;
      }
      await recargar({ silencioso: true });
      if (errorGeneracion) throw errorGeneracion;
      setTipoAviso("GREEN");
      setAviso("Insumos agregados a tu despensa");
      anunciar("Insumos agregados a tu despensa");
    } catch (e) {
      setTipoAviso("RED");
      conError(e);
    } finally {
      procesandoRef.current = false;
      setProcesando(false);
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
              onToggle={() => toggleSeleccion(it.id)}
              disabled={procesando}
              selected={seleccionados.has(it.id)}
            />
          ))}
        </View>
      )}
      {seleccionados.size > 0 ? (
        <Button
          label={`Agregar (${seleccionados.size}) a mi despensa`}
          onPress={agregarSeleccionados}
          loading={procesando}
          disabled={procesando}
          full
        />
      ) : null}
      {aviso ? <K.Banner title={aviso} tone={tipoAviso} /> : null}
    </Screen>
  );
}

// Fila de ítem: el checkbox agrega el ingrediente a la despensa.
function ItemRow({ it, valor, onToggle, disabled, selected }) {
  return (
    <Pressable
      onPress={onToggle}
      disabled={disabled}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={`${it.nombre}, ${valor}`}
      accessibilityHint={selected ? "Seleccionado para agregar a tu despensa" : "Toca para seleccionar"}
      style={(state) => [
        styles.itemRow,
        selected && styles.itemRowSelected,
        state.pressed && styles.pressed,
        focoVisible(state),
      ]}
    >
      <View style={[styles.checkbox, selected && styles.checkboxDone]}>
        {selected ? <Icon name="checkmark" size={14} color={colors.white} /> : null}
      </View>
      <View style={styles.itemMain}>
        <Text style={styles.itemName}>
          {it.nombre}
        </Text>
        <Text style={styles.itemValor}>
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
  itemRowSelected: {
    backgroundColor: colors.greenBg,
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
  itemValor: {
    fontSize: 13,
    color: colors.sub,
  },
});
