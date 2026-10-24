-- GENERADO por scripts/generate-seed.ts — no editar a mano (npm run catalog:seed).

-- Estados de la República (32 entidades federativas)
insert into public.mx_states (slug, name) values
  ('aguascalientes', 'Aguascalientes'),
  ('baja-california', 'Baja California'),
  ('baja-california-sur', 'Baja California Sur'),
  ('campeche', 'Campeche'),
  ('chiapas', 'Chiapas'),
  ('chihuahua', 'Chihuahua'),
  ('ciudad-de-mexico', 'Ciudad de México'),
  ('coahuila', 'Coahuila'),
  ('colima', 'Colima'),
  ('durango', 'Durango'),
  ('estado-de-mexico', 'Estado de México'),
  ('guanajuato', 'Guanajuato'),
  ('guerrero', 'Guerrero'),
  ('hidalgo', 'Hidalgo'),
  ('jalisco', 'Jalisco'),
  ('michoacan', 'Michoacán'),
  ('morelos', 'Morelos'),
  ('nayarit', 'Nayarit'),
  ('nuevo-leon', 'Nuevo León'),
  ('oaxaca', 'Oaxaca'),
  ('puebla', 'Puebla'),
  ('queretaro', 'Querétaro'),
  ('quintana-roo', 'Quintana Roo'),
  ('san-luis-potosi', 'San Luis Potosí'),
  ('sinaloa', 'Sinaloa'),
  ('sonora', 'Sonora'),
  ('tabasco', 'Tabasco'),
  ('tamaulipas', 'Tamaulipas'),
  ('tlaxcala', 'Tlaxcala'),
  ('veracruz', 'Veracruz'),
  ('yucatan', 'Yucatán'),
  ('zacatecas', 'Zacatecas')
on conflict do nothing;

-- Catálogo de marcas y modelos
create or replace function pg_temp.add_catalog(p_type vehicle_type, p_brand text, p_models text[]) returns void
language plpgsql as $$
declare bid int; m text;
begin
  insert into public.catalog_brands (vehicle_type, name, slug)
  values (p_type, p_brand, public.slugify(p_brand))
  on conflict (vehicle_type, slug) do update set name = excluded.name
  returning id into bid;
  foreach m in array p_models loop
    insert into public.catalog_models (brand_id, name, slug)
    values (bid, m, public.slugify(m)) on conflict (brand_id, slug) do nothing;
  end loop;
end $$;

select pg_temp.add_catalog('auto', 'Acura', array['ILX', 'MDX', 'RDX', 'RLX', 'TLX', 'TSX', 'ZDX']);
select pg_temp.add_catalog('auto', 'Alfa Romeo', array['Giulia', 'Giulietta', 'MiTo', 'Stelvio', 'Tonale']);
select pg_temp.add_catalog('auto', 'Audi', array['A1', 'A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'e-tron', 'Q2', 'Q3', 'Q5', 'Q7', 'Q8', 'R8', 'TT']);
select pg_temp.add_catalog('auto', 'BAIC', array['BJ40', 'D20', 'U5 Plus', 'X7', 'X35', 'X55']);
select pg_temp.add_catalog('auto', 'BMW', array['i3', 'i4', 'iX', 'Serie 1', 'Serie 2', 'Serie 3', 'Serie 4', 'Serie 5', 'Serie 7', 'X1', 'X2', 'X3', 'X4', 'X5', 'X6', 'X7', 'Z4']);
select pg_temp.add_catalog('auto', 'Buick', array['Enclave', 'Encore', 'Envision', 'Lacrosse', 'Regal']);
select pg_temp.add_catalog('auto', 'BYD', array['Dolphin', 'Dolphin Mini', 'e2', 'F3', 'Han', 'Seal', 'Shark', 'Song Plus', 'Song Pro', 'Tang', 'Yuan Plus']);
select pg_temp.add_catalog('auto', 'Cadillac', array['ATS', 'CT4', 'CT5', 'CTS', 'Escalade', 'Lyriq', 'SRX', 'XT4', 'XT5', 'XT6']);
select pg_temp.add_catalog('auto', 'Changan', array['Alsvin', 'CS15', 'CS35 Plus', 'CS55 Plus', 'CS75 Plus', 'Hunter', 'Uni-K', 'Uni-T']);
select pg_temp.add_catalog('auto', 'Chevrolet', array['Aveo', 'Beat', 'Blazer', 'Camaro', 'Captiva', 'Cavalier', 'Chevy', 'Cheyenne', 'Colorado', 'Corvette', 'Cruze', 'Equinox', 'Groove', 'Malibu', 'Matiz', 'Montana', 'Onix', 'Optra', 'Orlando', 'S10', 'Silverado', 'Sonic', 'Spark', 'Suburban', 'Tahoe', 'Tornado', 'Tracker', 'Traverse', 'Trax']);
select pg_temp.add_catalog('auto', 'Chirey', array['Arrizo 5', 'Jaecoo 7', 'Omoda 5', 'Tiggo 2 Pro', 'Tiggo 4 Pro', 'Tiggo 7 Pro', 'Tiggo 8 Pro']);
select pg_temp.add_catalog('auto', 'Chrysler', array['300', 'Aspen', 'Pacifica', 'PT Cruiser', 'Town & Country', 'Voyager']);
select pg_temp.add_catalog('auto', 'Citroën', array['Berlingo', 'C3', 'C4', 'C4 Cactus', 'C5 Aircross', 'Jumpy', 'Xsara Picasso']);
select pg_temp.add_catalog('auto', 'Cupra', array['Ateca', 'Born', 'Formentor', 'León']);
select pg_temp.add_catalog('auto', 'DFSK', array['C31', 'Glory 500', 'Glory 560', 'Glory 580', 'K01', 'K02']);
select pg_temp.add_catalog('auto', 'Dodge', array['Attitude', 'Avenger', 'Caliber', 'Challenger', 'Charger', 'Dart', 'Durango', 'Grand Caravan', 'Hornet', 'Journey', 'Neon', 'Nitro', 'Ram 1500', 'Stratus', 'Viper']);
select pg_temp.add_catalog('auto', 'Fiat', array['500', '500e', 'Argo', 'Cronos', 'Ducato', 'Fastback', 'Freemont', 'Linea', 'Mobi', 'Palio', 'Panda', 'Pulse', 'Punto', 'Strada', 'Uno']);
select pg_temp.add_catalog('auto', 'Ford', array['Bronco', 'Bronco Sport', 'EcoSport', 'Edge', 'Escape', 'Escort', 'Expedition', 'Explorer', 'F-150', 'F-250', 'F-350', 'Fiesta', 'Figo', 'Focus', 'Fusion', 'Ikon', 'Lobo', 'Maverick', 'Mustang', 'Mustang Mach-E', 'Ranger', 'Taurus', 'Territory', 'Thunderbird', 'Transit']);
select pg_temp.add_catalog('auto', 'GAC', array['Emkoo', 'Empow', 'GA4', 'GS3', 'GS4', 'GS8']);
select pg_temp.add_catalog('auto', 'GMC', array['Acadia', 'Canyon', 'Envoy', 'Hummer EV', 'Sierra', 'Terrain', 'Yukon']);
select pg_temp.add_catalog('auto', 'Honda', array['Accord', 'Africa Twin', 'BR-V', 'City', 'Civic', 'Civic Type R', 'CR-V', 'CR-Z', 'Fit', 'HR-V', 'Insight', 'Odyssey', 'Passport', 'Pilot', 'Prologue', 'Ridgeline']);
select pg_temp.add_catalog('auto', 'Hyundai', array['Accent', 'Atos', 'Creta', 'Elantra', 'Excel', 'Getz', 'Grand i10', 'H-1', 'i10', 'i20', 'Ioniq', 'Ioniq 5', 'Kona', 'Palisade', 'Santa Cruz', 'Santa Fe', 'Sonata', 'Stargazer', 'Tucson', 'Veloster', 'Venue']);
select pg_temp.add_catalog('auto', 'Infiniti', array['EX35', 'FX35', 'G35', 'Q50', 'Q60', 'Q70', 'QX50', 'QX55', 'QX60', 'QX80']);
select pg_temp.add_catalog('auto', 'Isuzu', array['D-Max', 'Elf', 'Forward', 'MU-X', 'Trooper']);
select pg_temp.add_catalog('auto', 'JAC', array['E-J7', 'Frison', 'J4', 'J7', 'JS2', 'JS3', 'JS4', 'JS6', 'JS8', 'Sei 2', 'Sei 4', 'Sei 7', 'T6', 'T8']);
select pg_temp.add_catalog('auto', 'Jaguar', array['E-Pace', 'F-Pace', 'F-Type', 'I-Pace', 'XE', 'XF', 'XJ']);
select pg_temp.add_catalog('auto', 'Jeep', array['Avenger', 'Cherokee', 'Commander', 'Compass', 'Gladiator', 'Grand Cherokee', 'Grand Cherokee L', 'Liberty', 'Patriot', 'Renegade', 'Wagoneer', 'Wrangler']);
select pg_temp.add_catalog('auto', 'Jetour', array['Dashing', 'T2', 'X70', 'X70 Plus', 'X90 Plus']);
select pg_temp.add_catalog('auto', 'Kia', array['Carens', 'Carnival', 'Cerato', 'EV6', 'EV9', 'Forte', 'K3', 'Niro', 'Optima', 'Picanto', 'Rio', 'Rondo', 'Seltos', 'Sephia', 'Sonet', 'Sorento', 'Soul', 'Sportage', 'Stinger', 'Stonic', 'Telluride']);
select pg_temp.add_catalog('auto', 'Land Rover', array['Defender', 'Discovery', 'Discovery Sport', 'Freelander', 'Range Rover', 'Range Rover Evoque', 'Range Rover Sport', 'Range Rover Velar']);
select pg_temp.add_catalog('auto', 'Lexus', array['CT', 'ES', 'GS', 'GX', 'IS', 'LC', 'LS', 'LX', 'NX', 'RC', 'RX', 'UX']);
select pg_temp.add_catalog('auto', 'Lincoln', array['Aviator', 'Continental', 'Corsair', 'MKC', 'MKS', 'MKT', 'MKX', 'MKZ', 'Nautilus', 'Navigator', 'Town Car']);
select pg_temp.add_catalog('auto', 'Mazda', array['BT-50', 'CX-3', 'CX-5', 'CX-7', 'CX-9', 'CX-30', 'CX-50', 'CX-60', 'CX-90', 'Mazda 2', 'Mazda 3', 'Mazda 5', 'Mazda 6', 'MX-5', 'MX-30', 'RX-8', 'Tribute']);
select pg_temp.add_catalog('auto', 'Mercedes-Benz', array['AMG GT', 'CLA', 'Clase A', 'Clase B', 'Clase C', 'Clase E', 'Clase G', 'Clase S', 'Clase V', 'CLS', 'EQA', 'EQB', 'EQC', 'GLA', 'GLB', 'GLC', 'GLE', 'GLS', 'SLK', 'Sprinter']);
select pg_temp.add_catalog('auto', 'MG', array['Cyberster', 'HS', 'Marvel R', 'MG 3', 'MG 5', 'MG 6', 'MG GT', 'MG ONE', 'MG4', 'RX5', 'RX8', 'ZS', 'ZS EV']);
select pg_temp.add_catalog('auto', 'Mini', array['Clubman', 'Convertible', 'Cooper', 'Cooper S', 'Countryman', 'John Cooper Works', 'Paceman']);
select pg_temp.add_catalog('auto', 'Mitsubishi', array['ASX', 'Colt', 'Eclipse Cross', 'Galant', 'L200', 'Lancer', 'Mirage', 'Montero', 'Montero Sport', 'Outlander', 'Outlander Sport', 'Xpander']);
select pg_temp.add_catalog('auto', 'Nissan', array['350Z', '370Z', 'Altima', 'Ariya', 'Armada', 'Frontier', 'GT-R', 'Juke', 'Kicks', 'Leaf', 'March', 'Maxima', 'Murano', 'Note', 'NP300', 'NP300 Estaquitas', 'Pathfinder', 'Platina', 'Qashqai', 'Rogue', 'Sentra', 'Tiida', 'Titan', 'Tsuru', 'Urvan', 'Versa', 'X-Trail', 'Xterra']);
select pg_temp.add_catalog('auto', 'Omoda', array['C5', 'E5', 'O5']);
select pg_temp.add_catalog('auto', 'Peugeot', array['106', '206', '207', '208', '301', '307', '308', '405', '406', '407', '2008', '3008', '5008', 'Expert', 'Manager', 'Partner', 'RCZ', 'Rifter']);
select pg_temp.add_catalog('auto', 'Pontiac', array['Aztek', 'G3', 'G5', 'G6', 'Grand Am', 'Grand Prix', 'Matiz', 'Montana', 'Solstice', 'Sunfire', 'Vibe']);
select pg_temp.add_catalog('auto', 'Porsche', array['718 Boxster', '718 Cayman', '911', 'Cayenne', 'Macan', 'Panamera', 'Taycan']);
select pg_temp.add_catalog('auto', 'Ram', array['700', '1200', '1500', '2500', '3500', '4000', 'Heavy Duty', 'ProMaster', 'ProMaster Rapid', 'Rampage']);
select pg_temp.add_catalog('auto', 'Renault', array['Alaskan', 'Arkana', 'Captur', 'Clio', 'Duster', 'Duster Oroch', 'Fluence', 'Kangoo', 'Kardian', 'Koleos', 'Kwid', 'Logan', 'Master', 'Megane', 'Oroch', 'Sandero', 'Scénic', 'Stepway', 'Symbol', 'Twingo']);
select pg_temp.add_catalog('auto', 'SEAT', array['Alhambra', 'Altea', 'Arona', 'Ateca', 'Córdoba', 'Ibiza', 'León', 'Mii', 'Tarraco', 'Toledo']);
select pg_temp.add_catalog('auto', 'Smart', array['EQ Fortwo', 'Forfour', 'Fortwo']);
select pg_temp.add_catalog('auto', 'Subaru', array['Ascent', 'BRZ', 'Crosstrek', 'Forester', 'Impreza', 'Legacy', 'Outback', 'Solterra', 'WRX', 'XV']);
select pg_temp.add_catalog('auto', 'Suzuki', array['Alto', 'Baleno', 'Celerio', 'Ciaz', 'Dzire', 'Ertiga', 'Fronx', 'Grand Vitara', 'Ignis', 'Jimny', 'S-Cross', 'Swift', 'SX4', 'Vitara', 'XL7']);
select pg_temp.add_catalog('auto', 'Tesla', array['Cybertruck', 'Model 3', 'Model S', 'Model X', 'Model Y']);
select pg_temp.add_catalog('auto', 'Toyota', array['4Runner', 'Agya', 'Avalon', 'Avanza', 'Avanza Veloz', 'bZ4X', 'C-HR', 'Camry', 'Corolla', 'Corolla Cross', 'Crown', 'Echo', 'Etios', 'FJ Cruiser', 'Fortuner', 'GR Corolla', 'GR86', 'Hiace', 'Highlander', 'Hilux', 'Innova', 'Land Cruiser', 'Matrix', 'Prado', 'Prius', 'RAV4', 'Rush', 'Sequoia', 'Sienna', 'Solara', 'Supra', 'Tacoma', 'Tercel', 'Tundra', 'Venza', 'Yaris', 'Yaris Cross', 'Yaris Sedán']);
select pg_temp.add_catalog('auto', 'Volkswagen', array['Amarok', 'Atlas', 'Beetle', 'Bora', 'Caddy', 'CC', 'Combi', 'Crafter', 'CrossFox', 'Derby', 'Eos', 'Fox', 'Gol', 'Golf', 'GTI', 'ID.4', 'Jetta', 'Jetta GLI', 'Lupo', 'Nivus', 'Passat', 'Pointer', 'Polo', 'Saveiro', 'Scirocco', 'Sedán (Vocho)', 'Sharan', 'T-Cross', 'Taos', 'Teramont', 'Tiguan', 'Touareg', 'Transporter', 'Vento', 'Virtus', 'Voyage']);
select pg_temp.add_catalog('auto', 'Volvo', array['C30', 'C40', 'EX30', 'EX90', 'S40', 'S60', 'S80', 'S90', 'V40', 'V60', 'V90', 'XC40', 'XC60', 'XC90']);
select pg_temp.add_catalog('moto', 'Aprilia', array['Dorsoduro', 'RS 125', 'RS 660', 'RSV4', 'Shiver', 'SR GT', 'Tuareg 660', 'Tuono 660', 'Tuono V4']);
select pg_temp.add_catalog('moto', 'Bajaj', array['Avenger 220', 'Boxer 150', 'Boxer CT100', 'Discover', 'Dominar 250', 'Dominar 400', 'Platina', 'Pulsar 125', 'Pulsar 150', 'Pulsar 180', 'Pulsar N160', 'Pulsar NS125', 'Pulsar NS160', 'Pulsar NS200', 'Pulsar RS200', 'Rouser']);
select pg_temp.add_catalog('moto', 'Benelli', array['180S', '302S', '752S', 'Imperiale 400', 'Leoncino 250', 'Leoncino 500', 'TNT 15', 'TNT 25', 'TNT 135', 'TNT 300', 'TNT 600', 'TRK 251', 'TRK 502', 'TRK 702']);
select pg_temp.add_catalog('moto', 'BMW', array['C 400 X', 'CE 04', 'F 750 GS', 'F 850 GS', 'F 900 R', 'F 900 XR', 'G 310 GS', 'G 310 R', 'K 1600', 'R 1250 GS', 'R 1250 R', 'R 1250 RT', 'R nineT', 'S 1000 R', 'S 1000 RR', 'S 1000 XR']);
select pg_temp.add_catalog('moto', 'Carabela', array[]::text[]);
select pg_temp.add_catalog('moto', 'CFMOTO', array['150NK', '250NK', '300NK', '400NK', '450SR', '650MT', '650NK', '700CL-X', '800MT', 'CForce', 'Papio', 'Terralander', 'UForce']);
select pg_temp.add_catalog('moto', 'Dinamo', array[]::text[]);
select pg_temp.add_catalog('moto', 'Ducati', array['DesertX', 'Diavel', 'Hypermotard', 'Monster', 'Multistrada', 'Panigale V2', 'Panigale V4', 'Scrambler', 'Streetfighter', 'SuperSport', 'XDiavel']);
select pg_temp.add_catalog('moto', 'Harley-Davidson', array['Breakout', 'Fat Bob', 'Fat Boy', 'Forty-Eight', 'Heritage Classic', 'Iron 883', 'Iron 1200', 'LiveWire', 'Low Rider', 'Nightster', 'Pan America', 'Road Glide', 'Road King', 'Softail Standard', 'Sportster 1200', 'Sportster S', 'Street 500', 'Street 750', 'Street Bob', 'Street Glide', 'Ultra Limited']);
select pg_temp.add_catalog('moto', 'Hero', array['Dash 110', 'Dash 125', 'Hunk 160R', 'Ignitor', 'Splendor', 'Thriller 160R', 'Xpulse 200', 'Xpulse 200 4V', 'Xtreme 160R']);
select pg_temp.add_catalog('moto', 'Honda', array['ADV 150', 'ADV 350', 'Africa Twin', 'Biz 125', 'C90', 'Cargo 150', 'CB 125F', 'CB 160F', 'CB 190R', 'CB 300F', 'CB 500F', 'CB 650R', 'CB 1000R', 'CBR 150R', 'CBR 250R', 'CBR 500R', 'CBR 600RR', 'CBR 650R', 'CBR 1000RR', 'CGL 125', 'CRF 150L', 'CRF 250L', 'CRF 300L', 'Dio', 'Elite 125', 'Falcon', 'Gold Wing', 'Hornet', 'Invicta', 'Navi', 'NC 750X', 'PCX', 'Pop 110i', 'Rebel 300', 'Rebel 500', 'Rebel 1100', 'SH 150', 'Shadow', 'Tornado XR 250', 'Transalp', 'Wave 110', 'XR 150L', 'XR 190L', 'XRE 300']);
select pg_temp.add_catalog('moto', 'Husqvarna', array['701 Enduro', '701 Supermoto', 'FE 350', 'Norden 901', 'Svartpilen 250', 'Svartpilen 401', 'TE 300', 'Vitpilen 401']);
select pg_temp.add_catalog('moto', 'Italika', array['125Z', '150Z', '250Z', '300Z', 'AT110', 'Blackbird', 'DM 150', 'DM 200', 'FT 125', 'FT 150', 'FT 180', 'RC 150', 'RT 200', 'RT 250', 'TC 200', 'TC 250', 'Vort-X 200', 'Vort-X 300', 'Vort-X 650', 'WS 150']);
select pg_temp.add_catalog('moto', 'Kawasaki', array['Eliminator', 'KLR 650', 'KLX 150', 'KLX 230', 'KLX 300', 'Ninja 125', 'Ninja 250', 'Ninja 300', 'Ninja 400', 'Ninja 650', 'Ninja 1000SX', 'Ninja H2', 'Ninja ZX-6R', 'Ninja ZX-10R', 'Versys 300', 'Versys 650', 'Versys 1000', 'Vulcan 900', 'Vulcan 1700', 'Vulcan S', 'W800', 'Z H2', 'Z125', 'Z250', 'Z400', 'Z650', 'Z650RS', 'Z900', 'Z900RS', 'Z1000']);
select pg_temp.add_catalog('moto', 'Keeway', array['Cafe Racer 152', 'K-Light 202', 'K-Light 250', 'RK 150', 'RKF 125', 'RKS 125', 'RKV 200', 'V302C']);
select pg_temp.add_catalog('moto', 'KTM', array['125 Duke', '200 Duke', '250 Adventure', '250 Duke', '300 XC-W', '350 EXC', '390 Adventure', '390 Duke', '450 EXC', '500 EXC', '790 Adventure', '790 Duke', '890 Adventure', '890 Duke', '1290 Super Adventure', '1290 Super Duke', 'RC 200', 'RC 390']);
select pg_temp.add_catalog('moto', 'Kurazai', array[]::text[]);
select pg_temp.add_catalog('moto', 'Kymco', array['Agility 125', 'Agility City 150', 'AK 550', 'Downtown 350', 'K-Pipe', 'Like 150', 'MXU 250', 'People S 150', 'Super 8', 'Xciting 250']);
select pg_temp.add_catalog('moto', 'Piaggio', array['Ape', 'Beverly 300', 'Fly 150', 'Liberty 150', 'Medley 150', 'MP3', 'Typhoon', 'X10', 'Zip']);
select pg_temp.add_catalog('moto', 'Royal Enfield', array['Bullet 350', 'Classic 350', 'Classic 500', 'Continental GT 650', 'Himalayan', 'Hunter 350', 'Interceptor 650', 'Meteor 350', 'Scram 411', 'Shotgun 650', 'Super Meteor 650', 'Thunderbird 350']);
select pg_temp.add_catalog('moto', 'Suzuki', array['Address 110', 'Avenis 125', 'AX4', 'Boulevard M50', 'Burgman 125', 'Burgman 200', 'Burgman 400', 'DR 150', 'DR 200', 'DR 650', 'DR-Z400', 'Gixxer 150', 'Gixxer 250', 'Gixxer SF 150', 'GN 125', 'GN 150', 'GSX-250R', 'GSX-R150', 'GSX-R600', 'GSX-R750', 'GSX-R1000', 'GSX-S750', 'GSX-S1000', 'Hayabusa', 'Intruder 150', 'Katana', 'Marauder', 'Sixteen', 'SV650', 'UZ 125', 'V-Strom 250', 'V-Strom 650', 'V-Strom 1050', 'VanVan 200']);
select pg_temp.add_catalog('moto', 'SYM', array['Citycom', 'Cruisym', 'Fiddle', 'Jet 14', 'Joyride', 'Maxsym', 'Orbit', 'Symphony', 'VF3i', 'Wolf']);
select pg_temp.add_catalog('moto', 'Triumph', array['Bonneville T100', 'Bonneville T120', 'Daytona 675', 'Rocket 3', 'Scrambler 400 X', 'Scrambler 900', 'Scrambler 1200', 'Speed 400', 'Speed Triple', 'Speed Twin', 'Street Triple', 'Thruxton', 'Tiger 660', 'Tiger 850', 'Tiger 900', 'Tiger 1200', 'Trident 660']);
select pg_temp.add_catalog('moto', 'TVS', array['Apache RR 310', 'Apache RTR 160', 'Apache RTR 180', 'Apache RTR 200', 'Jupiter', 'Ntorq 125', 'Radeon', 'Raider 125', 'Sport', 'Star City']);
select pg_temp.add_catalog('moto', 'Vento', array['Crossmax', 'Nitrox', 'Rebellian', 'Rocketman', 'Screamer', 'Tornado', 'Workman']);
select pg_temp.add_catalog('moto', 'Vespa', array['Elettrica', 'GTS 300', 'GTV 300', 'LX 150', 'Primavera 150', 'S 125', 'Sprint 150']);
select pg_temp.add_catalog('moto', 'Yamaha', array['Bolt', 'Crypton', 'Cygnus', 'DT 125', 'DT 175', 'Fascino', 'Fazer 250', 'FZ 16', 'FZ 25', 'FZ-09 / MT-09', 'FZ-10 / MT-10', 'FZ-S 3.0', 'FZ-S FI', 'FZS 25', 'Libero 125', 'Mio', 'MT-03', 'MT-07', 'MT-15', 'MT-25', 'NMAX', 'NMAX 155', 'PW 50', 'R1', 'R3', 'R6', 'R7', 'R15', 'R125', 'Ray ZR', 'Ray ZR 125', 'RX 100', 'Tenere 700', 'Tenere 1200', 'Tracer 7', 'Tracer 9', 'TW 200', 'V Star 250', 'V Star 650', 'Vino 125', 'Virago 250', 'WR 250', 'XMAX 300', 'XSR 700', 'XSR 900', 'XTZ 125', 'XTZ 150', 'XTZ 250', 'YBR 125', 'YZ 250', 'Zuma 125']);
select pg_temp.add_catalog('moto', 'Zontes', array['125 G1', '125 U', '310 R', '310 T', '310 X', '350 D', '350 GK', '350 T', '368 G', '703 F', '703 RR']);
