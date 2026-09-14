(() => {
  'use strict';

  const VERSION='19.1.0';
  const NS='http://www.w3.org/2000/svg';
  let frame=0;

  const css=`
    .map-panel.kpcg-adm .lvl,
    .map-panel.kpcg-adm .x19-map-guide{display:none!important}
    .map-panel.kpcg-adm.x19-surface:after{display:none!important}
    .map-panel.kpcg-adm .territory-label-layer{pointer-events:none}
    .map-panel.kpcg-adm .territory-label{pointer-events:none;fill:#13231d;font-family:inherit;font-weight:850;letter-spacing:-.01em;text-anchor:middle;paint-order:stroke fill;stroke:rgba(255,255,255,.92);stroke-width:3px;stroke-linejoin:round}
    html[data-theme=dark] .map-panel.kpcg-adm .territory-label{fill:#f7fbf9;stroke:rgba(6,25,18,.88)}
  `;

  function installStyle(){
    if(document.querySelector('#kpcg-map-presentation-v19'))return;
    const style=document.createElement('style');
    style.id='kpcg-map-presentation-v19';
    style.textContent=css;
    document.head.append(style);
  }

  function cleanName(shape){
    const raw=shape.querySelector('title')?.textContent||shape.getAttribute('aria-label')||'';
    return raw.split(/\s+-\s+|\s+—\s+|\s+·\s+/)[0].trim();
  }

  function levelOf(panel){
    const raw=panel.querySelector('.lvl')?.textContent||'';
    const match=raw.match(/ADM(\d)/i);
    return match?Number(match[1]):1;
  }

  function splitLines(name){
    const words=name.trim().split(/\s+/).filter(Boolean);
    if(words.length<2)return[name];
    let best=[name],score=Infinity;
    for(let i=1;i<words.length;i++){
      const a=words.slice(0,i).join(' '),b=words.slice(i).join(' ');
      const next=Math.max(a.length,b.length)+Math.abs(a.length-b.length)*.22;
      if(next<score){score=next;best=[a,b]}
    }
    return best;
  }

  function labelSpec(shape,level){
    let box;
    try{box=shape.getBBox()}catch{return null}
    if(!box||box.width<=0||box.height<=0)return null;
    const name=cleanName(shape);
    if(!name)return null;

    const font=level===0?16:level===1?8.6:level===2?12.2:11.1;
    const pad=level===1?8:10;
    const singleWidth=name.length*font*.56+pad;
    let lines=[name];

    if(singleWidth>box.width&&name.includes(' '))lines=splitLines(name);
    const longest=Math.max(...lines.map(line=>line.length));
    const neededWidth=longest*font*.56+pad;
    const neededHeight=font*(lines.length===1?1.8:2.9);

    const minWidth=level===1?34:level===3?30:42;
    const minHeight=level===1?20:level===3?22:28;
    if(box.width<Math.max(minWidth,neededWidth)||box.height<Math.max(minHeight,neededHeight))return null;

    return{name,lines,font,x:box.x+box.width/2,y:box.y+box.height/2};
  }

  function addLabels(panel,svg){
    svg.querySelector('.territory-label-layer')?.remove();
    const level=levelOf(panel);
    const layer=document.createElementNS(NS,'g');
    layer.setAttribute('class','territory-label-layer');
    layer.setAttribute('aria-hidden','true');

    panel.querySelectorAll('.ashape').forEach(shape=>{
      const spec=labelSpec(shape,level);
      if(!spec)return;
      const text=document.createElementNS(NS,'text');
      text.setAttribute('class','territory-label');
      text.setAttribute('data-territory-name',spec.name);
      text.setAttribute('x',spec.x.toFixed(1));
      text.setAttribute('y',(spec.y-(spec.lines.length-1)*spec.font*.58).toFixed(1));
      text.setAttribute('font-size',String(spec.font));
      spec.lines.forEach((line,index)=>{
        const tspan=document.createElementNS(NS,'tspan');
        tspan.setAttribute('x',spec.x.toFixed(1));
        tspan.setAttribute('dy',index===0?'0':`${(spec.font*1.14).toFixed(1)}px`);
        tspan.textContent=line;
        text.append(tspan);
      });
      layer.append(text);
    });

    svg.querySelector('.aview')?.append(layer);
  }

  function stabilize(panel){
    if(!panel.dataset.kpcgMapPointerStable){
      panel.dataset.kpcgMapPointerStable=VERSION;
      panel.classList.remove('x19-surface');
      panel.style.removeProperty('--x19-x');
      panel.style.removeProperty('--x19-y');
      panel.addEventListener('pointermove',event=>{
        if(event.target.closest?.('svg'))event.stopImmediatePropagation();
      },true);
    }
    panel.classList.remove('x19-surface');
    panel.querySelector('.tip')?.remove();
  }

  function applyPanel(panel){
    if(!panel?.classList?.contains('kpcg-adm'))return;
    stabilize(panel);
    const svg=panel.querySelector('.amap svg');
    if(!svg)return;

    svg.querySelectorAll('.centre,.centre0').forEach(node=>{
      const group=node.closest('g');
      if(group&&group!==svg.querySelector('.aview'))group.remove();else node.remove();
    });

    const signature=`${levelOf(panel)}:${panel.querySelectorAll('.ashape').length}:${panel.querySelector('.asum')?.textContent||''}`;
    if(svg.dataset.presentationSignature===signature&&svg.querySelector('.territory-label-layer'))return;
    svg.dataset.presentationSignature=signature;
    addLabels(panel,svg);
  }

  function apply(){
    document.querySelectorAll('.map-panel.kpcg-adm').forEach(applyPanel);
  }

  function schedule(){
    if(frame)return;
    frame=requestAnimationFrame(()=>{frame=0;apply()});
  }

  function start(){
    installStyle();
    apply();
    const root=document.querySelector('#app')||document.body;
    new MutationObserver(records=>{
      if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&!node.closest?.('.territory-label-layer'))))schedule();
    }).observe(root,{subtree:true,childList:true});
    addEventListener('hashchange',()=>setTimeout(schedule,0));
    window.KPCGMapPresentation=Object.freeze({version:VERSION,refresh:apply});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
