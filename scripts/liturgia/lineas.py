import pymupdf as fitz, sys, json
RED=16711680
def lineas(path):
    d=fitz.open(path); out=[]
    for pn,p in enumerate(d):
        for b in p.get_text('dict')['blocks']:
            for l in b.get('lines',[]):
                sp=[s for s in l['spans']]
                if not sp: continue
                if all(s['font'].startswith('Times') for s in sp if s['text'].strip()) and any(s['text'].strip() for s in sp):
                    continue  # page number
                text=''.join(s['text'] for s in sp)
                segs=[]
                for s in sp:
                    if not s['text']: continue
                    segs.append({'t':s['text'],'r':s['color']==RED,'b':'Bold' in s['font'],'i':'Italic' in s['font']})
                out.append({'p':pn,'x0':round(l['bbox'][0]),'x1':round(l['bbox'][2]),'y':round(l['bbox'][1],1),'t':text,'segs':segs})
    return out
if __name__=='__main__':
    for l in lineas(sys.argv[1]):
        flags=('R' if any(s['r'] for s in l['segs'] if s['t'].strip()) else '-')+('B' if any(s['b'] for s in l['segs'] if s['t'].strip()) else '-')+('I' if any(s['i'] for s in l['segs'] if s['t'].strip()) else '-')
        print(f"{l['p']:3} {l['x0']:4} {l['x1']:4} {flags} |{l['t'].rstrip()}")
