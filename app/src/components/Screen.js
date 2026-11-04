import { useEffect } from "react";
import { ScrollView, View, StyleSheet } from "react-native";
import AppBar from "./AppBar";
import { canGoBack, replaceTo } from "../lib/nav";
import { anunciar } from "../lib/a11y";
import { router } from "expo-router";
import { colors, spacing } from "../tokens";

// Layout de las pantallas implementadas (Fases 1-4): AppBar + contenido.
// La cámara vive en el botón central de la barra inferior (no hay FAB por pantalla).
// Accesibilidad: al abrir una pantalla se anuncia su nombre (2.4.2 / 4.1.3) y los
// formularios mantienen los toques sobre botones mientras el teclado está abierto.
export default function Screen({ id, name, children, right }) {
  useEffect(() => {
    anunciar(name);
  }, [name]);

  return (
    <View style={styles.root}>
      <AppBar
        title={name}
        crumb={id}
        right={right}
        onBack={
          id === "DES-04"
            ? () => replaceTo("DES-03")
            : !["ACC-01", "ACC-02", "ACC-03", "INI-01", "DES-01", "PLA-05", "AJU-01"].includes(id) && canGoBack()
              ? () => router.back()
              : undefined
        }
      />
      <ScrollView contentContainerStyle={styles.body} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.canvas },
  body: { padding: spacing.md, paddingBottom: 96, gap: spacing.sm },
});
