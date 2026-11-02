/*
  Convierte el enlace que pega el cliente en dos enlaces útiles:
  - ver:       abre el documento (la vista previa de Drive).
  - descargar: baja el archivo directamente, si Drive lo permite.

  ¿Por qué? El enlace de "Compartir" de Drive (…/file/d/ID/view) abre una
  vista previa, no descarga. Drive tiene otra dirección para descargar
  usando el mismo ID del archivo, así que solo hay que extraerlo.
*/
export interface Documento { nombre: string; enlace: string }
export interface EnlacesDocumento { nombre: string; ver: string; descargar: string | null; tipo: string }

export function enlacesDocumento({ nombre, enlace }: Documento): EnlacesDocumento {
  let url: URL;
  try {
    url = new URL(enlace);
  } catch {
    return { nombre, ver: enlace, descargar: null, tipo: 'Enlace' };
  }
  const id = url.pathname.match(/\/d\/([\w-]{10,})/)?.[1] ?? url.searchParams.get('id');

  if (url.hostname === 'drive.google.com') {
    if (url.pathname.includes('/folders/')) return { nombre, ver: enlace, descargar: null, tipo: 'Carpeta' };
    if (id) return { nombre, ver: `https://drive.google.com/file/d/${id}/view`, descargar: `https://drive.google.com/uc?export=download&id=${id}`, tipo: 'Archivo' };
  }
  if (url.hostname === 'docs.google.com' && id) {
    // Los documentos de Google (Docs, Hojas, Presentaciones) se descargan convertidos a PDF.
    if (url.pathname.startsWith('/document/')) return { nombre, ver: enlace, descargar: `https://docs.google.com/document/d/${id}/export?format=pdf`, tipo: 'Documento' };
    if (url.pathname.startsWith('/presentation/')) return { nombre, ver: enlace, descargar: `https://docs.google.com/presentation/d/${id}/export/pdf`, tipo: 'Presentación' };
    if (url.pathname.startsWith('/spreadsheets/')) return { nombre, ver: enlace, descargar: `https://docs.google.com/spreadsheets/d/${id}/export?format=pdf`, tipo: 'Hoja de cálculo' };
  }
  const pdf = /\.pdf$/i.test(url.pathname);
  return { nombre, ver: enlace, descargar: pdf ? enlace : null, tipo: pdf ? 'PDF' : 'Enlace' };
}
