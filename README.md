# Carisma Franciscano · Sitio web

Blog personal **Carisma Franciscano**: oraciones, formación, proyectos, publicaciones y noticias con espiritualidad franciscana.

Hecho con **Astro**, **Tailwind CSS v4** y **Keystatic** (panel de contenido).

## Diseño

El sitio se lee como una **revista o un libro de la fraternidad**, no como una página de ventas:

- **Papel y tinta**: fondo cálido, texto oscuro y un solo color de acento, el rojo *rúbrica* que se usaba en los libros litúrgicos para títulos y números.
- **Tipografías**: Fraunces (titulares), Newsreader (lectura) e Inter Tight (rótulos en mayúsculas). Se sirven desde el propio sitio, sin Google Fonts.
- **Estructura con líneas y números** en lugar de tarjetas y sombras: cada página tiene su número (01 La Orden, 02 Oraciones…), como los capítulos de una revista.
- **Animaciones sutiles**: titulares que suben línea por línea, textos que aparecen al hacer scroll, líneas que se dibujan, la Tau que se traza sola, parallax suave en las fotos y transición entre páginas. Si la persona tiene activado "reducir movimiento" en su dispositivo, todo se muestra sin animación.

## Cómo correrlo en tu computadora

Necesitas Node.js 22 o más reciente.

```bash
npm install      # instala dependencias (solo la primera vez)
npm run dev      # abre el sitio en http://localhost:4321
```

- Sitio: http://localhost:4321
- Panel de contenido: http://localhost:4321/keystatic

Para generar la versión final: `npm run build`.

## Cómo está organizado

```
src/
├── pages/            ← cada archivo es una página (la URL sale del nombre del archivo)
│   ├── index.astro         → /
│   ├── la-orden.astro      → /la-orden
│   ├── oraciones/          → /oraciones y /oraciones/<nombre>
│   ├── proyectos/          → /proyectos y /proyectos/<nombre>
│   ├── formacion/          → /formacion y /formacion/<nombre>
│   ├── noticias/           → /noticias y /noticias/<nombre>
│   └── publicaciones/      → /publicaciones y /publicaciones/<nombre>
├── layouts/          ← estructura general (Base: header + footer; Entrada: cualquier entrada completa)
├── components/       ← piezas que se reutilizan (Header, Footer, Tau, Lineas, Rubro, Lamina, Cita…)
├── content/          ← noticias, publicaciones, proyectos, formacion y oraciones en Markdown (.md)
├── data/             ← datos editables desde el panel
│   ├── sitio.json          → nombre, contacto, aviso de "en construcción"
│   └── navegacion.ts       → opciones del menú y créditos
└── styles/global.css ← colores, tipografías y estilos del sistema de diseño
keystatic.config.ts   ← qué se puede editar desde el panel
```

Los **datos de contacto** se escriben una sola vez en `src/data/sitio.json` y solo se muestran en el pie de página (el enlace `#contacto` lleva ahí desde cualquier página). Lugar y dirección son opcionales: si están vacíos, esa columna no aparece.

## Cómo se edita el contenido

Desde el panel `/keystatic` se pueden:

- Publicar **Publicaciones**, **Noticias**, **Proyectos**, **Formación** y **Oraciones** (título, fecha, resumen, imagen y texto).
- Cambiar los **datos del sitio**: WhatsApp, correo y redes.

Cuando haya número de WhatsApp o correo, los botones de contacto del pie de página aparecen solos.

Cuando todo el contenido sea real, desmarca **"Mostrar aviso de sitio en construcción"** en *Datos del sitio*.

> Para agregar otra sección editable: crea la colección en `keystatic.config.ts` **y** en `src/content.config.ts` (deben coincidir), y sus páginas `index.astro` + `[...slug].astro` en `src/pages/`.

## Publicar en Vercel

1. El repositorio es `JustinAdame13/Carisma-Franciscano-` (si cambia de nombre, cámbialo en `keystatic.config.ts`).
2. En Vercel: **Add New → Project**, importa el repositorio y despliega. Vercel detecta Astro solo.
3. **Conectar el panel con GitHub** (para que alguien de la comunidad publique desde internet):
   - Corre `npm run dev`, cambia temporalmente `storage` en `keystatic.config.ts` a `{ kind: 'github', repo: '...' }` y entra a `/keystatic`.
   - Keystatic te guía para crear una *GitHub App* y genera un archivo `.env` con las variables.
   - Copia esas variables (ver `.env.example`) en Vercel → Settings → Environment Variables y vuelve a desplegar.
   - La persona que publique necesita una cuenta de GitHub con acceso al repositorio.
4. **Dominio propio:** cuando lo compren, en Vercel → Settings → Domains agrégalo y actualiza `site` en `astro.config.mjs`.

## Pendiente (contenido de ejemplo)

Todo lo marcado con `PENDIENTE` en el código, más:

- [ ] WhatsApp, correo y redes sociales
- [ ] Proyectos, formación y oraciones reales
- [ ] Fotos: guardar cada foto en `public/imagenes/` y agregar `src="/imagenes/..."` a su `<Lamina>`
- [ ] Borrar las entradas de ejemplo (las que tienen "Es contenido de ejemplo")
- [ ] Desactivar el aviso de "sitio en construcción"

---

Sitio desarrollado por [Justin Adame](https://portafolio-pink-rho.vercel.app/).
