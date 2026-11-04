import { useEffect, useRef, useState } from "react";
import { Text, View, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Button from "../components/Button";
import * as K from "../components/kit";
import { go } from "../lib/nav";
import { anunciar, MIN_TARGET } from "../lib/a11y";
import { colors, spacing, typography } from "../tokens";
import { buscarInsumos, confirmarAltaManual } from "../lib/api";

const UNIDADES = ["atado", "pieza", "taza", "kg", "g", "l", "ml", "lata", "paquete", "docena", "Otra"];

function nombreCatalogo(insumo) {
  return String(insumo?.nombre || insumo?.nombre_comun || "").trim();
}

function unidadLocal(unidadBase) {
  const valor = String(unidadBase || "").trim().toLowerCase();
  if (!valor) return "pieza";
  const equivalencias = {
    atados: "atado",
    unidad: "pieza",
    unidades: "pieza",
    unid: "pieza",
    und: "pieza",
    piezas: "pieza",
    kilogramo: "kg",
    kilogramos: "kg",
    gramos: "g",
    gr: "g",
    litro: "l",
    litros: "l",
    mililitro: "ml",
    mililitros: "ml",
    latas: "lata",
    paquetes: "paquete",
    docenas: "docena",
  };
  const equivalente = equivalencias[valor] || valor;
  return UNIDADES.includes(equivalente) && equivalente !== "Otra" ? equivalente : "Otra";
}

export default function DES_06() {
  const [producto, setProducto] = useState("");
  const [productoCatalogo, setProductoCatalogo] = useState(null);
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [errorBusqueda, setErrorBusqueda] = useState("");
  const [cantidad, setCantidad] = useState("");
  const [unidad, setUnidad] = useState("pieza");
  const [otraUnidad, setOtraUnidad] = useState("");
  const [precio, setPrecio] = useState("");
  const [unidadesAbiertas, setUnidadesAbiertas] = useState(false);
  const [carrito, setCarrito] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardar, setErrorGuardar] = useState("");
  const guardadoEnCurso = useRef(false);

  useEffect(() => {
    const query = producto.trim();
    if (query.length < 2 || (productoCatalogo && nombreCatalogo(productoCatalogo).toLowerCase() === query.toLowerCase())) {
      return undefined;
    }

    let vigente = true;
    const timer = setTimeout(async () => {
      setBuscando(true);
      setErrorBusqueda("");
      try {
        const resultados = await buscarInsumos(query);
        if (vigente) setSugerencias((resultados || []).filter((item) => nombreCatalogo(item)).slice(0, 6));
      } catch (e) {
        if (vigente) {
          setSugerencias([]);
          setErrorBusqueda((e && e.message) || "No se pudo buscar en el catálogo.");
        }
      } finally {
        if (vigente) setBuscando(false);
      }
    }, 300);

    return () => {
      vigente = false;
      clearTimeout(timer);
    };
  }, [producto, productoCatalogo]);

  const cambiarProducto = (valor) => {
    setProducto(valor);
    setProductoCatalogo(null);
    setSugerencias([]);
    setBuscando(valor.trim().length >= 2);
    setErrorBusqueda("");
    setUnidad("pieza");
    setOtraUnidad("");
    setUnidadesAbiertas(false);
  };

  const seleccionarProducto = (insumo) => {
    const nombre = nombreCatalogo(insumo);
    const unidadBase = String(insumo.unidad_medida_base || "").trim();
    setProducto(nombre);
    setProductoCatalogo(insumo);
    setSugerencias([]);
    setBuscando(false);
    setErrorBusqueda("");
    const local = unidadLocal(unidadBase);
    setUnidad(local);
    setOtraUnidad(local === "Otra" ? unidadBase : "");
    setUnidadesAbiertas(false);
    anunciar(`${nombre} seleccionado. Unidad: ${local === "Otra" ? unidadBase : local}`);
  };

  const seleccionarUnidad = (valor) => {
    setUnidad(valor);
    if (valor !== "Otra") setOtraUnidad("");
  };

  const unidadElegida = unidad === "Otra" ? otraUnidad.trim() : unidad;
  const listo = producto.trim().length > 0 && cantidad.trim().length > 0 && unidadElegida.length > 0;

  const agregarAlCarrito = () => {
    if (!listo) return;
    const nombreLimpio = producto.trim();
    const cantidadConUnidad = `${cantidad.trim()} ${unidadElegida}`;
    setCarrito((actual) => [
      ...actual,
      { id: `${Date.now()}-${actual.length}`, nombre: nombreLimpio, cantidad: cantidadConUnidad },
    ]);
    anunciar(`${nombreLimpio}, ${cantidadConUnidad}, agregado a insumos por agregar`);
    setProducto("");
    setProductoCatalogo(null);
    setSugerencias([]);
    setCantidad("");
    setUnidad("pieza");
    setOtraUnidad("");
    setPrecio("");
    setUnidadesAbiertas(false);
    setErrorBusqueda("");
  };

  const quitarDelCarrito = (id) => {
    setCarrito((actual) => actual.filter((item) => item.id !== id));
  };

  const guardarCarrito = async () => {
    if (carrito.length === 0 || guardadoEnCurso.current) return;
    guardadoEnCurso.current = true;
    setGuardando(true);
    setErrorGuardar("");
    try {
      const items = carrito.map(({ nombre, cantidad }) => ({ nombre, cantidad }));
      await confirmarAltaManual(items);
      go("DES-08");
    } catch (e) {
      const mensaje = (e && e.message) || "No se pudieron guardar los insumos. Inténtalo nuevamente.";
      setErrorGuardar(mensaje);
      anunciar(mensaje);
    } finally {
      guardadoEnCurso.current = false;
      setGuardando(false);
    }
  };

  return (
    <Screen id="DES-06" name="Registro manual de insumos">
      <K.SectionTitle title="Agregar insumos manualmente" />
      <View style={styles.rows}>
        <K.InputField
          label="Producto"
          placeholder="Busca el producto en el catálogo…"
          value={producto}
          onChangeText={cambiarProducto}
          accessibilityLabel="Producto"
          autoCapitalize="sentences"
          autoCorrect={false}
        />

        {buscando ? <K.Loading text="Buscando productos…" /> : null}
        {sugerencias.length > 0 ? (
          <View style={styles.sugerencias}>
            <Text style={styles.subtitulo} accessibilityRole="header">Sugerencias del catálogo</Text>
            {sugerencias.map((insumo, index) => {
              const nombre = nombreCatalogo(insumo);
              const base = insumo.unidad_medida_base ? `Unidad base: ${insumo.unidad_medida_base}` : "Seleccionar producto";
              return (
                <K.Row
                  key={insumo.id ?? `${nombre}-${index}`}
                  label={nombre}
                  value={base}
                  icon="search"
                  onPress={() => seleccionarProducto(insumo)}
                />
              );
            })}
          </View>
        ) : null}
        {errorBusqueda ? <K.Note text={errorBusqueda} alerta /> : null}
        {producto.trim().length >= 2 && !buscando && !errorBusqueda && sugerencias.length === 0 && !productoCatalogo ? (
          <Text style={styles.estadoBusqueda} accessibilityLiveRegion="polite">
            No encontramos coincidencias en el catálogo. Puedes registrar el producto escrito.
          </Text>
        ) : null}

        <View style={styles.cantidadUnidad}>
          <View style={styles.cantidadInput}>
            <K.InputField
              label="Cantidad"
              placeholder="Ej. 2"
              value={cantidad}
              onChangeText={setCantidad}
              keyboardType="numeric"
              accessibilityLabel="Cantidad"
            />
          </View>
          <View style={styles.unidadResumen}>
            <Text style={styles.unidadTexto}>Unidad: {unidadElegida || unidad}</Text>
            <Button
              label={unidadesAbiertas ? "Listo" : "Cambiar"}
              variant="ghost"
              compact
              accessibilityLabel={unidadesAbiertas ? "Listo, cerrar unidades" : "Cambiar unidad"}
              onPress={() => setUnidadesAbiertas((abierta) => !abierta)}
            />
          </View>
        </View>

        {unidadesAbiertas ? (
          <View>
            <Text style={styles.subtitulo} accessibilityRole="header">Elegir unidad</Text>
            <K.Chips
              items={UNIDADES}
              active={unidad}
              onPressItem={seleccionarUnidad}
              accessibilityRole="radio"
              groupRole="radiogroup"
              groupLabel="Unidad"
              minTarget
              hintItem="Selecciona una unidad para la cantidad"
            />
          </View>
        ) : null}

        {unidad === "Otra" ? (
          <K.InputField
            label="Especifica otra unidad"
            placeholder="Ej. bolsa"
            value={otraUnidad}
            onChangeText={setOtraUnidad}
            accessibilityLabel="Especifica otra unidad"
          />
        ) : null}

        <K.InputField
          label="Precio estimado (opcional)"
          placeholder="S/ 0.00"
          value={precio}
          onChangeText={setPrecio}
          keyboardType="numeric"
          accessibilityLabel="Precio estimado, opcional"
        />
      </View>
      <Button label="Agregar a la lista" full onPress={agregarAlCarrito} disabled={!listo} />

      {carrito.length > 0 ? (
        <View style={styles.carrito}>
          <K.SectionTitle title="Insumos a agregar" />
          {carrito.map((item) => (
            <View key={item.id} style={styles.itemCarrito}>
              <View style={styles.itemTexto}>
                <Text style={styles.itemNombre}>{item.nombre}</Text>
                <Text style={styles.itemCantidad}>{item.cantidad}</Text>
              </View>
              <Button
                label="Quitar"
                variant="ghost"
                compact
                accessibilityLabel={`Quitar ${item.nombre}`}
                onPress={() => quitarDelCarrito(item.id)}
              />
            </View>
          ))}
        </View>
      ) : null}

      {errorGuardar ? <K.Note text={errorGuardar} alerta /> : null}
      <Button
        label={`Guardar (${carrito.length}) insumos`}
        full
        loading={guardando}
        disabled={carrito.length === 0 || guardando}
        onPress={guardarCarrito}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rows: { gap: spacing.sm },
  sugerencias: { gap: spacing.xs },
  cantidadUnidad: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  cantidadInput: { flex: 1 },
  unidadResumen: { alignItems: "center", gap: spacing.xs },
  unidadTexto: { fontSize: typography.sizes.small, fontWeight: typography.weights.semibold, color: colors.text },
  carrito: { gap: spacing.xs },
  itemCarrito: { flexDirection: "row", alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xs },
  itemTexto: { flex: 1, gap: spacing.xs },
  itemNombre: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text },
  itemCantidad: { fontSize: typography.sizes.small, color: colors.sub },
  subtitulo: { fontSize: typography.sizes.body, fontWeight: typography.weights.semibold, color: colors.text, marginBottom: spacing.xs },
  estadoBusqueda: { fontSize: typography.sizes.small, color: colors.sub, minHeight: MIN_TARGET },
});
