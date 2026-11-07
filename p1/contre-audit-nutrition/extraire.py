import re,sys,hashlib
def extraire(path,name):
    s=open(path,encoding='utf-8').read()
    m=re.search(r'^(async\s+)?function\s+'+re.escape(name)+r'\s*\(',s,re.M)
    if not m: return None
    i=s.index('{',m.end()); d=0; j=i
    instr=None; esc=False; k=i
    while k<len(s):
        c=s[k]
        if instr:
            if esc: esc=False
            elif c=='\\': esc=True
            elif c==instr: instr=None
        else:
            if c in '"\'`': instr=c
            elif c=='/' and s[k+1]=='/': k=s.index('\n',k); continue
            elif c=='/' and s[k+1]=='*': k=s.index('*/',k)+1
            elif c=='{': d+=1
            elif c=='}':
                d-=1
                if d==0: return s[m.start():k+1], s[:m.start()].count('\n')+1
        k+=1
names=sys.argv[3:]
for n in names:
    a=extraire(sys.argv[1],n); b=extraire(sys.argv[2],n)
    if a is None or b is None: print(n,'ABSENTE', a is None, b is None); continue
    h=lambda x:hashlib.sha1(x[0].encode()).hexdigest()[:8]
    print(f"{n:24s} master L{a[1]} {h(a)} | cand L{b[1]} {h(b)} | {'IDENTIQUE' if a[0]==b[0] else 'DIFFÈRE'}")
