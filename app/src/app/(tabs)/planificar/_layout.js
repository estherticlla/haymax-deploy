import { Stack } from "expo-router";

// El detalle de receta queda dentro de la pestaña Planificar, por lo que
// conserva su propia pila y la pestaña sigue activa durante la navegación.
export default function PlanificarLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="[id]" />
    </Stack>
  );
}
