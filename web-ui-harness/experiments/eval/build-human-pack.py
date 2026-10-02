#!/usr/bin/env python3
"""사용자 blind 평가 패키지 생성기.
usage: build-human-pack.py <pairs.json> <out_dir> [--seed N]
pairs.json: [{"task":"T3","a":"T3-B-1","b":"T3-C-1","mobile":false,"repeat":false}, ...]
 - 각 쌍의 좌/우는 무작위로 배치한다(키는 out_dir/../human-blind-key.json 에 별도 저장).
 - 이미지: 해당 run의 qa/shot-1440.png(첫 화면), qa/full-1440.png(전체 축소), mobile=true면 qa/shot-375.png도.
 - 산출: out_dir/index.html (오프라인 단일 폴더). 응답은 브라우저 localStorage에 저장되고 'JSON 내보내기'로 복사한다.
"""
import json, os, random, shutil, sys
pairs = json.load(open(sys.argv[1], encoding='utf-8'))
out = sys.argv[2]
seed = int(sys.argv[sys.argv.index('--seed') + 1]) if '--seed' in sys.argv else 20261002
root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'runs'))
rnd = random.Random(seed)
shutil.rmtree(out, ignore_errors=True); os.makedirs(out + '/img')
items, key = [], {}
order = list(range(len(pairs))); rnd.shuffle(order)
for n, idx in enumerate(order, 1):
    p = pairs[idx]; flip = rnd.random() < 0.5
    left, right = (p['b'], p['a']) if flip else (p['a'], p['b'])
    pid = f'P{n:02d}'
    key[pid] = {'task': p['task'], 'left': left, 'right': right, 'repeat': bool(p.get('repeat'))}
    imgs = {}
    for side, run in (('L', left), ('R', right)):
        for kind, src in (('fold', 'shot-1440.png'), ('full', 'full-1440.png')) + ((('mob', 'shot-375.png'),) if p.get('mobile') else ()):
            dst = f'img/{pid}-{side}-{kind}.png'
            shutil.copy(f'{root}/{run}/qa/{src}', f'{out}/{dst}')
            imgs[f'{side}_{kind}'] = dst
    items.append({'id': pid, 'task': p['task'], 'imgs': imgs})
json.dump({'note': '평가가 끝나기 전에 열지 마세요. 좌/우 배치와 조건(A/B/C)의 대응표입니다.', 'seed': seed, 'key': key},
          open(os.path.join(os.path.dirname(out.rstrip('/')), 'human-blind-key.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
html = '''<!doctype html><html lang="ko"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>페이지 비교 평가</title>
<style>
:root{--bg:#f6f7f9;--fg:#15181d;--mut:#5b6472;--line:#d9dde3;--card:#fff;--acc:#2447b3}
@media(prefers-color-scheme:dark){:root{--bg:#101318;--fg:#e8ebf0;--mut:#9aa4b2;--line:#2a313b;--card:#171b22;--acc:#8fb0ff}}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--fg);font:16px/1.6 system-ui,"Apple SD Gothic Neo","Noto Sans KR",sans-serif}
main{max-width:1200px;margin:0 auto;padding:20px 16px 80px}h1{font-size:20px;margin:8px 0}p.s{color:var(--mut);margin:4px 0 16px}
.bar{position:sticky;top:0;background:var(--bg);padding:10px 0;border-bottom:1px solid var(--line);display:flex;gap:12px;align-items:center;justify-content:space-between;z-index:5}
.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:14px}@media(max-width:800px){.pair{grid-template-columns:1fr}}
.side{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px}.side h2{font-size:14px;margin:0 0 8px;color:var(--mut)}
.side img{width:100%;border:1px solid var(--line);border-radius:6px;display:block;margin-bottom:8px}details summary{cursor:pointer;color:var(--acc);margin:6px 0}
fieldset{border:1px solid var(--line);border-radius:10px;margin:16px 0;padding:10px 14px;background:var(--card)}legend{font-weight:600;padding:0 6px}
label{display:inline-flex;gap:6px;margin:4px 14px 4px 0;align-items:center}input[type=text]{width:100%;padding:8px;border:1px solid var(--line);border-radius:6px;background:var(--bg);color:var(--fg)}
button{padding:10px 16px;border-radius:8px;border:1px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer;font:inherit}button.p{background:var(--acc);color:#fff;border-color:var(--acc)}
.nav{display:flex;gap:8px;margin-top:12px}.done{color:var(--mut)}textarea{width:100%;height:160px}
</style></head><body><main>
<div class="bar"><div><strong id="prog"></strong></div><div><button id="exp">JSON 내보내기</button></div></div>
<h1>두 페이지 중 어느 쪽이 더 나은가요?</h1>
<p class="s">좌우 위치와 순서는 무작위입니다. 어느 쪽이 어떻게 만들어졌는지는 알려주지 않습니다. 첫 화면을 먼저 보고, 필요하면 '전체 보기'를 펼쳐 비교하세요. 정답은 없습니다. 비슷하면 '차이 없음'을 고르세요.</p>
<div id="stage"></div><div class="nav"><button id="prev">이전</button><button id="next" class="p">다음</button></div>
<div id="end" hidden><h1>끝났습니다</h1><p>아래 JSON을 복사해서 전달해 주세요.</p><textarea id="out" readonly></textarea></div></main>
<script>
const ITEMS=__ITEMS__;const KEY='human-blind-v1';let st={};try{st=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){}
let i=0;const $=s=>document.querySelector(s);const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}};
const Q=[['intent','어느 쪽이 더 의도를 가지고 디자인된 것처럼 보이나요? (이유 없이 평균적인 선택이 적은 쪽)'],['use','어느 쪽을 실제 서비스에 쓰고 싶나요?'],['ai','어느 쪽이 더 \\'AI가 만든 것 같다\\'고 느껴지나요?']];
function radios(name,cur){return ['L:왼쪽','R:오른쪽','T:차이 없음'].map(x=>{const[v,t]=x.split(':');return `<label><input type=radio name="${name}" value="${v}" ${cur===v?'checked':''}>${t}</label>`}).join('')}
function render(){const it=ITEMS[i];const r=st[it.id]||{};$('#prog').textContent=`${i+1} / ${ITEMS.length}`;
const side=(s,l)=>`<div class=side><h2>${l}</h2><img src="${it.imgs[s+'_fold']}" alt="">${it.imgs[s+'_mob']?`<img src="${it.imgs[s+'_mob']}" style="max-width:260px" alt="">`:''}<details><summary>전체 보기</summary><img src="${it.imgs[s+'_full']}" alt=""></details></div>`;
$('#stage').innerHTML=`<div class=pair>${side('L','왼쪽')}${side('R','오른쪽')}</div>`+Q.map(([k,t])=>`<fieldset><legend>${t}</legend>${radios(k,r[k])}</fieldset>`).join('')+`<fieldset><legend>한 줄 이유 (선택)</legend><input type=text id=why value="${(r.why||'').replace(/"/g,'&quot;')}"></fieldset>`;
document.querySelectorAll('input[type=radio]').forEach(e=>e.onchange=()=>{(st[it.id]=st[it.id]||{})[e.name]=e.value;save()});
$('#why').oninput=e=>{(st[it.id]=st[it.id]||{}).why=e.target.value;save()};$('#prev').disabled=i===0;$('#next').textContent=i===ITEMS.length-1?'완료':'다음';window.scrollTo(0,0)}
$('#prev').onclick=()=>{i--;render()};$('#next').onclick=()=>{if(i<ITEMS.length-1){i++;render()}else{$('#stage').hidden=true;$('.nav').hidden=true;$('#end').hidden=false;$('#out').value=JSON.stringify(st,null,1)}};
$('#exp').onclick=()=>{$('#stage').hidden=true;$('.nav').hidden=true;$('#end').hidden=false;$('#out').value=JSON.stringify(st,null,1)};render();
</script></body></html>'''
html = html.replace('__ITEMS__', json.dumps(items, ensure_ascii=False))
open(out + '/index.html', 'w', encoding='utf-8').write(html)
print(f'{len(items)}쌍 생성 → {out}/index.html (키: human-blind-key.json)')
