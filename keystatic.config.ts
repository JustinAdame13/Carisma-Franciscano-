import { config, collection, singleton, fields } from '@keystatic/core';

/*
  Panel de contenido (CMS) del sitio. Se abre en /keystatic.
  - En tu computadora (npm run dev) guarda los cambios directo en los archivos.
  - En Vercel guarda los cambios como commits en GitHub y el sitio se vuelve a publicar solo.
  Si el repositorio tiene otro nombre, cámbialo en `repo`.
*/

const camposDePublicacion = (carpeta: string) => ({
  titulo: fields.slug({ name: { label: 'Título' } }),
  fecha: fields.date({ label: 'Fecha', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
  resumen: fields.text({ label: 'Resumen', description: 'Una o dos frases que aparecen en la tarjeta.', multiline: true, validation: { length: { min: 1, max: 240 } } }),
  imagen: fields.image({
    label: 'Imagen principal',
    description: 'Opcional. De preferencia horizontal.',
    directory: `public/imagenes/${carpeta}`,
    publicPath: `/imagenes/${carpeta}/`,
  }),
  ejemplo: fields.checkbox({ label: 'Es contenido de ejemplo', description: 'Márcalo solo en publicaciones de prueba.', defaultValue: false }),
  contenido: fields.markdoc({ label: 'Contenido', extension: 'md' }),
});

export default config({
  storage: import.meta.env.PROD
    ? { kind: 'github', repo: 'JustinAdame13/caridad-franciscana' }
    : { kind: 'local' },
  ui: {
    brand: { name: 'Caridad Franciscana' },
    navigation: {
      Publicar: ['noticias', 'publicaciones'],
      'Datos del sitio': ['sitio', 'comisiones', 'proyectos'],
    },
  },
  collections: {
    noticias: collection({
      label: 'Noticias',
      slugField: 'titulo',
      path: 'src/content/noticias/*',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'fecha'],
      schema: {
        ...camposDePublicacion('noticias'),
        categoria: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Aviso', value: 'Aviso' },
            { label: 'Evento', value: 'Evento' },
            { label: 'Servicio', value: 'Servicio' },
            { label: 'Fraternidad', value: 'Fraternidad' },
          ],
          defaultValue: 'Aviso',
        }),
      },
    }),
    publicaciones: collection({
      label: 'Publicaciones',
      slugField: 'titulo',
      path: 'src/content/publicaciones/*',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'fecha'],
      schema: {
        ...camposDePublicacion('publicaciones'),
        tipo: fields.select({
          label: 'Tipo',
          options: [
            { label: 'Reflexión', value: 'Reflexión' },
            { label: 'Boletín', value: 'Boletín' },
            { label: 'Documento', value: 'Documento' },
          ],
          defaultValue: 'Reflexión',
        }),
        archivo: fields.file({
          label: 'Archivo PDF (opcional)',
          directory: 'public/documentos',
          publicPath: '/documentos/',
        }),
      },
    }),
  },
  singletons: {
    sitio: singleton({
      label: 'Datos de la fraternidad',
      path: 'src/data/sitio',
      format: 'json',
      schema: {
        modoBorrador: fields.checkbox({
          label: 'Mostrar aviso de "sitio en construcción"',
          description: 'Desmárcalo cuando toda la información sea real.',
          defaultValue: true,
        }),
        nombre: fields.text({ label: 'Nombre' }),
        subtitulo: fields.text({ label: 'Subtítulo' }),
        lema: fields.text({ label: 'Lema' }),
        sede: fields.text({ label: 'Sede (parroquia)' }),
        direccion: fields.text({ label: 'Dirección' }),
        whatsapp: fields.text({ label: 'WhatsApp', description: 'Solo números, con lada de país. Ej: 528711234567' }),
        correo: fields.text({ label: 'Correo electrónico' }),
        facebook: fields.url({ label: 'Facebook (enlace)' }),
        instagram: fields.url({ label: 'Instagram (enlace)' }),
        reuniones: fields.array(
          fields.object({
            titulo: fields.text({ label: 'Actividad' }),
            dia: fields.text({ label: 'Día' }),
            hora: fields.text({ label: 'Hora' }),
            lugar: fields.text({ label: 'Lugar' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
          }),
          { label: 'Horarios de reuniones', itemLabel: (p) => `${p.fields.titulo.value} · ${p.fields.dia.value}` },
        ),
      },
    }),
    comisiones: singleton({
      label: 'Comisiones',
      path: 'src/data/comisiones',
      format: 'json',
      schema: {
        comisiones: fields.array(
          fields.object({
            nombre: fields.text({ label: 'Nombre' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
            responsable: fields.text({ label: 'Responsable (opcional)' }),
          }),
          { label: 'Comisiones', itemLabel: (p) => p.fields.nombre.value },
        ),
      },
    }),
    proyectos: singleton({
      label: 'Proyectos',
      path: 'src/data/proyectos',
      format: 'json',
      schema: {
        proyectos: fields.array(
          fields.object({
            nombre: fields.text({ label: 'Nombre' }),
            frecuencia: fields.text({ label: 'Frecuencia' }),
            descripcion: fields.text({ label: 'Descripción', multiline: true }),
            comoAyudar: fields.text({ label: '¿Cómo puede ayudar alguien?', multiline: true }),
          }),
          { label: 'Proyectos', itemLabel: (p) => p.fields.nombre.value },
        ),
      },
    }),
  },
});
