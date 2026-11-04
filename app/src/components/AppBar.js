import { View, Text, Pressable, StyleSheet } from "react-native";
import { colors, spacing, typography, layout } from "../tokens";
import { SHOW_DEV_TAGS } from "../config";
import Icon from "./Icon";
import { focoVisible } from "../lib/a11y";

// Cabecera de las pantallas (equivale al AppBar del prototipo Figma).
// Sin SHOW_DEV_TAGS solo queda el botón atrás (pantallas apiladas);
// en pestañas no se renderiza ninguna barra.
export default function AppBar({ title, crumb, onBack, right }) {
  const etiquetas = SHOW_DEV_TAGS;
  if (!etiquetas && !onBack && !right) return null;
  return (
    <View style={styles.bar}>
      <View style={[styles.side, styles.leftSide]}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel="Volver"
            accessibilityState={{ disabled: false }}
            style={(state) => [styles.back, focoVisible(state)]}
          >
            <Icon name="chevron-back" size={24} color={colors.primary} />
          </Pressable>
        ) : null}
        {etiquetas ? (
          <View style={styles.titleWrap}>
            {crumb ? <Text style={styles.crumb}>{crumb}</Text> : null}
            {title ? (
              <Text style={styles.title} accessibilityRole="header">
                {title}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>
      {right ? <View style={styles.side}>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    minHeight: layout.appBarMinHeight,
    paddingHorizontal: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  side: { minWidth: 0, flexDirection: "row", alignItems: "center", gap: spacing.sm },
  leftSide: { flex: 1 },
  titleWrap: { flex: 1, minWidth: 0 },
  back: { marginRight: spacing.xs, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" },
  crumb: { fontSize: typography.sizes.caption, color: colors.muted, letterSpacing: 0.7 },
  title: { fontSize: typography.sizes.subtitle, fontWeight: typography.weights.semibold, color: colors.text },
});
