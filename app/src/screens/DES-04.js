import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Platform } from "react-native";
import * as ImagePicker from "expo-image-picker";
import Screen from "../components/Screen";
import Button from "../components/Button";
import * as K from "../components/kit";
import { go } from "../lib/nav";
import { analizarImagenDespensa } from "../lib/api";

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function mimeTypeDe(asset) {
  const mime = String(asset.mimeType || "").toLowerCase();
  if (mime === "image/jpg") return "image/jpeg";
  if (mime.startsWith("image/")) return mime;
  const extension = String(asset.fileName || asset.uri).toLowerCase().split(".").pop();
  const extensiones = {
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    heic: "image/heic",
    heif: "image/heif",
  };
  return extensiones[extension] || "image/jpeg";
}

export default function DES_04({ autoPick }) {
  const [modo] = useState("Boleta");
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const autoPickIniciado = useRef(false);

  const analizar = useCallback(async (resultado) => {
    if (resultado.canceled || !resultado.assets?.length) return;
    const asset = resultado.assets[0];
    if (asset.type && asset.type !== "image") {
      setError("Selecciona un archivo de imagen.");
      return;
    }
    if (asset.fileSize > MAX_IMAGE_BYTES) {
      setError("La imagen supera el límite de 8 MB. Elige una imagen más pequeña.");
      return;
    }
    if (!asset.base64) {
      setError("No se pudo leer el archivo. Prueba con otra imagen.");
      return;
    }

    setError("");
    await analizarImagenDespensa({
      base64: asset.base64,
      mimeType: mimeTypeDe(asset),
      modo,
      uri: asset.uri,
    });
    go("DES-05");
  }, [modo]);

  const tomarFoto = async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      if (Platform.OS !== "web") {
        const permiso = await ImagePicker.requestCameraPermissionsAsync();
        if (!permiso.granted) {
          Alert.alert("Permiso de cámara", "Permite el acceso a la cámara para fotografiar tu boleta o lista.");
          return;
        }
      }
      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
        cameraType: ImagePicker.CameraType.back,
      });
      await analizar(resultado);
    } catch (e) {
      setError(e.message || "No se pudo abrir la cámara. Inténtalo nuevamente.");
    } finally {
      setProcesando(false);
    }
  };

  const elegirImagen = useCallback(async () => {
    if (procesando) return;
    setProcesando(true);
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: false,
        quality: 0.8,
        base64: true,
        selectionLimit: 1,
      });
      await analizar(resultado);
    } catch (e) {
      setError(e.message || "No se pudo abrir el selector de imágenes. Inténtalo nuevamente.");
    } finally {
      setProcesando(false);
    }
  }, [procesando, analizar]);

  useEffect(() => {
    if ((autoPick === true || autoPick === "true") && !autoPickIniciado.current) {
      autoPickIniciado.current = true;
      elegirImagen();
    }
  }, [autoPick, elegirImagen]);

  return (
    <Screen id="DES-04" name="Agregar insumos a despensa">
      <K.SectionTitle title="Agregar insumo por foto" />
      <K.CameraView
        modo={modo}
        hint="Encuadra tu boleta o lista con buena luz"
        onPress={tomarFoto}
      />
      <Button
        label="Subir archivo de galería"
        variant="outline"
        full
        disabled={procesando}
        onPress={elegirImagen}
      />
      {error ? <K.ErrorState text={error} /> : null}
      {procesando ? <K.Loading text="Analizando la imagen con Gemini…" /> : null}
    </Screen>
  );
}
