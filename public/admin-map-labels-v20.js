(() => {
'use strict';
const VERSION='20.1.0';
const NS='http://www.w3.org/2000/svg';
let frame=0,nationalCentre=null;
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const escText=v=>String(v??'').trim();
const levelOf=panel=>Number(((panel.querySelector('.lvl')?.textContent||'').match(/ADM(\d)/)||[])[1]||1);
const unitName=shape=>{
  const raw=shape.querySelector('title')?.textContent||shape.getAttribute('aria-label')||'';
  return escText(raw.split(' · ')[0].split(/\s+-\s+/)[0].replace(/\s+(County|Sub-County|Ward).*$/i,''))||'Administrative unit';
};
function style(){if($('#kpcg-admin-label-css'))return;const s=document.createElement('style');s.id='kpcg-admin-label-css';s.textContent=`
.kpcg-adm .admin-map-label-layer{pointer-events:none}.kpcg-adm .admin-unit-label,.kpcg-adm .admin-centre-label{font-family:Inter,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;text-anchor:middle;paint-order:stroke;stroke:#fff;stroke-width:2.8px;stroke-linejoin:round;fill:#102a22;font-weight:850;letter-spacing:-.01em;pointer-events:none;user-select:none}.kpcg-adm .admin-unit-label[data-level="0"]{font-size:22px;letter-spacing:.08em}.kpcg-adm .admin-unit-label[data-level="1"]{font-size:7.4px}.kpcg-adm .admin-unit-label[data-level="2"]{font-size:10.4px}.kpcg-adm .admin-unit-label[data-level="3"]{font-size:9.2px}.kpcg-adm .admin-centre-label{font-size:6.3px;text-anchor:start;font-weight:800;fill:#17211d;stroke-width:2.4px}.kpcg-adm .admin-centre-label.national{font-size:7.5px;fill:#7f321d;font-weight:950}.kpcg-adm .admin-centre-halo{fill:#fff;stroke:#17342a;stroke-width:1.4;vector-effect:non-scaling-stroke}.kpcg-adm .admin-centre-core{fill:#17342a;stroke:#fff;stroke-width:1;vector-effect:non-scaling-stroke}.kpcg-adm .admin-centre-core.national{fill:#a84a2a}.kpcg-adm .admin-label-note{position:absolute;z-index:7;right:14px;bottom:91px;max-width:min(340px,52%);padding:6px 8px;border:1px solid #d4e0da;border-radius:8px;background:#ffffffdf;color:#52665d;font-size:.58rem;line-height:1.35;text-align:right;pointer-events:none}.kpcg-adm .admin-label-note strong{color:#17211d}.kpcg-adm[data-label-level="2"] .admin-label-note,.kpcg-adm[data-label-level="3"] .admin-label-note{display:block}
html[data-theme=dark] .kpcg-adm .admin-unit-label,html[data-theme=dark] .kpcg-adm .admin-centre-label{fill:#eef6f2;stroke:#0b1712}html[data-theme=dark] .kpcg-adm .admin-centre-label.national{fill:#f2a68a}html[data-theme=dark] .kpcg-adm .admin-label-note{background:#14211dde;color:#b9c9c1;border-color:#365044}html[data-theme=dark] .kpcg-adm .admin-label-note strong{color:#eef6f2}
@media(max-width:720px){.kpcg-adm .admin-unit-label[data-level="1"]{font-size:6.4px}.kpcg-adm .admin-unit-label[data-level="2"]{font-size:9.2px}.kpcg-adm .admin-unit-label[data-level="3"]{font-size:8px}.kpcg-adm .admin-centre-label{font-size:5.7px}.kpcg-adm .admin-label-note{max-width:58%;font-size:.54rem}}
`;document.head.append(s)}
function splitLabel(name,level,bbox){
  if(level===0)return[name.toUpperCase()];
  const max=level===1?12:level===2?18:16;
  if(name.length<=max||!name.includes(' '))return[name];
  const words=name.split(/\s+/),lines=[];let row='';
  for(const word of words){const next=row?`${row} ${word}`:word;if(next.length<=max||!row)row=next;else{lines.push(row);row=word}}
  if(row)lines.push(row);
  if(lines.length>3){const first=lines.slice(0,2);first.push(lines.slice(2).join(' '));return first}
  return lines;
}
function pointIn(path,x,y){try{return typeof path.isPointInFill==='function'?path.isPointInFill(new DOMPoint(x,y)):true}catch{return true}}
function labelPoint(path){
  const b=path.getBBox(),cx=b.x+b.width/2,cy=b.y+b.height/2;
  if(pointIn(path,cx,cy))return{x:cx,y:cy,b};
  const candidates=[];for(const dy of[0,-.16,.16,-.3,.3])for(const dx of[0,-.16,.16,-.3,.3])candidates.push([cx+b.width*dx,cy+b.height*dy]);
  const hit=candidates.find(([x,y])=>pointIn(path,x,y));return{x:hit?.[0]??cx,y:hit?.[1]??cy,b};
}
function textNode(name,level,path){
  const {x,y,b}=labelPoint(path),lines=splitLabel(name,level,b),text=document.createElementNS(NS,'text');text.setAttribute('class','admin-unit-label');text.dataset.level=String(level);text.dataset.unitName=name;text.setAttribute('x',x.toFixed(1));text.setAttribute('y',(y-(lines.length-1)*(level===1?3.6:level===0?11:5.1)).toFixed(1));text.setAttribute('aria-hidden','true');
  const fs=level===0?22:level===1?7.4:level===2?10.4:9.2;
  if(level>0&&b.width<42)text.style.fontSize=`${Math.max(level===1?5.1:6.8,Math.min(fs,b.width/Math.max(4,name.length*.52)))}px`;
  lines.forEach((line,i)=>{const t=document.createElementNS(NS,'tspan');t.textContent=line;t.setAttribute('x',x.toFixed(1));if(i)t.setAttribute('dy',level===0?'22':'1.05em');text.append(t)});return text;
}
function centreName(circle){const label=circle.getAttribute('aria-label')||circle.dataset.tip||'';return escText(label.split(/\s+-\s+/)[0])||'Administrative centre'}
function rememberNational(panel){const c=panel.querySelector('.centre.nat');if(!c)return;const x=Number(c.getAttribute('cx')),y=Number(c.getAttribute('cy'));if(Number.isFinite(x)&&Number.isFinite(y))nationalCentre={x,y,name:centreName(c)}}
function centreLabels(panel,layer,level){
  if(level===1){
    const circles=$$('.centre',panel);rememberNational(panel);
    circles.forEach(c=>{const x=Number(c.getAttribute('cx')),y=Number(c.getAttribute('cy')),name=centreName(c),national=c.classList.contains('nat');if(!Number.isFinite(x)||!Number.isFinite(y)||!name)return;const t=document.createElementNS(NS,'text');t.setAttribute('class',`admin-centre-label${national?' national':''}`);t.setAttribute('x',(x+5.4).toFixed(1));t.setAttribute('y',(y-4.8).toFixed(1));t.textContent=national?`${name} · national capital`:`${name} · county HQ`;t.setAttribute('aria-hidden','true');layer.append(t)})
  }else if(level===0&&nationalCentre){
    const {x,y,name}=nationalCentre,h=document.createElementNS(NS,'circle'),c=document.createElementNS(NS,'circle'),t=document.createElementNS(NS,'text');h.setAttribute('class','admin-centre-halo');h.setAttribute('cx',x);h.setAttribute('cy',y);h.setAttribute('r','6.2');c.setAttribute('class','admin-centre-core national');c.setAttribute('cx',x);c.setAttribute('cy',y);c.setAttribute('r','4');t.setAttribute('class','admin-centre-label national');t.setAttribute('x',x+7);t.setAttribute('y',y-6);t.textContent=`${name} · national capital`;layer.append(h,c,t)
  }
}
function note(panel,level){panel.querySelector('.admin-label-note')?.remove();const n=document.createElement('div');n.className='admin-label-note';n.innerHTML=level<=1?'<strong>Map labels:</strong> territory names and verified administrative centres are shown directly on the map.':'<strong>Map labels:</strong> territory names are shown directly on the map. Sub-county/ward headquarters are not labelled until an authoritative national centre registry is connected.';panel.querySelector('.amap')?.append(n)}
function applyPanel(panel){
  if(!panel.classList.contains('kpcg-adm'))return;const view=panel.querySelector('.aview'),shapes=$$('.ashape',panel);if(!view||!shapes.length)return;const level=levelOf(panel);panel.dataset.labelLevel=String(level);view.querySelector('[data-admin-map-label-layer]')?.remove();const layer=document.createElementNS(NS,'g');layer.classList.add('admin-map-label-layer');layer.dataset.adminMapLabelLayer=VERSION;for(const shape of shapes)layer.append(textNode(unitName(shape),level,shape));centreLabels(panel,layer,level);view.append(layer);note(panel,level)
}
function apply(){frame=0;$$('.map-panel.kpcg-adm').forEach(applyPanel)}
function schedule(){if(frame)return;frame=requestAnimationFrame(apply)}
function start(){style();schedule();new MutationObserver(records=>{for(const record of records){for(const node of record.addedNodes){if(node.nodeType!==1)continue;if(node.matches?.('.aview,.ashape,.kpcg-adm')||node.querySelector?.('.aview,.ashape,.kpcg-adm')){schedule();return}}}}).observe(document.body,{subtree:true,childList:true});addEventListener('resize',()=>{clearTimeout(window.__kpcgLabelResize);window.__kpcgLabelResize=setTimeout(schedule,120)},{passive:true});window.KPCGAdminLabels=Object.freeze({version:VERSION,refresh:schedule})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
