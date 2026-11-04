import { View, Text, Pressable, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import Icon from "../components/Icon";
import * as K from "../components/kit";
import { go } from "../lib/nav";
import { colors, spacing, typography, shadows, radius } from "../tokens";
import { focoVisible } from "../lib/a11y";

const OPCIONES = [
  {
    id: "foto",
    icon: "camera-outline",
    title: "Escanear o subir foto",
    sub: "Toma una foto o elige una imagen de tu dispositivo.",
    target: "DES-04",
  },
  {
    id: "manual",
    icon: "create-outline",
    title: "Escribir manualmente",
    sub: "Agrega los insumos escribiendo sus datos.",
    target: "DES-06",
  },
];

export default function DES_03() {
  return (
    <Screen id="DES-03" name="Agregar insumos">
      <K.SectionTitle title="¿Cómo quieres agregar insumos?" />
      <Text style={styles.hint}>
        Elige la opción que mejor se adapte a tu compra. Puedes cambiarla después.
      </Text>

      {OPCIONES.map((op) => (
        <Pressable
          key={op.id}
          onPress={(event) => {
            if (typeof event?.currentTarget?.blur === "function") event.currentTarget.blur();
            go(op.target);
          }}
          accessibilityRole="button"
          accessibilityLabel={op.title}
          accessibilityState={{ disabled: false }}
          accessibilityHint={op.sub}
          style={(state) => [
            styles.card,
            state.pressed && styles.pressed,
            focoVisible(state),
          ]}
        >
          <View style={styles.iconBox}>
            <Icon name={op.icon} size={26} color={colors.primary} />
          </View>
          <View style={styles.textBox}>
            <Text style={styles.title}>{op.title}</Text>
            <Text style={styles.sub}>{op.sub}</Text>
          </View>
          <Icon name="chevron-forward" size={20} color={colors.muted} />
        </Pressable>
      ))}

    </Screen>
  );
}

const styles = StyleSheet.create({
  hint: {
    fontSize: typography.sizes.body,
    color: colors.sub,
    marginBottom: spacing.sm,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.card,
  },
  pressed: { opacity: 0.85 },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: "center",
    justifyContent: "center",
  },
  textBox: { flex: 1, gap: 2 },
  title: {
    fontSize: typography.sizes.label,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sub: {
    fontSize: typography.sizes.body,
    color: colors.sub,
    lineHeight: 18,
  },
});
