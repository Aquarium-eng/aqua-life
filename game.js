(()=>{
const $=id=>document.getElementById(id);
const species=[
{id:'clown',name:'カクレクマノミ',emoji:'🐠',food:'plankton',foodname:'プランクトン'},
{id:'tang',name:'ナンヨウハギ',emoji:'🐟',food:'seaweed',foodname:'海藻'},
{id:'puffer',name:'ハコフグ',emoji:'🐡',food:'shrimp',foodname:'エビ'},
{id:'gold',name:'金魚',emoji:'🐠',food:'flakes',foodname:'フレーク'},
{id:'shark',name:'サメ',emoji:'🦈',food:'shrimp',foodname:'エビ'},
{id:'turtle',name:'ウミガメ',emoji:'🐢',food:'seaweed',foodname:'海藻'},
{id:'jelly',name:'クラゲ',emoji:'🪼',food:'plankton',foodname:'プランクトン'}];
const foods=[{id:'plankton',name:'プランクトン',emoji:'🫧'},{id:'seaweed',name:'海藻',emoji:'🌿'},{id:'shrimp',name:'エビ',emoji:'🦐'},{id:'flakes',name:'フレーク',emoji:'🥣'}];
const decors=[{id:'coral',name:'サンゴ',emoji:'🪸'},{id:'castle',name:'海のお城',emoji:'🏰'},{id:'shell',name:'貝殻',emoji:'🐚'},{id:'rock',name:'岩',emoji:'🪨'},{id:'treasure',name:'宝箱',emoji:'💎'},{id:'plant',name:'水草',emoji:'🌿'}];
const fresh=()=>({coins:0,foods:{plankton:2,seaweed:2,shrimp:2,flakes:2},tasks:[],history:[],total:0,claimed:0,fish:[{id:'clown',level:1,hunger:70}],decor:[],placedDecor:[]});
let state=fresh();
try{
 const s=JSON.parse(localStorage.getItem('aqualife-save'));
 if(s&&Array.isArray(s.tasks)&&Array.isArray(s.fish)){
   state={...fresh(),...s,foods:{...fresh().foods,...(s.foods||{})},history:Array.isArray(s.history)?s.history:[],placedDecor:Array.isArray(s.placedDecor)?s.placedDecor:[]};
   if(!state.fish.length)state.fish=[{id:'clown',level:1,hunger:70}];
 }
}catch(e){}
const save=()=>localStorage.setItem('aqualife-save',JSON.stringify(state));
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let toastTimer;function toast(s){$('toast').textContent=s;$('toast').classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.add('hidden'),2200)}
let placingDecorId=null;
function render(){
 $('coins').textContent=state.coins;$('gachacoin').textContent=state.coins;$('foodtotal').textContent=Object.values(state.foods).reduce((a,b)=>a+b,0);$('total').textContent=state.total;$('level').textContent='LEVEL '+(1+Math.floor(state.total/10));
 $('fishcount').textContent='🐟 魚 '+state.fish.length+'匹';
 $('swimmers').innerHTML=state.fish.map((f,i)=>{const s=species.find(x=>x.id===f.id)||species[0];return `<span class="fish" style="left:${8+(i*29)%78}%;top:${25+(i*23)%53}%;animation-delay:${-i*1.4}s;animation-duration:${5+i%4}s">${s.emoji}</span>`}).join('');
 $('fishlist').innerHTML=state.fish.map((f,i)=>{const s=species.find(x=>x.id===f.id)||species[0],food=foods.find(x=>x.id===s.food);return `<div class="fishcard"><div class="row" style="justify-content:space-between"><b>${s.emoji} ${s.name}</b><span class="tag">Lv.${f.level}</span></div><p class="muted">好物：${s.foodname}</p><div class="muted">満腹度 ${f.hunger}%</div><div class="meter" style="margin:5px 0 9px"><span style="width:${f.hunger}%"></span></div><button class="primary" data-feed="${i}" ${!state.foods[s.food]?'disabled':''}>${food.emoji} 好物をあげる</button> <button class="soft" data-other="${i}">別のエサ</button></div>`}).join('');
 $('nofish').classList.toggle('hidden',state.fish.length>0);
 $('foodstock').innerHTML=foods.map(f=>`<span class="tag">${f.emoji} ${f.name} × ${state.foods[f.id]||0}</span>`).join('');
 const done=state.tasks.filter(t=>t.done).length;$('progress').textContent=`${done} / ${state.tasks.length} 達成`;$('bar').style.width=(state.tasks.length?done/state.tasks.length*100:0)+'%';
 $('tasks').innerHTML=state.tasks.length?state.tasks.map(t=>`<div class="task"><button class="soft" data-check="${t.id}" ${t.done?'disabled':''}>${t.done?'✓':'○'}</button><div class="grow"><div class="taskname ${t.done?'done':''}">${esc(t.name)}</div><div class="muted">${esc(t.type)} · ${t.done?'達成済み':'🥣 エサ1個'}${t.dueDate?' · 期限 '+esc(t.dueDate):''}</div></div>${t.done?'<span>🎉</span>':`<button class="primary" data-check="${t.id}">完了</button>`}<button class="soft" data-edit="${t.id}">編集</button><button class="soft" data-del="${t.id}">×</button></div>`).join(''):'<p class="muted center">ToDoを追加してみよう！</p>';
 $('history').innerHTML=state.history.length?[...state.history].reverse().map(h=>`<div class="history-item"><b>✓ ${esc(h.name)}</b><div class="muted">${esc(h.type||'その他')} · ${new Date(h.completedAt).toLocaleString('ja-JP')}</div></div>`).join(''):'<p class="muted center">まだクリアしたタスクはないよ。</p>';
 $('lineup').innerHTML=[...species.map(x=>({...x,kind:'魚'})),...decors.map(x=>({...x,kind:'装飾'}))].map(x=>`<div class="fishcard">${x.emoji} <b>${x.name}</b><div class="muted">${x.kind}</div></div>`).join('');
 $('fishbook').innerHTML=species.map(s=>{let n=state.fish.filter(f=>f.id===s.id).length;return `<div class="fishcard">${n?s.emoji:'❔'} <b>${n?s.name:'？？？'}</b><div class="muted">${n?'発見済み × '+n:'未発見'}</div></div>`}).join('');
 $('decorbook').innerHTML=decors.map(d=>{let n=state.decor.filter(x=>x===d.id).length+state.placedDecor.filter(x=>x.id===d.id).length;return `<div class="fishcard">${n?d.emoji:'❔'} <b>${n?d.name:'？？？'}</b><div class="muted">${n?'所持・配置中 × '+n:'未発見'}</div></div>`}).join('');
 $('decor-swimmers').innerHTML=state.fish.map((f,i)=>{const s=species.find(x=>x.id===f.id)||species[0];return `<span class="fish" style="left:${8+(i*29)%78}%;top:${25+(i*23)%53}%;animation-delay:${-i*1.4}s">${s.emoji}</span>`}).join('');
 $('placed-decor').innerHTML=state.placedDecor.map(d=>{const item=decors.find(x=>x.id===d.id);return item?`<span class="placed-item" data-placed="${d.uid}" style="left:${d.x}%;top:${d.y}%">${item.emoji}</span>`:''}).join('');
 const counts={};state.decor.forEach(id=>counts[id]=(counts[id]||0)+1);
 $('decor-inventory').innerHTML=decors.filter(d=>counts[d.id]).map(d=>`<div class="fishcard inventory-item"><span>${d.emoji} <b>${d.name}</b> ×${counts[d.id]}</span><button class="primary" data-place="${d.id}">配置</button></div>`).join('')||'<p class="muted center">まだ装飾を持っていないよ。ガチャで手に入れよう！</p>';
 $('placed-list').innerHTML=state.placedDecor.map(d=>{const item=decors.find(x=>x.id===d.id);return item?`<div class="task"><span>${item.emoji} ${item.name}</span><span class="grow"></span><button class="soft" data-remove="${d.uid}">片付ける</button></div>`:''}).join('')||'<p class="muted center">水槽にはまだ装飾がないよ。</p>';
 $('placing-hint').textContent=placingDecorId?`${decors.find(d=>d.id===placingDecorId)?.name||'装飾'}を置く場所を水槽内でタップしてね。`:'配置ボタンを押して飾りを選んでね。';
}
$('add').onclick=()=>{let name=$('taskinput').value.trim();if(!name)return toast('タスクを入力してね');state.tasks.push({id:Date.now()+Math.random(),name,type:$('tasktype').value,dueDate:$('taskdue').value||'',done:false});$('taskinput').value='';$('taskdue').value='';save();render()};
$('taskinput').addEventListener('keydown',e=>{if(e.key==='Enter')$('add').click()});
$('tasks').addEventListener('click',e=>{
 let b=e.target.closest('[data-check],[data-del],[data-edit]');if(!b)return;
 if(b.dataset.del){state.tasks=state.tasks.filter(t=>String(t.id)!==b.dataset.del);save();render();return}
 if(b.dataset.edit){let t=state.tasks.find(t=>String(t.id)===b.dataset.edit);if(!t)return;let name=prompt('タスク名を編集',t.name);if(name===null)return;if(!name.trim())return toast('タスク名を入力してね');let due=prompt('期限を入力（YYYY-MM-DD／空欄で期限なし）',t.dueDate||'');if(due===null)return;t.name=name.trim();t.dueDate=due.trim();save();render();return}
 let t=state.tasks.find(t=>String(t.id)===b.dataset.check);if(!t||t.done)return;t.done=true;let food=foods[Math.floor(Math.random()*foods.length)];state.foods[food.id]=(state.foods[food.id]||0)+1;state.total++;state.history.push({name:t.name,type:t.type,completedAt:new Date().toISOString()});let msg=food.name+'を獲得！';if(Math.floor(state.total/5)>state.claimed){state.claimed=Math.floor(state.total/5);state.coins++;msg+=' 🪙 ガチャコインも獲得！'}save();render();toast('🥣 '+msg)
});
$('fishlist').addEventListener('click',e=>{let b=e.target.closest('[data-feed],[data-other]');if(!b)return;let i=Number(b.dataset.feed??b.dataset.other),f=state.fish[i],s=species.find(x=>x.id===f.id)||species[0];let id=s.food;if(b.dataset.other!==undefined){let available=foods.filter(x=>(state.foods[x.id]||0)>0);if(!available.length)return toast('エサがないよ');id=available[0].id}if(!state.foods[id])return toast('そのエサは持っていないよ');state.foods[id]--;let liked=id===s.food;f.hunger=Math.min(100,f.hunger+(liked?35:12));if(f.hunger>=100&&liked){f.level++;f.hunger=55;toast(s.name+'がレベルアップ！')}else toast(liked?'大好物！ '+s.name+'が喜んでいるよ':'食べてくれたよ！');save();render()});
$('pull').onclick=()=>{if(state.coins<1)return toast('コインが足りないよ！ToDoを達成しよう');state.coins--;let isFish=Math.random()<.6,p;if(isFish){p=species[Math.floor(Math.random()*species.length)];state.fish.push({id:p.id,level:1,hunger:50})}else{p=decors[Math.floor(Math.random()*decors.length)];state.decor.push(p.id)}$('prize').classList.remove('hidden');$('prizeemoji').textContent=p.emoji;$('prizename').textContent=p.name;$('prizedesc').textContent=isFish?'新しい仲間が水槽にやってきた！':'装飾タブから水槽に飾れるよ！';save();render()};
$('decor-inventory').addEventListener('click',e=>{const b=e.target.closest('[data-place]');if(!b)return;placingDecorId=b.dataset.place;render();toast('水槽内の置きたい場所をタップしてね')});
$('decor-tank').addEventListener('click',e=>{if(!placingDecorId||e.target.closest('[data-placed]'))return;const r=$('decor-tank').getBoundingClientRect();const x=Math.max(5,Math.min(95,(e.clientX-r.left)/r.width*100));const y=Math.max(12,Math.min(88,(e.clientY-r.top)/r.height*100));const idx=state.decor.indexOf(placingDecorId);if(idx<0)return toast('その装飾は持っていないよ');state.decor.splice(idx,1);state.placedDecor.push({uid:Date.now()+Math.random(),id:placingDecorId,x,y});placingDecorId=null;save();render();toast('水槽に飾ったよ！')});
$('placed-decor').addEventListener('pointerdown',e=>{const el=e.target.closest('[data-placed]');if(!el)return;e.preventDefault();const uid=el.dataset.placed;el.setPointerCapture?.(e.pointerId);el.classList.add('dragging');const tank=$('decor-tank'),r=tank.getBoundingClientRect();const move=ev=>{const item=state.placedDecor.find(d=>String(d.uid)===uid);if(!item)return;item.x=Math.max(3,Math.min(97,(ev.clientX-r.left)/r.width*100));item.y=Math.max(8,Math.min(92,(ev.clientY-r.top)/r.height*100));el.style.left=item.x+'%';el.style.top=item.y+'%'};const up=()=>{el.classList.remove('dragging');el.removeEventListener('pointermove',move);el.removeEventListener('pointerup',up);el.removeEventListener('pointercancel',up);save()};el.addEventListener('pointermove',move);el.addEventListener('pointerup',up);el.addEventListener('pointercancel',up)});
$('placed-list').addEventListener('click',e=>{const b=e.target.closest('[data-remove]');if(!b)return;const i=state.placedDecor.findIndex(d=>String(d.uid)===b.dataset.remove);if(i<0)return;const [d]=state.placedDecor.splice(i,1);state.decor.push(d.id);save();render();toast('装飾を持ち物に戻したよ')});
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tab]').forEach(x=>x.classList.toggle('active',x===b));['tank','todo','gacha','book','decor'].forEach(p=>$('page-'+p).classList.toggle('hidden',p!==b.dataset.tab))});
for(let i=0;i<8;i++){let x=document.createElement('i');x.className='bubble';x.style.left=(8+i*12)+'%';x.style.animationDelay=(i*.7)+'s';x.style.animationDuration=(4+i%4)+'s';$('tank').appendChild(x)}
render();save();
})();