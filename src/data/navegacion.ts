// Opciones del menú principal. El orden aquí es el orden en la barra.
// "numero" y "resumen" se usan en el sumario de la portada y en el encabezado de cada página.
export const navegacion = [
  { texto: 'Inicio', href: '/', numero: '00', resumen: 'Portada' },
  { texto: 'La Orden', href: '/la-orden', numero: '01', resumen: 'Qué es la familia franciscana y de dónde viene' },
  { texto: 'Oraciones', href: '/oraciones', numero: '02', resumen: 'Oraciones franciscanas para cada momento' },
  { texto: 'Proyectos', href: '/proyectos', numero: '03', resumen: 'La caridad hecha obra' },
  { texto: 'Formación', href: '/formacion', numero: '04', resumen: 'Temas y lecturas para crecer en la fe' },
  { texto: 'Publicaciones', href: '/publicaciones', numero: '05', resumen: 'Reflexiones y documentos' },
  { texto: 'Noticias', href: '/noticias', numero: '06', resumen: 'Avisos y crónica' },
];

export const seccion = (href: string) => navegacion.find((n) => n.href === href)!;

export const CREDITOS = {
  autor: 'Justin Adame',
  url: 'https://portafolio-pink-rho.vercel.app/',
};
