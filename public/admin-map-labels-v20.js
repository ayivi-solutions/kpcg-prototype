(() => {
'use strict';
const VERSION='20.2.0';
const NS='http://www.w3.org/2000/svg';
let frame=0,nationalCentre=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const norm=v=>String(v??'').toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/\bcity\b|\bcounty\b/g,'').replace(/[^a-z0-9]+/g,' ').trim();
const escText=v=>String(v??'').trim();
const levelOf=panel=>Number(((panel.querySelector('.lvl')?.textContent||'').match(/ADM(\d)/)||[])[1]||1);
const unitName=shape=>{
  const raw=shape.querySelector('title')?.textContent||shape.getAttribute('aria-label')||'';
  return escText(raw.split(' · ')[0].split(/\s+-\s+/)[0].replace(/\s+(County|Sub-County|Ward).*$/i,''))||'Administrative unit';
};
function style(){
  if($('#kpcg-admin-label-css'))$('#kpcg-admin-label-css').remove();
  const s=document.createElement('style');s.id='kpcg-admin-label-css';s.textContent=`
.kpcg-adm .admin-map-label-layer{pointer-events:none}.kpcg-adm .admin-unit-label,.kpcg-adm .admin-centre-label{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-anchor:middle;paint-order:stroke;stroke:#fff;stroke-width:1.9px;stroke-linejoin:round;fill:#102a22;font-weight:800;letter-spacing:-.015em;pointer-events:none;user-select:none;transition:opacity .12s ease,stroke-width .12s ease,font-size .12s ease}.kpcg-adm .admin-unit-label[data-level="0"]{font-size:21px;letter-spacing:.08em}.kpcg-adm .admin-unit-label[data-level="1"]{font-size:6.6px}.kpcg-adm .admin-unit-label[data-level="2"]{font-size:9.1px}.kpcg-adm .admin-unit-label[data-level="3"]{font-size:8.5px}.kpcg-adm .admin-unit-label[data-suppressed="true"]{opacity:0}.kpcg-adm .admin-unit-label.is-hot{opacity:1!important;stroke-width:4.6px;font-weight:950}.kpcg-adm .admin-centre-label{font-size:6.2px;text-anchor:start;font-weight:800;fill:#17211d;stroke-width:2.4px;opacity:0}.kpcg-adm .admin-centre-label.national,.kpcg-adm .admin-centre-label.is-hot{opacity:1}.kpcg-adm .admin-centre-label.is-hot{stroke-width:4.6px;font-weight:950}.kpcg-adm .admin-centre-halo{fill:#fff;stroke:#17342a;stroke-width:1.4;vector-effect:non-scaling-stroke}.kpcg-adm .admin-centre-core{fill:#17342a;stroke:#fff;stroke-width:1;vector-effect:non-scaling-stroke}.kpcg-adm .admin-centre-core.national{fill:#a84a2a}.kpcg-adm .admin-centre-label.national{font-size:7.2px;fill:#7f321d;font-weight:950}
html[data-theme=dark] .kpcg-adm .admin-unit-label,html[data-theme=dark] .kpcg-adm .admin-centre-label{fill:#eef6f2;stroke:#0b1712}html[data-theme=dark] .kpcg-adm .admin-centre-label.national{fill:#f2a68a}
@media(max-width:720px){.kpcg-adm .admin-unit-label[data-level="1"]{font-size:6px}.kpcg-adm .admin-unit-label[data-level="2"]{font-size:8.5px}.kpcg-adm .admin-unit-label[data-level="3"]{font-size:7.8px}.kpcg-adm .admin-centre-label{font-size:5.7px}}
@media(prefers-reduced-motion:reduce){.kpcg-adm .admin-unit-label,.kpcg-adm .admin-centre-label{transition:none!important}}
`;document.head.append(s)
}
function splitLabel(name,level){
  if(level===0)return[name.toUpperCase()];
  const max=level===1?11:level===2?17:15;
  if(name.length<=max||!name.includes(' '))return[name];
  const words=name.split(/\s+/),lines=[];let row='';
  for(const word of words){const next=row?`${row} ${word}`:word;if(next.length<=max||!row)row=next;else{lines.push(row);row=word}}
  if(row)lines.push(row);return lines.length<=2?lines:[lines[0],lines.slice(1).join(' ')]
}
function pointIn(path,x,y){try{return typeof path.isPointInFill==='function'?path.isPointInFill(new DOMPoint(x,y)):true}catch{return true}}
function labelPoint(path){
  const b=path.getBBox(),cx=b.x+b.width/2,cy=b.y+b.height/2;
  if(pointIn(path,cx,cy))return{x:cx,y:cy,b};
  const candidates=[];for(const dy of[0,-.14,.14,-.28,.28])for(const dx of[0,-.14,.14,-.28,.28])candidates.push([cx+b.width*dx,cy+b.height*dy]);
  const hit=candidates.find(([x,y])=>pointIn(path,x,y));return{x:hit?.[0]??cx,y:hit?.[1]??cy,b}
}
function fontSize(level,b,name){
  const base=level===0?21:level===1?6.6:level===2?9.1:8.5;if(level===0)return base;
  const fit=Math.max(level===1?5.3:6.8,Math.min(base,b.width/Math.max(3.8,name.length*.46)));return fit
}
function estimateBox(candidate){
  const width=Math.max(...candidate.lines.map(x=>x.length),1)*candidate.fs*.53+5;
  const height=candidate.lines.length*candidate.fs*1.05+4;
  return{x:candidate.x-width/2,y:candidate.y-height/2,w:width,h:height}
}
function collides(a,b,pad=2.5){return!(a.x+a.w+pad<b.x||b.x+b.w+pad<a.x||a.y+a.h+pad<b.y||b.y+b.h+pad<a.y)}
function makeText(candidate,suppressed){
  const {name,level,x,y,lines,fs,id}=candidate,text=document.createElementNS(NS,'text');text.setAttribute('class','admin-unit-label');text.dataset.level=String(level);text.dataset.unitName=name;text.dataset.shapeId=id;text.dataset.suppressed=suppressed?'true':'false';text.style.fontSize=`${fs}px`;text.setAttribute('x',x.toFixed(1));text.setAttribute('y',(y-(lines.length-1)*fs*.48).toFixed(1));text.setAttribute('aria-hidden','true');
  lines.forEach((line,i)=>{const t=document.createElementNS(NS,'tspan');t.textContent=line;t.setAttribute('x',x.toFixed(1));if(i)t.setAttribute('dy','1.04em');text.append(t)});return text
}
function territoryLabels(panel,layer,level,shapes){
  const width=panel.getBoundingClientRect().width||620;
  const budget=level===0?1:level===1?(width>=1050?28:width>=760?22:width>=520?15:10):999;
  const candidates=shapes.map(shape=>{const name=unitName(shape),{x,y,b}=labelPoint(shape),fs=fontSize(level,b,name),lines=splitLabel(name,level);return{shape,id:shape.dataset.shape||name,name,x,y,b,fs,lines,area:b.width*b.height}}).sort((a,b)=>b.area-a.area);
  const occupied=[];let visible=0;
  for(const c of candidates){
    const box=estimateBox(c),fits=c.b.width>=Math.max(15,box.w*.60)&&c.b.height>=Math.max(9,box.h*.55),collision=occupied.some(o=>collides(box,o)),force=level===0||/nairobi/i.test(c.name),allow=force||(visible<budget&&fits&&!collision);
    layer.append(makeText(c,!allow));if(allow){occupied.push(box);visible++}
  }
}
function centreInfo(circle){
  const label=circle.getAttribute('aria-label')||circle.dataset.tip||'';const parts=label.split(/\s+-\s+/);const capital=escText(parts[0]||'Administrative centre');const county=escText((parts[1]||'').replace(/administrative centre.*$/i,''));return{capital,county,key:norm(county),national:circle.classList.contains('nat')}
}
function rememberNational(panel){const c=panel.querySelector('.centre.nat');if(!c)return;const x=Number(c.getAttribute('cx')),y=Number(c.getAttribute('cy')),info=centreInfo(c);if(Number.isFinite(x)&&Number.isFinite(y))nationalCentre={x,y,name:info.capital}}
function centreLabels(panel,layer,level){
  if(level===1){
    const circles=$$('.centre',panel);rememberNational(panel);
    circles.forEach((c,index)=>{const x=Number(c.getAttribute('cx')),y=Number(c.getAttribute('cy')),info=centreInfo(c);if(!Number.isFinite(x)||!Number.isFinite(y)||!info.capital)return;const t=document.createElementNS(NS,'text');t.setAttribute('class',`admin-centre-label${info.national?' national':''}`);t.dataset.centreIndex=String(index);t.dataset.countyKey=info.key;t.setAttribute('x',(x+5.4).toFixed(1));t.setAttribute('y',(y-4.8).toFixed(1));t.textContent=info.national?`${info.capital} · national capital`:`${info.capital} · county HQ`;t.setAttribute('aria-hidden','true');layer.append(t);c.dataset.centreIndex=String(index)})
  }else if(level===0&&nationalCentre){
    const {x,y,name}=nationalCentre,h=document.createElementNS(NS,'circle'),c=document.createElementNS(NS,'circle'),t=document.createElementNS(NS,'text');h.setAttribute('class','admin-centre-halo');h.setAttribute('cx',x);h.setAttribute('cy',y);h.setAttribute('r','6.2');c.setAttribute('class','admin-centre-core national');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','4');t.setAttribute('class','admin-centre-label national');t.setAttribute('x',x+7);t.setAttribute('y',y-6);t.textContent=`${name} · national capital`;layer.append(h,c,t)
  }
}
function clearHot(panel){$$('.admin-unit-label.is-hot,.admin-centre-label.is-hot',panel).forEach(x=>x.classList.remove('is-hot'))}
function hotForShape(panel,shape){clearHot(panel);const id=shape.dataset.shape||'';panel.querySelector(`.admin-unit-label[data-shape-id="${CSS.escape(id)}"]`)?.classList.add('is-hot');const key=norm(unitName(shape));$$('.admin-centre-label',panel).find(x=>x.dataset.countyKey===key)?.classList.add('is-hot')}
function bind(panel){
  if(panel.dataset.adminLabelBound==='true')return;panel.dataset.adminLabelBound='true';
  panel.addEventListener('pointerover',e=>{const shape=e.target.closest?.('.ashape');if(shape&&panel.contains(shape)){hotForShape(panel,shape);return}const centre=e.target.closest?.('.centre');if(centre&&panel.contains(centre)){clearHot(panel);panel.querySelector(`.admin-centre-label[data-centre-index="${CSS.escape(centre.dataset.centreIndex||'')}" ]`)?.classList.add('is-hot')}});
  panel.addEventListener('pointerout',e=>{if(!e.relatedTarget||!panel.contains(e.relatedTarget)||e.target.closest?.('.ashape,.centre'))clearHot(panel)});
  panel.addEventListener('focusin',e=>{const shape=e.target.closest?.('.ashape');if(shape)hotForShape(panel,shape);const centre=e.target.closest?.('.centre');if(centre){clearHot(panel);panel.querySelector(`.admin-centre-label[data-centre-index="${CSS.escape(centre.dataset.centreIndex||'')}" ]`)?.classList.add('is-hot')}});
  panel.addEventListener('focusout',()=>clearHot(panel))
}
function applyPanel(panel){
  if(!panel.classList.contains('kpcg-adm'))return;const view=panel.querySelector('.aview'),shapes=$$('.ashape',panel);if(!view||!shapes.length)return;
  const level=levelOf(panel),signature=`${VERSION}:${level}:${Math.round(panel.getBoundingClientRect().width)}:${shapes.map(s=>s.dataset.shape||'').join('|')}`;
  const existing=view.querySelector('[data-admin-map-label-layer]');if(existing?.dataset.signature===signature){bind(panel);return}
  existing?.remove();panel.querySelector('.admin-label-note')?.remove();panel.dataset.labelLevel=String(level);
  const layer=document.createElementNS(NS,'g');layer.classList.add('admin-map-label-layer');layer.dataset.adminMapLabelLayer=VERSION;layer.dataset.signature=signature;
  territoryLabels(panel,layer,level,shapes);centreLabels(panel,layer,level);view.append(layer);bind(panel)
}
function apply(){frame=0;$$('.map-panel.kpcg-adm').forEach(applyPanel)}
function schedule(){if(frame)return;frame=requestAnimationFrame(apply)}
function relevant(node){if(node.nodeType!==1)return false;if(node.matches?.('.map-panel.kpcg-adm,.map-panel.kpcg-adm .aview,.map-panel.kpcg-adm .amap'))return true;return Boolean(node.querySelector?.('.map-panel.kpcg-adm .aview,.kpcg-adm .aview'))}
function start(){
  style();schedule();
  new MutationObserver(records=>{for(const record of records){if([...record.addedNodes].some(relevant)){schedule();return}}}).observe(document.body,{subtree:true,childList:true});
  addEventListener('resize',()=>{clearTimeout(window.__kpcgLabelResize);window.__kpcgLabelResize=setTimeout(schedule,140)},{passive:true});
  window.KPCGAdminLabels=Object.freeze({version:VERSION,refresh:schedule})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
