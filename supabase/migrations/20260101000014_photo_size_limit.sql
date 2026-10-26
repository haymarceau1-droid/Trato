-- Cada foto ya viene comprimida del navegador (~300 KB, tope 400 KB). El bucket rechaza todo lo que pase de 512 KB
-- para que ninguna llamada directa a la API infle el almacenamiento.
update storage.buckets set file_size_limit = 524288 where id = 'listing-photos';
