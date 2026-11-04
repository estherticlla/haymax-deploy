import { View, StyleSheet } from "react-native";
import Screen from "../components/Screen";
import * as K from "../components/kit";
import { spacing } from "../tokens";

const NOMBRE = "Ayuda y preguntas frecuentes";

export default function AYU_01() {
  return (
    <Screen id="AYU-01" name={NOMBRE}>
      <K.TextLine text="Respuestas rápidas para usar Haymax." />
      <View style={styles.faqList}>
        <View>
          <K.SectionTitle title="Escanear" />
          <K.Card
            title="¿Cómo registro una boleta o una lista?"
            sub="Toca el botón de cámara, elige el tipo de foto y toma la imagen. Revisa los insumos detectados; puedes corregir nombres y cantidades antes de confirmar."
          />
        </View>
        <View>
          <K.SectionTitle title="Planificar" />
          <K.Card
            title="¿Cómo planifico un plato?"
            sub="Abre Planificar, elige la fecha y la comida, y selecciona una receta. Puedes ajustar las porciones; si faltan insumos, agrégalos a tu lista de compras."
          />
        </View>
        <View>
          <K.SectionTitle title="Descontar insumos" />
          <K.Card
            title="¿Cuándo se actualiza mi despensa?"
            sub="Toca Ya lo preparé, revisa las cantidades y confirma. El descuento se aplica al confirmar; puedes corregir las cantidades antes de guardar."
          />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  faqList: { gap: spacing.sm },
});
