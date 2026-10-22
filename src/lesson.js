(()=>{
'use strict';
const slides=[...document.querySelectorAll('.slide')],total=slides.length;
let current=0,toastTimer=null;
const q=(s,root=document)=>root.querySelector(s),qa=(s,root=document)=>[...root.querySelectorAll(s)];
function tell(msg){const t=q('#toast');t.textContent=msg;t.hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.hidden=true,3500)}
function go(n,update=true){n=Math.max(0,Math.min(total-1,n));slides.forEach((s,i)=>{s.hidden=i!==n;s.classList.toggle('current',i===n)});current=n;q('#counter').textContent=`${n+1} / ${total}`;q('#progress').style.width=((n+1)/total*100)+'%';q('#prev').disabled=n===0;q('#next').disabled=n===total-1;qa('#contents [data-goto]').forEach(b=>{const active=Number(b.dataset.goto)===n;b.setAttribute('aria-current',active?'step':'false')});if(update)history.replaceState(null,'','#'+(n+1));document.title=`${n+1}/${total} — ${slides[n].getAttribute('aria-label').split('. ').slice(1).join('. ')} — Биология`;window.dispatchEvent(new CustomEvent('lesson:slide',{detail:{index:n+1}}))}
q('#prev').addEventListener('click',()=>go(current-1));q('#next').addEventListener('click',()=>go(current+1));
q('#menu-open').addEventListener('click',()=>q('#contents').showModal());q('#help-open').addEventListener('click',()=>q('#help').showModal());
qa('[data-close]').forEach(b=>b.addEventListener('click',()=>q('#'+b.dataset.close).close()));
qa('[data-goto]').forEach(b=>b.addEventListener('click',()=>{go(Number(b.dataset.goto));q('#contents').close()}));
qa('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
async function fullscreen(){try{if(document.fullscreenElement)await document.exitFullscreen();else if(document.documentElement.requestFullscreen)await document.documentElement.requestFullscreen();else tell('Браузер не поддерживает полноэкранный режим. Слайды доступны в обычном окне.')}catch{tell('Используйте полноэкранный режим в меню браузера.')}}
q('#fullscreen').addEventListener('click',fullscreen);document.addEventListener('fullscreenchange',()=>q('#fullscreen').textContent=document.fullscreenElement?'Выйти из полного экрана':'На весь экран');
function panel(scene,open){const p=q('.copy-panel',scene),c=q('[data-collapse]',scene),r=q('[data-restore]',scene);p.hidden=!open;r.hidden=open;scene.classList.toggle('panel-closed',!open);(open?c:r).focus({preventScroll:true});window.dispatchEvent(new Event('lesson:layout'))}
qa('.scene').forEach(s=>{q('[data-collapse]',s).addEventListener('click',()=>panel(s,false));q('[data-restore]',s).addEventListener('click',()=>panel(s,true))});
document.addEventListener('keydown',e=>{if(e.altKey||e.ctrlKey||e.metaKey||q('dialog[open]'))return;const tag=e.target.tagName;if(['INPUT','SELECT','TEXTAREA'].includes(tag)||e.target.isContentEditable)return;if((e.key===' '||e.key==='Enter')&&tag==='BUTTON')return;if(['ArrowRight','PageDown',' '].includes(e.key)){e.preventDefault();go(current+1)}else if(['ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();go(current-1)}else if(e.key==='Home'){e.preventDefault();go(0)}else if(e.key==='End'){e.preventDefault();go(total-1)}else if(e.key.toLowerCase()==='f'){e.preventDefault();fullscreen()}else if(e.key.toLowerCase()==='t'){const s=q('.scene',slides[current]);if(s){e.preventDefault();panel(s,q('.copy-panel',s).hidden)}}});
window.addEventListener('hashchange',()=>{const n=parseInt(location.hash.slice(1),10);if(Number.isFinite(n))go(n-1,false)});
qa('[data-reveal]').forEach(b=>{b.dataset.closedLabel=b.textContent;b.addEventListener('click',()=>{const t=q('#'+b.dataset.reveal),open=t.hidden;t.hidden=!open;b.setAttribute('aria-expanded',String(open));b.textContent=open?'Скрыть ответ':b.dataset.closedLabel;if(open)requestAnimationFrame(()=>t.scrollIntoView({block:'nearest',behavior:'instant'}))})});
qa('[data-cell]').forEach(b=>b.addEventListener('click',()=>setCell(b,!b.classList.contains('revealed'))));
function setCell(b,show){b.textContent=show?b.dataset.value:'Открыть';b.classList.toggle('revealed',show);b.setAttribute('aria-expanded',String(show));b.setAttribute('aria-label',(show?'Скрыть: ':'Открыть ответ: ')+b.closest('tr').querySelector('th').textContent)}
q('#table-all').addEventListener('click',()=>qa('[data-cell]').forEach(b=>setCell(b,true)));q('#table-reset').addEventListener('click',()=>qa('[data-cell]').forEach(b=>setCell(b,false)));
const leafMessages={parallel:'Параллельное жилкование — признак однодольных.',arc:'Дуговое жилкование — признак однодольных.',net:'Сетчатое жилкование — признак двудольных.'};
qa('[data-leaf]').forEach(b=>b.addEventListener('click',()=>{const active=b.classList.contains('selected');qa('[data-leaf]').forEach(x=>{x.classList.remove('selected');x.setAttribute('aria-pressed','false')});q('.leaf-stage').classList.toggle('has-selection',!active);if(!active){b.classList.add('selected');b.setAttribute('aria-pressed','true')}q('#leaf-feedback').textContent=active?'Нажмите на лист для определения класса.':leafMessages[b.dataset.leaf]}));
function selectScheme(key){
 const button=q('[data-scheme-trait="'+key+'"]');
 qa('[data-scheme-trait]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 qa('[data-scheme-target]').forEach(r=>{const selected=r.dataset.schemeTarget===key;r.setAttribute('aria-pressed',String(selected));r.classList.toggle('scheme-selected',selected)});
 const feedback=q('#scheme-feedback');feedback.replaceChildren();
 const text=key?[button.textContent,'Однодольные: '+button.dataset.mono+'.','Двудольные: '+button.dataset.di+'.']:['С чего начинается определение класса?','С числа семядолей в зародыше семени.'];
 text.forEach((t,i)=>{const p=document.createElement('p');p.textContent=t;if(i===0)p.className='scheme-feature-title';feedback.append(p)});
}
qa('[data-scheme-trait]').forEach(b=>b.addEventListener('click',()=>selectScheme(b.getAttribute('aria-pressed')==='true'?null:b.dataset.schemeTrait)));
qa('[data-scheme-target]').forEach(r=>{const choose=()=>selectScheme(r.dataset.schemeTarget);r.addEventListener('click',choose);r.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();e.stopPropagation();choose()}})});
q('#scheme-reset').addEventListener('click',()=>selectScheme(null));
q('#sort-check').addEventListener('click',()=>{let count=0;qa('.sort-item').forEach(r=>{const val=q('select',r).value,yes=val===r.dataset.correct;r.classList.toggle('correct',yes);r.classList.toggle('incorrect',!yes);q('.sort-feedback',r).textContent=!val?'Выберите один из классов.':yes?'Верно.':`Исправьте: ${r.dataset.correct==='mono'?'однодольные':'двудольные'}.`;if(yes)count++});q('#sort-score').textContent=`Верно: ${count} из 6. Главный критерий класса — число семядолей.`});
q('#sort-reset').addEventListener('click',()=>{qa('.sort-item').forEach(r=>{q('select',r).value='';r.classList.remove('correct','incorrect');q('.sort-feedback',r).textContent=''});q('#sort-score').textContent=''});
qa('.sort-item select').forEach(s=>s.addEventListener('change',()=>{const r=s.closest('.sort-item');r.classList.remove('correct','incorrect');q('.sort-feedback',r).textContent='';q('#sort-score').textContent=''}));
qa('[data-choice]').forEach(b=>b.addEventListener('click',()=>{const c=b.closest('.case');qa('[data-choice]',c).forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const yes=b.dataset.choice===c.dataset.answer;q('.case-feedback',c).textContent=yes?'Верно. Все перечисленные признаки соответствуют этому классу.':'Попробуйте ещё раз. Начните с числа семядолей.';q('.case-feedback',c).style.color=yes?'#2d6a4e':'#9b352a'}));
q('#cases-reset').addEventListener('click',()=>{qa('[data-choice]').forEach(b=>b.setAttribute('aria-pressed','false'));qa('.case-feedback').forEach(p=>p.textContent='')});
const cropCopy={wheat:'<p><b>Пшеница</b></p><p>Из зерна получают муку для выпечки хлеба и кондитерских изделий.</p>',sunflower:'<p><b>Подсолнечник</b></p><p>Из семян получают растительное масло.</p>',grape:'<p><b>Виноградная лоза</b></p><p>Символ Республики Молдова. С выращиванием винограда связано традиционное виноделие.</p>'};
qa('[data-crop]').forEach(b=>b.addEventListener('click',()=>{const active=b.getAttribute('aria-pressed')==='true';qa('[data-crop]').forEach(x=>x.setAttribute('aria-pressed','false'));if(active)q('#crop-result').innerHTML='<p>Выберите растение, чтобы раскрыть его значение.</p>';else{b.setAttribute('aria-pressed','true');q('#crop-result').innerHTML=cropCopy[b.dataset.crop]}}));
const initial=parseInt(location.hash.slice(1),10);go(Number.isFinite(initial)?initial-1:0,false);
})();
