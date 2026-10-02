const machines={
  press:{name:'프레스 12',risk:78,change:24,state:'점검 권장',tone:'risk-high',values:[44,38,53,48,66,74,78],long:[32,38,36,45,42,60,78],title:'금형 온도와 진동을 확인하세요',copy:'생산 일정에 맞춰 10월 5일 점검을 권장합니다.'},
  injection:{name:'사출기 07',risk:46,change:8,state:'변화 관찰',tone:'risk-mid',values:[30,33,28,38,35,42,46],long:[20,25,27,30,34,39,46],title:'모터 전류 변화를 관찰하세요',copy:'10월 8일 점검 시 이전 기록과 비교해보세요.'},
  conveyor:{name:'컨베이어 03',risk:18,change:-3,state:'정상 범위',tone:'risk-low',values:[21,22,19,20,17,20,18],long:[22,18,24,21,20,17,18],title:'정기 점검 일정을 유지하세요',copy:'현재 위험도는 안정적입니다. 10월 12일 정기 점검을 권장합니다.'}
};
let selectedMachine='press',selectedPeriod='7';
const $=selector=>document.querySelector(selector);
function renderChart(){
  const m=machines[selectedMachine],values=selectedPeriod==='7'?m.values:m.long;
  const points=values.map((v,i)=>[36+i*100,145-v*1.2]);
  const line=points.map((p,i)=>(i?'L':'M')+p.join(' ')).join(' ');
  $('#chart-line').setAttribute('d',line);$('#chart-area').setAttribute('d',line+' L636 145 L36 145 Z');$('#chart-point').setAttribute('cy',points.at(-1)[1]);
  $('#chart-name').textContent=m.name;$('.trend-heading p').textContent=`최근 ${selectedPeriod}일간 고장 위험도 추이`;
  $('#risk-value').replaceChildren(document.createTextNode(String(m.risk)),Object.assign(document.createElement('span'),{textContent:'%'}));
  $('#risk-state').textContent=m.state;$('#risk-state').className='risk-label '+m.tone;
  const delta=values.at(-1)-values[0];$('#risk-change').textContent=`${selectedPeriod==='7'?'지난주':'30일 전'} 대비 ${delta>=0?'+':''}${delta}%p`;
  $('#recommendation-title').textContent=m.title;$('#recommendation-copy').textContent=m.copy;
  $('#chart-title').textContent=`${m.name}의 최근 ${selectedPeriod}일 고장 위험도 추이`;
  $('#chart-desc').textContent=`예시 데이터: 고장 위험도가 ${values[0]}%에서 ${m.risk}%로 변했습니다.`;
  const labels=$('.chart-days').querySelectorAll('text');labels[0].textContent=selectedPeriod==='7'?'09.26':'09.03';labels[1].textContent=selectedPeriod==='7'?'09.29':'09.17';
}
document.querySelectorAll('[data-machine]').forEach(button=>button.addEventListener('click',()=>{
  selectedMachine=button.dataset.machine;
  document.querySelectorAll('[data-machine]').forEach(b=>{const active=b===button;b.setAttribute('aria-pressed',String(active));b.classList.toggle('selected',active);});renderChart();
}));
document.querySelectorAll('[data-period]').forEach(button=>button.addEventListener('click',()=>{selectedPeriod=button.dataset.period;document.querySelectorAll('[data-period]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));renderChart();}));
const tabs=[...document.querySelectorAll('.workspace-tab')];
function selectTab(tab,focus=false){tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active;});if(focus)tab.focus();}
tabs.forEach(tab=>{tab.addEventListener('click',()=>selectTab(tab));tab.addEventListener('keydown',event=>{let at=tabs.indexOf(tab);if(event.key==='ArrowRight')at=(at+1)%tabs.length;else if(event.key==='ArrowLeft')at=(at-1+tabs.length)%tabs.length;else if(event.key==='Home')at=0;else if(event.key==='End')at=tabs.length-1;else return;event.preventDefault();selectTab(tabs[at],true);});});
const menuButton=$('.menu-button'),mobileMenu=$('#mobile-menu');
function closeMenu(){mobileMenu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','메뉴 열기');}
menuButton.addEventListener('click',()=>{const open=mobileMenu.hidden;mobileMenu.hidden=!open;menuButton.setAttribute('aria-expanded',String(open));menuButton.setAttribute('aria-label',open?'메뉴 닫기':'메뉴 열기');});
mobileMenu.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!mobileMenu.hidden){closeMenu();menuButton.focus();}});
matchMedia('(min-width:821px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
const form=$('#demo-form'),fields=['name','company','email'];
form.addEventListener('input',event=>{if(['name','company','email','message'].includes(event.target.id)){$('#request-result').hidden=true;$('#copy-status').textContent='';$('#form-status').textContent='';}});
fields.forEach(id=>$('#'+id).addEventListener('input',()=>{$('#'+id).removeAttribute('aria-invalid');$('#'+id).removeAttribute('aria-describedby');$('#'+id+'-error').textContent='';}));
form.addEventListener('submit',event=>{
  event.preventDefault();let firstInvalid=null;
  fields.forEach(id=>{const input=$('#'+id),empty=!input.value.trim(),invalid=empty||(id==='email'&&!input.validity.valid);const error=$('#'+id+'-error');error.textContent=invalid?(empty?'필수 항목을 입력해주세요.':'이메일 주소를 확인해주세요.'):'';input.setAttribute('aria-invalid',String(invalid));if(invalid){input.setAttribute('aria-describedby',error.id);firstInvalid??=input;}else input.removeAttribute('aria-describedby');});
  if(firstInvalid){firstInvalid.focus();$('#form-status').textContent='필수 항목을 확인해주세요.';return;}
  $('#request-text').value=`알파로그 데모 문의\n이름: ${$('#name').value.trim()}\n회사: ${$('#company').value.trim()}\n이메일: ${$('#email').value.trim()}\n관심 설비/공정: ${$('#message').value.trim()||'상담 시 확인'}\n\n※ 가상 서비스 예시 화면에서 준비한 내용입니다.`;
  $('#request-result').hidden=false;$('#copy-status').textContent='';$('#form-status').textContent='요청 내용을 준비했습니다. 서버로 전송하지 않았습니다.';$('.result-heading').focus();
});
$('#copy-request').addEventListener('click',async()=>{try{await navigator.clipboard.writeText($('#request-text').value);$('#copy-status').textContent='요청 내용을 복사했습니다.';}catch{$('#request-text').focus();$('#request-text').select();$('#copy-status').textContent='자동 복사가 지원되지 않습니다. 선택된 내용을 직접 복사해주세요.';}});
renderChart();
