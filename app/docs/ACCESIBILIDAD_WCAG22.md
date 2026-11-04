# Estado de revisión de accesibilidad WCAG 2.2 — Haymax

## Alcance y lectura del estado

Este documento resume una revisión estática y acotada del código de `app/` después de los temas 1–7. Registra cambios implementados y verificaciones que todavía hacen falta; **no es una evaluación de conformidad WCAG ni cubre exhaustivamente todas las pantallas, estados y plataformas**.

No se calcula un porcentaje global. Una corrección de código aislada no demuestra que un criterio se cumpla en toda la aplicación.

- ✅ Implementación observada en el alcance indicado; no significa conformidad verificada.
- 🟡 Requiere comprobación manual o una revisión más amplia.
- ⬜ No evaluado suficientemente en esta revisión.

## Criterios revisados

| Criterio | Estado y evidencia en el código | Pendiente de verificación |
|---|---|---|
| 1.1.1 Contenido no textual | ✅ En componentes revisados, los iconos decorativos se ocultan a tecnologías de asistencia y las imágenes de receta se acompañan de contenido textual. `components/Icon.js`, `components/kit.js` | 🟡 Revisar alternativas y propósito de imágenes e iconos en todas las pantallas. |
| 1.3.1 Información y relaciones | ✅ El kit usa encabezados accesibles y combina etiquetas en algunos elementos compuestos. `components/kit.js` | 🟡 Recorrer las pantallas y comprobar que encabezados, grupos y relaciones se anuncien correctamente. |
| 1.3.4 Orientación | ✅ La configuración permite orientación predeterminada. `app.json` | 🟡 Probar las pantallas en horizontal y comprobar que no se pierda contenido ni funcionalidad. |
| 1.3.5 Identificar el propósito de la entrada | ✅ Se definieron valores de autocompletado para campos revisados de acceso. `components/kit.js`, pantallas `ACC-02/03` | 🟡 Revisar el resto de formularios. |
| 1.4.1 Uso del color | ✅ En los estados de vencimiento revisados, el estado también se comunica con texto. `screens/PRE-03.js`, `lib/fechas.js` | 🟡 Confirmar en las pantallas restantes que el color no sea el único indicador. |
| 1.4.3 Contraste mínimo | ✅ Se ajustaron tokens de texto en los temas anteriores. `tokens/index.js` | 🟡 Recalcular y comprobar combinaciones de texto, fondos, estados y contenido dinámico en toda la app; no se declara cumplimiento general. |
| 1.4.4 Cambio de tamaño del texto | ✅ Se reemplazaron alturas fijas por alturas mínimas en componentes afectados, se habilitaron dos líneas en el título y la etiqueta de pestaña, y se quitaron o elevaron límites de líneas en nombres esenciales de las pantallas trabajadas. `components/kit.js`, `components/AppBar.js`, `app/(tabs)/_layout.js`, `screens/COM-01.js`, `screens/DES-01.js`, `screens/PLA-06.js`, `screens/PLA-09.js` | 🟡 Probar a 200 % de fuente, incluyendo nombres largos, errores y estados vacíos; aún puede haber riesgos en otras pantallas. |
| 1.4.10 Reflow | 🟡 Hay ajustes de `flexWrap`, flexibilidad y alturas mínimas en componentes y filas revisados. `components/kit.js`, pantallas trabajadas en el tema 1 | 🟡 Probar a 200 % y en horizontal para detectar desplazamiento en dos direcciones, solapamiento o contenido recortado. |
| 1.4.11 Contraste no textual | ✅ Se añadió `colors.borderStrong` (`#888888`): contraste calculado aproximado de 3,54:1 sobre blanco y 3,30:1 sobre `colors.field` (`#F7F7F7`). Se usa en los controles de borde revisados. `tokens/index.js`, `components/kit.js`, `components/DistrictSelect.js`, `components/Button.js`, pantallas `COM-01` y `AJU-02` | 🟡 Comprobar visualmente los estados interactivos y los fondos reales en la app. `colors.border` queda para separadores decorativos. |
| 2.1.1 Teclado | 🟡 Se añadieron roles y estados accesibles a controles revisados. | 🟡 Probar navegación completa con teclado en web, incluidos foco, activación y orden. |
| 2.4.2 Página titulada | ✅ `Screen` comunica el nombre de pantalla como título y lo anuncia al abrirse. `components/Screen.js` | 🟡 Verificar títulos y anuncios al navegar por rutas reales. |
| 2.4.3 Orden del foco | 🟡 Hay foco visible en controles revisados. | 🟡 Comprobar el orden de foco con teclado y que siga el orden visual y de lectura. |
| 2.4.6 Encabezados y etiquetas | ✅ Hay encabezados accesibles y etiquetas en componentes revisados. `components/kit.js` | 🟡 Revisar jerarquía y claridad de etiquetas en todas las pantallas. |
| 2.4.7 Foco visible | ✅ Los controles revisados usan `focoVisible`. `lib/a11y.js`, componentes y pantallas trabajadas | 🟡 Confirmar su visibilidad en web y con cada estilo de control. |
| 2.4.11 Foco no oculto (mínimo) | ✅ Las pantallas con barra inferior reservan espacio al final del contenido. `components/Screen.js` | 🟡 Comprobar manualmente que el foco no quede tapado por barras fijas, teclado o ventanas emergentes. |
| 2.4.13 Apariencia del foco | 🟡 Hay estilo de foco en los controles revisados. | 🟡 Verificar tamaño, contraste y visibilidad del indicador en cada plataforma; no se declara conformidad. |
| 2.5.3 Etiqueta en el nombre | ✅ En controles corregidos se añadieron etiquetas que incluyen el texto visible, como los controles del calendario y los chips. `screens/PLA-05.js`, `screens/PLA-09.js`, `components/kit.js` | 🟡 Revisar todos los controles de todas las pantallas. |
| 2.5.8 Tamaño del objetivo (mínimo) | ✅ Los controles ajustados usan `MIN_TARGET` o un tamaño mínimo de 44 px. `lib/a11y.js`, `components/kit.js`, pantallas trabajadas | 🟡 Auditar objetivos táctiles de la app completa, especialmente controles compactos y grupos densos. |
| 3.1.1 Idioma de la página | ✅ La raíz web declara español. `app/src/app/+html.js` | 🟡 Ejecutar `npm run web` y comprobar el atributo `lang` en el HTML generado. |
| 3.2.6 Ayuda consistente | ✅ La ayuda abre AYU-01 desde INI-01 y AJU-01, en la posición relativa correspondiente. `components/kit.js`, `screens/AJU-01.js`, `screens/AYU-01.js` | 🟡 Revisar si la ayuda debe estar disponible de forma consistente en otras partes de la aplicación. |
| 3.3.2 Etiquetas o instrucciones | ✅ Los campos de acceso revisados tienen etiquetas visibles. `components/kit.js`, pantallas `ACC-02/03` | 🟡 Revisar etiquetas e instrucciones del resto de formularios. |
| 3.3.7 Entrada redundante | ✅ En el registro revisado se conserva la confirmación de contraseña por seguridad. `screens/ACC-03.js` | 🟡 Revisar otros flujos que puedan pedir de nuevo información ya ingresada. |
| 3.3.8 Autenticación accesible | ✅ Los campos de acceso revisados permiten autocompletado y no bloquean el pegado. `screens/ACC-02.js`, `screens/ACC-03.js` | 🟡 Probar con gestores de contraseñas y tecnologías de asistencia. |
| 4.1.2 Nombre, función, valor | ✅ Se corrigieron controles concretos: calendario y chips de PLA-09, switch de AJU-01, chips de AJU-02 y búsqueda de `DistrictSelect`; se revisaron `Items.js` y Pressable. `screens/PLA-05.js`, `screens/PLA-09.js`, `screens/AJU-01.js`, `screens/AJU-02.js`, `components/DistrictSelect.js`, `components/Items.js` | 🟡 Probar roles, nombres y estados con TalkBack y VoiceOver; falta una auditoría completa de controles en todas las pantallas. |
| 4.1.3 Mensajes de estado | ✅ El kit dispone de anuncios para errores, avisos y estados de carga en componentes revisados. `components/kit.js`, `lib/a11y.js` | 🟡 Confirmar con TalkBack y VoiceOver que los mensajes relevantes se anuncien sin mover el foco de forma inesperada. |

## Pruebas manuales pendientes

- TalkBack en Android y VoiceOver en iOS: nombres, roles, estados, orden de lectura, cambios y mensajes de estado.
- Fuente al 200 %: desbordamiento, recortes, solapamientos, desplazamiento y acceso a acciones en pantallas y diálogos.
- Orientación horizontal: reflow, acceso a todo el contenido y ausencia de desplazamiento en dos direcciones.
- Web: idioma `lang="es"`, teclado, orden y apariencia del foco.
- Contraste en contexto: estados de foco, selección, deshabilitado, error y fondos reales.

Hasta completar estas pruebas y una revisión de todas las pantallas, este documento **no declara que Haymax cumpla WCAG 2.2 AA**.
