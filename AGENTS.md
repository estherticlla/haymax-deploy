# Reglas para agentes — Haymax

## Alcance
Monorepo con `app/` (Expo / React Native) y `api/` (Node + Express + PostgreSQL). Puedes editar ambos, siguiendo estas reglas. Textos en español (es-PE), tono cotidiano, soles como "S/".

## ZONA PROHIBIDA (solo lectura)
- `api/src/routes/ocr.js` y todo código que use Gemini o `GEMINI_API_KEY`. No cambies el contrato de `POST /api/ocr/analizar`.
- Archivos `.env*` (en `api/` y `app/`): nunca los leas, crees ni imprimas.
- `app/src/lib/api.js`: no modifiques `analizarImagenDespensa`, `getEscaneoPendiente`, `confirmarEscaneo` ni nada que llame a `/ocr`. Puedes AGREGAR funciones nuevas al final del archivo.
- `app/src/screens/DES-04.js` y `DES-05.js`: no cambies lógica ni handlers. Los estilos solo con autorización explícita en el prompt.
- No ejecutes ni edites `app/tools/_gen_screens.js`, `tools/`, `prototipo/` ni `documentos/`.

## Backend (api/)
- Migraciones idempotentes en `api/src/db.js` (`IF NOT EXISTS`). No rompas `npm run seed`.
- Consultas parametrizadas, validación de entrada y errores con código y mensaje claros. Toda ruta personal pasa por `auth`.
- Antes de cambiar esquema o endpoints, muestra el plan y espera mi OK (otro compañero trabaja en el backend).

## Expo
Tu memoria sobre Expo puede estar desactualizada. Lee la versión de `expo` en `app/package.json` y consulta docs.expo.dev para esa versión. Instala dependencias solo con `npx expo install <paquete>` y avísame antes.

## Sistema de diseño (consistencia)
- Todo valor visual (color, tamaño de letra, familia, espaciado, radio, sombra, tamaño de control) sale de `app/src/tokens/index.js`. Nada de literales en pantallas.
- Una sola familia tipográfica y una escala fija de roles (display, title, subtitle, body, label, caption).
- Usa los componentes de `app/src/components` (`kit.js`, `Button.js`). No dupliques componentes ni armes botones con `Pressable` y estilos propios.
- Todo lo que ejecuta una acción usa `Button` o `LinkText`. Lo que no es botón no debe parecerlo. Sigue `app/docs/GUIA_ESTILO.md`.
- Objetivos táctiles ≥ 44 px (`MIN_TARGET` en `lib/a11y.js`). Usa `focoVisible`, `anunciar` y `etiqueta` de `lib/a11y.js`.

## Accesibilidad (WCAG 2.2 AA)
- Todo control tiene role, label (que contenga el texto visible) y state.
- El color nunca es el único canal. Contraste: texto ≥ 4,5:1, componentes de UI ≥ 3:1.
- Sin alturas fijas en texto (usa `minHeight`). Sin `numberOfLines` en información esencial. Debe funcionar a 200 % de fuente.
- Los errores se muestran con texto claro y se anuncian a lectores de pantalla.

## Entorno (Windows, cmd)
- No uses `pwd` ni `grep`. Usa `rg` con un patrón simple por comando; si un patrón con `|` falla, haz búsquedas separadas.
- Rutas con `\` o `/`, siempre relativas a la raíz del repo.

## Proceso
- Muestra un plan corto antes de editar. Un tema por tarea.
- Al terminar: `cd app && npx expo lint && npx tsc --noEmit && npm run test:domain`. Si tocaste `api/`: `cd api && npm test` si existe; si no, `node --check` de cada archivo editado.
- Verificación de zona prohibida: `git diff --stat -- api/src/routes/ocr.js app/src/screens/DES-04.js app/src/screens/DES-05.js` debe salir vacío, y `git diff -U0 -- app/src/lib/api.js` solo puede mostrar líneas agregadas fuera de las funciones OCR.
- No hagas commit ni push.