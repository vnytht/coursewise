export const terms = [{id:'fall26',name:'Fall 2026',start:'2026-08-24',end:'2026-12-11',exceptions:['2026-09-07','2026-11-26','2026-11-27']},{id:'spring27',name:'Spring 2027',start:'2027-01-19',end:'2027-05-07',exceptions:['2027-02-15','2027-03-22','2027-03-23','2027-03-24','2027-03-25','2027-03-26']}];
export const departments = [
 {id:'CS',name:'Computer Science',color:'blue',icon:'⌘',titles:['The Structure of Programs','Data Structures & Algorithms','Introduction to Artificial Intelligence','Computer Systems','Human–Computer Interaction','Foundations of Cybersecurity','Database Systems','Computer Graphics','Networks & the Internet','Software Engineering'],desc:'Build a practical understanding of computational thinking through code, collaborative projects, and carefully designed experiments.'},
 {id:'DATA',name:'Data Science',color:'purple',icon:'▥',titles:['Foundations of Data Science','Data, Ethics & Society','Statistical Inference','Machine Learning in Practice','Data Visualization','Applied Regression','Natural Language Processing','Data Engineering','Causal Inference','Experiments & Decision Making'],desc:'Turn questions into evidence. Work with realistic datasets, communicate uncertainty, and discover how data shapes everyday decisions.'},
 {id:'DES',name:'Design',color:'orange',icon:'◈',titles:['Designing Human Experiences','Visual Communication','Design Research','Interaction Design Studio','Typography & Information','Designing for Accessibility','Creative Coding','Service Design','Prototyping New Ideas','Design & Social Change'],desc:'Explore how people experience the world and develop thoughtful responses through research, making, critique, and iteration.'},
 {id:'MATH',name:'Mathematics',color:'teal',icon:'∑',titles:['Calculus & Its Applications','Linear Algebra','Discrete Mathematics','Probability','Differential Equations','Numerical Methods','Real Analysis','Optimization','Mathematical Modeling','Geometry & Visualization'],desc:'Develop mathematical intuition and precise reasoning. Connect abstract ideas to practical problems through guided exercises and discussion.'},
 {id:'ECON',name:'Economics',color:'gold',icon:'↗',titles:['Principles of Economics','Microeconomic Analysis','Macroeconomic Analysis','Behavioral Economics','Economics of Technology','Environmental Economics','International Trade','Labor & Inequality','Public Policy','Econometrics'],desc:'Investigate how people, organizations, and communities make choices. Use models and evidence to understand tradeoffs and policy.'},
 {id:'PSY',name:'Psychology',color:'pink',icon:'◎',titles:['Mind, Brain & Behavior','Cognitive Psychology','Social Psychology','Development Across the Lifespan','Learning & Memory','Research Methods','Perception','Psychology of Decision Making','Emotion & Motivation','Culture & Identity'],desc:'Examine the mind and human behavior through research, experiments, and discussion of evidence from everyday life.'}
];
const codes=[61,100,188,120,140,160,170,180,190,199];
const instructors=['Maya Chen','Oliver Reyes','Amara Okafor','Ethan Park','Sofia Patel','Julian Brooks','Lena Alvarez','Noah Kim','Isabel Morgan','Daniel Rivers'];
export const courses=departments.flatMap((d,di)=>d.titles.map((title,i)=>({id:`${d.id}${codes[i]}`,code:`${d.id} ${codes[i]}`,canonical:`${d.id}${codes[i]}`,title,department:d.id,color:d.color,icon:d.icon,units:d.id==='DES'||d.id==='PSY'?3:4,variable:i===9,description:d.desc,prerequisite:i===0?'No prerequisites.':`Recommended preparation: ${d.id} ${codes[Math.max(0,i-1)]} or equivalent experience. Instructor permission may be required.`,tag:di<2?'Quantitative reasoning':di===2?'Arts & literature':di===3?'Quantitative reasoning':di===4?'Social sciences':'Behavioral sciences',level:i===0?'Lower division':'Upper division',instructor:instructors[(i+di*2)%10],alias:di===1&&i===1?'STS 110':null})));
export const offerings=terms.flatMap((term,ti)=>courses.map((c,idx)=>{
 const sections=[],combos=[];const i=idx%10;
 const meeting=(days,start,duration,extra={})=>({days,start,end:start+duration,startDate:term.start,endDate:term.end,exceptions:term.exceptions,...extra});
 for(let option=0;option<2;option++){
  const base=9*60+((idx*2+option*3)%7)*60;
  const lid=`${term.id}-${c.id}-L${option+1}`;
  const status=idx===8?'cancelled':idx===7?'unknown':idx%13===6?'waitlist':idx%11===5&&option===0?'full':'open';
  const mode=idx===9?'TBA':idx===19?'Asynchronous':'In person';
  const half=idx===20?{endDate:ti?'2027-03-05':'2026-10-09'}:idx===21?{startDate:ti?'2027-03-08':'2026-10-12'}:{};
  sections.push({id:lid,label:`LEC 00${option+1}`,type:'Lecture',instructor:c.instructor,location:mode==='In person'?`${['Alder','Newton','Horizon','Cedar'][idx%4]} Hall ${100+(idx%8)*10}`:mode,status,seats:status==='open'?8+(idx*7+option)%65:0,capacity:120,mode,meetings:mode==='In person'?[meeting(option===0?[1,3]:[2,4],base,80,half)]:[]});
  if(i<6){
   const sid=`${term.id}-${c.id}-D${option+1}`;
   sections.push({id:sid,label:`${c.department==='CS'?'LAB':'DIS'} 10${option+1}`,type:c.department==='CS'?'Lab':'Discussion',instructor:c.instructor,location:`Cedar Hall ${200+idx}`,status:idx===4&&option===0?'full':'open',seats:12+idx%9,capacity:30,mode:'In person',meetings:[meeting([option===0?5:3],10*60+idx%6*60,50,half)]});
   combos.push([lid,sid]);
  }else combos.push([lid]);
 }
 return {id:`${term.id}-${c.id}`,term:term.id,course:c.id,sections,combos};
}));
export const getCourse=id=>courses.find(c=>c.id===id||c.alias===id);
export const getOffering=(term,id)=>offerings.find(o=>o.term===term&&o.course===getCourse(id)?.id);
export const getTerm=id=>terms.find(t=>t.id===id);
export const dayNames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
export const time=n=>`${Math.floor(n/60)%12||12}:${String(n%60).padStart(2,'0')} ${n<720?'AM':'PM'}`;
export const meetingLabel=m=>`${m.days.map(d=>dayNames[d]).join(' / ')} · ${time(m.start)}–${time(m.end)}`;
