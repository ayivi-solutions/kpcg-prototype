(() => {
'use strict';
const VERSION='20.0.5';
function style(){if(document.querySelector('link[data-kpcg-ci-style]'))return;const l=document.createElement('link');l.rel='stylesheet';l.href=`/climate-intelligence-v20.css?v=${VERSION}`;l.dataset.kpcgCiStyle=VERSION;document.head.append(l)}
function script(src,key){return new Promise((resolve,reject)=>{const existing=document.querySelector(`script[data-kpcg-ci="${key}"]`);if(existing){if(key==='ui'||window.KPCGClimate)return resolve();existing.addEventListener('load',resolve,{once:true});return}const s=document.createElement('script');s.src=`${src}?v=${VERSION}`;s.defer=true;s.dataset.kpcgCi=key;s.onload=resolve;s.onerror=()=>reject(new Error(`Failed to load ${src}`));document.head.append(s)})}
async function start(){style();try{await script('/climate-intelligence-core-v20.js','core');await window.KPCGClimate.load();await script('/climate-intelligence-ui-v20.js','ui');window.KPCGClimateIntelligence=Object.freeze({version:VERSION,indicatorCount:window.KPCGClimate.store.indicators.length,observationCount:window.KPCGClimate.store.observations.length,geographyLevels:window.KPCGClimate.store.geography?.levels?.length||0})}catch(error){console.error('[KPCG CI] initialization failed',error)}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
