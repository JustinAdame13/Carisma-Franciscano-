import { sitio } from './sitio';

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
export function enlaceWhatsApp(mensaje = 'Hola, te escribo desde Carisma Franciscano.') {
  const numero = sitio.whatsapp.replace(/\D/g, '');
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}

// Lugar para buscar en Maps: solo las partes que sí estén llenas (evita ", " sueltas).
const lugar = [sitio.sede, sitio.direccion].filter(Boolean).join(', ');

/** Enlace de Google Maps para la dirección de la sede (o null si no hay lugar). */
export const enlaceMapa = lugar
  ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(lugar)}`
  : null;

export const mapaEmbed = lugar
  ? `https://www.google.com/maps?q=${encodeURIComponent(lugar)}&output=embed`
  : null;
