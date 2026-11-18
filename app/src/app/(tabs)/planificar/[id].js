import { useLocalSearchParams } from "expo-router";
import REC_02 from "../../../screens/REC-02";

function unico(valor) {
  return Array.isArray(valor) ? valor[0] : valor;
}

// Reutiliza el detalle de receta sin sacarlo de la pila de Planificar.
export default function DetalleRecetaPlanificada() {
  const params = useLocalSearchParams();
  return (
    <REC_02
      receta={unico(params.id)}
      fecha={unico(params.fecha)}
      comida={unico(params.comida)}
      planId={unico(params.planId)}
    />
  );
}
