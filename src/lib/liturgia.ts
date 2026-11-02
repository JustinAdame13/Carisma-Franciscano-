/*
  Liturgia de las Horas · Propio de la Familia Franciscana.
  Los textos viven en src/data/liturgia.json, que se genera desde los PDF
  con scripts/liturgia/liturgia.py (ver el README de esa carpeta).
  No se edita desde el panel: es un calendario fijo que se repite cada año.
*/
import datos from '../data/liturgia.json';

export interface Hora { id: string; titulo: string }
export interface Celebracion {
  id: string;
  mes: number;
  dia: number | null;
  movil: string | null;
  titulo: string;
  rangos: string[];
  semblanza: string;
  oficio: string;
  horas: Hora[];
  latin?: string;
}
export interface Entrada {
  mes: number;
  dia: number | null;
  movil?: string;
  nombre: string;
  rangos: string[];
  celebracion?: string;
}

export const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
export const BASE = '/oraciones/liturgia-de-las-horas';
export const FUENTE: string = datos.fuente;

export const calendario = datos.calendario as Entrada[];
export const celebraciones = datos.celebraciones as Celebracion[];
export const himnos = datos.himnos as { html: string; horas: Hora[] };

export const celebracion = (id?: string) => celebraciones.find((c) => c.id === id);

/** Fecha de una entrada fija: "8 de noviembre". */
export const fechaTexto = (e: { mes: number; dia: number | null; movil?: string | null }) =>
  e.dia ? `${e.dia} de ${MESES[e.mes - 1]}` : (e.movil ?? '');

/** URL de la página de un día fijo, o de una fiesta móvil. */
export const urlDia = (mes: number, dia: number) => `${BASE}/${MESES[mes - 1]}/${dia}/`;
export const urlEntrada = (e: Entrada) => (e.dia ? urlDia(e.mes, e.dia) : `${BASE}/fiestas-moviles/${e.celebracion}/`);

/** Días fijos con al menos una celebración, en orden del año. */
export const diasConCelebracion = () => {
  const vistos = new Map<string, { mes: number; dia: number }>();
  for (const e of calendario) if (e.dia) vistos.set(`${e.mes}-${e.dia}`, { mes: e.mes, dia: e.dia });
  return [...vistos.values()].sort((a, b) => a.mes - b.mes || a.dia - b.dia);
};

/*
  Rango que se muestra en listas cortas. El PDF da el rango por rama
  (OFM, OFM Cap, Clarisas…); para un blog franciscano seglar priorizamos
  el de toda la Familia Franciscana o el de la Orden Seglar.
*/
export function rangoPrincipal(rangos: string[]) {
  const r = rangos.find((x) => /^Familia Franciscana/i.test(x)) ?? rangos.find((x) => /OFS|III Orden|Tercera/i.test(x)) ?? rangos[0];
  if (!r) return '';
  const valor = r.includes(':') ? r.split(':').slice(1).join(':').trim() : r;
  return expandir(valor);
}

export const expandir = (r: string) =>
  r.replace(/\bMO\b/g, 'Memoria obligatoria').replace(/\bML\b/g, 'Memoria libre').replace(/\bFIESTA\b/g, 'Fiesta').replace(/\bSOLEMNIDAD\b/g, 'Solemnidad');

/** Desplazamiento en días respecto al Domingo de Pascua para las fiestas móviles conocidas. */
export function desfaseMovil(texto: string): number | null {
  const m = texto.match(/(\p{L}+) después del (I{1,3}|IV|V|VI) domingo de Pascua/iu);
  if (!m) return null;
  const dias: Record<string, number> = { domingo: 0, lunes: 1, martes: 2, miércoles: 3, jueves: 4, viernes: 5, sábado: 6 };
  const n = { I: 0, II: 1, III: 2, IV: 3, V: 4, VI: 5 }[m[2].toUpperCase() as 'I'] ?? 0;
  const d = dias[m[1].toLowerCase()];
  return d === undefined ? null : n * 7 + d;
}
