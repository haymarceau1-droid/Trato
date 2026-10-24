-- Estados de la República
insert into public.mx_states (slug, name) values
 ('aguascalientes','Aguascalientes'),('baja-california','Baja California'),('baja-california-sur','Baja California Sur'),
 ('campeche','Campeche'),('chiapas','Chiapas'),('chihuahua','Chihuahua'),('ciudad-de-mexico','Ciudad de México'),
 ('coahuila','Coahuila'),('colima','Colima'),('durango','Durango'),('estado-de-mexico','Estado de México'),
 ('guanajuato','Guanajuato'),('guerrero','Guerrero'),('hidalgo','Hidalgo'),('jalisco','Jalisco'),('michoacan','Michoacán'),
 ('morelos','Morelos'),('nayarit','Nayarit'),('nuevo-leon','Nuevo León'),('oaxaca','Oaxaca'),('puebla','Puebla'),
 ('queretaro','Querétaro'),('quintana-roo','Quintana Roo'),('san-luis-potosi','San Luis Potosí'),('sinaloa','Sinaloa'),
 ('sonora','Sonora'),('tabasco','Tabasco'),('tamaulipas','Tamaulipas'),('tlaxcala','Tlaxcala'),('veracruz','Veracruz'),
 ('yucatan','Yucatán'),('zacatecas','Zacatecas')
on conflict do nothing;

-- Catálogo de marcas y modelos principales
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

select pg_temp.add_catalog('auto','Nissan', array['Versa','Sentra','March','Kicks','Tsuru','NP300','Frontier','X-Trail','Altima','Tiida','Note','Rogue']);
select pg_temp.add_catalog('auto','Chevrolet', array['Aveo','Spark','Onix','Beat','Sonic','Cavalier','Silverado','Tracker','Equinox','Trax','Captiva','Malibu']);
select pg_temp.add_catalog('auto','Volkswagen', array['Jetta','Vento','Polo','Virtus','Tiguan','Golf','Gol','Saveiro','Taos','T-Cross','Sedán','Passat']);
select pg_temp.add_catalog('auto','Toyota', array['Corolla','Yaris','Camry','RAV4','Hilux','Avanza','Tacoma','Prius','Highlander','Sienna','Tundra','Rush']);
select pg_temp.add_catalog('auto','Kia', array['Rio','Forte','Sportage','Seltos','Sorento','Soul','K3','Picanto','Sonet']);
select pg_temp.add_catalog('auto','Mazda', array['Mazda 2','Mazda 3','Mazda 6','CX-3','CX-30','CX-5','CX-9','MX-5']);
select pg_temp.add_catalog('auto','Honda', array['Civic','City','Accord','CR-V','HR-V','Fit','Pilot','Odyssey','BR-V']);
select pg_temp.add_catalog('auto','Ford', array['Fiesta','Focus','Figo','Fusion','Escape','Explorer','Ranger','F-150','Lobo','EcoSport','Mustang','Edge']);
select pg_temp.add_catalog('auto','Hyundai', array['Grand i10','Accent','Elantra','Tucson','Creta','Santa Fe','Sonata','Venue','i10']);
select pg_temp.add_catalog('auto','MG', array['MG 5','MG GT','ZS','HS','MG 3','RX8']);
select pg_temp.add_catalog('auto','BYD', array['Dolphin','Seal','Song Plus','Yuan Plus','Han','Tang']);
select pg_temp.add_catalog('auto','Suzuki', array['Swift','Ignis','Vitara','S-Cross','Ertiga','Baleno','Jimny','Celerio']);
select pg_temp.add_catalog('auto','Renault', array['Kwid','Logan','Sandero','Duster','Stepway','Captur','Koleos','Oroch']);
select pg_temp.add_catalog('auto','Seat', array['Ibiza','León','Arona','Ateca','Toledo','Cordoba']);
select pg_temp.add_catalog('auto','Jeep', array['Wrangler','Compass','Renegade','Grand Cherokee','Patriot','Gladiator']);
select pg_temp.add_catalog('auto','Dodge', array['Attitude','Journey','Charger','Challenger','Ram 700','Durango']);
select pg_temp.add_catalog('auto','BMW', array['Serie 1','Serie 3','Serie 5','X1','X3','X5']);
select pg_temp.add_catalog('auto','Mercedes-Benz', array['Clase A','Clase C','Clase E','GLA','GLC','GLE']);
select pg_temp.add_catalog('auto','Audi', array['A1','A3','A4','Q3','Q5','Q7']);
select pg_temp.add_catalog('auto','Peugeot', array['208','301','2008','3008','Partner']);

select pg_temp.add_catalog('moto','Italika', array['FT125','FT150','DM150','DM200','125Z','150Z','250Z','AT110','XS150','RC150','WS150','Blackbird']);
select pg_temp.add_catalog('moto','Honda', array['CB190R','CB125F','XR150L','Navi','Wave 110','CBR250R','Elite 125','Africa Twin','CRF250L','PCX']);
select pg_temp.add_catalog('moto','Yamaha', array['FZ25','FZ-S','YZF-R3','MT-03','XTZ 125','Crypton','NMAX','XMAX','Ray ZR','Tenere 700']);
select pg_temp.add_catalog('moto','Suzuki', array['GN125','Gixxer 150','V-Strom 250','DR650','Burgman','Address','Intruder']);
select pg_temp.add_catalog('moto','Bajaj', array['Pulsar NS200','Pulsar 150','Dominar 400','Boxer CT100','Avenger']);
select pg_temp.add_catalog('moto','Vento', array['Rocketman','Workman','Nitrox','Tornado','Crossmax','Screamer','Xpress']);
select pg_temp.add_catalog('moto','Kawasaki', array['Ninja 400','Z400','Versys 300','Vulcan S','Ninja 650','Z650']);
select pg_temp.add_catalog('moto','KTM', array['Duke 200','Duke 390','RC 390','Adventure 390','Duke 790']);
select pg_temp.add_catalog('moto','BMW', array['G 310 R','G 310 GS','R 1250 GS','F 850 GS','S 1000 RR']);
select pg_temp.add_catalog('moto','Harley-Davidson', array['Sportster','Street 750','Fat Boy','Iron 883','Softail','Road King']);
select pg_temp.add_catalog('moto','Royal Enfield', array['Classic 350','Himalayan','Meteor 350','Interceptor 650']);
select pg_temp.add_catalog('moto','Benelli', array['TNT 25','Leoncino 500','TRK 502','Imperiale 400']);
