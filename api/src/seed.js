// Carga inicial de datos de demostración. Ejecutar: npm run seed
// Es idempotente: usa IDs fijos + ON CONFLICT DO NOTHING, se puede repetir.
const bcrypt = require("bcryptjs");
const { db } = require("./db");
const { lunesDe, sumarDias } = require("./utils");
const { cargarPlatosPeruanos } = require("./platos-peruanos");
const { diasVidaUtilPorProducto } = require("./vida-util");

// — Catálogo de productos (ids fijos) —
const productos = [
  { id: 1, nombre: "Papa amarilla", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 2, nombre: "Pollo", categoria: "Carnes", unidad_medida_base: "gr" },
  { id: 3, nombre: "Leche evaporada", categoria: "Lácteos", unidad_medida_base: "lata" },
  { id: 4, nombre: "Ají amarillo", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 5, nombre: "Queso fresco", categoria: "Lácteos", unidad_medida_base: "gr" },
  { id: 6, nombre: "Lomo fino", categoria: "Carnes", unidad_medida_base: "gr" },
  { id: 7, nombre: "Cebolla roja", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 8, nombre: "Tomate italiano", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 9, nombre: "Salsa de soya", categoria: "Secos", unidad_medida_base: "botella" },
  { id: 10, nombre: "Arroz", categoria: "Secos", unidad_medida_base: "kg" },
  { id: 11, nombre: "Palta", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 12, nombre: "Huevo", categoria: "Secos", unidad_medida_base: "und" },
  { id: 13, nombre: "Galletas de agua", categoria: "Secos", unidad_medida_base: "paquete" },
  { id: 14, nombre: "Nueces", categoria: "Secos", unidad_medida_base: "gr" },
  { id: 15, nombre: "Papas fritas", categoria: "Congelados", unidad_medida_base: "gr" },
  { id: 16, nombre: "Leche", categoria: "Lácteos", unidad_medida_base: "ml" },
  { id: 17, nombre: "Pescado", categoria: "Mariscos", unidad_medida_base: "gr" },
  { id: 18, nombre: "Camarones", categoria: "Mariscos", unidad_medida_base: "gr" },
  { id: 19, nombre: "Conchas de abanico", categoria: "Mariscos", unidad_medida_base: "und" },
  { id: 20, nombre: "Carne de res", categoria: "Carnes", unidad_medida_base: "gr" },
  { id: 21, nombre: "Carne de cerdo", categoria: "Carnes", unidad_medida_base: "gr" },
  { id: 22, nombre: "Pechuga de pollo", categoria: "Carnes", unidad_medida_base: "gr" },
  { id: 23, nombre: "Lentejas", categoria: "Menestras", unidad_medida_base: "gr" },
  { id: 24, nombre: "Frejol canario", categoria: "Menestras", unidad_medida_base: "gr" },
  { id: 25, nombre: "Zanahoria", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 26, nombre: "Arvejas", categoria: "Verduras", unidad_medida_base: "gr" },
  { id: 27, nombre: "Choclo", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 28, nombre: "Limón", categoria: "Frutas", unidad_medida_base: "und" },
  { id: 29, nombre: "Culantro", categoria: "Verduras", unidad_medida_base: "atado" },
  { id: 30, nombre: "Ajo", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 31, nombre: "Ají panca", categoria: "Condimentos", unidad_medida_base: "gr" },
  { id: 32, nombre: "Rocoto", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 33, nombre: "Fideos spaghetti", categoria: "Pastas", unidad_medida_base: "gr" },
  { id: 34, nombre: "Tallarines", categoria: "Pastas", unidad_medida_base: "gr" },
  { id: 35, nombre: "Aceite vegetal", categoria: "Secos", unidad_medida_base: "ml" },
  { id: 36, nombre: "Camote", categoria: "Verduras", unidad_medida_base: "und" },
  { id: 37, nombre: "Yuca", categoria: "Verduras", unidad_medida_base: "kg" },
  { id: 38, nombre: "Zapallo", categoria: "Verduras", unidad_medida_base: "gr" },
  { id: 39, nombre: "Espinaca", categoria: "Verduras", unidad_medida_base: "atado" },
  { id: 40, nombre: "Champiñones", categoria: "Verduras", unidad_medida_base: "gr" },
  { id: 41, nombre: "Sillao", categoria: "Condimentos", unidad_medida_base: "botella" }
];

const recetas = [
  {
    id: "REC-LOMO",
    titulo: "Lomo saltado",
    descripcion: "Clásico salteado de lomo de res con cebolla, tomate y ají amarillo.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/Lomo_Salteado.jpg/640px-Lomo_Salteado.jpg",
    porciones: 2,
    tiempo_preparacion_min: 35,
    dificultad: "facil",
    precio: 28.5,
    distrito: "Surquillo",
    nutri_calorias: 520,
    nutri_proteinas: 32,
    nutri_carbohidratos: 40,
    nutri_grasas: 22,
    nutri_fibra: 4,
    pasos: ["Sellar la carne", "Agregar verduras", "Sazonar con soya", "Servir con arroz y papas"]
  },
  {
    id: "REC-AGALLINA",
    titulo: "Ají de gallina",
    descripcion: "Crema de ají amarillo con pollo deshilachado y galletas de agua.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Aji_de_gallina_10.jpg/640px-Aji_de_gallina_10.jpg",
    porciones: 4,
    tiempo_preparacion_min: 55,
    dificultad: "media",
    precio: 32,
    distrito: "Surquillo",
    nutri_calorias: 610,
    nutri_proteinas: 35,
    nutri_carbohidratos: 48,
    nutri_grasas: 28,
    nutri_fibra: 3,
    pasos: ["Cocer el pollo", "Preparar la crema", "Integrar y cocinar", "Servir con arroz y papa"]
  },
  {
    id: "REC-HUANCAINA",
    titulo: "Papa a la huancaína",
    descripcion: "Papas amarillas bañadas en salsa huancaína de ají y queso fresco.",
    imagen: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/74/Papa_a_la_huancaina.jpg/640px-Papa_a_la_huancaina.jpg",
    porciones: 4,
    tiempo_preparacion_min: 25,
    dificultad: "facil",
    precio: 14,
    distrito: "Surquillo",
    nutri_calorias: 380,
    nutri_proteinas: 12,
    nutri_carbohidratos: 42,
    nutri_grasas: 18,
    nutri_fibra: 5,
    pasos: ["Hervir las papas", "Licuar la salsa", "Emplatar y decorar"]
  },
  {
    id: "REC-CEVICHE",
    titulo: "Ceviche clásico peruano",
    descripcion: "Tradicional ceviche de pescado fresco marinado en limón, con cebolla roja, rocoto, choclo y camote.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Ceviche%20peruano.jpg?width=640",
    porciones: 2,
    tiempo_preparacion_min: 30,
    dificultad: "media",
    precio: 32,
    distrito: "Surquillo",
    nutri_calorias: 320,
    nutri_proteinas: 36,
    nutri_carbohidratos: 28,
    nutri_grasas: 6,
    nutri_fibra: 4,
    pasos: ["Cortar el pescado fresco en cubos", "Exprimir los limones y reservar el jugo", "Mezclar el pescado con limón, sal y rocoto", "Agregar la cebolla roja en juliana", "Servir con choclo y camote sancochado"]
  },
  {
    id: "REC-CHAUFA",
    titulo: "Arroz chaufa de pollo",
    descripcion: "Clásico plato de chifa peruano preparado con arroz, pollo, huevo, verduras y sillao.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Arroz%20chaufa.JPG?width=640",
    porciones: 3,
    tiempo_preparacion_min: 30,
    dificultad: "facil",
    precio: 24,
    distrito: "Surquillo",
    nutri_calorias: 580,
    nutri_proteinas: 28,
    nutri_carbohidratos: 72,
    nutri_grasas: 19,
    nutri_fibra: 3,
    pasos: ["Cocinar el arroz y dejarlo enfriar", "Cortar el pollo en trozos pequeños", "Saltear el pollo hasta que esté cocido", "Agregar huevo revuelto, zanahoria y arvejas", "Incorporar el arroz y el sillao", "Saltear a fuego alto y servir"]
  },
  {
    id: "REC-TALLARIN",
    titulo: "Tallarines verdes",
    descripcion: "Pasta peruana con salsa cremosa de espinaca, queso fresco, leche y ajo. Alternativa vegetariana.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Tallarines%20verdes.jpg?width=640",
    porciones: 3,
    tiempo_preparacion_min: 35,
    dificultad: "facil",
    precio: 22,
    distrito: "Surquillo",
    nutri_calorias: 460,
    nutri_proteinas: 17,
    nutri_carbohidratos: 62,
    nutri_grasas: 16,
    nutri_fibra: 5,
    pasos: ["Hervir los tallarines hasta que estén al dente", "Lavar y deshojar la espinaca", "Licuar la espinaca con queso fresco, leche y ajo", "Calentar la salsa en una sartén", "Incorporar los tallarines y mezclar", "Servir caliente"]
  },
  {
    id: "REC-SECO",
    titulo: "Seco de res con frejoles",
    descripcion: "Guiso tradicional de carne de res cocinado con culantro, arvejas y especias, acompañado de frejoles y arroz.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Seco%20de%20carne%20peru.jpg?width=640",
    porciones: 4,
    tiempo_preparacion_min: 75,
    dificultad: "media",
    precio: 38,
    distrito: "Surquillo",
    nutri_calorias: 690,
    nutri_proteinas: 42,
    nutri_carbohidratos: 76,
    nutri_grasas: 23,
    nutri_fibra: 9,
    pasos: ["Cortar la carne en trozos medianos", "Licuar el culantro con un poco de agua", "Preparar el aderezo con cebolla y ajo", "Agregar la carne y dorar", "Incorporar el culantro y las arvejas", "Cocinar a fuego bajo hasta que la carne esté suave", "Servir con frejoles y arroz"]
  },
  {
    id: "REC-LENTEJAS",
    titulo: "Guiso de lentejas",
    descripcion: "Plato casero y nutritivo de lentejas con zanahoria, zapallo, tomate y aderezo criollo. Preparación vegetariana.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Lentejas%2004.JPG?width=640",
    porciones: 4,
    tiempo_preparacion_min: 45,
    dificultad: "facil",
    precio: 18,
    distrito: "Surquillo",
    nutri_calorias: 340,
    nutri_proteinas: 19,
    nutri_carbohidratos: 56,
    nutri_grasas: 5,
    nutri_fibra: 14,
    pasos: ["Lavar las lentejas y retirar impurezas", "Cocinarlas en una olla con agua", "Picar la cebolla, zanahoria, tomate y ajo", "Preparar el aderezo en una sartén", "Agregar el aderezo y el zapallo a las lentejas", "Cocinar hasta que las verduras estén suaves", "Servir caliente"]
  },
  {
    id: "REC-FREJOLES",
    titulo: "Frejoles canarios con cerdo",
    descripcion: "Guiso criollo de frejoles canarios con carne de cerdo, ají panca y aderezo de cebolla. Acompañado de arroz.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Seco%20de%20cabrito%20con%20frijoles.JPG?width=640",
    porciones: 4,
    tiempo_preparacion_min: 90,
    dificultad: "media",
    precio: 30,
    distrito: "Surquillo",
    nutri_calorias: 650,
    nutri_proteinas: 35,
    nutri_carbohidratos: 74,
    nutri_grasas: 22,
    nutri_fibra: 12,
    pasos: ["Remojar los frejoles desde la noche anterior", "Cocinar los frejoles hasta que estén suaves", "Cortar el cerdo en cubos", "Preparar el aderezo con cebolla, ajo y ají panca", "Dorar el cerdo e incorporarlo al aderezo", "Agregar los frejoles cocidos y dejar hervir", "Servir acompañado de arroz blanco"]
  },
  {
    id: "REC-CHUPE",
    titulo: "Chupe de camarones",
    descripcion: "Sopa tradicional arequipeña preparada con camarones, choclo, papa, leche y queso fresco.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Chupe%20de%20Camarones.jpg?width=640",
    porciones: 4,
    tiempo_preparacion_min: 60,
    dificultad: "media",
    precio: 45,
    distrito: "Surquillo",
    nutri_calorias: 560,
    nutri_proteinas: 34,
    nutri_carbohidratos: 48,
    nutri_grasas: 24,
    nutri_fibra: 5,
    pasos: ["Limpiar y lavar los camarones", "Preparar un aderezo con ajo", "Agregar agua y cocinar el choclo", "Incorporar las papas y cocinar hasta que estén suaves", "Agregar los camarones y cocinar unos minutos", "Incorporar la leche y el queso fresco", "Añadir el huevo y dejar cocinar", "Servir caliente"]
  },
  {
    id: "REC-CONCHAS",
    titulo: "Conchitas a la parmesana",
    descripcion: "Entrada marina preparada con conchas de abanico gratinadas con queso, ajo y un toque de limón.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Scallops%20with%20cheese%20from%20La%20Rosa%20Nautica%20restaurant.jpg?width=640",
    porciones: 3,
    tiempo_preparacion_min: 25,
    dificultad: "media",
    precio: 36,
    distrito: "Surquillo",
    nutri_calorias: 290,
    nutri_proteinas: 25,
    nutri_carbohidratos: 8,
    nutri_grasas: 17,
    nutri_fibra: 0,
    pasos: ["Limpiar las conchas de abanico", "Colocarlas en una fuente para horno", "Mezclar el queso con leche y ajo picado", "Colocar la mezcla sobre cada concha", "Agregar unas gotas de aceite", "Gratinar hasta que el queso esté dorado", "Servir con limón"]
  },
  {
    id: "REC-PAPARELLENA",
    titulo: "Papa rellena",
    descripcion: "Preparación criolla de papa amarilla rellena de carne de res sazonada, cebolla, tomate y huevo, frita hasta quedar dorada.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Papa%20rellena%20Queirolo.jpg?width=640",
    porciones: 4,
    tiempo_preparacion_min: 60,
    dificultad: "media",
    precio: 26,
    distrito: "Surquillo",
    nutri_calorias: 580,
    nutri_proteinas: 24,
    nutri_carbohidratos: 58,
    nutri_grasas: 28,
    nutri_fibra: 5,
    pasos: ["Hervir las papas y prensarlas hasta obtener un puré", "Preparar el relleno con carne, cebolla, tomate y ajo", "Agregar huevo picado al relleno", "Dejar enfriar el relleno", "Tomar una porción de masa de papa y colocar el relleno en el centro", "Cerrar y dar forma ovalada", "Freír en aceite caliente hasta dorar", "Servir caliente"]
  },
  {
    id: "REC-TACUTACU",
    titulo: "Tacu tacu casero",
    descripcion: "Plato criollo de frejoles y arroz mezclados con aderezo de cebolla, ajo y ají panca, dorados en sartén y acompañados de huevo.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Tacu%20Tacu.jpg?width=640",
    porciones: 2,
    tiempo_preparacion_min: 30,
    dificultad: "media",
    precio: 20,
    distrito: "Surquillo",
    nutri_calorias: 570,
    nutri_proteinas: 19,
    nutri_carbohidratos: 76,
    nutri_grasas: 20,
    nutri_fibra: 11,
    pasos: ["Cocinar los frejoles hasta que estén suaves", "Preparar un aderezo con cebolla, ajo y ají panca", "Agregar los frejoles y aplastarlos ligeramente", "Incorporar el arroz cocido y mezclar", "Formar porciones compactas", "Dorar cada porción en una sartén con aceite", "Freír los huevos y servir como acompañamiento"]
  },
  {
    id: "REC-ROCOTO",
    titulo: "Rocoto relleno arequipeño",
    descripcion: "Plato tradicional de Arequipa preparado con rocotos rellenos de carne de res, cebolla, tomate, huevo y nueces, cubiertos con queso.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Rocoto%20relleno.jpg?width=640",
    porciones: 4,
    tiempo_preparacion_min: 70,
    dificultad: "dificil",
    precio: 42,
    distrito: "Surquillo",
    nutri_calorias: 490,
    nutri_proteinas: 31,
    nutri_carbohidratos: 24,
    nutri_grasas: 30,
    nutri_fibra: 5,
    pasos: ["Lavar los rocotos y retirar las semillas", "Hervir los rocotos para reducir su picor", "Preparar el relleno con carne, cebolla, tomate y ajo", "Agregar el huevo picado y las nueces", "Rellenar los rocotos con la preparación", "Cubrir con queso fresco", "Hornear hasta que el queso esté gratinado", "Servir caliente"]
  },
  {
    id: "REC-ENSALADA",
    titulo: "Ensalada fresca de champiñones y palta",
    descripcion: "Ensalada ligera de champiñones, espinaca, tomate, palta y zanahoria, aliñada con limón. Preparación vegetariana.",
    imagen: "https://commons.wikimedia.org/wiki/Special:FilePath/Ensalada%20Palta.JPG?width=640",
    porciones: 2,
    tiempo_preparacion_min: 15,
    dificultad: "facil",
    precio: 18,
    distrito: "Surquillo",
    nutri_calorias: 240,
    nutri_proteinas: 8,
    nutri_carbohidratos: 22,
    nutri_grasas: 15,
    nutri_fibra: 9,
    pasos: ["Lavar y desinfectar todas las verduras", "Cortar los champiñones en láminas", "Cortar el tomate y la palta en trozos", "Rallar la zanahoria", "Colocar la espinaca como base", "Agregar los demás ingredientes", "Aliñar con jugo de limón y mezclar", "Servir fresca"]
  }
];

const ingredientes = [
  { id: 1, receta_id: "REC-LOMO", producto_id: 6, nombre: "Lomo fino", cantidad: 400, unidad_medida: "gr", orden: 0 },
  { id: 2, receta_id: "REC-LOMO", producto_id: 7, nombre: "Cebolla roja", cantidad: 1, unidad_medida: "und", orden: 1 },
  { id: 3, receta_id: "REC-LOMO", producto_id: 8, nombre: "Tomate italiano", cantidad: 2, unidad_medida: "und", orden: 2 },
  { id: 4, receta_id: "REC-LOMO", producto_id: 4, nombre: "Ají amarillo", cantidad: 1, unidad_medida: "und", orden: 3 },
  { id: 5, receta_id: "REC-LOMO", producto_id: 9, nombre: "Salsa de soya", cantidad: 3, unidad_medida: "cda", orden: 4 },
  { id: 6, receta_id: "REC-LOMO", producto_id: 15, nombre: "Papas fritas", cantidad: 200, unidad_medida: "gr", orden: 5 },
  { id: 7, receta_id: "REC-LOMO", producto_id: 10, nombre: "Arroz", cantidad: 200, unidad_medida: "gr", orden: 6 },
  { id: 8, receta_id: "REC-AGALLINA", producto_id: 2, nombre: "Pollo", cantidad: 600, unidad_medida: "gr", orden: 0 },
  { id: 9, receta_id: "REC-AGALLINA", producto_id: 4, nombre: "Ají amarillo", cantidad: 3, unidad_medida: "und", orden: 1 },
  { id: 10, receta_id: "REC-AGALLINA", producto_id: 13, nombre: "Galletas de agua", cantidad: 6, unidad_medida: "und", orden: 2 },
  { id: 11, receta_id: "REC-AGALLINA", producto_id: 3, nombre: "Leche evaporada", cantidad: 1, unidad_medida: "lata", orden: 3 },
  { id: 12, receta_id: "REC-AGALLINA", producto_id: 14, nombre: "Nueces", cantidad: 50, unidad_medida: "gr", orden: 4 },
  { id: 13, receta_id: "REC-AGALLINA", producto_id: 10, nombre: "Arroz", cantidad: 300, unidad_medida: "gr", orden: 5 },
  { id: 14, receta_id: "REC-HUANCAINA", producto_id: 1, nombre: "Papa amarilla", cantidad: 4, unidad_medida: "und", orden: 0 },
  { id: 15, receta_id: "REC-HUANCAINA", producto_id: 4, nombre: "Ají amarillo", cantidad: 2, unidad_medida: "und", orden: 1 },
  { id: 16, receta_id: "REC-HUANCAINA", producto_id: 5, nombre: "Queso fresco", cantidad: 200, unidad_medida: "gr", orden: 2 },
  { id: 17, receta_id: "REC-HUANCAINA", producto_id: 13, nombre: "Galletas de agua", cantidad: 4, unidad_medida: "und", orden: 3 },
  { id: 18, receta_id: "REC-HUANCAINA", producto_id: 16, nombre: "Leche", cantidad: 100, unidad_medida: "ml", orden: 4 },

  { id: 19, receta_id: "REC-CEVICHE", producto_id: 17, nombre: "Pescado", cantidad: 400, unidad_medida: "gr", orden: 0 },
  { id: 20, receta_id: "REC-CEVICHE", producto_id: 28, nombre: "Limón", cantidad: 8, unidad_medida: "und", orden: 1 },
  { id: 21, receta_id: "REC-CEVICHE", producto_id: 7, nombre: "Cebolla roja", cantidad: 1, unidad_medida: "und", orden: 2 },
  { id: 22, receta_id: "REC-CEVICHE", producto_id: 27, nombre: "Choclo", cantidad: 1, unidad_medida: "und", orden: 3 },
  { id: 23, receta_id: "REC-CEVICHE", producto_id: 36, nombre: "Camote", cantidad: 1, unidad_medida: "und", orden: 4 },
  { id: 24, receta_id: "REC-CEVICHE", producto_id: 32, nombre: "Rocoto", cantidad: 0.5, unidad_medida: "und", orden: 5 },

  { id: 25, receta_id: "REC-CHAUFA", producto_id: 22, nombre: "Pechuga de pollo", cantidad: 250, unidad_medida: "gr", orden: 0 },
  { id: 26, receta_id: "REC-CHAUFA", producto_id: 10, nombre: "Arroz", cantidad: 300, unidad_medida: "gr", orden: 1 },
  { id: 27, receta_id: "REC-CHAUFA", producto_id: 12, nombre: "Huevo", cantidad: 2, unidad_medida: "und", orden: 2 },
  { id: 28, receta_id: "REC-CHAUFA", producto_id: 25, nombre: "Zanahoria", cantidad: 1, unidad_medida: "und", orden: 3 },
  { id: 29, receta_id: "REC-CHAUFA", producto_id: 26, nombre: "Arvejas", cantidad: 80, unidad_medida: "gr", orden: 4 },
  { id: 30, receta_id: "REC-CHAUFA", producto_id: 41, nombre: "Sillao", cantidad: 2, unidad_medida: "cda", orden: 5 },

  { id: 31, receta_id: "REC-TALLARIN", producto_id: 34, nombre: "Tallarines", cantidad: 300, unidad_medida: "gr", orden: 0 },
  { id: 32, receta_id: "REC-TALLARIN", producto_id: 39, nombre: "Espinaca", cantidad: 1, unidad_medida: "atado", orden: 1 },
  { id: 33, receta_id: "REC-TALLARIN", producto_id: 5, nombre: "Queso fresco", cantidad: 100, unidad_medida: "gr", orden: 2 },
  { id: 34, receta_id: "REC-TALLARIN", producto_id: 16, nombre: "Leche", cantidad: 100, unidad_medida: "ml", orden: 3 },
  { id: 35, receta_id: "REC-TALLARIN", producto_id: 30, nombre: "Ajo", cantidad: 2, unidad_medida: "und", orden: 4 },

  { id: 36, receta_id: "REC-SECO", producto_id: 20, nombre: "Carne de res", cantidad: 500, unidad_medida: "gr", orden: 0 },
  { id: 37, receta_id: "REC-SECO", producto_id: 29, nombre: "Culantro", cantidad: 1, unidad_medida: "atado", orden: 1 },
  { id: 38, receta_id: "REC-SECO", producto_id: 7, nombre: "Cebolla roja", cantidad: 1, unidad_medida: "und", orden: 2 },
  { id: 39, receta_id: "REC-SECO", producto_id: 30, nombre: "Ajo", cantidad: 3, unidad_medida: "und", orden: 3 },
  { id: 40, receta_id: "REC-SECO", producto_id: 26, nombre: "Arvejas", cantidad: 100, unidad_medida: "gr", orden: 4 },
  { id: 41, receta_id: "REC-SECO", producto_id: 24, nombre: "Frejol canario", cantidad: 250, unidad_medida: "gr", orden: 5 },
  { id: 42, receta_id: "REC-SECO", producto_id: 10, nombre: "Arroz", cantidad: 300, unidad_medida: "gr", orden: 6 },

  { id: 43, receta_id: "REC-LENTEJAS", producto_id: 23, nombre: "Lentejas", cantidad: 250, unidad_medida: "gr", orden: 0 },
  { id: 44, receta_id: "REC-LENTEJAS", producto_id: 25, nombre: "Zanahoria", cantidad: 1, unidad_medida: "und", orden: 1 },
  { id: 45, receta_id: "REC-LENTEJAS", producto_id: 7, nombre: "Cebolla roja", cantidad: 1, unidad_medida: "und", orden: 2 },
  { id: 46, receta_id: "REC-LENTEJAS", producto_id: 30, nombre: "Ajo", cantidad: 2, unidad_medida: "und", orden: 3 },
  { id: 47, receta_id: "REC-LENTEJAS", producto_id: 38, nombre: "Zapallo", cantidad: 200, unidad_medida: "gr", orden: 4 },
  { id: 48, receta_id: "REC-LENTEJAS", producto_id: 8, nombre: "Tomate italiano", cantidad: 1, unidad_medida: "und", orden: 5 },

  { id: 49, receta_id: "REC-FREJOLES", producto_id: 24, nombre: "Frejol canario", cantidad: 300, unidad_medida: "gr", orden: 0 },
  { id: 50, receta_id: "REC-FREJOLES", producto_id: 21, nombre: "Carne de cerdo", cantidad: 250, unidad_medida: "gr", orden: 1 },
  { id: 51, receta_id: "REC-FREJOLES", producto_id: 31, nombre: "Ají panca", cantidad: 2, unidad_medida: "cda", orden: 2 },
  { id: 52, receta_id: "REC-FREJOLES", producto_id: 7, nombre: "Cebolla roja", cantidad: 1, unidad_medida: "und", orden: 3 },
  { id: 53, receta_id: "REC-FREJOLES", producto_id: 30, nombre: "Ajo", cantidad: 2, unidad_medida: "und", orden: 4 },
  { id: 54, receta_id: "REC-FREJOLES", producto_id: 10, nombre: "Arroz", cantidad: 300, unidad_medida: "gr", orden: 5 },

  { id: 55, receta_id: "REC-CHUPE", producto_id: 18, nombre: "Camarones", cantidad: 300, unidad_medida: "gr", orden: 0 },
  { id: 56, receta_id: "REC-CHUPE", producto_id: 27, nombre: "Choclo", cantidad: 1, unidad_medida: "und", orden: 1 },
  { id: 57, receta_id: "REC-CHUPE", producto_id: 1, nombre: "Papa amarilla", cantidad: 2, unidad_medida: "und", orden: 2 },
  { id: 58, receta_id: "REC-CHUPE", producto_id: 16, nombre: "Leche", cantidad: 200, unidad_medida: "ml", orden: 3 },
  { id: 59, receta_id: "REC-CHUPE", producto_id: 5, nombre: "Queso fresco", cantidad: 100, unidad_medida: "gr", orden: 4 },
  { id: 60, receta_id: "REC-CHUPE", producto_id: 12, nombre: "Huevo", cantidad: 2, unidad_medida: "und", orden: 5 },
  { id: 61, receta_id: "REC-CHUPE", producto_id: 30, nombre: "Ajo", cantidad: 2, unidad_medida: "und", orden: 6 },

  { id: 62, receta_id: "REC-CONCHAS", producto_id: 19, nombre: "Conchas de abanico", cantidad: 12, unidad_medida: "und", orden: 0 },
  { id: 63, receta_id: "REC-CONCHAS", producto_id: 5, nombre: "Queso fresco", cantidad: 100, unidad_medida: "gr", orden: 1 },
  { id: 64, receta_id: "REC-CONCHAS", producto_id: 16, nombre: "Leche", cantidad: 50, unidad_medida: "ml", orden: 2 },
  { id: 65, receta_id: "REC-CONCHAS", producto_id: 30, nombre: "Ajo", cantidad: 1, unidad_medida: "und", orden: 3 },
  { id: 66, receta_id: "REC-CONCHAS", producto_id: 35, nombre: "Aceite vegetal", cantidad: 15, unidad_medida: "ml", orden: 4 },
  { id: 67, receta_id: "REC-CONCHAS", producto_id: 28, nombre: "Limón", cantidad: 1, unidad_medida: "und", orden: 5 },

  { id: 68, receta_id: "REC-PAPARELLENA", producto_id: 1, nombre: "Papa amarilla", cantidad: 6, unidad_medida: "und", orden: 0 },
  { id: 69, receta_id: "REC-PAPARELLENA", producto_id: 20, nombre: "Carne de res", cantidad: 250, unidad_medida: "gr", orden: 1 },
  { id: 70, receta_id: "REC-PAPARELLENA", producto_id: 7, nombre: "Cebolla roja", cantidad: 1, unidad_medida: "und", orden: 2 },
  { id: 71, receta_id: "REC-PAPARELLENA", producto_id: 8, nombre: "Tomate italiano", cantidad: 1, unidad_medida: "und", orden: 3 },
  { id: 72, receta_id: "REC-PAPARELLENA", producto_id: 12, nombre: "Huevo", cantidad: 2, unidad_medida: "und", orden: 4 },
  { id: 73, receta_id: "REC-PAPARELLENA", producto_id: 30, nombre: "Ajo", cantidad: 2, unidad_medida: "und", orden: 5 },
  { id: 74, receta_id: "REC-PAPARELLENA", producto_id: 35, nombre: "Aceite vegetal", cantidad: 500, unidad_medida: "ml", orden: 6 },

  { id: 75, receta_id: "REC-TACUTACU", producto_id: 24, nombre: "Frejol canario", cantidad: 250, unidad_medida: "gr", orden: 0 },
  { id: 76, receta_id: "REC-TACUTACU", producto_id: 10, nombre: "Arroz", cantidad: 250, unidad_medida: "gr", orden: 1 },
  { id: 77, receta_id: "REC-TACUTACU", producto_id: 7, nombre: "Cebolla roja", cantidad: 1, unidad_medida: "und", orden: 2 },
  { id: 78, receta_id: "REC-TACUTACU", producto_id: 30, nombre: "Ajo", cantidad: 2, unidad_medida: "und", orden: 3 },
  { id: 79, receta_id: "REC-TACUTACU", producto_id: 31, nombre: "Ají panca", cantidad: 1, unidad_medida: "cda", orden: 4 },
  { id: 80, receta_id: "REC-TACUTACU", producto_id: 12, nombre: "Huevo", cantidad: 2, unidad_medida: "und", orden: 5 },
  { id: 81, receta_id: "REC-TACUTACU", producto_id: 35, nombre: "Aceite vegetal", cantidad: 30, unidad_medida: "ml", orden: 6 },

  { id: 82, receta_id: "REC-ROCOTO", producto_id: 32, nombre: "Rocoto", cantidad: 4, unidad_medida: "und", orden: 0 },
  { id: 83, receta_id: "REC-ROCOTO", producto_id: 20, nombre: "Carne de res", cantidad: 300, unidad_medida: "gr", orden: 1 },
  { id: 84, receta_id: "REC-ROCOTO", producto_id: 7, nombre: "Cebolla roja", cantidad: 1, unidad_medida: "und", orden: 2 },
  { id: 85, receta_id: "REC-ROCOTO", producto_id: 8, nombre: "Tomate italiano", cantidad: 1, unidad_medida: "und", orden: 3 },
  { id: 86, receta_id: "REC-ROCOTO", producto_id: 12, nombre: "Huevo", cantidad: 1, unidad_medida: "und", orden: 4 },
  { id: 87, receta_id: "REC-ROCOTO", producto_id: 14, nombre: "Nueces", cantidad: 40, unidad_medida: "gr", orden: 5 },
  { id: 88, receta_id: "REC-ROCOTO", producto_id: 5, nombre: "Queso fresco", cantidad: 100, unidad_medida: "gr", orden: 6 },

  { id: 89, receta_id: "REC-ENSALADA", producto_id: 40, nombre: "Champiñones", cantidad: 200, unidad_medida: "gr", orden: 0 },
  { id: 90, receta_id: "REC-ENSALADA", producto_id: 39, nombre: "Espinaca", cantidad: 0.5, unidad_medida: "atado", orden: 1 },
  { id: 91, receta_id: "REC-ENSALADA", producto_id: 8, nombre: "Tomate italiano", cantidad: 2, unidad_medida: "und", orden: 2 },
  { id: 92, receta_id: "REC-ENSALADA", producto_id: 11, nombre: "Palta", cantidad: 1, unidad_medida: "und", orden: 3 },
  { id: 93, receta_id: "REC-ENSALADA", producto_id: 28, nombre: "Limón", cantidad: 2, unidad_medida: "und", orden: 4 },
  { id: 94, receta_id: "REC-ENSALADA", producto_id: 25, nombre: "Zanahoria", cantidad: 1, unidad_medida: "und", orden: 5 }
];

const despensa = [
  { id: 1, producto_id: 1, nombre: "Papa amarilla", cantidad: 8, unidad_medida: "und", fecha_vencimiento: "2026-10-20", ubicacion: "Despensa" },
  { id: 2, producto_id: 2, nombre: "Pollo", cantidad: 600, unidad_medida: "gr", fecha_vencimiento: "2026-10-04", ubicacion: "Refrigerador" },
  { id: 3, producto_id: 3, nombre: "Leche evaporada", cantidad: 2, unidad_medida: "lata", fecha_vencimiento: "2026-11-12", ubicacion: "Despensa" },
  { id: 4, producto_id: 4, nombre: "Ají amarillo", cantidad: 5, unidad_medida: "und", fecha_vencimiento: "2026-10-08", ubicacion: "Refrigerador" },
  { id: 5, producto_id: 5, nombre: "Queso fresco", cantidad: 300, unidad_medida: "gr", fecha_vencimiento: "2026-10-01", ubicacion: "Refrigerador" },
  { id: 6, producto_id: 6, nombre: "Lomo fino", cantidad: 400, unidad_medida: "gr", fecha_vencimiento: "2026-10-12", ubicacion: "Refrigerador" },
  { id: 7, producto_id: 7, nombre: "Cebolla roja", cantidad: 2, unidad_medida: "und", fecha_vencimiento: "2026-10-18", ubicacion: "Despensa" },
  { id: 8, producto_id: 8, nombre: "Tomate italiano", cantidad: 4, unidad_medida: "und", fecha_vencimiento: "2026-10-15", ubicacion: "Refrigerador" },
  { id: 9, producto_id: 9, nombre: "Salsa de soya", cantidad: 1, unidad_medida: "botella", fecha_vencimiento: "2027-01-30", ubicacion: "Despensa" },
  { id: 10, producto_id: 10, nombre: "Arroz", cantidad: 1, unidad_medida: "kg", fecha_vencimiento: "2026-12-30", ubicacion: "Despensa" },
  { id: 11, producto_id: 11, nombre: "Palta", cantidad: 3, unidad_medida: "und", fecha_vencimiento: "2026-10-05", ubicacion: "Refrigerador" },
  { id: 12, producto_id: 12, nombre: "Huevo", cantidad: 6, unidad_medida: "und", fecha_vencimiento: "2026-10-25", ubicacion: "Refrigerador" },
  { id: 13, producto_id: 17, nombre: "Pescado", cantidad: 350, unidad_medida: "gr", fecha_vencimiento: "2026-11-05", ubicacion: "Refrigerador" },
  { id: 14, producto_id: 18, nombre: "Camarones", cantidad: 250, unidad_medida: "gr", fecha_vencimiento: "2026-11-06", ubicacion: "Refrigerador" },
  { id: 15, producto_id: 19, nombre: "Conchas de abanico", cantidad: 8, unidad_medida: "und", fecha_vencimiento: "2026-11-07", ubicacion: "Refrigerador" },
  { id: 16, producto_id: 22, nombre: "Pechuga de pollo", cantidad: 500, unidad_medida: "gr", fecha_vencimiento: "2026-11-06", ubicacion: "Refrigerador" },
  { id: 17, producto_id: 40, nombre: "Champiñones", cantidad: 200, unidad_medida: "gr", fecha_vencimiento: "2026-11-07", ubicacion: "Refrigerador" },
  { id: 18, producto_id: 39, nombre: "Espinaca", cantidad: 1, unidad_medida: "atado", fecha_vencimiento: "2026-11-08", ubicacion: "Refrigerador" },
  { id: 19, producto_id: 8, nombre: "Tomate italiano", cantidad: 8, unidad_medida: "und", fecha_vencimiento: "2026-11-10", ubicacion: "Refrigerador" },
  { id: 20, producto_id: 23, nombre: "Lentejas", cantidad: 500, unidad_medida: "gr", fecha_vencimiento: "2027-05-30", ubicacion: "Despensa" },
  { id: 21, producto_id: 24, nombre: "Frejol canario", cantidad: 1, unidad_medida: "kg", fecha_vencimiento: "2027-07-15", ubicacion: "Despensa" },
  { id: 22, producto_id: 34, nombre: "Tallarines", cantidad: 500, unidad_medida: "gr", fecha_vencimiento: "2027-02-28", ubicacion: "Despensa" },
  { id: 23, producto_id: 31, nombre: "Ají panca", cantidad: 200, unidad_medida: "gr", fecha_vencimiento: "2027-03-31", ubicacion: "Despensa" },
  { id: 24, producto_id: 41, nombre: "Sillao", cantidad: 1, unidad_medida: "botella", fecha_vencimiento: "2027-05-31", ubicacion: "Despensa" },
  { id: 25, producto_id: 38, nombre: "Zapallo", cantidad: 500, unidad_medida: "gr", fecha_vencimiento: "2026-11-12", ubicacion: "Refrigerador" },
  { id: 26, producto_id: 28, nombre: "Limón", cantidad: 6, unidad_medida: "und", fecha_vencimiento: "2026-11-20", ubicacion: "Refrigerador" },
  { id: 27, producto_id: 35, nombre: "Aceite vegetal", cantidad: 1, unidad_medida: "litro", fecha_vencimiento: "2027-12-31", ubicacion: "Despensa" }
];

const compras = [
  { id: 1, nombre: "Arroz Costeño 5 kg", cantidad: "1", unidad_medida: "paquete", seccion: "Supermercado", comprado: 1 },
  { id: 2, nombre: "Aceite Primor 1 L", cantidad: "1", unidad_medida: "botella", seccion: "Supermercado", comprado: 1 },
  { id: 3, nombre: "Leche Gloria x6", cantidad: "1", unidad_medida: "paquete", seccion: "Supermercado", comprado: 1 },
  { id: 4, nombre: "Galletas de agua", cantidad: "2", unidad_medida: "paquete", seccion: "Supermercado", comprado: 0 },
  { id: 5, nombre: "Nueces 200 g", cantidad: "1", unidad_medida: "paquete", seccion: "Supermercado", comprado: 0 },
  { id: 6, nombre: "Lomo fino de res", cantidad: "500 g", unidad_medida: "gr", seccion: "Mercado de abastos", comprado: 0 },
  { id: 7, nombre: "Cebolla roja", cantidad: "2 kg", unidad_medida: "kg", seccion: "Mercado de abastos", comprado: 1 },
  { id: 8, nombre: "Tomate italiano", cantidad: "1 kg", unidad_medida: "kg", seccion: "Mercado de abastos", comprado: 1 },
  { id: 9, nombre: "Ají amarillo", cantidad: "1 atado", unidad_medida: "atado", seccion: "Mercado de abastos", comprado: 0 },
  { id: 10, nombre: "Papa amarilla", cantidad: "3 kg", unidad_medida: "kg", seccion: "Mercado de abastos", comprado: 1 },
  { id: 11, nombre: "Queso fresco", cantidad: "300 g", unidad_medida: "gr", seccion: "Mercado de abastos", comprado: 1 },
  { id: 12, nombre: "Huevo", cantidad: "1 docena", unidad_medida: "docena", seccion: "Mercado de abastos", comprado: 0 },
  { id: 13, nombre: "Pescado fresco", cantidad: "500 g", unidad_medida: "gr", seccion: "Mercado de abastos", comprado: 0 },
  { id: 14, nombre: "Camarones", cantidad: "300 g", unidad_medida: "gr", seccion: "Mercado de abastos", comprado: 0 },
  { id: 15, nombre: "Conchas de abanico", cantidad: "12 unidades", unidad_medida: "und", seccion: "Mercado de abastos", comprado: 0 },
  { id: 16, nombre: "Lentejas", cantidad: "500 g", unidad_medida: "gr", seccion: "Mercado de abastos", comprado: 1 },
  { id: 17, nombre: "Frejol canario", cantidad: "1 kg", unidad_medida: "kg", seccion: "Mercado de abastos", comprado: 0 },
  { id: 18, nombre: "Ají panca", cantidad: "1 bolsa", unidad_medida: "bolsa", seccion: "Supermercado", comprado: 0 },
  { id: 19, nombre: "Tallarines", cantidad: "500 g", unidad_medida: "gr", seccion: "Supermercado", comprado: 1 },
  { id: 20, nombre: "Choclo", cantidad: "4 unidades", unidad_medida: "und", seccion: "Mercado de abastos", comprado: 0 },
  { id: 21, nombre: "Culantro", cantidad: "1 atado", unidad_medida: "atado", seccion: "Mercado de abastos", comprado: 0 },
  { id: 22, nombre: "Champiñones", cantidad: "250 g", unidad_medida: "gr", seccion: "Supermercado", comprado: 0 }
];

async function seed() {
  const lunes = lunesDe();
  return db.transaction(async (tx) => {
    // 1) Usuario demo
    let rosa = await tx.get("SELECT * FROM usuarios WHERE lower(email) = lower(?)", "rosa@haymax.pe");
    if (!rosa) {
      const r = await tx.run(
        `INSERT INTO usuarios (email, password_hash, nombre, foto_url, distrito)
         VALUES (?, ?, ?, ?, ?) RETURNING *`,
        "rosa@haymax.pe",
        bcrypt.hashSync("haymax123", 10),
        "Rosa Ticlla",
        null,
        "Surquillo"
      );
      rosa = r.row;
    }

    // 2) Hogar de Rosa + membresía
    let miembro = await tx.get("SELECT hogar_id FROM hogar_integrantes WHERE usuario_id = ? ORDER BY hogar_id LIMIT 1", rosa.id);
    let hogar = miembro && miembro.hogar_id;
    if (!hogar) {
      const r = await tx.run("INSERT INTO hogares (nombre) VALUES (?) RETURNING id", `Hogar de ${rosa.nombre}`);
      hogar = r.row.id;
    }
    await tx.run(
      "INSERT INTO hogar_integrantes (hogar_id, usuario_id, rol) VALUES (?, ?, 'admin') ON CONFLICT DO NOTHING",
      hogar,
      rosa.id
    );

    // 3) Catálogo
    for (const p of productos) {
      await tx.run(
        `INSERT INTO catalogo_productos (id, nombre, categoria, unidad_medida_base, dias_vida_util)
         VALUES (?, ?, ?, ?, ?)
         ON CONFLICT (id) DO UPDATE SET dias_vida_util = EXCLUDED.dias_vida_util`,
        p.id,
        p.nombre,
        p.categoria,
        p.unidad_medida_base,
        diasVidaUtilPorProducto(p.categoria, p.nombre)
      );
    }

    // 4) Recetas
    for (const r of recetas) {
      await tx.run(
        `INSERT INTO recetas
           (id, titulo, descripcion, imagen, porciones, tiempo_preparacion_min, dificultad, precio,
            distrito, nutri_calorias, nutri_proteinas, nutri_carbohidratos, nutri_grasas, nutri_fibra,
            pasos, autor_id, publica)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE) ON CONFLICT DO NOTHING`,
        r.id, r.titulo, r.descripcion, r.imagen, r.porciones, r.tiempo_preparacion_min, r.dificultad,
        r.precio, r.distrito, r.nutri_calorias, r.nutri_proteinas, r.nutri_carbohidratos,
        r.nutri_grasas, r.nutri_fibra, JSON.stringify(r.pasos), rosa.id
      );
    }

    // 5) Ingredientes de recetas
    for (const i of ingredientes) {
      await tx.run(
        `INSERT INTO receta_ingredientes
           (id, receta_id, producto_id, nombre, cantidad, unidad_medida, opcional, orden)
         VALUES (?, ?, ?, ?, ?, ?, FALSE, ?) ON CONFLICT DO NOTHING`,
        i.id, i.receta_id, i.producto_id, i.nombre, i.cantidad, i.unidad_medida, i.orden
      );
    }

    // 6) Despensa del hogar
    for (const d of despensa) {
      await tx.run(
        `INSERT INTO despensa
           (id, hogar_id, producto_id, nombre, cantidad, unidad_medida, fecha_vencimiento, ubicacion)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        d.id, hogar, d.producto_id, d.nombre, d.cantidad, d.unidad_medida, d.fecha_vencimiento, d.ubicacion
      );
    }

    // 7) Planes de la semana actual (lunes, martes, miércoles)
const planes = [
  { id: 1, receta_id: "REC-HUANCAINA", fecha: sumarDias(lunes, 0), comida: "desayuno", porciones: 2 },
  { id: 2, receta_id: "REC-CEVICHE", fecha: sumarDias(lunes, 0), comida: "almuerzo", porciones: 3 },
  { id: 3, receta_id: "REC-TALLARIN", fecha: sumarDias(lunes, 0), comida: "cena", porciones: 2 },

  { id: 4, receta_id: "REC-ENSALADA", fecha: sumarDias(lunes, 1), comida: "desayuno", porciones: 2 },
  { id: 5, receta_id: "REC-CHAUFA", fecha: sumarDias(lunes, 1), comida: "almuerzo", porciones: 4 },
  { id: 6, receta_id: "REC-LENTEJAS", fecha: sumarDias(lunes, 1), comida: "cena", porciones: 3 },

  { id: 7, receta_id: "REC-TALLARIN", fecha: sumarDias(lunes, 2), comida: "desayuno", porciones: 2 },
  { id: 8, receta_id: "REC-SECO", fecha: sumarDias(lunes, 2), comida: "almuerzo", porciones: 4 },
  { id: 9, receta_id: "REC-CEVICHE", fecha: sumarDias(lunes, 2), comida: "cena", porciones: 2 },

  { id: 10, receta_id: "REC-HUANCAINA", fecha: sumarDias(lunes, 3), comida: "desayuno", porciones: 3 },
  { id: 11, receta_id: "REC-FREJOLES", fecha: sumarDias(lunes, 3), comida: "almuerzo", porciones: 4 },
  { id: 12, receta_id: "REC-CHUPE", fecha: sumarDias(lunes, 3), comida: "cena", porciones: 3 },

  { id: 13, receta_id: "REC-ENSALADA", fecha: sumarDias(lunes, 4), comida: "desayuno", porciones: 2 },
  { id: 14, receta_id: "REC-PAPARELLENA", fecha: sumarDias(lunes, 4), comida: "almuerzo", porciones: 3 },
  { id: 15, receta_id: "REC-ROCOTO", fecha: sumarDias(lunes, 4), comida: "cena", porciones: 4 },

  { id: 16, receta_id: "REC-TALLARIN", fecha: sumarDias(lunes, 5), comida: "desayuno", porciones: 2 },
  { id: 17, receta_id: "REC-TACUTACU", fecha: sumarDias(lunes, 5), comida: "almuerzo", porciones: 4 },
  { id: 18, receta_id: "REC-CONCHAS", fecha: sumarDias(lunes, 5), comida: "cena", porciones: 3 },

  { id: 19, receta_id: "REC-HUANCAINA", fecha: sumarDias(lunes, 6), comida: "desayuno", porciones: 2 },
  { id: 20, receta_id: "REC-LOMO", fecha: sumarDias(lunes, 6), comida: "almuerzo", porciones: 4 },
  { id: 21, receta_id: "REC-LENTEJAS", fecha: sumarDias(lunes, 6), comida: "cena", porciones: 3 }
];

    for (const p of planes) {
      await tx.run(
        `INSERT INTO planes (id, hogar_id, receta_id, fecha, comida, porciones, completado)
         VALUES (?, ?, ?, ?, ?, ?, FALSE) ON CONFLICT DO NOTHING`,
        p.id, hogar, p.receta_id, p.fecha, p.comida, p.porciones
      );
    }

    // 8) Lista de compras
    for (const c of compras) {
      await tx.run(
        `INSERT INTO compras (id, hogar_id, nombre, cantidad, unidad_medida, seccion, comprado)
         VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT DO NOTHING`,
        c.id, hogar, c.nombre, c.cantidad, c.unidad_medida, c.seccion, Boolean(c.comprado)
      );
    }

    // 9) Favorito de ejemplo
    await tx.run(
      "INSERT INTO favoritos (usuario_id, receta_id) VALUES (?, ?) ON CONFLICT DO NOTHING",
      rosa.id,
      "REC-LOMO"
    );

    // Los datos de demo usan IDs explícitos; adelanta los identity sequences.
    for (const tabla of ["usuarios", "hogares", "catalogo_productos", "despensa", "receta_ingredientes", "planes", "compras"]) {
      await tx.run(
        `SELECT setval(pg_get_serial_sequence(?, 'id'), GREATEST(COALESCE((SELECT MAX(id) FROM ${tabla}), 1), 1), TRUE)`,
        tabla
      );
    }
    await cargarPlatosPeruanos(tx, rosa.id);
    return { hogar, usuario: rosa.email };
  });
}

seed().then((info) => {
  console.log(
    `Seed completado: usuario ${info.usuario} / haymax123, hogar #${info.hogar}, ` +
      `${productos.length} productos, ${recetas.length} recetas, ${despensa.length} insumos, ` +
      `${compras.length} compras, 3 planes, 1 favorito`
  );
  return db.pool.end();
}).catch(async (error) => {
  console.error(error);
  await db.pool.end();
  process.exitCode = 1;
});
