import { config, collection, singleton, fields } from '@keystatic/core';

/*
  Panel de contenido (CMS) del sitio. Se abre en /keystatic.
  - En tu computadora (npm run dev) guarda los cambios directo en los archivos.
  - En Vercel guarda los cambios como commits en GitHub y el sitio se vuelve a publicar solo.
  Si el repositorio tiene otro nombre, cámbialo en `repo`.

  Cada colección de aquí debe tener su gemela en src/content.config.ts:
  Keystatic arma el formulario del panel y Astro valida los archivos al compilar.
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
  ? { kind: 'github', repo: 'JustinAdame13/Carisma-Franciscano-' }
  : { kind: 'local' },
  ui: {
    brand: { name: 'Carisma Franciscano' },
    navigation: {
      Publicar: ['publicaciones', 'noticias', 'proyectos', 'formacion', 'oraciones'],
      'Datos del sitio': ['sitio'],
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
    proyectos: collection({
      label: 'Proyectos',
      slugField: 'titulo',
      path: 'src/content/proyectos/*',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'fecha'],
      schema: {
        ...camposDePublicacion('proyectos'),
        frecuencia: fields.text({ label: 'Frecuencia (opcional)', description: 'Ej: Cada mes, Sábados por la mañana.' }),
        comoAyudar: fields.text({ label: '¿Cómo puede ayudar alguien? (opcional)', multiline: true }),
      },
    }),
    formacion: collection({
      label: 'Formación',
      slugField: 'titulo',
      path: 'src/content/formacion/*',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'fecha'],
      schema: {
        ...camposDePublicacion('formacion'),
        tema: fields.select({
          label: 'Tema',
          options: [
            { label: 'Espiritualidad', value: 'Espiritualidad' },
            { label: 'San Francisco y Santa Clara', value: 'San Francisco y Santa Clara' },
            { label: 'Sagrada Escritura', value: 'Sagrada Escritura' },
            { label: 'Doctrina', value: 'Doctrina' },
            { label: 'Lectura recomendada', value: 'Lectura recomendada' },
          ],
          defaultValue: 'Espiritualidad',
        }),
        archivo: fields.file({
          label: 'Archivo PDF (opcional)',
          directory: 'public/documentos',
          publicPath: '/documentos/',
        }),
      },
    }),
    oraciones: collection({
      label: 'Oraciones',
      slugField: 'titulo',
      path: 'src/content/oraciones/*',
      format: { contentField: 'contenido' },
      entryLayout: 'content',
      columns: ['titulo', 'categoria'],
      schema: {
        titulo: fields.slug({ name: { label: 'Título' } }),
        fecha: fields.date({ label: 'Fecha', description: 'Solo sirve para ordenar: las más recientes salen primero.', defaultValue: { kind: 'today' }, validation: { isRequired: true } }),
        fuente: fields.text({ label: 'Autor o fuente (opcional)', description: 'Ej: San Francisco de Asís, Tradición franciscana.' }),
        categoria: fields.select({
          label: 'Categoría',
          options: [
            { label: 'Oración', value: 'Oración' },
            { label: 'Novena', value: 'Novena' },
            { label: 'Letanía', value: 'Letanía' },
            { label: 'Bendición', value: 'Bendición' },
          ],
          defaultValue: 'Oración',
        }),
        resumen: fields.text({ label: 'Nota breve (opcional)', description: 'Para qué momento es o una intención. Aparece en la lista.', multiline: true }),
        ejemplo: fields.checkbox({ label: 'Es contenido de ejemplo', description: 'Márcalo solo en oraciones de prueba.', defaultValue: false }),
        contenido: fields.markdoc({ label: 'Texto de la oración', extension: 'md' }),
      },
    }),
  },
  singletons: {
    sitio: singleton({
      label: 'Datos del sitio',
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
        sede: fields.text({ label: 'Lugar (opcional)', description: 'Si lo llenas, aparece en el pie de página.' }),
        direccion: fields.text({ label: 'Dirección (opcional)' }),
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
          { label: 'Horarios (opcional)', itemLabel: (p) => `${p.fields.titulo.value} · ${p.fields.dia.value}` },
        ),
      },
    }),
  },
});
