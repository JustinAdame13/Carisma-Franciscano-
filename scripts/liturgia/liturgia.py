"""Convierte los 12 PDF del Propio de la Familia Franciscana en un JSON para el sitio.

Uso: python3 liturgia.py <carpeta_con_pdfs> <salida.json>
Los PDF deben llamarse ENERO.pdf, FEBRERO.pdf, ...
"""
import html, json, re, sys, unicodedata
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from lineas import lineas

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto',
         'septiembre', 'octubre', 'noviembre', 'diciembre']
CENTRO = 299.5
RE_FECHA = re.compile(r'^(\d{1,2}) de (' + '|'.join(MESES) + r')$', re.I)
RE_MOVIL = re.compile(r'después del .*domingo de Pascua', re.I)
RE_MARCA = re.compile(r'^(R\.|V\.|Ant\.?|Ant \d|Benedictus|Magníficat|Invitatorio|Oremos|\*|Lectura breve|Cántico)', re.I)


def norm(s):
    s = unicodedata.normalize('NFKD', s.lower())
    return ''.join(c for c in s if not unicodedata.combining(c))


def slug(s):
    return re.sub(r'[^a-z0-9]+', '-', norm(s)).strip('-')[:80]


def vacia(l):
    return not l['t'].strip()


def roja(l):
    seg = [s for s in l['segs'] if s['t'].strip()]
    return bool(seg) and all(s['r'] for s in seg)


def empieza_roja(l):
    seg = [s for s in l['segs'] if s['t'].strip()]
    return bool(seg) and seg[0]['r']


def negrita(l):
    seg = [s for s in l['segs'] if s['t'].strip()]
    return bool(seg) and all(s['b'] for s in seg)


def cursiva(l):
    seg = [s for s in l['segs'] if s['t'].strip()]
    return bool(seg) and all(s['i'] for s in seg)


def centrada(l):
    return l['x0'] > 105 and abs((l['x0'] + l['x1']) / 2 - CENTRO) < 8


def mayusculas(t):
    letras = [c for c in t if c.isalpha()]
    return len(letras) >= 3 and all(c.isupper() for c in letras)


def col_verso(x):
    return 183 <= x <= 200 or 212 <= x <= 232


def en_linea(segs):
    """Segmentos con formato → HTML en línea."""
    out = []
    for s in segs:
        t = html.escape(s['t'])
        if s['i'] and t.strip():
            t = f'<em>{t}</em>'
        if s['b'] and t.strip():
            t = f'<strong>{t}</strong>'
        if s['r'] and t.strip():
            t = f'<span class="r">{t}</span>'
        out.append(t)
    h = ''.join(out)
    h = re.sub(r'</span>(\s*)<span class="r">', r'\1', h)
    h = re.sub(r'</em>(\s*)<em>', r'\1', h)
    return re.sub(r'\s+', ' ', h).strip()


def tokenizar(ls):
    """Clasifica cada línea del cuerpo de una celebración."""
    toks = []
    n = len(ls)
    i = 0
    while i < n:
        l = ls[i]
        if vacia(l):
            toks.append(('vacia', l))
            i += 1
            continue
        t = l['t'].strip()
        prev = next((ls[j] for j in range(i - 1, -1, -1) if not vacia(ls[j])), None)
        sig = next((ls[j] for j in range(i + 1, n) if not vacia(ls[j])), None)
        vecino_verso = any(v is not None and v['x0'] >= 150 and col_verso(v['x0']) and abs(v['y'] - l['y']) > 2
                           and v['p'] == l['p'] for v in (prev, sig))
        if negrita(l) and re.fullmatch(r'[IVX]+', t):
            toks.append(('hora-menor', l))
        elif roja(l) and negrita(l) and centrada(l):
            toks.append(('seccion', l))
        elif roja(l) and cursiva(l) and centrada(l):
            toks.append(('titulo', l))
        elif negrita(l) and (centrada(l) or l['x0'] < 100) and len(t) < 40:
            es_hora = centrada(l) and not re.fullmatch(r'[IVX]+', t)
            toks.append(('hora' if es_hora else 'hora-menor', l))
        elif roja(l) and l['x0'] < 100 and mayusculas(t):
            ref = None
            if sig is not None and roja(sig) and sig['x0'] > 300 and abs(sig['y'] - l['y']) < 3:
                ref = sig
            toks.append(('rubro', l, ref))
            if ref is not None:
                i = ls.index(ref, i)
        elif roja(l) and centrada(l) and not (col_verso(l['x0']) and vecino_verso):
            toks.append(('subrubro', l))
        elif l['x0'] >= 150 and (col_verso(l['x0']) or vecino_verso):
            toks.append(('verso', l))
        elif centrada(l):
            toks.append(('centrada', l))
        else:
            toks.append(('prosa', l))
        i += 1
    return toks


def a_html(ls, horas=None):
    """Convierte líneas en HTML. Llena `horas` con las horas encontradas (para el índice)."""
    toks = tokenizar(ls)
    partes = []
    parrafo = None  # [clases, [html...], ultima_linea]
    estrofa = None  # [lineas html]

    def cerrar():
        nonlocal parrafo, estrofa
        if parrafo:
            clase = ' class="nota"' if parrafo[0] else ''
            partes.append(f'<p{clase}>' + ' '.join(parrafo[1]) + '</p>')
        if estrofa:
            partes.append('<p class="verso">' + '<br>'.join(estrofa) + '</p>')
        parrafo = None
        estrofa = None

    for tok in toks:
        tipo, l = tok[0], tok[1]
        t = l['t'].strip()
        if tipo == 'vacia':
            # Solo un renglón vacío en la columna de versos separa estrofas
            # (el PDF trae espacios sueltos a media estrofa).
            if estrofa and l['x0'] <= 232:
                cerrar()
            continue
        if tipo == 'prosa':
            if estrofa:
                cerrar()
            nuevo = (parrafo is None or 115 <= l['x0'] <= 135
                     or (empieza_roja(l) and RE_MARCA.match(t))
                     or parrafo[2]['x1'] < 470
                     or roja(l) != parrafo[0])
            if nuevo:
                cerrar()
                parrafo = [roja(l), [], l]
            parrafo[1].append(en_linea(l['segs']))
            parrafo[2] = l
            continue
        if tipo == 'verso':
            if parrafo:
                cerrar()
            if estrofa is None:
                estrofa = []
            h = en_linea(l['segs'])
            if l['x0'] >= 212:
                h = f'<span class="sangria">{h}</span>'
            estrofa.append(h)
            continue
        cerrar()
        h = en_linea(l['segs'])
        if tipo in ('hora', 'seccion'):
            ident = slug(t)
            if horas is not None:
                base, k = ident, 2
                while any(x['id'] == ident for x in horas):
                    ident = f'{base}-{k}'
                    k += 1
                m = re.match(r'^([IV]+ )(.*)$', t)
                bonito = (m.group(1) + m.group(2).capitalize()) if m else t.capitalize()
                horas.append({'id': ident, 'titulo': bonito})
            clase = 'seccion' if tipo == 'seccion' else 'hora'
            partes.append(f'<h3 id="{ident}" class="{clase}">{html.escape(t)}</h3>')
        elif tipo == 'hora-menor':
            partes.append(f'<h4 class="hora-menor">{html.escape(t)}</h4>')
        elif tipo == 'rubro':
            ref = tok[2]
            r = f' <span class="ref">{html.escape(ref["t"].strip())}</span>' if ref else ''
            partes.append(f'<h4 class="rubro">{html.escape(t)}{r}</h4>')
        elif tipo == 'subrubro':
            partes.append(f'<h4 class="subrubro">{html.escape(t)}</h4>')
        elif tipo == 'titulo':
            if partes and partes[-1].startswith('<p class="titulo-lectura">'):
                partes[-1] = partes[-1][:-4] + ' ' + html.escape(t) + '</p>'
            else:
                partes.append(f'<p class="titulo-lectura">{html.escape(t)}</p>')
        elif tipo == 'centrada':
            partes.append(f'<p class="centrada">{h}</p>')
    cerrar()
    return '\n'.join(partes)


def unir_titulo(lineas_titulo):
    t = ' '.join(l['t'].strip() for l in lineas_titulo)
    return re.sub(r'\s+', ' ', t).strip().rstrip(',')


def capitalizar(t):
    """'SAN DIEGO DE ALCALÁ, RELIGIOSO, I ORDEN' → 'San Diego de Alcalá, religioso, I Orden'."""
    menores = {'de', 'del', 'la', 'las', 'los', 'el', 'y', 'e', 'en', 'a', 'su', 'sus', 'al'}
    romanos = {'I', 'II', 'III', 'IV', 'XXIII', 'XX', 'XXI'}
    cargos = {'presbítero', 'presbíteros', 'religioso', 'religiosa', 'virgen', 'mártir', 'mártires', 'obispo',
              'diácono', 'papa', 'fundador', 'fundadora', 'seglar', 'viuda', 'doctor', 'compañeros', 'compañeras',
              'patrona', 'patrono', 'abadesa', 'confesor', 'esposa', 'madre', 'reina', 'rey', 'terciaria',
              'terciario', 'misionero', 'misionera', 'penitente', 'casada', 'casado', 'hermano', 'hermana', 'monja',
              'cardenal', 'arzobispo'}
    palabras = t.split(' ')
    out = []
    for i, p in enumerate(palabras):
        limpio = p.strip(',.;:()')
        if limpio in romanos:
            out.append(p)
            continue
        bajo = p.lower()
        lb = limpio.lower()
        if i > 0 and (lb in menores or lb in cargos):
            out.append(bajo)
        else:
            out.append(bajo[:1].upper() + bajo[1:])
    s = ' '.join(out)
    s = s.replace(' Orden', ' Orden').replace('orden', 'Orden')
    return s


def parsear_indice(ls):
    items = []
    for l in ls:
        t = l['t'].strip()
        if not t:
            continue
        if t.upper().startswith('APÉNDICE'):
            break
        if l['x0'] < 105 and re.fullmatch(r'\d{1,2}', t):
            items.append({'dia': int(t), 'nombre': '', 'rangos': []})
        elif l['x0'] < 105 and RE_MOVIL.search(t):
            items.append({'dia': None, 'movil': t.rstrip(':'), 'nombre': '', 'rangos': []})
        elif not items:
            continue
        elif l['x0'] < 140 or (items[-1].get('movil') and l['x0'] < 105):
            items[-1]['nombre'] = (items[-1]['nombre'] + ' ' + t).strip()
        else:
            if items[-1]['rangos'] and (t[:1].islower() or t[:1] == '('):
                items[-1]['rangos'][-1] += ' ' + t
            else:
                items[-1]['rangos'].append(t)
    for it in items:
        it['nombre'] = it['nombre'].rstrip('.').strip()
    return items


def parsear_celebraciones(ls, mes):
    """Divide el cuerpo en celebraciones por los encabezados de fecha."""
    cortes = [i for i, l in enumerate(ls)
              if centrada(l) and not negrita(l) and (
                  (RE_FECHA.match(l['t'].strip()) and RE_FECHA.match(l['t'].strip()).group(2).lower() == mes)
                  or RE_MOVIL.search(l['t']))]
    cels = []
    for k, ini in enumerate(cortes):
        fin = cortes[k + 1] if k + 1 < len(cortes) else len(ls)
        bloque = ls[ini + 1:fin]
        j = 0
        while j < len(bloque) and vacia(bloque[j]):
            j += 1
        tit = []
        while j < len(bloque) and negrita(bloque[j]):
            tit.append(bloque[j])
            j += 1
        while (j < len(bloque) and tit and centrada(bloque[j]) and not roja(bloque[j])
               and mayusculas(bloque[j]['t'])):
            j += 1  # segunda línea del título (cargo, Orden): ya está en el nombre del índice
        rangos = []
        while j < len(bloque) and not vacia(bloque[j]) and roja(bloque[j]) and centrada(bloque[j]):
            t = bloque[j]['t'].strip()
            if rangos and (t[:1].islower() or t[:1] == '('):
                rangos[-1] += ' ' + t
            else:
                rangos.append(t)
            j += 1
        horas = []
        cuerpo = a_html(bloque[j:], horas)
        # La semblanza es lo que va antes de la primera hora.
        corte = cuerpo.find('<h3')
        semblanza, oficio = (cuerpo, '') if corte < 0 else (cuerpo[:corte], cuerpo[corte:])
        cab = ls[ini]['t'].strip()
        movil = cab if RE_MOVIL.search(cab) else None
        dia = None if movil else int(RE_FECHA.match(cab).group(1))
        titulo = capitalizar(unir_titulo(tit)) if tit else ''
        cels.append({'dia': dia, 'movil': movil, 'titulo': titulo, 'rangos': rangos,
                     'semblanza': semblanza.strip(), 'oficio': oficio.strip(), 'horas': horas})
    return cels


def parsear_latin(ls, mes):
    """Apéndice II: himnos latinos propios, por fecha."""
    cortes = [i for i, l in enumerate(ls) if RE_FECHA.match(l['t'].strip())
              and RE_FECHA.match(l['t'].strip()).group(2).lower() == mes]
    out = []
    for k, ini in enumerate(cortes):
        fin = cortes[k + 1] if k + 1 < len(cortes) else len(ls)
        bloque = ls[ini + 1:fin]
        j = 0
        while j < len(bloque) and vacia(bloque[j]):
            j += 1
        titulo = bloque[j]['t'].strip() if j < len(bloque) else ''
        out.append({'dia': int(RE_FECHA.match(ls[ini]['t'].strip()).group(1)), 'titulo': titulo,
                    'html': a_html(bloque[j + 1:])})
    return out


def parecido(a, b):
    pa = {w for w in re.findall(r'[a-z]{4,}', norm(a))} - {'orden', 'beato', 'beata', 'santo', 'santa', 'compañeros', 'companeros', 'presbitero', 'religioso', 'virgen', 'martires', 'martir'}
    pb = {w for w in re.findall(r'[a-z]{4,}', norm(b))}
    return len(pa & pb) / max(1, len(pa))


def main(carpeta, salida):
    calendario, celebraciones, himnos = [], [], None
    for m, mes in enumerate(MESES, 1):
        ls = lineas(f'{carpeta}/{mes.upper()}.pdf')
        i_ap1 = next(i for i, l in enumerate(ls) if l['t'].strip() == 'APÉNDICE I' and negrita(l))
        i_ap2 = next((i for i, l in enumerate(ls) if l['t'].strip() == 'APÉNDICE II' and negrita(l)), len(ls))
        i_cel = next((i for i, l in enumerate(ls[:i_ap1]) if centrada(l) and RE_FECHA.match(l['t'].strip())), i_ap1)
        indice = parsear_indice(ls[:i_cel])
        cels = parsear_celebraciones(ls[i_cel:i_ap1], mes)
        latin = parsear_latin(ls[i_ap2:], mes) if i_ap2 < len(ls) else []
        if himnos is None:
            ap1 = [l for l in ls[i_ap1 + 1:i_ap2]]
            # quitamos el subtítulo "Himnos en castellano"
            ap1 = [l for l in ap1 if l['t'].strip() != 'Himnos en castellano']
            himnos = {'horas': []}
            himnos['html'] = a_html(ap1, himnos['horas'])
        for c in cels:
            c['mes'] = m
            c['id'] = slug(c['titulo'])
            for la in latin:
                if la['dia'] == c['dia'] and (len([x for x in cels if x['dia'] == c['dia']]) == 1
                                               or parecido(la['titulo'], c['titulo']) > 0.3):
                    c['latin'] = la['html']
        usadas = set()
        for it in indice:
            it['mes'] = m
            cand = [(parecido(it['nombre'], c['titulo']), k) for k, c in enumerate(cels)
                    if c['dia'] == it['dia'] and bool(c.get('movil')) == bool(it.get('movil')) and k not in usadas]
            cand.sort(reverse=True)
            if cand and cand[0][0] >= 0.34:
                usadas.add(cand[0][1])
                it['celebracion'] = cels[cand[0][1]]['id']
        for k, c in enumerate(cels):
            if k not in usadas:
                calendario_extra = {'mes': m, 'dia': c['dia'], 'nombre': c['titulo'], 'rangos': c['rangos'],
                                    'celebracion': c['id']}
                if c.get('movil'):
                    calendario_extra['movil'] = c['movil']
                indice.append(calendario_extra)
                print(f'  [aviso] {mes} {c["dia"]}: "{c["titulo"]}" no estaba en el índice; agregado', file=sys.stderr)
        indice.sort(key=lambda x: x['dia'] or 99)
        calendario += indice
        celebraciones += cels
        print(f'{mes:11} índice={len(indice):3} textos={len(cels):3} latín={len(latin)}', file=sys.stderr)
    datos = {'fuente': 'Liturgia de las Horas · Propio de la Familia Franciscana en España',
             'calendario': calendario, 'celebraciones': celebraciones, 'himnos': himnos}
    with open(salida, 'w', encoding='utf-8') as f:
        json.dump(datos, f, ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main(sys.argv[1], sys.argv[2])
