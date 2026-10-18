-- ============================================================================
-- Migration: 20261018000005_seed_foods.sql
-- Sprint: 5 — Nutrición
-- Description: Seed de ~200 alimentos base con macros por 100g
-- Source: USDA FoodData Central (aproximados)
-- ============================================================================

-- Proteínas animales (30)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Pechuga de pollo',                'protein', 165.0, 31.0,  0.0,  3.6, 0.0, 150.0, '1 pechuga'),
  ('Muslo de pollo',                  'protein', 209.0, 26.0,  0.0, 10.9, 0.0, 120.0, '1 muslo'),
  ('Carne picada magra (5% grasa)',   'protein', 137.0, 21.4,  0.0,  5.0, 0.0, 150.0, NULL),
  ('Carne picada (15% grasa)',        'protein', 250.0, 26.0,  0.0, 15.0, 0.0, 150.0, NULL),
  ('Bife de chorizo',                 'protein', 271.0, 25.0,  0.0, 19.0, 0.0, 200.0, '1 bife'),
  ('Lomo de cerdo',                   'protein', 143.0, 26.0,  0.0,  3.5, 0.0, 150.0, NULL),
  ('Chuleta de cerdo',                'protein', 242.0, 27.0,  0.0, 14.0, 0.0, 180.0, '1 chuleta'),
  ('Salmón',                          'protein', 208.0, 20.0,  0.0, 13.0, 0.0, 150.0, '1 filete'),
  ('Atún fresco',                     'protein', 132.0, 28.0,  0.0,  1.3, 0.0, 150.0, NULL),
  ('Atún en lata al agua',            'protein', 116.0, 26.0,  0.0,  0.8, 0.0, 120.0, '1 lata escurrida'),
  ('Merluza',                         'protein',  86.0, 17.0,  0.0,  1.8, 0.0, 150.0, NULL),
  ('Tilapia',                         'protein',  96.0, 20.0,  0.0,  1.7, 0.0, 150.0, NULL),
  ('Sardinas en lata',                'protein', 208.0, 25.0,  0.0, 11.5, 0.0, 90.0,  '1 lata'),
  ('Huevo entero',                    'protein', 143.0, 12.6,  0.7,  9.5, 0.0, 50.0,  '1 huevo'),
  ('Clara de huevo',                  'protein',  52.0, 10.9,  0.7,  0.2, 0.0, 33.0,  '1 clara'),
  ('Yema de huevo',                   'protein', 322.0, 15.9,  3.6, 26.5, 0.0, 17.0,  '1 yema'),
  ('Pavo (pechuga)',                  'protein', 135.0, 30.0,  0.0,  1.0, 0.0, 150.0, NULL),
  ('Jamón cocido',                    'protein', 145.0, 18.0,  1.5,  7.0, 0.0, 40.0,  '2 fetas'),
  ('Jamón crudo',                     'protein', 268.0, 26.0,  0.3, 18.0, 0.0, 30.0,  '2 fetas'),
  ('Bondiola de cerdo',               'protein', 518.0, 11.0,  0.0, 53.0, 0.0, 100.0, NULL),
  ('Riñón de vaca',                   'protein',  99.0, 17.0,  0.9,  3.0, 0.0, 150.0, NULL),
  ('Hígado de vaca',                  'protein', 135.0, 20.0,  3.9,  3.6, 0.0, 150.0, NULL),
  ('Cordero (pierna)',                'protein', 258.0, 25.0,  0.0, 16.5, 0.0, 150.0, NULL),
  ('Conejo',                          'protein', 173.0, 33.0,  0.0,  3.5, 0.0, 150.0, NULL),
  ('Camarones',                       'protein',  99.0, 24.0,  0.2,  0.3, 0.0, 100.0, NULL),
  ('Langostinos',                     'protein',  85.0, 20.0,  0.0,  0.3, 0.0, 100.0, NULL),
  ('Mejillones',                      'protein',  86.0, 12.0,  3.7,  2.2, 0.0, 100.0, NULL),
  ('Calamar',                         'protein',  92.0, 15.6,  3.1,  1.4, 0.0, 100.0, NULL),
  ('Pulpo',                           'protein',  82.0, 15.0,  2.2,  1.0, 0.0, 100.0, NULL),
  ('Anchoas en aceite',               'protein', 210.0, 29.0,  0.0, 10.0, 0.0, 30.0,  '1 porción')
ON CONFLICT (name) DO NOTHING;

-- Lácteos (15)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Leche entera',            'dairy',  61.0,  3.2,  4.8,  3.3, 0.0, 250.0, '1 vaso'),
  ('Leche descremada',        'dairy',  34.0,  3.4,  5.0,  0.1, 0.0, 250.0, '1 vaso'),
  ('Leche semidescremada',    'dairy',  47.0,  3.3,  4.9,  1.7, 0.0, 250.0, '1 vaso'),
  ('Yogur natural entero',    'dairy',  61.0,  3.5,  4.7,  3.3, 0.0, 150.0, '1 pote'),
  ('Yogur griego natural',    'dairy',  97.0,  9.0,  3.6,  5.0, 0.0, 170.0, '1 pote'),
  ('Yogur descremado',        'dairy',  35.0,  4.0,  4.5,  0.1, 0.0, 150.0, '1 pote'),
  ('Queso fresco',            'dairy',  98.0, 11.0,  3.4,  4.3, 0.0,  50.0, '1 porción'),
  ('Queso cremoso',           'dairy', 246.0,  9.0,  2.0, 22.0, 0.0,  30.0, '1 feta'),
  ('Queso mozzarella',        'dairy', 280.0, 18.0,  2.2, 22.0, 0.0,  30.0, '1 feta'),
  ('Queso cheddar',           'dairy', 402.0, 25.0,  1.3, 33.0, 0.0,  30.0, '1 feta'),
  ('Queso parmesano',         'dairy', 431.0, 38.0,  4.1, 29.0, 0.0,  15.0, '1 cda'),
  ('Ricota',                  'dairy', 174.0, 11.0,  3.0, 13.0, 0.0, 100.0, NULL),
  ('Requesón',                'dairy',  98.0, 11.0,  3.4,  4.3, 0.0, 100.0, NULL),
  ('Manteca',                 'dairy', 717.0,  0.9,  0.1, 81.0, 0.0,  10.0, '1 cdita'),
  ('Crema de leche',          'dairy', 340.0,  2.1,  2.8, 36.0, 0.0,  15.0, '1 cda')
ON CONFLICT (name) DO NOTHING;

-- Carbohidratos (25)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Arroz blanco cocido',         'carbs', 130.0, 2.7, 28.2, 0.3, 0.4, 150.0, '1 taza'),
  ('Arroz integral cocido',       'carbs', 112.0, 2.6, 23.5, 0.9, 1.8, 150.0, '1 taza'),
  ('Arroz crudo',                 'carbs', 365.0, 7.1, 80.0, 0.7, 1.3,  50.0, NULL),
  ('Pasta cocida',                'carbs', 158.0, 5.8, 30.9, 0.9, 1.8, 150.0, '1 plato'),
  ('Pasta integral cocida',       'carbs', 124.0, 5.3, 26.5, 0.5, 3.2, 150.0, '1 plato'),
  ('Pan blanco',                  'carbs', 265.0, 9.0, 49.0, 3.2, 2.7,  30.0, '1 rodaja'),
  ('Pan integral',                'carbs', 247.0, 13.0, 41.0, 3.4, 7.0,  30.0, '1 rodaja'),
  ('Pan de centeno',              'carbs', 259.0, 8.5, 48.3, 3.3, 5.8,  30.0, '1 rodaja'),
  ('Avena en hojuelas',           'carbs', 389.0, 16.9, 66.3, 6.9, 10.6, 40.0, '1/2 taza'),
  ('Harina de trigo',             'carbs', 364.0, 10.3, 76.3, 1.0, 2.7,  30.0, NULL),
  ('Harina de maíz',              'carbs', 361.0, 6.9, 76.9, 3.9, 7.3,  30.0, NULL),
  ('Papa hervida',                'carbs',  87.0, 1.9, 20.1, 0.1, 1.8, 150.0, '1 papa mediana'),
  ('Papa frita',                  'carbs', 312.0, 3.4, 41.0, 15.0, 3.8, 100.0, NULL),
  ('Batata hervida',              'carbs',  86.0, 1.6, 20.1, 0.1, 3.0, 150.0, '1 batata'),
  ('Batata asada',                'carbs',  90.0, 2.0, 20.7, 0.2, 3.3, 150.0, NULL),
  ('Mandioqui (yuca)',            'carbs', 160.0, 1.4, 38.1, 0.3, 1.8, 150.0, NULL),
  ('Choclo (maíz dulce)',         'carbs',  86.0, 3.3, 18.7, 1.4, 2.0, 150.0, '1 choclo'),
  ('Quinoa cocida',               'carbs', 120.0, 4.4, 21.3, 1.9, 2.8, 150.0, '1 taza'),
  ('Cuscús cocido',               'carbs', 112.0, 3.8, 23.2, 0.2, 1.4, 150.0, '1 taza'),
  ('Tortilla de trigo',           'carbs', 306.0, 8.0, 51.0, 7.0, 3.0,  40.0, '1 tortilla'),
  ('Pan rallado',                 'carbs', 395.0, 13.0, 72.0, 5.0, 4.5,  15.0, '1 cda'),
  ('Galletitas de agua',          'carbs', 440.0, 9.5, 72.0, 12.0, 3.0,  10.0, '3 galletitas'),
  ('Cereal de maíz',              'carbs', 378.0, 7.0, 84.0, 1.0, 3.0,  30.0, NULL),
  ('Granola',                     'carbs', 471.0, 10.0, 64.0, 20.0, 6.0,  40.0, NULL),
  ('Mijo cocido',                 'carbs', 119.0, 3.5, 23.7, 1.0, 1.3, 150.0, '1 taza')
ON CONFLICT (name) DO NOTHING;

-- Frutas (25)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Manzana',             'fruit',  52.0, 0.3, 13.8, 0.2, 2.4, 180.0, '1 manzana'),
  ('Banana',              'fruit',  89.0, 1.1, 22.8, 0.3, 2.6, 120.0, '1 banana'),
  ('Naranja',             'fruit',  47.0, 0.9, 11.8, 0.1, 2.4, 150.0, '1 naranja'),
  ('Mandarina',           'fruit',  53.0, 0.8, 13.3, 0.3, 1.8, 100.0, '1 mandarina'),
  ('Pera',                'fruit',  57.0, 0.4, 15.2, 0.1, 3.1, 170.0, '1 pera'),
  ('Durazno',             'fruit',  39.0, 0.9,  9.5, 0.3, 1.5, 150.0, '1 durazno'),
  ('Frutilla',            'fruit',  32.0, 0.7,  7.7, 0.3, 2.0, 150.0, '1 taza'),
  ('Arándano',            'fruit',  57.0, 0.7, 14.5, 0.3, 2.4, 100.0, '1 taza'),
  ('Frambuesa',           'fruit',  52.0, 1.2, 11.9, 0.7, 6.5, 100.0, '1 taza'),
  ('Uva',                 'fruit',  69.0, 0.7, 18.1, 0.2, 0.9, 100.0, '1 taza'),
  ('Sandía',              'fruit',  30.0, 0.6,  7.6, 0.2, 0.4, 200.0, '1 tajada'),
  ('Melón',               'fruit',  34.0, 0.8,  8.2, 0.2, 0.9, 200.0, '1 tajada'),
  ('Piña',                'fruit',  50.0, 0.5, 13.1, 0.1, 1.4, 150.0, '1 rodaja'),
  ('Mango',               'fruit',  60.0, 0.8, 15.0, 0.4, 1.6, 200.0, '1 mango'),
  ('Papaya',              'fruit',  43.0, 0.5, 10.8, 0.3, 1.7, 200.0, '1 taza'),
  ('Kiwi',                'fruit',  61.0, 1.1, 14.7, 0.5, 3.0, 75.0,  '1 kiwi'),
  ('Palta (aguacate)',    'fruit', 160.0, 2.0,  8.5, 14.7, 6.7, 100.0, '1/2 palta'),
  ('Limón',               'fruit',  29.0, 1.1,  9.3, 0.3, 2.8, 50.0,  '1 limón'),
  ('Pomelo',              'fruit',  42.0, 0.8, 10.7, 0.1, 1.6, 200.0, '1 pomelo'),
  ('Granada',             'fruit',  83.0, 1.7, 18.7, 1.2, 4.0, 100.0, NULL),
  ('Higo',                'fruit',  74.0, 0.8, 19.2, 0.3, 2.9, 60.0,  '1 higo'),
  ('Dátil',               'fruit', 282.0, 2.5, 75.0, 0.4, 8.0, 20.0,  '2 dátiles'),
  ('Ciruela',             'fruit',  46.0, 0.7, 11.4, 0.3, 1.4, 70.0,  '1 ciruela'),
  ('Cereza',              'fruit',  63.0, 1.1, 16.0, 0.2, 2.1, 100.0, '1 taza'),
  ('Maracuyá',            'fruit',  97.0, 2.2, 23.4, 0.7, 10.4, 100.0, NULL)
ON CONFLICT (name) DO NOTHING;

-- Verduras (30)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Brócoli',             'vegetable', 34.0, 2.8, 6.6, 0.4, 2.6, 150.0, '1 taza'),
  ('Espinaca',            'vegetable', 23.0, 2.9, 3.6, 0.4, 2.2, 100.0, '1 taza'),
  ('Lechuga',             'vegetable', 15.0, 1.4, 2.9, 0.2, 1.3, 80.0,  '1 taza'),
  ('Tomate',              'vegetable', 18.0, 0.9, 3.9, 0.2, 1.2, 150.0, '1 tomate'),
  ('Tomate cherry',       'vegetable', 18.0, 0.9, 3.9, 0.2, 1.2, 100.0, '1 taza'),
  ('Pepino',              'vegetable', 16.0, 0.7, 3.6, 0.1, 0.5, 150.0, '1/2 pepino'),
  ('Zanahoria',           'vegetable', 41.0, 0.9, 9.6, 0.2, 2.8, 80.0,  '1 zanahoria'),
  ('Cebolla',             'vegetable', 40.0, 1.1, 9.3, 0.1, 1.7, 100.0, '1 cebolla'),
  ('Cebolla morada',      'vegetable', 40.0, 1.1, 9.3, 0.1, 1.7, 100.0, NULL),
  ('Morrón rojo',         'vegetable', 31.0, 1.0, 6.0, 0.3, 2.1, 100.0, '1 morrón'),
  ('Morrón verde',        'vegetable', 20.0, 0.9, 4.6, 0.2, 1.7, 100.0, '1 morrón'),
  ('Ajo',                 'vegetable', 149.0, 6.4, 33.1, 0.5, 2.1, 5.0,  '1 diente'),
  ('Berenjena',           'vegetable', 25.0, 1.0, 5.9, 0.2, 3.0, 150.0, NULL),
  ('Zapallito (calabacín)','vegetable', 17.0, 1.2, 3.1, 0.3, 1.0, 150.0, '1 zapallito'),
  ('Zapallo',             'vegetable', 26.0, 1.0, 6.5, 0.1, 0.5, 200.0, '1 rodaja'),
  ('Calabaza',            'vegetable', 26.0, 1.0, 6.5, 0.1, 0.5, 200.0, NULL),
  ('Champiñón',           'vegetable', 22.0, 3.1, 3.3, 0.3, 1.0, 100.0, '1 taza'),
  ('Coliflor',            'vegetable', 25.0, 1.9, 5.0, 0.3, 2.0, 150.0, '1 taza'),
  ('Repollo',             'vegetable', 25.0, 1.3, 5.8, 0.1, 2.5, 100.0, '1 taza'),
  ('Repollito de Bruselas','vegetable',43.0, 3.4, 8.9, 0.3, 3.8, 100.0, '1 taza'),
  ('Apio',                'vegetable', 16.0, 0.7, 3.0, 0.2, 1.6, 80.0,  '2 tallos'),
  ('Espárrago',           'vegetable', 20.0, 2.2, 3.9, 0.1, 2.1, 100.0, '1 taza'),
  ('Remolacha',           'vegetable', 43.0, 1.6, 9.6, 0.2, 2.8, 100.0, NULL),
  ('Rabanito',            'vegetable', 16.0, 0.7, 3.4, 0.1, 1.6, 50.0,  '3 rabanitos'),
  ('Puerro',              'vegetable', 61.0, 1.5, 14.2, 0.3, 1.8, 100.0, NULL),
  ('Alcaucil (alcachofa)', 'vegetable',47.0, 3.3, 10.5, 0.2, 5.4, 100.0, '1 alcaucil'),
  ('Chaucha (ejotes)',    'vegetable', 31.0, 1.8, 7.0, 0.2, 3.4, 100.0, '1 taza'),
  ('Arvejas frescas',     'vegetable', 81.0, 5.4, 14.5, 0.4, 5.7, 100.0, '1 taza'),
  ('Maíz en grano',       'vegetable', 86.0, 3.3, 18.7, 1.4, 2.0, 100.0, '1 taza'),
  ('Acelga',              'vegetable', 19.0, 1.8, 3.7, 0.2, 1.6, 100.0, '1 taza')
ON CONFLICT (name) DO NOTHING;

-- Legumbres (15)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Lentejas cocidas',        'legume', 116.0, 9.0, 20.1, 0.4, 7.9, 150.0, '1 taza'),
  ('Lentejas secas',          'legume', 352.0, 24.6, 63.4, 1.1, 10.7, 80.0, NULL),
  ('Garbanzos cocidos',       'legume', 164.0, 8.9, 27.4, 2.6, 7.6, 150.0, '1 taza'),
  ('Garbanzos secos',         'legume', 378.0, 20.5, 63.0, 6.0, 12.2, 80.0, NULL),
  ('Porotos negros cocidos',  'legume', 132.0, 8.9, 23.7, 0.5, 8.7, 150.0, '1 taza'),
  ('Porotos rojos cocidos',   'legume', 127.0, 8.7, 22.8, 0.5, 6.4, 150.0, '1 taza'),
  ('Porotos blancos cocidos', 'legume', 139.0, 9.7, 25.1, 0.4, 6.3, 150.0, '1 taza'),
  ('Porotos de soja cocidos', 'legume', 172.0, 18.2, 8.4, 9.0, 6.0, 150.0, '1 taza'),
  ('Arvejas secas',           'legume', 341.0, 24.6, 60.0, 1.2, 25.5, 80.0, NULL),
  ('Habas cocidas',           'legume', 110.0, 7.6, 19.7, 0.4, 5.4, 150.0, '1 taza'),
  ('Maní (cacahuate)',        'legume', 567.0, 25.8, 16.1, 49.2, 8.5, 30.0,  '1 puñado'),
  ('Mantequilla de maní',     'legume', 588.0, 25.0, 20.0, 50.0, 6.0, 20.0,  '1 cda'),
  ('Tofu firme',              'legume', 144.0, 17.3, 2.8, 8.7, 2.3, 100.0, NULL),
  ('Tempeh',                  'legume', 195.0, 20.3, 7.6, 10.8, 0.0, 100.0, NULL),
  ('Edamame',                 'legume', 122.0, 11.9, 8.9, 5.2, 5.2, 100.0, '1 taza')
ON CONFLICT (name) DO NOTHING;

-- Frutos secos y semillas (15)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Almendra',                'nuts', 579.0, 21.2, 21.6, 49.9, 12.5, 30.0,  '1 puñado'),
  ('Nuez',                    'nuts', 654.0, 15.2, 13.7, 65.2,  6.7, 30.0,  '1 puñado'),
  ('Avellana',                'nuts', 628.0, 15.0, 16.7, 60.8,  9.7, 30.0,  '1 puñado'),
  ('Castaña de cajú',         'nuts', 553.0, 18.2, 30.2, 43.9,  3.3, 30.0,  '1 puñado'),
  ('Pistacho',                'nuts', 562.0, 20.2, 27.2, 45.3, 10.6, 30.0,  '1 puñado'),
  ('Nuez de Brasil',          'nuts', 659.0, 14.3, 11.7, 67.1,  7.5, 20.0,  '2 nueces'),
  ('Semilla de chía',         'nuts', 486.0, 16.5, 42.1, 30.7, 34.4, 15.0,  '1 cda'),
  ('Semilla de lino',         'nuts', 534.0, 18.3, 28.9, 42.2, 27.3, 15.0,  '1 cda'),
  ('Semilla de girasol',      'nuts', 584.0, 20.8, 20.0, 51.5,  8.6, 30.0,  '1 puñado'),
  ('Semilla de zapallo',      'nuts', 559.0, 30.2, 10.7, 49.1,  6.0, 30.0,  '1 puñado'),
  ('Semilla de sésamo',       'nuts', 573.0, 17.7, 23.4, 49.7, 11.8, 15.0,  '1 cda'),
  ('Nuez pecana',             'nuts', 691.0,  9.2, 13.9, 72.0,  9.6, 30.0,  '1 puñado'),
  ('Macadamia',               'nuts', 718.0,  7.9, 13.8, 75.8,  8.6, 30.0,  '1 puñado'),
  ('Piñón',                   'nuts', 673.0, 13.7, 13.1, 68.4,  3.7, 20.0,  '1 cda'),
  ('Coco rallado',            'nuts', 660.0,  6.9, 23.7, 64.5, 16.3, 20.0,  '1 cda')
ON CONFLICT (name) DO NOTHING;

-- Aceites y grasas (10)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Aceite de oliva',         'fat', 884.0, 0.0, 0.0, 100.0, 0.0, 10.0, '1 cda'),
  ('Aceite de girasol',       'fat', 884.0, 0.0, 0.0, 100.0, 0.0, 10.0, '1 cda'),
  ('Aceite de coco',          'fat', 862.0, 0.0, 0.0, 100.0, 0.0, 10.0, '1 cda'),
  ('Aceite de canola',        'fat', 884.0, 0.0, 0.0, 100.0, 0.0, 10.0, '1 cda'),
  ('Mayonesa',                'fat', 680.0, 1.0, 0.6,  75.0, 0.0, 15.0, '1 cda'),
  ('Manteca de cerdo',        'fat', 902.0, 0.0, 0.0, 100.0, 0.0, 10.0, '1 cda'),
  ('Margarina',               'fat', 717.0, 0.2, 0.7,  81.0, 0.0, 10.0, '1 cdita'),
  ('Grasa vacuna',            'fat', 900.0, 0.0, 0.0, 100.0, 0.0, 10.0, '1 cda'),
  ('Aceituna',                'fat', 115.0, 0.8, 6.3,   10.7, 3.2, 30.0, '10 aceitunas'),
  ('Palta (grasa vegetal)',   'fat', 160.0, 2.0, 8.5,   14.7, 6.7, 100.0,'1/2 palta')
ON CONFLICT (name) DO NOTHING;

-- Procesados / snacks (15)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Barrita de cereal',       'processed', 420.0, 6.0, 65.0, 14.0, 3.0, 30.0,  '1 barrita'),
  ('Barrita proteica',        'processed', 350.0, 30.0, 40.0, 8.0, 4.0, 60.0,  '1 barrita'),
  ('Galletitas dulces',       'processed', 480.0, 6.0, 68.0, 20.0, 2.0, 30.0,  '3 galletitas'),
  ('Chocolate negro 70%',     'processed', 598.0, 7.8, 45.9, 42.6, 10.9, 20.0, '2 cuadraditos'),
  ('Chocolate con leche',     'processed', 535.0, 7.7, 59.4, 29.7, 3.4, 20.0,  '2 cuadraditos'),
  ('Papas fritas de paquete', 'processed', 536.0, 7.0, 53.0, 34.0, 4.8, 30.0,  '1 paquete chico'),
  ('Helado de crema',         'processed', 207.0, 3.5, 24.0, 11.0, 0.7, 100.0, '2 bochas'),
  ('Facturas',                'processed', 400.0, 6.0, 50.0, 20.0, 2.0, 80.0,  '1 factura'),
  ('Medialuna',               'processed', 380.0, 6.0, 45.0, 20.0, 2.0, 60.0,  '1 medialuna'),
  ('Alfajor',                 'processed', 470.0, 6.0, 65.0, 22.0, 2.0, 50.0,  '1 alfajor'),
  ('Pizza de muzzarella',     'processed', 266.0, 11.0, 33.0, 10.0, 2.3, 150.0, '1 porción'),
  ('Empanada de carne',       'processed', 280.0, 10.0, 28.0, 14.0, 1.5, 100.0, '1 empanada'),
  ('Hamburguesa casera',      'processed', 295.0, 17.0, 22.0, 15.0, 1.5, 150.0, '1 hamburguesa'),
  ('Pancho (hot dog)',        'processed', 247.0, 10.0, 18.0, 14.0, 1.2, 100.0, '1 pancho'),
  ('Milanesa de carne',       'processed', 290.0, 20.0, 15.0, 17.0, 0.8, 120.0, '1 milanesa')
ON CONFLICT (name) DO NOTHING;

-- Suplementos (10)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Whey protein (polvo)',    'supplement', 400.0, 80.0, 8.0, 6.0, 0.0, 30.0, '1 scoop'),
  ('Caseína (polvo)',         'supplement', 370.0, 75.0, 8.0, 4.0, 0.0, 30.0, '1 scoop'),
  ('Creatina monohidrato',    'supplement',   0.0,  0.0, 0.0, 0.0, 0.0,  5.0, '1 cdita'),
  ('Maltodextrina',           'supplement', 380.0,  0.0, 95.0, 0.0, 0.0, 30.0, '1 scoop'),
  ('BCAA (polvo)',            'supplement', 200.0, 50.0, 0.0, 0.0, 0.0, 10.0, '1 scoop'),
  ('Pre-entreno',             'supplement', 100.0,  0.0, 25.0, 0.0, 0.0, 10.0, '1 scoop'),
  ('Proteína vegetal (polvo)', 'supplement',390.0, 70.0, 10.0, 5.0, 3.0, 30.0, '1 scoop'),
  ('Colágeno hidrolizado',    'supplement', 360.0, 90.0, 0.0, 0.0, 0.0, 10.0, '1 cda'),
  ('Glutamina (polvo)',       'supplement',   0.0,  0.0, 0.0, 0.0, 0.0,  5.0, '1 cdita'),
  ('Omega 3 (cápsulas)',      'supplement', 900.0,  0.0, 0.0, 100.0, 0.0, 1.0, '1 cápsula')
ON CONFLICT (name) DO NOTHING;

-- Bebidas (10)
INSERT INTO public.foods
  (name, category, kcal_per_100g, protein_per_100g, carbs_per_100g, fat_per_100g, fiber_per_100g, serving_g, serving_name)
VALUES
  ('Agua',                    'beverage',   0.0, 0.0,  0.0, 0.0, 0.0, 250.0, '1 vaso'),
  ('Café solo',               'beverage',   1.0, 0.1,  0.0, 0.0, 0.0, 200.0, '1 taza'),
  ('Té',                      'beverage',   1.0, 0.0,  0.2, 0.0, 0.0, 200.0, '1 taza'),
  ('Jugo de naranja',         'beverage',  45.0, 0.7, 10.4, 0.2, 0.2, 250.0, '1 vaso'),
  ('Jugo de manzana',         'beverage',  46.0, 0.1, 11.3, 0.1, 0.2, 250.0, '1 vaso'),
  ('Gaseosa cola',            'beverage',  42.0, 0.0, 10.6, 0.0, 0.0, 350.0, '1 lata'),
  ('Gaseosa zero',            'beverage',   0.0, 0.0,  0.0, 0.0, 0.0, 350.0, '1 lata'),
  ('Cerveza',                 'beverage',  43.0, 0.5,  3.6, 0.0, 0.0, 330.0, '1 lata'),
  ('Vino tinto',              'beverage',  85.0, 0.1,  2.6, 0.0, 0.0, 150.0, '1 copa'),
  ('Bebida isotónica',        'beverage',  26.0, 0.0,  6.5, 0.0, 0.0, 500.0, '1 botella')
ON CONFLICT (name) DO NOTHING;
