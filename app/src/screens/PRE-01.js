import { useState } from "react";
import { View, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Button from "../components/Button";
import * as K from "../components/kit";
import { go, replaceTo } from "../lib/nav";
import { spacing } from "../tokens";
import useApi from "../hooks/useApi";
import { getPreparar, getDespensa, descontarAlCocinar, actualizarPlan } from "../lib/api";
import { escalarIngredientes, familiaUnidad, coincideNombre } from "../lib/domain";
import { anunciar } from "../lib/a11y";

const NOMBRE = "Preparar: descontar insumos";

// Gramos/ml se ajustan de 50 en 50, kg/l de 0,25 y los demás insumos de uno en uno.
function paso(unit) {
  const familia = familiaUnidad(unit);
  if (familia === "peso" || familia === "volumen") {
    return ["kg", "kilo", "kilos", "l", "lt", "litro", "litros"].includes(String(unit).toLowerCase()) ? 0.25 : 50;
  }
  return 1;
}

export default function PRE_01({ receta }) {
  const { data, loading, error, recargar } = useApi(async () => {
    const [preparar, despensa] = await Promise.all([getPreparar(receta), getDespensa()]);
    return { ...preparar, pantry: despensa.items || [] };
  });
  const [porciones, setPorciones] = useState(null);
  const [filas, setFilas] = useState(null);
  const [guardo, setGuardo] = useState(false);
  const [descontado, setDescontado] = useState(false);
  const [repetido, setRepetido] = useState(false);
  const [reporte, setReporte] = useState(null);
  const [aviso, setAviso] = useState("");

  if (loading) {
    return (
      <Screen id="PRE-01" name={NOMBRE}>
        <K.Loading text="Preparando…" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen id="PRE-01" name={NOMBRE}>
        <K.ErrorState onRetry={recargar} />
      </Screen>
    );
  }

  const r = data.receta;
  const plan = data.plan;
  const yaPreparado = !!(plan && plan.completado);
  const porc = porciones == null ? (plan ? plan.porciones : r.porciones) : porciones;
  const descuentosBase = escalarIngredientes(r, porc);
  const descuentosDisponibles = descuentosBase.filter((ingrediente) =>
    data.pantry.some(
      (insumo) =>
        Number(insumo.cantidad) > 0 &&
        familiaUnidad(insumo.unidad) === familiaUnidad(ingrediente.unit) &&
        coincideNombre(insumo.nombre, ingrediente.label)
    )
  );
  const filasActuales = filas || descuentosDisponibles;
  const tieneAdvertencias = !!(
    reporte && ((reporte.noEncontrados && reporte.noEncontrados.length) || (reporte.insuficientes && reporte.insuficientes.length))
  );

  const cambiarPorciones = (delta) => {
    setPorciones(Math.max(1, Math.min(12, porc + delta)));
    setFilas(null);
  };

  const cambiarCantidad = (id, delta) => {
    setFilas(
      filasActuales.map((fila) =>
        fila.id === id
          ? { ...fila, qty: Math.max(0, Math.round((fila.qty + delta * paso(fila.unit)) * 1000) / 1000) }
          : fila
      )
    );
  };

  const confirmar = async () => {
    if (guardo || (descontado && !aviso)) return;
    if (yaPreparado && !descontado && !repetido) {
      setRepetido(true);
      anunciar("Este plato ya se marcó como preparado. Toca de nuevo para descontar otra vez.");
      return;
    }

    setGuardo(true);
    setAviso("");
    let hecho = descontado;
    let resultado = reporte;

    try {
      if (!hecho) {
        resultado = await descontarAlCocinar(filasActuales);
        hecho = true;
        setDescontado(true);
        setReporte(resultado);
      }
      if (plan && plan.id != null) await actualizarPlan(plan.id, { completado: true });

      if (resultado && ((resultado.noEncontrados && resultado.noEncontrados.length) || (resultado.insuficientes && resultado.insuficientes.length))) {
        anunciar("Revisa las advertencias de descuento antes de volver a tu plan.");
        setGuardo(false);
        return;
      }
      replaceTo("INI-01");
    } catch (_e) {
      const mensaje = hecho
        ? "Se descontaron los ingredientes, pero no se pudo marcar el plato como preparado. Inténtalo de nuevo; no se descontarán dos veces."
        : "No pudimos actualizar tu despensa. Inténtalo de nuevo.";
      setAviso(mensaje);
      anunciar(mensaje);
      setGuardo(false);
    }
  };

  const etiquetaBoton = guardo
    ? "Guardando…"
    : descontado && aviso
      ? "Reintentar marcar como preparado"
      : descontado
        ? "Insumos descontados"
        : repetido
          ? "Toca de nuevo para descontar otra vez"
          : "Confirmar y descontar de despensa";

  return (
    <Screen id="PRE-01" name={NOMBRE}>
      <K.SectionTitle title={plan ? String(plan.comida || "Cocinar ahora").toUpperCase() : "Cocinar ahora"} />
      <K.Card thumb={r.imagen} title={r.nombre} sub={`${porc} porciones planificadas`} />
      {yaPreparado && !descontado ? (
        <K.Banner
          title="Este plato ya se marcó como preparado"
          sub="Si lo confirmas otra vez, se descontarán los insumos de nuevo."
          tone="PRIMARY"
        />
      ) : null}
      <View style={styles.rows}>
        <K.EditStepper label="Porciones preparadas" qty={porc} onChange={descontado ? undefined : cambiarPorciones} />
      </View>

      {tieneAdvertencias ? (
        <>
          {reporte.noEncontrados && reporte.noEncontrados.length > 0 ? (
            <K.Note alerta text={`No se encontró en tu despensa, así que no se descontó: ${reporte.noEncontrados.join(", ")}.`} />
          ) : null}
          {reporte.insuficientes && reporte.insuficientes.length > 0 ? (
            <K.Note
              alerta
              text={`Stock insuficiente, quedó en 0: ${reporte.insuficientes
                .map((insumo) => `${insumo.label} (faltaban ${insumo.faltante} ${insumo.unit})`)
                .join(", ")}.`}
            />
          ) : null}
        </>
      ) : null}

      <K.SectionTitle title="Insumos a descontar" />
      {filasActuales.length === 0 ? (
        <K.TextLine
          text={
            descuentosBase.length
              ? "No tienes insumos de esta receta disponibles para descontar."
              : "Esta receta no registró insumos a descontar."
          }
        />
      ) : (
        <View style={styles.rows}>
          {filasActuales.map((fila) => (
            <K.EditStepper
              key={fila.id}
              label={fila.label}
              qty={`${fila.qty} ${fila.unit}`}
              onChange={descontado ? undefined : (delta) => cambiarCantidad(fila.id, delta)}
            />
          ))}
        </View>
      )}
      {!descontado ? <K.Note text="Ajusta cada insumo con − / + antes de confirmar el descuento." /> : null}

      <Button
        label={etiquetaBoton}
        full
        loading={guardo}
        disabled={descontado && !aviso}
        onPress={confirmar}
      />
      <K.LinkText
        label={descontado || tieneAdvertencias ? "Volver a mi plan" : "Omitir por ahora"}
        align="CENTER"
        onPress={() => go("PLA-09")}
      />
      {aviso ? <K.Banner title={aviso} tone="RED" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({ rows: { gap: spacing.sm } });
