import { useState } from "react";
import { Alert, View, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Button from "../components/Button";
import * as K from "../components/kit";
import { go, replaceTo } from "../lib/nav";
import { colors } from "../tokens";
import { anunciar } from "../lib/a11y";
import useApi from "../hooks/useApi";
import {
  getRecetaDetalle,
  getPlanSemanaDe,
  agregarFavorito,
  quitarFavorito,
  actualizarPlan,
  enviarFaltantesALista,
  getPlanesEntre,
  planificarPlato,
} from "../lib/api";
import { hoyIso, lunesDeIso } from "../lib/fechas";
import { norm, precioPorPorcion, ahorroPorPorcion, soles, dificultadTexto } from "../lib/domain";

const NOMBRE = "Detalle de receta";

export default function REC_02({ receta, fecha, comida, planId }) {
  const { data, loading, error, recargar } = useApi(async () => {
    const lunesActual = lunesDeIso(hoyIso());
    const [detalle, semana] = await Promise.all([getRecetaDetalle(receta), getPlanSemanaDe(lunesActual)]);
    return { ...detalle, planActual: semana.plan || [] };
  });
  const [favLocal, setFavLocal] = useState(null);
  const [errorFavorito, setErrorFavorito] = useState("");
  const [guardandoPlan, setGuardandoPlan] = useState(false);
  const [errorPlan, setErrorPlan] = useState("");
  const [planificadoLocal, setPlanificadoLocal] = useState(false);

  if (loading) {
    return (
      <Screen id="REC-02" name={NOMBRE}>
        <K.Loading text="Cargando receta…" />
      </Screen>
    );
  }
  if (error) {
    return (
      <Screen id="REC-02" name={NOMBRE}>
        <K.ErrorState onRetry={recargar} />
      </Screen>
    );
  }

  const r = data.receta;
  const estaPlanificado = planificadoLocal || data.planActual.some((plan) => String(plan.recetaId) === String(r.id));
  const favorito = favLocal == null ? !!r.esFavorito : favLocal;
  const faltantes = (data.disponibilidad && data.disponibilidad.faltantes) || [];
  const faltaIngrediente = (nombre) => faltantes.some((f) => norm(f).includes(norm(nombre)));
  const ahorro = ahorroPorPorcion(r);
  const pasos = Array.isArray(r.pasos) ? r.pasos : [];

  const ingredientes =
    r.ingredientes_detalle && r.ingredientes_detalle.length
      ? r.ingredientes_detalle.map((i) => ({
          key: String(i.id),
          nombre: i.nombre,
          label: [i.cantidad, i.unidad_medida, i.nombre].filter((x) => x != null && x !== "").join(" "),
          opcional: !!i.opcional,
        }))
      : (r.ingredientes || []).map((s, idx) => ({
          key: s + idx,
          nombre: s.replace(/^[0-9.,]+\s*\S*\s*(de\s+)?/i, ""),
          label: s,
          opcional: false,
        }));

  const alternarFavorito = async () => {
    const nuevo = !favorito;
    setErrorFavorito("");
    setFavLocal(nuevo);
    try {
      if (nuevo) await agregarFavorito(r.id);
      else await quitarFavorito(r.id);
    } catch (_e) {
      setFavLocal(!nuevo);
      const mensaje = "No pudimos actualizar tus favoritos. Inténtalo de nuevo.";
      setErrorFavorito(mensaje);
      anunciar(mensaje);
    }
  };

  const planificarYAgregarFaltantes = async () => {
    if (guardandoPlan) return;
    const fechaPlan = fecha || hoyIso();
    const comidaPlan = comida || "almuerzo";
    let planGuardado = false;
    setGuardandoPlan(true);
    setErrorPlan("");

    try {
      let idPlan = planId;
      if (!idPlan) {
        const planesDelDia = await getPlanesEntre(fechaPlan, fechaPlan);
        const planExistente = (planesDelDia || []).find((plan) => plan.comida === comidaPlan);
        idPlan = planExistente && planExistente.id;
      }

      if (idPlan) {
        await actualizarPlan(idPlan, {
          recetaId: r.id,
          fecha: fechaPlan,
          comida: comidaPlan,
          porciones: r.porciones,
        });
      } else {
        await planificarPlato({
          recetaId: r.id,
          fecha: fechaPlan,
          comida: comidaPlan,
          porciones: r.porciones,
        });
      }

      planGuardado = true;
      await enviarFaltantesALista(faltantes);
      setPlanificadoLocal(true);
      recargar();

      const mensaje = faltantes.length
        ? "Plato planificado. Se agregaron los faltantes a tu lista de compras."
        : "Plato planificado. No tienes faltantes por agregar a tu lista de compras.";
      anunciar(mensaje);
      Alert.alert("Planificación lista", mensaje);
      replaceTo("PLA-09", { fecha: fechaPlan, comida: comidaPlan });
    } catch (e) {
      const mensaje = planGuardado
        ? "El plato se planificó, pero no se pudieron agregar los faltantes a tu lista de compras. Inténtalo nuevamente."
        : (e && e.message) || "No se pudo planificar el plato y actualizar tu lista de compras.";
      setErrorPlan(mensaje);
      anunciar(mensaje);
    } finally {
      setGuardandoPlan(false);
    }
  };

  return (
    <Screen id="REC-02" name={NOMBRE}>
      <View style={styles.heroWrap}>
        <K.Hero
          imagen={r.imagen}
          title={r.nombre}
          price={`${soles(precioPorPorcion(r))} /poc.`}
          time={`${r.minutos} min`}
        />
        <K.Heart activo={favorito} onPress={alternarFavorito} style={styles.heart} />
      </View>

      {errorFavorito ? <K.TextLine text={errorFavorito} /> : null}
      <K.SectionTitle title="Datos" />
      <View style={styles.rows}>
        <K.Row label="Porciones" value={String(r.porciones)} icon="👥" />
        <K.Row label="Tiempo total" value={`${r.minutos} min`} icon="⏱" />
        <K.Row label="Dificultad" value={dificultadTexto(r.dificultad)} icon="★" />
      </View>

      <K.Card
        title="Cálculo Hogar & Ahorro"
        sub={`En casa ${soles(ahorro.enCasa)} por porción · delivery ${soles(ahorro.delivery)}`}
        right={`−${ahorro.pct}%`}
      />

      <K.SectionTitle title="Ingredientes" />
      <View style={styles.rows}>
        {ingredientes.map((ing) => {
          const ok = ing.opcional || !faltaIngrediente(ing.nombre);
          return (
            <K.Row
              key={ing.key}
              label={ing.label}
              value={ing.opcional ? "Opcional" : ok ? "En stock" : "Falta"}
              valueColor={ing.opcional ? colors.muted : ok ? undefined : colors.amber}
              icon={ing.opcional ? "☆" : ok ? "✓" : "!"}
            />
          );
        })}
      </View>

      <K.SectionTitle title="Preparación" />
      {pasos.length > 0 ? (
        pasos.map((paso, indice) => <K.TextLine key={`${indice}-${paso}`} text={`${indice + 1}. ${paso}`} />)
      ) : (
        <K.TextLine text="Esta receta no tiene pasos de preparación disponibles." />
      )}

      <K.Card
        title="Balance nutricional"
        sub={`${r.calorias > 0 ? `${r.calorias} kcal por porción` : "Información nutricional no disponible"} · rinde ${r.porciones} porciones · ${faltantes.length === 0 ? "todo disponible" : `faltan ${faltantes.length} insumos`}`}
      />

      {errorPlan ? <K.Banner title={errorPlan} tone="RED" /> : null}
      {!estaPlanificado ? (
        <Button
          label="Planificar este plato"
          full
          disabled={guardandoPlan}
          loading={guardandoPlan}
          onPress={planificarYAgregarFaltantes}
        />
      ) : null}
      <Button label="Cocinar ahora" variant="outline" full onPress={() => go("PRE-01", { receta: r.id })} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rows: { gap: 0 },
  heroWrap: { position: "relative" },
  heart: { position: "absolute", top: 12, right: 12 },
});
