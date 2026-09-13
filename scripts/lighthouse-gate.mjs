import fs from 'node:fs';

const input=process.argv[2];
if(!input||!fs.existsSync(input))throw new Error(`Lighthouse JSON not found: ${input||'(missing argument)'}`);
const report=JSON.parse(fs.readFileSync(input,'utf8'));
const scores=Object.fromEntries(['performance','accessibility','best-practices','seo'].map(key=>[key,report.categories?.[key]?.score??0]));
const thresholds={performance:.75,accessibility:.95,'best-practices':.90,seo:.90};
const failures=Object.entries(thresholds).filter(([key,min])=>scores[key]<min);
const metrics={
  firstContentfulPaint:report.audits?.['first-contentful-paint']?.numericValue??null,
  largestContentfulPaint:report.audits?.['largest-contentful-paint']?.numericValue??null,
  totalBlockingTime:report.audits?.['total-blocking-time']?.numericValue??null,
  cumulativeLayoutShift:report.audits?.['cumulative-layout-shift']?.numericValue??null,
  speedIndex:report.audits?.['speed-index']?.numericValue??null
};
const summary={url:report.finalDisplayedUrl||report.finalUrl,fetchTime:report.fetchTime,scores,thresholds,metrics,passed:failures.length===0};
const out=input.replace(/\.json$/,'-gate.json');
fs.writeFileSync(out,JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify(summary,null,2));
if(failures.length){
  throw new Error(`Lighthouse gate failed: ${failures.map(([key,min])=>`${key} ${Math.round(scores[key]*100)} < ${Math.round(min*100)}`).join(', ')}`);
}
