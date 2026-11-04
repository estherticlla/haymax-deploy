import { useRef, useState } from "react";
import { View, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Button from "../components/Button";
import * as K from "../components/kit";
import { go } from "../lib/nav";
import useApi from "../hooks/useApi";
import { getReceta, planificarPlato, actualizarPlan, getPlanesEntre, enviarFaltantesALista } from "../lib/api";
import { soles, ingredienteAlcanza } from "../lib/domain";
import { fechaLarga } from "../lib/fechas";

const NOMBRE = "Planificar: ajustar porciones";
const MAX_PORCIONES = 12;

// Ajuste de porciones: el botón "Confirmar porciones" se recalcula en tiempo
// real según si los ingredientes de la despensa alcanzan para las porciones
// elegidas (mínimo por ingrediente escalado desde la receta base).
export default function PLA_07({ receta: recetaId, fecha, comida = "almuerzo", planId }) {
  const { data, loading, error, recargar } = useApi(() => getReceta(recetaId));
  const [porciones, setPorciones] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [fallo, setFallo] = useState("");
  const solicitudEnCurso = useRef(false);

  if (loading) {
    return (
      <Screen id="PLA-07" name={NOMBRE}>
        <K.Loading text="Revisando tu despensa…" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen id="PLA-07" name={NOMBRE}>
        <K.ErrorState onRetry={recargar} />
      </Screen>
    );
  }

  const r = data.receta;
  const pantry = data.pantry;
  const porc = porciones == null ? r.porciones : porciones;
  const veredicto = ingredienteAlcanza(r, pantry, porc);

  const confirmar = async (agregarFaltantes = false) => {
    if (solicitudEnCurso.current) return;
    solicitudEnCurso.current = true;
    setGuardando(true);
    setFallo("");
    let faltantesEnviados = false;
    try {
      if (agregarFaltantes) {
        await enviarFaltantesALista(veredicto.faltantes);
        faltantesEnviados = true;
      }
      if (planId) {
        // Edición de un plato existente: PUT parcial (requisito 3.c: guarda
        // el día, la comida y la cantidad de porciones).
        await actualizarPlan(planId, { recetaId: r.id, fecha, comida, porciones: porc });
        go("PLA-08", { fecha, comida, nombre: r.nombre, porciones: String(porc), editado: true });
        return;
      }
      // Alta nueva: si la comida del día ya tiene otro plato, resolvemos el
      // conflicto en PLA-04; si no, se guarda directamente.
      const delDia = await getPlanesEntre(fecha, fecha);
      const conflicto = (delDia || []).find((p) => p.comida === comida && p.receta_id !== r.id);
      if (conflicto) {
        go("PLA-04", { receta: r.id, porciones: String(porc), fecha, plan: conflicto.id, comida });
        return;
      }
      await planificarPlato({ recetaId: r.id, fecha, comida, porciones: porc });
      go("PLA-08", { fecha, comida, nombre: r.nombre, porciones: String(porc) });
    } catch (e) {
      const mensaje = e && e.message;
      setFallo(
        mensaje ||
          (agregarFaltantes && !faltantesEnviados
            ? "No se pudieron agregar los ingredientes a la lista. No se guardó el plan."
            : "No se pudo guardar el plan. Revisa tu conexión con la API."),
      );
    } finally {
      solicitudEnCurso.current = false;
      setGuardando(false);
    }
  };

  return (
    <Screen id="PLA-07" name={NOMBRE}>
      <K.SectionTitle title={fechaLarga(fecha)} />
      <K.Chips items={[comida.charAt(0).toUpperCase() + comida.slice(1)]} ok />

      <K.Card
        thumb={r.imagen}
        title={r.nombre}
        sub={`${r.minutos} min · ${soles(r.precio)} total · base ${r.porciones} porc.`}
        right="Cambiar"
        onPress={() => go("PLA-06", { fecha, comida, planId })}
      />

      <K.SectionTitle title="¿Para cuántas personas?" />
      <View style={styles.rows}>
        <K.EditStepper
          label="Porciones"
          qty={porc}
          onChange={(d) => setPorciones(Math.max(1, Math.min(MAX_PORCIONES, porc + d)))}
        />
      </View>
      {!veredicto.alcanza && (
        <View style={styles.alerta}>
          <K.Banner
            title="Faltan estos ingredientes"
            sub={veredicto.faltantes.join(", ")}
            tone="RED"
          />
        </View>
      )}

      <Button
        label={veredicto.alcanza ? "Confirmar porciones" : "Agregar faltantes a la lista y planificar"}
        variant="primary"
        disabled={guardando}
        loading={guardando}
        full
        onPress={() => confirmar(!veredicto.alcanza)}
      />
      {!veredicto.alcanza ? (
        <Button
          label="Elegir otro platillo"
          variant="outline"
          disabled={guardando}
          full
          onPress={() => go("PLA-06", { fecha, comida, planId })}
        />
      ) : null}
      {fallo ? <K.Banner title={fallo} tone="RED" /> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 8 },
  alerta: { gap: 4 },
});
