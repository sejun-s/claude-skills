const fs=require('fs');
const plans=['스타터','팀','비즈니스','엔터프라이즈'];
const rows=[
['월 요금 (사용자당)','무료','₩9,900','₩19,900','별도 문의'],
['프로젝트 수','3개','무제한','무제한','무제한'],
['저장 공간','5GB','100GB','1TB','맞춤 설정'],
['팀 구성원','최대 5명','최대 50명','최대 500명','제한 없음'],
['승인 워크플로','—','기본','다단계 승인','다단계 승인 + 감사 로그'],
['외부 서비스 연동','3개','20개','100개 이상','100개 이상 + 전용 커넥터'],
['단일 로그인(SSO)','—','—','지원','지원 (SAML, SCIM)'],
['고객 지원','커뮤니티','이메일 (영업일 2일 이내)','이메일·채팅 (4시간 이내)','전담 매니저 및 24시간 대응']];
const cards=[
['업무 보드','칸반과 타임라인을 한 화면에서 전환합니다.'],
['자동화 규칙','조건에 따라 담당자 지정과 상태 변경을 자동으로 처리합니다.'],
['승인 요청','검토가 필요한 항목을 지정된 순서에 따라 승인자에게 전달합니다.'],
['외부 서비스 연동을 통한 알림 통합 관리','메신저, 이메일, 캘린더의 알림을 한곳에서 확인합니다.'],
['리포트','팀별 처리 속도와 지연 항목을 주간 단위로 요약합니다.'],
['템플릿','반복되는 업무 구조를 저장해 새 프로젝트에 바로 적용합니다.'],
['권한 관리','프로젝트와 항목 단위로 열람·편집 권한을 구분합니다.'],
['감사 로그 및 변경 이력 추적','누가 언제 무엇을 바꿨는지 기록으로 남깁니다.']];
const nav=['제품 소개','기능','요금제','고객 사례','보안 및 규정 준수','개발자 문서','고객 지원'];
const table=`<table class="cmp"><thead><tr><th scope="col"><span class="sr">항목</span></th>${plans.map(p=>`<th scope="col">${p}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr><th scope="row">${r[0]}</th>${r.slice(1).map(v=>`<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table>`;
const stack=plans.map((p,i)=>`<article class="plan"><h3>${p}</h3><dl>${rows.map(r=>`<div><dt>${r[0]}</dt><dd>${r[i+1]}</dd></div>`).join('')}</dl></article>`).join('');
const html=`<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>스텝보드</title>
<style>
@font-face{font-family:Pretendard;font-weight:400;font-display:swap;src:url(fonts/Pretendard-Regular.woff2) format("woff2")}
@font-face{font-family:Pretendard;font-weight:500;font-display:swap;src:url(fonts/Pretendard-Medium.woff2) format("woff2")}
@font-face{font-family:Pretendard;font-weight:600;font-display:swap;src:url(fonts/Pretendard-SemiBold.woff2) format("woff2")}
@font-face{font-family:Pretendard;font-weight:700;font-display:swap;src:url(fonts/Pretendard-Bold.woff2) format("woff2")}
:root{
 --bg:#F3F5FA;--surface:#FFFFFF;--ink:#141B34;--ink-2:#4A5270;--line:#D9DEEB;--accent:#2A44F0;--accent-ink:#1B2FC0;--tint:#E4E9FF;--deep:#141B34;--deep-ink:#F3F5FA;
 --on-accent:#fff;--gut:clamp(16px,4vw,48px);--max:1200px;
 font-family:Pretendard,system-ui,sans-serif;color-scheme:light;
}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]){
 --bg:#0E1326;--surface:#171E38;--ink:#EEF1FB;--ink-2:#A9B2D1;--line:#2B3454;--accent:#6F85FF;--accent-ink:#9DAEFF;--tint:#222C55;--deep:#0A0F20;--deep-ink:#EEF1FB;--on-accent:#0E1326;color-scheme:dark}}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--bg);color:var(--ink);font-size:1rem;line-height:1.6;word-break:keep-all;overflow-wrap:break-word;letter-spacing:-.01em}
::selection{background:var(--accent);color:#fff}
a{color:inherit;text-underline-offset:.25em}
:focus-visible{outline:3px solid var(--accent);outline-offset:3px;border-radius:4px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.wrap{max-width:var(--max);margin:0 auto;padding-inline:var(--gut)}
/* nav */
.top{background:var(--surface);border-bottom:1px solid var(--line)}
.top .wrap{display:flex;flex-wrap:wrap;align-items:center;gap:.5rem 2rem;padding-block:1rem}
.brand{font-weight:700;font-size:1.375rem;letter-spacing:-.03em;text-decoration:none;display:flex;align-items:center;gap:.6rem;margin-right:auto}
.brand i{display:inline-block;width:1.25rem;height:1.25rem;background:linear-gradient(var(--accent),var(--accent)) left bottom/33.4% 40% no-repeat,linear-gradient(var(--accent),var(--accent)) center bottom/33.4% 70% no-repeat,linear-gradient(var(--accent),var(--accent)) right bottom/33.4% 100% no-repeat}
.cta{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:.55rem 1.25rem;background:var(--accent);color:var(--on-accent);font:600 1rem/1.2 inherit;font-family:inherit;border:0;border-radius:8px;text-decoration:none;cursor:pointer;transition:background .15s,transform .15s}
.cta:hover{background:var(--accent-ink);color:#fff}
@media (prefers-color-scheme:dark){:root:not([data-theme=light]) .cta:hover{background:#A9B8FF;color:#0E1326}}
.cta:active{transform:translateY(1px)}
.top ul{order:3;flex:1 0 100%;list-style:none;margin:0;padding:0;display:flex;flex-wrap:wrap;gap:0 1.25rem}
.top li a{display:inline-flex;align-items:center;min-height:44px;color:var(--ink-2);text-decoration:none;font-weight:500;font-size:.9375rem}
.top li a:hover{color:var(--accent);text-decoration:underline}
@media(min-width:1100px){.top ul{order:0;flex:0 1 auto;gap:0 1.75rem}.top .wrap{flex-wrap:nowrap}.brand{margin-right:1rem}.top ul{margin-right:auto}}
/* pricing */
.pricing{padding-block:clamp(2.5rem,6vw,5rem)}
.plans{display:grid;gap:1rem;grid-template-columns:1fr}
.plan{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:1.25rem 1.25rem .5rem}
.plan h3{margin:0 0 .5rem;font-size:1.75rem;line-height:1.2;font-weight:700;letter-spacing:-.03em}
.plan dl{margin:0}
.plan dl div{padding:.7rem 0;border-top:1px solid var(--line)}
.plan dt{font-size:.8125rem;color:var(--ink-2);font-weight:500}
.plan dd{margin:.1rem 0 0;font-weight:600}
.plan div:first-child dd{font-size:1.5rem;letter-spacing:-.03em;font-weight:700;font-variant-numeric:tabular-nums}
.cmp{display:none}
@media(min-width:560px){.plans{grid-template-columns:1fr 1fr}}
@media(min-width:960px){
 .plans{display:none}
 .cmp{display:table;width:100%;border-collapse:separate;border-spacing:0;background:var(--surface);border:1px solid var(--line);border-radius:14px;table-layout:fixed;font-variant-numeric:tabular-nums}
 .cmp th,.cmp td{padding:1rem 1.25rem;text-align:left;vertical-align:top;border-top:1px solid var(--line)}
 .cmp thead th{border-top:0;font-size:1.625rem;font-weight:700;letter-spacing:-.03em;line-height:1.2;padding-block:1.5rem 1.25rem;background:var(--tint);color:var(--ink)}
 .cmp thead th:first-child{border-top-left-radius:13px;width:19%}
 .cmp thead th:last-child{border-top-right-radius:13px}
 .cmp tbody th{font-weight:500;font-size:.9375rem;color:var(--ink-2)}
 .cmp td{font-weight:500}
 .cmp tbody tr:first-child td{font-size:1.375rem;font-weight:700;letter-spacing:-.03em}
 .cmp td+td,.cmp th+th{border-left:1px solid var(--line)}
 .cmp tbody th{border-right:0}
 .cmp tbody tr:hover td,.cmp tbody tr:hover th{background:color-mix(in srgb,var(--tint) 45%,transparent)}
}
/* features: stair-stepped board */
.features{background:var(--deep);color:var(--deep-ink);padding-block:clamp(3rem,7vw,6rem)}
.board{list-style:none;margin:0;padding:0;display:grid;gap:1rem;grid-template-columns:1fr}
.card{border:1px solid color-mix(in srgb,var(--deep-ink) 22%,transparent);border-radius:10px;padding:1.25rem 1.25rem 1.5rem;background:color-mix(in srgb,var(--deep-ink) 5%,transparent)}
.card h3{margin:0 0 .5rem;font-size:1.25rem;line-height:1.35;font-weight:700;letter-spacing:-.025em;text-wrap:balance}
.card p{margin:0;color:color-mix(in srgb,var(--deep-ink) 78%,transparent);font-size:.9375rem}
@media(min-width:600px){.board{grid-template-columns:1fr 1fr}}
@media(min-width:1000px){
 .board{grid-template-columns:repeat(4,1fr);align-items:start;gap:1rem 1rem;padding-bottom:2rem}
 .board li:nth-child(4n+2){margin-top:1.75rem}
 .board li:nth-child(4n+3){margin-top:3.5rem}
 .board li:nth-child(4n+4){margin-top:5.25rem}
 .board li:nth-child(n+5){margin-top:0}
 .board li:nth-child(4n+2){transform:none}
}
@media(min-width:1000px){
 .board{grid-auto-flow:row}
 .board li:nth-child(n+5):nth-child(4n+1){margin-top:-3.25rem}
 .board li:nth-child(n+5):nth-child(4n+2){margin-top:-1.5rem}
 .board li:nth-child(n+5):nth-child(4n+3){margin-top:.25rem}
 .board li:nth-child(n+5):nth-child(4n+4){margin-top:2rem}
}
/* form */
.contact{padding-block:clamp(2.5rem,6vw,5rem)}
form{max-width:720px;margin:0 auto;background:var(--surface);border:1px solid var(--line);border-radius:14px;padding:clamp(1.25rem,4vw,2.5rem);display:grid;gap:1.25rem}
.f{display:grid;gap:.4rem;min-width:0}
.f label{font-weight:600;font-size:.9375rem}
.req{color:var(--accent-ink);font-weight:500;font-size:.8125rem;margin-left:.4rem}
input,select,textarea{font:inherit;color:var(--ink);background:var(--bg);border:1px solid color-mix(in srgb,var(--ink) 40%,var(--line));border-radius:8px;padding:.7rem .85rem;min-height:48px;width:100%;max-width:100%}
textarea{min-height:9rem;resize:vertical;line-height:1.55}
input:hover,select:hover,textarea:hover{border-color:var(--accent)}
input:focus-visible,select:focus-visible,textarea:focus-visible{outline:3px solid color-mix(in srgb,var(--accent) 45%,transparent);outline-offset:0;border-color:var(--accent)}
input:user-invalid,textarea:user-invalid{border-color:#C4262E}
.two{display:grid;gap:1.25rem;grid-template-columns:1fr}
@media(min-width:620px){.two{grid-template-columns:1fr 1fr}}
.agree{display:flex;gap:.75rem;align-items:flex-start;font-size:.9375rem;min-height:44px;cursor:pointer}
.agree input{width:1.375rem;min-height:0;height:1.375rem;margin:.1rem 0 0;flex:none;accent-color:var(--accent)}
form .cta{width:100%;min-height:52px;font-size:1.0625rem}
@media(min-width:620px){form .cta{width:auto;justify-self:start;padding-inline:2rem}}
@media(prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
</head>
<body>
<header class="top"><div class="wrap">
<a class="brand" href="#"><i aria-hidden="true"></i>스텝보드</a>
<nav aria-label="주요 메뉴" style="display:contents"><ul>${nav.map(n=>`<li><a href="#">${n}</a></li>`).join('')}</ul></nav>
<a class="cta" href="#contact">무료로 시작하기</a>
</div></header>
<main>
<section class="pricing" aria-label="요금제"><div class="wrap">
<div class="plans">${stack}</div>
${table}
</div></section>
<section class="features" aria-label="기능"><div class="wrap">
<ul class="board">${cards.map(c=>`<li class="card"><h3>${c[0]}</h3><p>${c[1]}</p></li>`).join('')}</ul>
</div></section>
<section class="contact" id="contact" aria-label="문의"><div class="wrap">
<form action="#" method="post">
<div class="two">
<div class="f"><label for="n">이름<span class="req">필수</span></label><input id="n" name="name" required autocomplete="name"></div>
<div class="f"><label for="e">회사 이메일<span class="req">필수</span></label><input id="e" name="email" type="email" required autocomplete="email"></div>
</div>
<div class="two">
<div class="f"><label for="c">회사명</label><input id="c" name="company" autocomplete="organization"></div>
<div class="f"><label for="s">팀 규모</label><select id="s" name="size"><option value="">선택</option><option>1–10</option><option>11–50</option><option>51–200</option><option>201명 이상</option></select></div>
</div>
<div class="f"><label for="m">문의 내용</label><textarea id="m" name="message" rows="5"></textarea></div>
<label class="agree"><input type="checkbox" name="agree" required><span>개인정보 수집·이용에 동의합니다</span></label>
<button class="cta" type="submit">문의 보내기</button>
</form>
</div></section>
</main>
</body>
</html>`;
fs.writeFileSync('index.html',html);
