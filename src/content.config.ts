import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
  Colecciones de contenido. Cada archivo .md dentro de src/content/noticias
  o src/content/publicaciones se convierte en una entrada.
  El "schema" valida los datos del encabezado (frontmatter) de cada archivo.
*/
const base = {
  titulo: z.string(),
  fecha: z.coerce.date(),
  resumen: z.string(),
  imagen: z.string().optional().nullable(),
  ejemplo: z.boolean().default(false),
};

const noticias = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/noticias' }),
  schema: z.object({
    ...base,
    categoria: z.string().default('Aviso'),
  }),
});

const publicaciones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/publicaciones' }),
  schema: z.object({
    ...base,
    tipo: z.string().default('Reflexión'),
    archivo: z.string().optional().nullable(),
  }),
});

export const collections = { noticias, publicaciones };
