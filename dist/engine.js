import {courses,getCourse,getOffering,getTerm} from './data.js';
export const clone=o=>structuredClone(o);
export function fail(code,message){throw Object.assign(new Error(message),{code});}
export function newPlan(term,id='plan-1',name='My semester'){return {id,term,name,revision:0,items:[],blocks:[],constraints:{earliest:480,latest:1200,noFriday:false,openOnly:true,minUnits:0,maxUnits:20,preference:'days'}};}
export function bundle(plan,courseId,sectionIds,units){
 const c=getCourse(courseId),o=getOffering(plan.term,courseId);
 if(!c||!o)fail('NOT_FOUND','Course is not available in this term.');
 if(!Array.isArray(sectionIds)||!o.combos.some(a=>a.length===sectionIds.length&&a.every(id=>sectionIds.includes(id))))fail('INVALID_SECTION_COMBINATION','Choose a complete lecture and its linked lab or discussion.');
 if(o.sections.some(s=>sectionIds.includes(s.id)&&s.status==='cancelled'))fail('CANCELLED','A selected section has been cancelled.');
 if(!Number.isInteger(units)||(c.variable?(units<1||units>4):units!==c.units))fail('INVALID_UNITS',c.variable?'Choose between 1 and 4 units.':`This course carries ${c.units} units.`);
 return {course:c.id,sections:[...sectionIds],units,locked:false};
}
export function meetings(plan){return [...plan.items.flatMap(item=>{
 const c=getCourse(item.course),o=getOffering(plan.term,item.course);
 return (o?.sections||[]).filter(s=>item.sections.includes(s.id)).flatMap(s=>s.meetings.map(m=>({...m,key:s.id,course:c.id,title:c.code,color:c.color,location:s.location,label:s.label})));
}),...plan.blocks.map(b=>({...b,key:b.id,title:b.name,color:'gray',location:'Personal time'}))];}
export function dates(m){const result=[];for(let t=Date.parse(m.startDate+'T12:00:00Z');t<=Date.parse(m.endDate+'T12:00:00Z');t+=86400000){const d=new Date(t);const key=d.toISOString().slice(0,10);if(m.days.includes(d.getUTCDay())&&!m.exceptions?.includes(key))result.push(key);}return result;}
export function overlap(a,b){if(a.start>=b.end||b.start>=a.end||a.endDate<b.startDate||b.endDate<a.startDate||!a.days.some(d=>b.days.includes(d)))return false;const bs=new Set(dates(b));return dates(a).some(d=>bs.has(d));}
export function checkPlan(plan){
 const issues=[],seen=new Set();
 for(const item of plan.items){try{bundle(plan,item.course,item.sections,item.units);}catch(e){issues.push({code:e.code,message:e.message});}
  const c=getCourse(item.course);if(seen.has(c?.canonical))issues.push({code:'DUPLICATE',message:`${c.code} is selected twice.`});seen.add(c?.canonical);
  const o=getOffering(plan.term,item.course);for(const s of o?.sections.filter(s=>item.sections.includes(s.id))||[]){if(s.mode==='TBA')issues.push({code:'UNKNOWN_TIME',message:`${c.code} ${s.label}: meeting time is unknown.`});if(s.status!=='open')issues.push({code:'AVAILABILITY',message:`${c.code} ${s.label}: ${s.status} (sample availability).`});}
 }
 const ms=meetings(plan);for(let i=0;i<ms.length;i++)for(let j=i+1;j<ms.length;j++)if(overlap(ms[i],ms[j]))issues.push({code:'TIME_CONFLICT',message:`${ms[i].title} ${ms[i].label||''} overlaps ${ms[j].title} ${ms[j].label||''}.`});
 return {units:plan.items.reduce((s,i)=>s+i.units,0),issues,verified:issues.length===0&&plan.items.length>0};
}
export function addBundle(plan,item,revision,{allowConflict=false}={}){
 if(revision!==plan.revision)fail('STALE_REVISION','Your plan changed. Refresh before applying this change.');
 const valid=bundle(plan,item.course,item.sections,item.units);if(plan.items.some(i=>getCourse(i.course).canonical===getCourse(valid.course).canonical))fail('DUPLICATE','This course is already in your plan.');
 const next=clone(plan);next.items.push(valid);next.revision++;
 if(!allowConflict&&checkPlan(next).issues.some(i=>i.code==='TIME_CONFLICT'))fail('TIME_CONFLICT','This selection overlaps a course or personal time. Choose another combination.');return next;
}
export function applyProposal(plan,proposal){if(proposal.baseRevision!==plan.revision||proposal.planId!==plan.id||proposal.term!==plan.term)fail('STALE_REVISION','Your plan changed after this proposal. Generate new options.');const next={...clone(plan),items:clone(proposal.items)};for(const old of plan.items.filter(i=>i.locked))if(!next.items.some(i=>JSON.stringify(i)===JSON.stringify(old)))fail('LOCKED','A locked course cannot be changed.');if(!isFeasible(next,plan.constraints))fail('INVALID_PROPOSAL','This proposal no longer satisfies your constraints.');next.revision++;return next;}
export function searchCourses(term,filters={}){
 if(!getTerm(term))fail('INVALID_TERM','Select a valid term.');
 const compact=s=>s.toLowerCase().replace(/\s+/g,'');const q=compact(filters.query||'');
 return courses.filter(c=>{
  if(q&&!compact([c.code,c.title,c.alias||'',c.instructor,c.description].join(' ')).includes(q))return false;
  if(filters.departments?.length&&!filters.departments.includes(c.department))return false;
  if(filters.level&&filters.level!==c.level)return false;if(filters.tag&&filters.tag!==c.tag)return false;
  if(filters.units&&!(c.variable?Number(filters.units)>=1&&Number(filters.units)<=4:Number(filters.units)===c.units))return false;
  const o=getOffering(term,c.id);return o.combos.some(combo=>combo.every(id=>{const s=o.sections.find(s=>s.id===id);if(s.status==='cancelled')return false;if(filters.openOnly&&s.status!=='open')return false;if(filters.mode&&s.mode!==filters.mode)return false;
   if((filters.earliest||filters.latest||filters.days?.length)&&s.mode==='TBA')return false;
   return s.meetings.every(m=>(!filters.earliest||m.start>=+filters.earliest)&&(!filters.latest||m.end<=+filters.latest)&&(!filters.days?.length||m.days.every(d=>filters.days.includes(d))));}));
 });
}
export function isFeasible(plan,cons){
 if(checkPlan(plan).issues.some(i=>['TIME_CONFLICT','UNKNOWN_TIME','CANCELLED','DUPLICATE','INVALID_UNITS','INVALID_SECTION_COMBINATION'].includes(i.code)))return false;
 if(cons.openOnly&&plan.items.some(i=>getOffering(plan.term,i.course).sections.some(s=>i.sections.includes(s.id)&&s.status!=='open')))return false;
 return meetings({...plan,blocks:[]}).every(m=>m.start>=cons.earliest&&m.end<=cons.latest&&(!cons.noFriday||!m.days.includes(5)));
}
export function metrics(plan){const byDay={};for(const m of meetings({...plan,blocks:[]}))for(const d of m.days)(byDay[d]??=[]).push(m);let gaps=0;for(const list of Object.values(byDay)){list.sort((a,b)=>a.start-b.start);for(let i=1;i<list.length;i++)gaps+=Math.max(0,list[i].start-list[i-1].end);}return {days:Object.keys(byDay).length,gaps,units:checkPlan(plan).units};}
export function generate(plan,candidates,mustInclude=[]){
 if(!Array.isArray(candidates)||candidates.length>8||!candidates.length)fail('CANDIDATES','Shortlist between 1 and 8 courses to generate options.');
 if(candidates.some(id=>!getCourse(id)))fail('NOT_FOUND','An unknown course was requested.');
 const locked=plan.items.filter(i=>i.locked),ids=[...new Set(candidates.map(id=>getCourse(id).id))].filter(id=>!locked.some(i=>i.course===id));
 const required=new Set(mustInclude.map(id=>getCourse(id)?.id));if([...required].some(id=>!id||(!ids.includes(id)&&!locked.some(i=>i.course===id))))fail('CANDIDATES','A required course is outside the shortlist.');
 const c=plan.constraints; if(c.minUnits>c.maxUnits||c.earliest>=c.latest)fail('CONSTRAINTS','Check your unit range and time window.');
 const base={...clone(plan),items:clone(locked)};if(!isFeasible(base,c))return {options:[],limited:false,visited:0,reason:'A locked course conflicts with your current constraints or personal time.'};
 const options=[];let visited=0,limited=false;
 function walk(pos,current){if(++visited>30000){limited=true;return;}const units=checkPlan(current).units;if(units>c.maxUnits)return;
  if(pos===ids.length){if(current.items.length&&units>=c.minUnits){const m=metrics(current);options.push({planId:plan.id,term:plan.term,baseRevision:plan.revision,items:clone(current.items),metrics:m,score:c.preference==='gaps'?m.gaps*10+m.days:m.days*1000+m.gaps});}return;}
  const id=ids[pos],course=getCourse(id),o=getOffering(plan.term,id);
  for(const combo of o.combos){for(const u of course.variable?[1,2,3,4]:[course.units]){if(limited)return;try{const item=bundle(plan,id,combo,u),next={...current,items:[...current.items,item]};if(isFeasible(next,c))walk(pos+1,next);}catch{}}}
  if(!required.has(id)&&!limited)walk(pos+1,current);
 }
 walk(0,base);options.sort((a,b)=>a.score-b.score||b.metrics.units-a.metrics.units);
 return {options:options.slice(0,3),limited,visited,reason:options.length?'':limited?'No option found within the search limit. Narrow the shortlist.':'No complete schedule satisfies these courses, linked sections, availability, unit range, and blocked times. Try changing one constraint.'};
}
export function calendar(plan,includeBlocks=false){
 const escape=s=>String(s).replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');
 const stamp=(day,minutes)=>day.replaceAll('-','')+'T'+String(Math.floor(minutes/60)).padStart(2,'0')+String(minutes%60).padStart(2,'0')+'00';
 const lines=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//CourseWise//Sample Planner//EN','CALSCALE:GREGORIAN','X-WR-TIMEZONE:America/Los_Angeles','BEGIN:VTIMEZONE','TZID:America/Los_Angeles','BEGIN:DAYLIGHT','DTSTART:19700308T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=2SU','TZOFFSETFROM:-0800','TZOFFSETTO:-0700','TZNAME:PDT','END:DAYLIGHT','BEGIN:STANDARD','DTSTART:19701101T020000','RRULE:FREQ=YEARLY;BYMONTH=11;BYDAY=1SU','TZOFFSETFROM:-0700','TZOFFSETTO:-0800','TZNAME:PST','END:STANDARD','END:VTIMEZONE'];
 for(const m of meetings(includeBlocks?plan:{...plan,blocks:[]}))for(const day of dates(m))lines.push('BEGIN:VEVENT',`UID:${escape(plan.id)}-${m.key}-${day}-${m.start}@coursewise.local`,'DTSTAMP:'+new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,''),`DTSTART;TZID=America/Los_Angeles:${stamp(day,m.start)}`,`DTEND;TZID=America/Los_Angeles:${stamp(day,m.end)}`,`SUMMARY:${escape(m.title+' '+(m.label||'')+' [Sample]')}`,`LOCATION:${escape(m.location||'')}`,'END:VEVENT');
 lines.push('END:VCALENDAR');return lines.map(line=>{let out='',bytes=0;for(const ch of line){const n=new TextEncoder().encode(ch).length;if(bytes+n>74){out+='\r\n ';bytes=1;}out+=ch;bytes+=n;}return out;}).join('\r\n')+'\r\n';
}
