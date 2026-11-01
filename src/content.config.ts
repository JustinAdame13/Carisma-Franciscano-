import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/*
  Colecciones de contenido. Cada archivo .md dentro de una carpeta de
  src/content/ (noticias, publicaciones, proyectos, formacion, oraciones)
  se convierte en una entrada. Deben coincidir con keystatic.config.ts.
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

const proyectos = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/proyectos' }),
  schema: z.object({
    ...base,
    frecuencia: z.string().optional().nullable(),
    comoAyudar: z.string().optional().nullable(),
  }),
});

const formacion = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/formacion' }),
  schema: z.object({
    ...base,
    tema: z.string().default('Espiritualidad'),
    archivo: z.string().optional().nullable(),
  }),
});

const oraciones = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/oraciones' }),
  schema: z.object({
    titulo: z.string(),
    fecha: z.coerce.date(),
    fuente: z.string().optional().nullable(),
    categoria: z.string().default('Oración'),
    resumen: z.string().optional().nullable(),
    ejemplo: z.boolean().default(false),
  }),
});

export const collections = { noticias, publicaciones, proyectos, formacion, oraciones };
