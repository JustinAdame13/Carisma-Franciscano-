# Liturgia de las Horas · conversión de los PDF

La subsección **Oraciones → Liturgia de las Horas** no se edita desde el panel:
sus textos salen de los 12 PDF del *Propio de la Familia Franciscana* y viven en
`src/data/liturgia.json`.

Solo hay que volver a correr esto si cambian los PDF.

## Cómo regenerar el JSON

Necesitas Python 3 y PyMuPDF:

```bash
pip install pymupdf
```

1. Copia los 12 PDF a una carpeta y renómbralos `ENERO.pdf`, `FEBRERO.pdf`, … `DICIEMBRE.pdf`.
2. Desde la raíz del proyecto:

```bash
python scripts/liturgia/liturgia.py ruta/a/los/pdf src/data/liturgia.json
```

## Cómo funciona

- `lineas.py` lee cada línea del PDF con su posición (x), color y estilo.
  En estos PDF el **rojo** marca las rúbricas, la **negrita** las horas
  (Laudes, Vísperas…) y la **sangría** distingue prosa (x≈85/121) de versos (x≈191/220).
- `liturgia.py` usa esas pistas para separar el índice del mes, cada celebración
  y los apéndices de himnos, y convierte el texto en HTML con clases
  (`.hora`, `.rubro`, `.verso`, `.nota`…) que se estilizan en `src/styles/global.css`.
- La única fiesta móvil (*Sábado después del III domingo de Pascua*) se calcula
  en el navegador a partir de la fecha de Pascua de cada año.
