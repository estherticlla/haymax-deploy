# HU-07: límites del filtrado en el cliente

Las exclusiones de ingredientes se comparan con los nombres que vienen en `ingredientes_detalle`, `ingredientes` o `ingredient_names` de cada receta. Si esos campos no están disponibles, se usan `faltantes` como respaldo; esa lista solo contiene los ingredientes faltantes, así que no permite descartar una receta por todos sus ingredientes.

Los tipos excluidos (`Pesados`, `Picantes`, `Fritos` y `Muy condimentados`) solo se comparan con metadatos explícitos de la receta: `tipo`, `tipo_plato`, `tipoPlato`, `categoria`, `categorias`, `tags`, `etiquetas` o `caracteristicas`.

Sin esos datos del backend no se puede determinar de forma fiable si un plato es pesado, picante, frito o muy condimentado a partir de su nombre o ingredientes. En ese caso, el filtro por tipo no puede ocultar esos platos; se necesita que la API entregue una categoría o etiqueta de tipo para cada receta.
