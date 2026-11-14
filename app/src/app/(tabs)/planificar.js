import { useLocalSearchParams } from "expo-router";
import PLA_09 from "../../screens/PLA-09";

export default function Planificar() {
  const { fecha, comida } = useLocalSearchParams();
  return <PLA_09 key={`${fecha || "semana-actual"}-${comida || "almuerzo"}`} fecha={fecha} comida={comida} />;
}
