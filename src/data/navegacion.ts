// Opciones del menú principal. El orden aquí es el orden en la barra.
// "numero" y "resumen" se usan en el sumario de la portada y en el encabezado de cada página.
export const navegacion = [
  { texto: 'Inicio', href: '/', numero: '00', resumen: 'Portada' },
  { texto: 'La Orden', href: '/la-orden', numero: '01', resumen: 'Qué es la Orden Franciscana Seglar y de dónde venimos' },
  { texto: 'Comisiones', href: '/comisiones', numero: '02', resumen: 'Cómo nos organizamos para servir' },
  { texto: 'Proyectos', href: '/proyectos', numero: '03', resumen: 'La caridad hecha obra en nuestra colonia' },
  { texto: 'Formación', href: '/formacion', numero: '04', resumen: 'El camino para integrarte, paso a paso' },
  { texto: 'Publicaciones', href: '/publicaciones', numero: '05', resumen: 'Reflexiones, boletines y documentos' },
  { texto: 'Noticias', href: '/noticias', numero: '06', resumen: 'Crónica de la vida fraterna' },
  { texto: 'Contacto', href: '/contacto', numero: '07', resumen: 'Dónde y cuándo encontrarnos' },
];

export const seccion = (href: string) => navegacion.find((n) => n.href === href)!;

export const CREDITOS = {
  autor: 'Justin Adame',
  url: 'https://portafolio-pink-rho.vercel.app/',
};
