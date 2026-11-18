// Catálogo adicional peruano. Las cantidades corresponden al rendimiento indicado.
const platos = [
  ["ARROZPOLLO", "Arroz con pollo", 4, 60, 30, "Pollo|800|gr;Arroz|400|gr;Culantro|1|atado;Arvejas|150|gr;Zanahoria|1|und;Cebolla roja|1|und;Ajo|3|und;Ají amarillo|1|und", "Dora el pollo y resérvalo|Prepara un aderezo con cebolla, ajo y ají|Añade el culantro licuado y el pollo; cocina hasta que esté listo|Agrega el arroz, agua, arvejas y zanahoria; cocina hasta que el arroz esté listo"],
  ["CAUSA", "Causa limeña de pollo", 4, 55, 28, "Papa amarilla|8|und;Pechuga de pollo|400|gr;Ají amarillo|2|und;Limón|3|und;Palta|1|und;Mayonesa|100|gr", "Sancocha las papas, pélalas y prénsalas|Mezcla la papa con ají, limón y sal|Cocina y deshilacha el pollo; mézclalo con mayonesa|Arma capas de papa, pollo y palta y sirve fría"],
  ["ADOBO", "Adobo arequipeño", 4, 120, 38, "Carne de cerdo|800|gr;Ají panca|60|gr;Cebolla roja|2|und;Ajo|4|und;Chicha de jora|500|ml;Comino|1|cdita;Orégano|1|cdita", "Marina el cerdo con chicha, ají, ajo y comino|Dora la carne en una olla|Añade la marinada y cocina a fuego bajo hasta ablandar|Agrega cebolla y orégano; cocina unos minutos más"],
  ["JUANE", "Juane de gallina", 4, 100, 34, "Gallina|800|gr;Arroz|400|gr;Huevo|4|und;Aceitunas|4|und;Cúrcuma|1|cdita;Ajo|3|und;Hojas de bijao|4|und", "Cocina la gallina con ajo y reserva el caldo|Cocina el arroz con el caldo y cúrcuma; deja enfriar|Mezcla el arroz con huevo batido y coloca una presa y aceituna en cada porción|Envuelve en hojas de bijao limpias, amarra y hierve hasta que cuaje"],
  ["PATASCA", "Patasca", 4, 150, 32, "Mote|500|gr;Carne de res|500|gr;Hierbabuena|1|atado;Cebolla roja|1|und;Ajo|3|und;Ají panca|30|gr", "Remoja el mote según las indicaciones del envase|Cocina el mote y la carne en agua hasta que estén suaves|Prepara un aderezo de cebolla, ajo y ají e incorpóralo|Sirve caliente con hierbabuena"],
  ["OLLUQUITO", "Olluquito con carne", 4, 50, 27, "Olluco|800|gr;Carne de res|400|gr;Cebolla roja|1|und;Ajo|2|und;Ají panca|30|gr;Perejil|1|atado;Arroz|300|gr", "Corta el olluco en tiras finas y la carne en trozos|Prepara un aderezo con cebolla, ajo y ají|Dora la carne, añade el olluco y cocina tapado hasta que esté suave|Sirve con perejil y arroz cocido"],
  ["CARAPULCRA", "Carapulcra de cerdo", 4, 100, 34, "Papa seca|400|gr;Carne de cerdo|600|gr;Ají panca|60|gr;Maní|80|gr;Cebolla roja|1|und;Ajo|3|und", "Tuesta y remoja la papa seca siguiendo las indicaciones del envase|Dora el cerdo y prepara el aderezo con cebolla, ajo y ají|Añade la papa seca, agua y cerdo; cocina hasta ablandar|Incorpora el maní molido y cocina unos minutos"],
  ["CAUCAU", "Cau cau", 4, 90, 26, "Mondongo|600|gr;Papa blanca|4|und;Ají amarillo|2|und;Cebolla roja|1|und;Ajo|3|und;Hierbabuena|1|atado;Arroz|300|gr", "Cocina el mondongo hasta que esté suave y córtalo en cubos|Prepara un aderezo de cebolla, ajo y ají|Añade la papa en cubos y agua; cocina hasta que esté tierna|Agrega el mondongo y hierbabuena; sirve con arroz"],
  ["PACHAMANCAOLLA", "Pachamanca a la olla", 4, 100, 45, "Pollo|600|gr;Carne de cerdo|400|gr;Papa blanca|4|und;Camote|2|und;Choclo|2|und;Habas|200|gr;Huacatay|1|atado;Ají panca|40|gr", "Licúa el huacatay con el ají y marina las carnes|Coloca en una olla las papas, camotes, choclos y habas|Acomoda las carnes encima, tapa y cocina a fuego bajo hasta que todo esté cocido|Sirve las carnes con las verduras"],
  ["QUINUA", "Guiso de quinua", 4, 45, 20, "Quinua|300|gr;Papa blanca|3|und;Queso fresco|150|gr;Leche evaporada|1|lata;Cebolla roja|1|und;Ajo|2|und;Ají amarillo|1|und", "Lava bien la quinua y cocínala en agua|Prepara un aderezo con cebolla, ajo y ají|Añade papa en cubos y agua; cocina hasta ablandar|Incorpora la quinua, leche y queso; calienta y sirve"],
  ["TIRADITO", "Tiradito de pescado", 2, 25, 30, "Pescado|400|gr;Limón|8|und;Ají amarillo|2|und;Camote|1|und;Choclo|1|und", "Sancocha el camote y el choclo|Licúa el ají con el jugo de limón y sal|Corta el pescado fresco en láminas con utensilios limpios y mantenlo refrigerado|Baña con la salsa y sirve de inmediato con camote y choclo"],
  ["SUDADO", "Sudado de pescado", 4, 35, 32, "Pescado|800|gr;Cebolla roja|2|und;Tomate italiano|3|und;Ají amarillo|1|und;Culantro|1|atado;Yuca|1|kg", "Sancocha la yuca hasta que esté suave|Coloca cebolla, tomate y ají en una olla con un poco de agua|Acomoda el pescado y cocina tapado hasta que esté cocido|Añade culantro y sirve con la yuca"],
  ["ESTOFADO", "Estofado de pollo", 4, 60, 29, "Pollo|800|gr;Papa blanca|4|und;Zanahoria|2|und;Arvejas|150|gr;Tomate italiano|3|und;Cebolla roja|1|und;Ajo|3|und;Arroz|300|gr", "Dora el pollo y resérvalo|Prepara un aderezo de cebolla, ajo y tomate|Añade pollo, papa, zanahoria, arvejas y agua; cocina hasta que estén listos|Sirve con arroz cocido"],
  ["SOPAQUINUA", "Sopa de quinua", 4, 45, 18, "Quinua|200|gr;Papa blanca|3|und;Zanahoria|1|und;Arvejas|100|gr;Apio|1|atado;Cebolla roja|1|und;Ajo|2|und", "Lava bien la quinua|Prepara un aderezo de cebolla y ajo|Añade agua, quinua y verduras picadas|Cocina hasta que la quinua y las verduras estén tiernas"],
  ["SOLTERITO", "Solterito arequipeño", 4, 35, 21, "Habas|300|gr;Choclo|2|und;Queso fresco|200|gr;Tomate italiano|2|und;Cebolla roja|1|und;Aceitunas|8|und;Rocoto|0.5|und;Limón|2|und", "Sancocha las habas y el choclo; deja enfriar|Pica el queso, tomate, cebolla y rocoto|Mezcla con las habas, choclo y aceitunas|Aliña con limón y sal antes de servir"]
];


// Más platos caseros de costa, sierra y selva.
platos.push(
  ["ARROZMARISCOS", "Arroz con mariscos", 4, 50, 42, "Arroz|400|gr;Camarones|400|gr;Arvejas|100|gr;Cebolla roja|1|und;Ajo|3|und;Ají amarillo|1|und", "Cocina el arroz y reserva|Prepara un aderezo con cebolla, ajo y ají|Cocina los camarones y las arvejas en el aderezo|Mezcla con el arroz y sirve caliente"],
  ["CHICHARRON", "Chicharrón de cerdo", 4, 90, 38, "Carne de cerdo|800|gr;Camote|2|und;Cebolla roja|1|und;Limón|2|und", "Cocina el cerdo en agua con sal hasta que esté suave|Deja evaporar el agua y dora la carne en su propia grasa|Sancocha el camote|Sirve con cebolla y limón"],
  ["CHICHAPESCADO", "Chicharrón de pescado", 4, 40, 36, "Pescado|700|gr;Harina de trigo|100|gr;Huevo|2|und;Limón|2|und;Yuca|1|kg;Aceite vegetal|200|ml", "Sancocha la yuca|Corta el pescado, pásalo por huevo y harina|Fríe en aceite caliente hasta que esté cocido y dorado|Sirve con yuca y limón"],
  ["ARROZTAPADO", "Arroz tapado", 4, 55, 30, "Arroz|400|gr;Carne de res|500|gr;Cebolla roja|1|und;Tomate italiano|2|und;Huevo|2|und;Aceitunas|6|und", "Cocina el arroz y los huevos|Prepara un relleno con carne picada, cebolla y tomate|Añade huevo cocido y aceitunas al relleno|Sirve el relleno entre capas de arroz"],
  ["LOCS", "Locro de zapallo", 4, 45, 20, "Zapallo|800|gr;Papa blanca|3|und;Choclo|2|und;Queso fresco|150|gr;Leche evaporada|1|lata;Cebolla roja|1|und", "Prepara un aderezo con cebolla|Añade zapallo, papa y choclo con agua y cocina hasta ablandar|Aplasta parte del zapallo y añade leche y queso|Calienta y sirve"],
  ["AJIATUN", "Ají de atún", 4, 35, 22, "Atún en conserva|2|lata;Ají amarillo|2|und;Galletas de agua|6|und;Leche evaporada|1|lata;Cebolla roja|1|und;Arroz|300|gr", "Remoja las galletas en leche y licúa con el ají|Prepara un aderezo de cebolla|Añade la crema y el atún escurrido; cocina unos minutos|Sirve con arroz cocido"],
  ["TORTILLA", "Tortilla de raya", 4, 35, 27, "Raya|500|gr;Huevo|4|und;Cebolla roja|1|und;Ajo|2|und;Aceite vegetal|30|ml", "Cocina la raya y desmenúzala retirando espinas|Mezcla con huevos batidos, cebolla y ajo|Cocina por ambos lados en una sartén hasta cuajar|Sirve caliente"],
  ["CHORITOS", "Choritos a la chalaca", 4, 35, 32, "Choros|12|und;Cebolla roja|1|und;Tomate italiano|2|und;Choclo|1|und;Limón|4|und;Culantro|1|atado", "Cocina los choros bien lavados hasta que abran y descarta los que no abran|Sancocha y desgrana el choclo|Pica cebolla, tomate y culantro; mezcla con limón y choclo|Coloca la mezcla sobre los choros y sirve"],
  ["CHILCANO", "Chilcano de pescado", 4, 45, 24, "Pescado|600|gr;Cebolla roja|1|und;Apio|1|atado;Ajo|2|und;Limón|2|und;Culantro|1|atado", "Hierve agua con cebolla, apio y ajo|Añade el pescado y cocina hasta que esté listo|Retira las espinas y reparte el pescado en platos|Sirve el caldo con culantro y limón"],
  ["MENESTRON", "Menestrón peruano", 4, 80, 28, "Carne de res|400|gr;Tallarines|200|gr;Frejol canario|200|gr;Papa blanca|2|und;Zanahoria|1|und;Espinaca|1|atado;Queso fresco|100|gr", "Cocina los frejoles remojados y la carne hasta ablandar|Añade papa, zanahoria y tallarines|Licúa la espinaca con queso y agrégala a la olla|Cocina unos minutos y sirve"],
  ["SOPACRIOLLA", "Sopa criolla", 4, 40, 24, "Carne de res|400|gr;Fideos cabello de ángel|200|gr;Tomate italiano|2|und;Cebolla roja|1|und;Leche evaporada|1|lata;Huevo|4|und", "Prepara un aderezo con cebolla y tomate|Añade carne picada y cocina bien|Agrega agua y fideos; cocina hasta que estén suaves|Incorpora leche y huevos y cocina hasta cuajar"],
  ["SOPASECA", "Sopa seca chinchana", 4, 55, 29, "Pollo|600|gr;Tallarines|400|gr;Albahaca|1|atado;Tomate italiano|2|und;Cebolla roja|1|und;Ajo|3|und", "Dora el pollo y reserva|Prepara un aderezo con cebolla, ajo y tomate y añade albahaca licuada|Agrega pollo, agua y tallarines|Cocina hasta que el pollo y la pasta estén listos"],
  ["TACACHO", "Tacacho con cecina", 4, 45, 38, "Plátano verde|4|und;Cecina|600|gr;Aceite vegetal|30|ml", "Asa o cocina los plátanos pelados hasta ablandar|Machácalos y forma porciones|Cocina la cecina por ambos lados hasta que esté bien cocida|Sirve el tacacho con la cecina"],
  ["INCHICAPI", "Inchicapi de gallina", 4, 90, 35, "Gallina|800|gr;Maní|150|gr;Yuca|1|kg;Culantro|1|atado;Ajo|3|und;Harina de maíz|60|gr", "Cocina la gallina con ajo hasta ablandar|Licúa el maní y el culantro con caldo|Añade la mezcla, la yuca y la harina de maíz disuelta|Cocina hasta que la yuca esté suave y sirve"],
  ["PALLARES", "Pallares guisados", 4, 100, 19, "Pallares|400|gr;Cebolla roja|1|und;Ajo|3|und;Ají amarillo|1|und;Arroz|300|gr", "Remoja los pallares y cocínalos hasta que estén tiernos|Prepara un aderezo con cebolla, ajo y ají|Añade los pallares y un poco de su caldo; cocina hasta espesar|Sirve con arroz cocido"],
  ["ARVEJAPARTIDA", "Guiso de arveja partida", 4, 70, 18, "Arveja partida|400|gr;Zanahoria|1|und;Papa blanca|2|und;Cebolla roja|1|und;Ajo|2|und", "Lava y cocina la arveja partida en agua|Prepara un aderezo de cebolla y ajo|Añade papa y zanahoria y cocina hasta que estén suaves|Sirve caliente"],
  ["CEBICHOCHO", "Cebiche de chochos", 4, 25, 18, "Tarwi cocido|400|gr;Cebolla roja|1|und;Tomate italiano|2|und;Limón|4|und;Culantro|1|atado;Choclo|1|und", "Enjuaga el tarwi cocido y listo para consumo|Sancocha y desgrana el choclo|Mezcla el tarwi con cebolla, tomate, culantro y limón|Sirve con el choclo"],
  ["PAPASOCOPA", "Ocopa arequipeña", 4, 35, 20, "Papa blanca|6|und;Huacatay|1|atado;Ají amarillo|2|und;Maní|80|gr;Galletas de agua|4|und;Queso fresco|100|gr;Leche evaporada|1|lata", "Sancocha las papas y pélalas|Licúa huacatay, ají, maní, galletas, queso y leche|Ajusta la consistencia con un poco de agua|Sirve la salsa sobre las papas"],
  ["HUATIA", "Huatia casera", 4, 80, 22, "Papa blanca|4|und;Camote|2|und;Choclo|2|und;Habas|300|gr;Queso fresco|200|gr", "Lava las papas y los camotes|Hornea las papas, camotes y choclos hasta que estén suaves|Sancocha las habas|Sirve las verduras con queso fresco"],
  ["HUMITAS", "Humitas saladas", 4, 70, 20, "Choclo|6|und;Queso fresco|150|gr;Cebolla roja|1|und;Ají amarillo|1|und", "Desgrana y licúa el choclo|Prepara un aderezo de cebolla y ají y mezcla con el choclo|Coloca la mezcla y el queso en hojas de choclo limpias y envuelve|Cocina al vapor hasta que la masa esté firme"],
  ["TAMAL", "Tamal de pollo", 4, 100, 28, "Harina de maíz|400|gr;Pollo|400|gr;Ají panca|40|gr;Aceitunas|4|und;Hojas de bijao|4|und", "Cocina y deshilacha el pollo|Prepara una masa con harina de maíz, agua y ají|Rellena cada hoja limpia con masa, pollo y aceituna y envuelve|Cocina al vapor hasta que la masa esté firme"],
  ["CHAUFAVERDURA", "Arroz chaufa de verduras", 4, 30, 19, "Arroz|400|gr;Huevo|3|und;Zanahoria|1|und;Arvejas|150|gr;Sillao|2|cda;Aceite vegetal|30|ml", "Cocina el arroz y deja enfriar|Saltea zanahoria y arvejas hasta que estén tiernas|Añade huevo y cocina hasta cuajar|Incorpora arroz y sillao y saltea"],
  ["TALLARINROJO", "Tallarines rojos con pollo", 4, 60, 31, "Tallarines|400|gr;Pollo|800|gr;Tomate italiano|5|und;Zanahoria|1|und;Cebolla roja|1|und;Ajo|3|und", "Dora el pollo|Prepara una salsa con tomate, zanahoria, cebolla y ajo licuados|Cocina el pollo en la salsa hasta que esté listo|Sirve sobre tallarines cocidos"],
  ["ESCABECHE", "Escabeche de pollo", 4, 60, 30, "Pollo|800|gr;Cebolla roja|2|und;Ají amarillo|2|und;Vinagre|80|ml;Camote|2|und;Huevo|2|und", "Cocina el pollo hasta que esté listo y dora las presas|Prepara cebolla y ají con vinagre y un poco de agua|Sancocha camote y huevo|Sirve el pollo con la salsa, camote y huevo"],
  ["SALTADOVERDURA", "Saltado de verduras", 4, 30, 22, "Champiñones|300|gr;Cebolla roja|1|und;Tomate italiano|2|und;Ají amarillo|1|und;Sillao|2|cda;Arroz|300|gr", "Cocina el arroz|Corta las verduras y champiñones|Saltea a fuego alto y añade sillao|Sirve con arroz"]
);

platos.push(
  ["ARROZZAPALLO", "Arroz con zapallo", 4, 45, 18, "Arroz|400|gr;Zapallo|600|gr;Arvejas|100|gr;Cebolla roja|1|und;Ajo|2|und", "Prepara un aderezo de cebolla y ajo|Añade zapallo picado y agua y cocina hasta ablandar|Incorpora arroz y arvejas|Cocina tapado hasta que el arroz esté listo"],
  ["PESCADOPLANCHA", "Pescado a la plancha con yuca", 4, 35, 30, "Pescado|800|gr;Yuca|1|kg;Limón|2|und;Ajo|2|und;Aceite vegetal|20|ml", "Sancocha la yuca hasta que esté suave|Sazona el pescado con ajo y limón|Cocina el pescado por ambos lados hasta que esté listo|Sirve con la yuca"],
  ["ENSALADAQUINUA", "Ensalada de quinua y palta", 4, 30, 20, "Quinua|250|gr;Palta|2|und;Tomate italiano|2|und;Limón|2|und;Culantro|1|atado", "Lava y cocina la quinua; deja enfriar|Pica la palta, el tomate y el culantro|Mezcla con la quinua|Aliña con limón y sirve"],
  ["GUISOTARWI", "Guiso de tarwi", 4, 40, 20, "Tarwi cocido|500|gr;Papa blanca|3|und;Cebolla roja|1|und;Ají amarillo|1|und;Queso fresco|100|gr", "Enjuaga el tarwi cocido y listo para consumo|Prepara un aderezo con cebolla y ají|Añade papa picada y agua y cocina hasta ablandar|Agrega el tarwi y queso, calienta y sirve"],
  ["PURPAPA", "Puré de papa con pollo", 4, 55, 28, "Papa blanca|6|und;Leche evaporada|1|lata;Pollo|800|gr;Ajo|2|und;Aceite vegetal|20|ml", "Sancocha y prensa las papas|Mezcla con leche hasta obtener un puré|Sazona el pollo con ajo y cocínalo hasta que esté listo|Sirve el pollo con el puré"],
  ["PICANTEPAPA", "Picante de papa", 4, 40, 18, "Papa blanca|6|und;Ají amarillo|2|und;Cebolla roja|1|und;Ajo|2|und;Queso fresco|150|gr;Arroz|300|gr", "Sancocha las papas y córtalas en cubos|Prepara un aderezo con cebolla, ajo y ají|Añade la papa y un poco de agua y cocina unos minutos|Agrega queso y sirve con arroz"],
  ["CHOCLOQUESO", "Choclo con queso", 4, 30, 16, "Choclo|4|und;Queso fresco|300|gr", "Retira las hojas y hebras de los choclos|Cocínalos en agua hasta que estén tiernos|Corta el queso en porciones|Sirve el choclo caliente con queso"],
  ["SOPAOLLUCO", "Sopa de olluco", 4, 45, 18, "Olluco|500|gr;Papa blanca|2|und;Zanahoria|1|und;Cebolla roja|1|und;Ajo|2|und;Perejil|1|atado", "Lava y corta el olluco y las verduras|Prepara un aderezo con cebolla y ajo|Agrega agua, olluco, papa y zanahoria|Cocina hasta que estén suaves y sirve con perejil"],
  ["ENSALADAHABAS", "Ensalada de habas y queso", 4, 30, 19, "Habas|400|gr;Queso fresco|200|gr;Tomate italiano|2|und;Cebolla roja|1|und;Limón|2|und", "Sancocha las habas hasta que estén tiernas y deja enfriar|Pica queso, tomate y cebolla|Mezcla todo y añade limón|Sirve fresca"],
  ["GUISOCHOCLO", "Guiso de choclo y queso", 4, 40, 20, "Choclo|4|und;Queso fresco|200|gr;Leche evaporada|1|lata;Cebolla roja|1|und;Ají amarillo|1|und", "Desgrana el choclo|Prepara un aderezo con cebolla y ají|Añade el choclo con agua y cocina hasta ablandar|Incorpora leche y queso; calienta y sirve"]
);

// Desayunos peruanos disponibles en el filtro de planificaci\u00f3n.
platos.push(
  ["DESAYUNOQUINUA", "Quinua at\u00f3mica con leche", 2, 25, 12, "Quinua|120|gr;Leche|500|ml;Platano de seda|1|und;Canela|1|gr", "Lava la quinua y coc\u00ednala con agua hasta que reviente|Agrega la leche y cocina a fuego bajo|Sirve con pl\u00e1tano picado y canela", "desayuno"],
  ["AVENAMACA", "Avena con maca y frutas", 2, 15, 11, "Avena|100|gr;Maca|10|gr;Leche|400|ml;Manzana|1|und;Platano de seda|1|und", "Hierve la avena con leche y maca, moviendo hasta espesar|Pica la manzana y el pl\u00e1tano|Sirve la avena con la fruta", "desayuno"],
  ["PANTORTILLA", "Pan con tortilla de huevo y palta", 2, 20, 14, "Pan frances|2|und;Huevo|3|und;Palta|1|und;Cebolla roja|0.25|und", "Bate los huevos con cebolla picada|Cocina la tortilla en una sart\u00e9n hasta cuajar|Abre los panes y rellena con tortilla y palta", "desayuno"],
  ["TAMALCRIOLLO", "Tamal criollo", 4, 90, 24, "Harina de ma\u00edz|400|gr;Pollo|300|gr;Aceitunas|4|und;Huevo|2|und;Cebolla roja|1|und;Ajo|2|und", "Prepara un aderezo de cebolla y ajo y cocina el pollo|Mezcla la harina con caldo hasta formar una masa suave|Rellena porciones con pollo, huevo y aceituna|Envuelve y cocina al vapor hasta que la masa est\u00e9 firme", "desayuno"],
  ["SANGUCHEDESPOLLO", "S\u00e1nguche de pollo deshilachado", 2, 25, 16, "Pan frances|2|und;Pechuga de pollo|250|gr;Mayonesa|30|gr;Lechuga|2|hoja;Palta|1|und", "Cocina el pollo y deshil\u00e1chalo|Mezcla con mayonesa|Abre los panes y agrega pollo, lechuga y palta", "desayuno"],
  ["MAZAMORRAMORADA", "Mazamorra morada", 4, 50, 15, "Maiz morado|300|gr;Pina|0.5|und;Manzana|1|und;Chuno|40|gr;Canela|2|gr;Clavo de olor|1|gr", "Hierve el ma\u00edz morado con canela y clavo y cuela el l\u00edquido|Agrega pi\u00f1a y manzana picadas y cocina hasta ablandar|Disuelve el chu\u00f1o en agua fr\u00eda, incorp\u00f3ralo y mueve hasta espesar", "desayuno"]
);

// Cada receta tiene una foto distinta. Las URLs de Unsplash son absolutas y se
// guardan completas en la base de datos para que Expo no las trate como rutas
// del API.
const imagenUnsplash = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=1200&q=80`;
const IMAGENES_POR_PLATO = {
  // Platos peruanos con fotografías específicas de Wikimedia Commons
  ARROZPOLLO: "https://upload.wikimedia.org/wikipedia/commons/e/e6/Arroz_con_pollo_peruano.jpg",
  CAUSA: "https://upload.wikimedia.org/wikipedia/commons/6/6a/Causa_Peruvian_dish.jpg",
  ADOBO: "https://upload.wikimedia.org/wikipedia/commons/0/08/Adobo_Arequipe%C3%B1o.jpg",
  JUANE: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Juane%2C_plato_emblema_de_la_selva_del_Per%C3%BA.jpg",
  PATASCA: "https://upload.wikimedia.org/wikipedia/commons/0/09/Patasca.jpg",
  OLLUQUITO: "https://upload.wikimedia.org/wikipedia/commons/2/2e/Olluquitos.jpg",
  CARAPULCRA: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Carapulcra.jpg",
  CAUCAU: "https://upload.wikimedia.org/wikipedia/commons/6/67/Caucau.jpg",
  PACHAMANCAOLLA: "https://upload.wikimedia.org/wikipedia/commons/9/9d/Pachamanca_Peru.JPG",
  SUDADO: "https://upload.wikimedia.org/wikipedia/commons/9/92/Pescado_sudado_%28dorada%29.jpg",
  SOLTERITO: "https://upload.wikimedia.org/wikipedia/commons/4/48/Solterito.jpg",
  ARROZMARISCOS: "https://upload.wikimedia.org/wikipedia/commons/f/f5/Arroz_con_mariscos.jpg",
  CHICHARRON: "https://upload.wikimedia.org/wikipedia/commons/9/9a/Chicharrones_Peru.jpg",
  CHICHAPESCADO: "https://upload.wikimedia.org/wikipedia/commons/c/c7/Chicharr%C3%B3n_de_pescado.jpg",
  TORTILLA: "https://upload.wikimedia.org/wikipedia/commons/1/1f/Tortilla_de_raya_2.JPG",
  CHORITOS: "https://upload.wikimedia.org/wikipedia/commons/d/da/Choritos_a_la_chalaca.JPG",
  MENESTRON: "https://upload.wikimedia.org/wikipedia/commons/c/cc/Menestr%C3%B3n_Peru.jpg",
  TACACHO: "https://upload.wikimedia.org/wikipedia/commons/1/11/Tacacho_con_cecina.jpg",
  INCHICAPI: "https://upload.wikimedia.org/wikipedia/commons/e/ef/Inchicapi%2C_comida_t%C3%ADpica_de_la_selva_peruana.jpg",
  PAPASOCOPA: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Peru_Ocopa.jpg",
  HUMITAS: "https://upload.wikimedia.org/wikipedia/commons/4/4a/Humitas_%281%29.jpg",
  CHAUFAVERDURA: "https://upload.wikimedia.org/wikipedia/commons/0/0b/Arroz_chaufa.JPG",
  MAZAMORRAMORADA: "https://upload.wikimedia.org/wikipedia/commons/d/d6/Mazamorra_morada_peruana.jpg",

  // Guisos y platos de preparación casera: Unsplash
  QUINUA: imagenUnsplash("1731328351443-ea233d9b8037"),
  ESTOFADO: imagenUnsplash("1731328351443-ea233d9b8037"),
  ARROZTAPADO: imagenUnsplash("1731328351443-ea233d9b8037"),
  LOCS: imagenUnsplash("1731328351443-ea233d9b8037"),
  AJIATUN: imagenUnsplash("1731328351443-ea233d9b8037"),
  PALLARES: imagenUnsplash("1731328351443-ea233d9b8037"),
  ARVEJAPARTIDA: imagenUnsplash("1731328351443-ea233d9b8037"),
  HUATIA: imagenUnsplash("1676300185165-3f543c1fcb72"),
  TAMAL: imagenUnsplash("1676300185165-3f543c1fcb72"),
  TALLARINROJO: imagenUnsplash("1563379926898-05f4575a45d8"),
  ESCABECHE: imagenUnsplash("1731328351443-ea233d9b8037"),
  SALTADOVERDURA: imagenUnsplash("1747292718361-c838a9968ec7"),
  ARROZZAPALLO: imagenUnsplash("1731328351443-ea233d9b8037"),
  GUISOTARWI: imagenUnsplash("1731328351443-ea233d9b8037"),
  PURPAPA: imagenUnsplash("1676300185165-3f543c1fcb72"),
  PICANTEPAPA: imagenUnsplash("1731328351443-ea233d9b8037"),
  CHOCLOQUESO: imagenUnsplash("1676300185165-3f543c1fcb72"),
  GUISOCHOCLO: imagenUnsplash("1731328351443-ea233d9b8037"),

  // Sopas y caldos: Unsplash
  SOPAQUINUA: imagenUnsplash("1652088079703-38f4a8d6b981"),
  CHILCANO: imagenUnsplash("1652088079703-38f4a8d6b981"),
  SOPACRIOLLA: imagenUnsplash("1731328351443-ea233d9b8037"),
  SOPASECA: imagenUnsplash("1563379926898-05f4575a45d8"),
  SOPAOLLUCO: imagenUnsplash("1652088079703-38f4a8d6b981"),

  // Pescados y preparaciones marinas: Unsplash
  TIRADITO: imagenUnsplash("1652498199372-30dfd622ceef"),
  PESCADOPLANCHA: imagenUnsplash("1676300185165-3f543c1fcb72"),

  // Ensaladas: Unsplash
  CEBICHOCHO: imagenUnsplash("1747292718361-c838a9968ec7"),
  ENSALADAQUINUA: imagenUnsplash("1747292718361-c838a9968ec7"),
  ENSALADAHABAS: imagenUnsplash("1747292718361-c838a9968ec7"),

  // Desayunos y preparaciones con pan: Unsplash
  DESAYUNOQUINUA: imagenUnsplash("1702648982253-8b851013e81f"),
  AVENAMACA: imagenUnsplash("1702648982253-8b851013e81f"),
  PANTORTILLA: imagenUnsplash("1685381918549-6bbc1f2503de"),
  TAMALCRIOLLO: imagenUnsplash("1676300185165-3f543c1fcb72"),
  SANGUCHEDESPOLLO: imagenUnsplash("1685381918549-6bbc1f2503de")
};

for (const plato of platos) {
  if (!["desayuno", "almuerzo", "cena", "todas"].includes(plato[7])) plato[7] = undefined;
  const imagen = IMAGENES_POR_PLATO[plato[0]];
  if (!imagen) throw new Error(`Falta una imagen para el plato ${plato[0]}`);
  plato[8] = imagen;
}

const categorias = {
  "Mayonesa": ["Secos", "gr"], "Chicha de jora": ["Bebidas", "ml"], "Comino": ["Condimentos", "gr"],
  "Orégano": ["Condimentos", "gr"], "Gallina": ["Carnes", "gr"], "Aceitunas": ["Secos", "und"],
  "Cúrcuma": ["Condimentos", "gr"], "Hojas de bijao": ["Verduras", "und"], "Mote": ["Secos", "gr"],
  "Hierbabuena": ["Verduras", "atado"], "Olluco": ["Verduras", "gr"], "Perejil": ["Verduras", "atado"],
  "Papa seca": ["Secos", "gr"], "Maní": ["Secos", "gr"], "Mondongo": ["Carnes", "gr"],
  "Papa blanca": ["Verduras", "und"], "Habas": ["Menestras", "gr"], "Huacatay": ["Verduras", "atado"],
  "Quinua": ["Secos", "gr"], "Apio": ["Verduras", "atado"],
  "Harina de trigo": ["Secos", "gr"], "Atún en conserva": ["Secos", "lata"], "Raya": ["Mariscos", "gr"], "Choros": ["Mariscos", "und"],
  "Fideos cabello de ángel": ["Pastas", "gr"], "Albahaca": ["Verduras", "atado"], "Plátano verde": ["Frutas", "und"],
  "Cecina": ["Carnes", "gr"], "Harina de maíz": ["Secos", "gr"], "Pallares": ["Menestras", "gr"],
  "Arveja partida": ["Menestras", "gr"], "Tarwi cocido": ["Menestras", "gr"], "Vinagre": ["Condimentos", "ml"],
  "Avena": ["Secos", "gr"], "Maca": ["Secos", "gr"], "Manzana": ["Frutas", "und"],
  "Platano de seda": ["Frutas", "und"], "Pan frances": ["Secos", "und"], "Canela": ["Condimentos", "gr"],
  "Maiz morado": ["Secos", "gr"], "Pina": ["Frutas", "und"], "Chuno": ["Secos", "gr"],
  "Clavo de olor": ["Condimentos", "gr"], "Lechuga": ["Verduras", "hoja"]
};

const { diasVidaUtilPorProducto } = require("./vida-util");

async function cargarPlatosPeruanos(tx, autorId) {
  const cenas = new Set(["SOPAQUINUA", "CHILCANO", "MENESTRON", "SOPAOLLUCO"]);
  for (const [codigo, titulo, porciones, minutos, precio, lista, pasos, tipoComida, imagen] of platos) {
    const id = `REC-PE-${codigo}`;
    const tipo = tipoComida || (cenas.has(codigo) ? "cena" : "almuerzo");
    const creado = await tx.get(
      `INSERT INTO recetas (id, titulo, descripcion, imagen, porciones, tiempo_preparacion_min, dificultad, precio, pasos, autor_id, publica, tipo_comida)
       VALUES (?, ?, ?, ?, ?, ?, 'media', ?, ?, ?, TRUE, ?) ON CONFLICT (id) DO NOTHING RETURNING id`,
      id, titulo, `Receta peruana de ${titulo.toLowerCase()}.`, imagen, porciones, minutos, precio, JSON.stringify(pasos.split('|')), autorId, tipo
    );
    if (!creado) {
      await tx.run("UPDATE recetas SET tipo_comida = ?, imagen = ? WHERE id = ?", tipo, imagen, id);
    }
    for (const [orden, entrada] of lista.split(';').entries()) {
      const [nombre, cantidad, unidad] = entrada.split('|');
      const existente = await tx.get(
        "SELECT categoria, unidad_medida_base FROM catalogo_productos WHERE nombre = ?",
        nombre
      );
      const [categoria, unidadBase] = categorias[nombre] || [
        existente ? existente.categoria : "Secos",
        existente ? existente.unidad_medida_base : unidad,
      ];
      await tx.run(
        `INSERT INTO catalogo_productos (nombre, categoria, unidad_medida_base, dias_vida_util)
         VALUES (?, ?, ?, ?)
         ON CONFLICT (nombre) DO UPDATE SET dias_vida_util = EXCLUDED.dias_vida_util`,
        nombre,
        categoria,
        unidadBase,
        diasVidaUtilPorProducto(categoria, nombre)
      );
      // Nunca alterar los ingredientes de una receta que ya existe.
      if (!creado) continue;
      const producto = await tx.get("SELECT id FROM catalogo_productos WHERE nombre = ?", nombre);
      await tx.run("INSERT INTO receta_ingredientes (receta_id, producto_id, nombre, cantidad, unidad_medida, orden) VALUES (?, ?, ?, ?, ?, ?)", id, producto.id, nombre, Number(cantidad), unidad, orden);
    }
  }
}

module.exports = { cargarPlatosPeruanos, platos };
