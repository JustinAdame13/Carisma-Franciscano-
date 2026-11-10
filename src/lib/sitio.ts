import { z } from 'astro/zod';
import datos from '../data/sitio.json';

/*
  Datos del sitio, ya limpios. Importa SIEMPRE desde aquí, nunca directo del JSON.

  ¿Por qué? src/data/sitio.json lo escribe Keystatic, y cuando el cliente deja
  un campo vacío, Keystatic BORRA la llave del archivo en vez de guardar "".
  Si el código lee esa llave directo (sitio.whatsapp.replace(...)), recibe
  undefined y el build truena.

  Este esquema garantiza que cada campo siempre exista con el tipo correcto:
  - Textos que falten (o vengan null) se vuelven "".
  - Los textos obligatorios tienen un valor de respaldo.
  - Si algún valor llega con un tipo raro, se usa el respaldo en lugar de romper.
  Así, para el resto del código, "vacío" siempre es "" y nunca undefined.
*/
const texto = (respaldo = '') =>
  z
    .string()
    .nullish()
    .transform((v) => v?.trim() || respaldo)
    .catch(respaldo);

const esquema = z.object({
  modoBorrador: z.boolean().catch(false),
  nombre: texto('Carisma Franciscano'),
  subtitulo: texto('Oraciones, formación y reflexiones franciscanas'),
  lema: texto('Paz y Bien'),
  sede: texto(),
  direccion: texto(),
  whatsapp: texto(),
  correo: texto(),
  facebook: texto(),
  instagram: texto(),
});

export type Sitio = z.infer<typeof esquema>;

export const sitio: Sitio = esquema.parse(datos);
