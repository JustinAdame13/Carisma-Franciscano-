import sitio from '../data/sitio.json';

/** Formatea una fecha como "3 de octubre de 2026". */
export function formatoFecha(fecha: Date) {
  return fecha.toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

/** Enlace de WhatsApp con mensaje prellenado (o null si aún no hay número). */
export function enlaceWhatsApp(mensaje = 'Hola, me gustaría conocer la fraternidad Caridad Franciscana.') {
  const numero = sitio.whatsapp.replace(/\D/g, '');
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

/** Enlace de Google Maps para la dirección de la sede. */
export const enlaceMapa = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
  `${sitio.sede}, ${sitio.direccion}`,
)}`;

export const mapaEmbed = `https://www.google.com/maps?q=${encodeURIComponent(
  `${sitio.sede}, ${sitio.direccion}`,
)}&output=embed`;
