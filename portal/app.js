const $=s=>document.querySelector(s);
const form=$("#profileForm");
const onboarding=$("#onboarding");
const hub=$("#hub");
const FALLBACK_PROJECTS=[
  {id:"P001",title:"未来自我",subtitle:"现在的我 · 未来的我 · 理想的我",route:"../future-me/",status:"active",accent:"warm",description:"未来自我、价值澄清与交互式反思。"},
  {id:"P002",title:"情绪天气站",subtitle:"PCL-5 · Current CAPE-P15",route:"../p002/",status:"active",accent:"sage",description:"稳定量表呈现、低改编交互条件与研究数据。"},
  {id:"P003",title:"人生模拟器",subtitle:"Life Simulation",route:"#",status:"building",accent:"blue",description:"从童年到成年的人生模拟与心理学机制。"},
  {id:"P004",title:"人物画像",subtitle:"Conversational Profile",route:"../p004/",status:"active",accent:"violet",description:"开放式聊天中的趣味人物画像；研究侧保留证据、覆盖率与不确定性。"},
  {id:"P005",title:"Future Self",subtitle:"Future You × FutureMe",route:"#",status:"building",accent:"amber",description:"未来自我对话、语音与未来形象体验。"}
];

function fill(profile){
  if(!profile)return;
  ["name","age","origin","location","currentWork"].forEach(k=>{
    const el=form.elements[k];
    if(el && profile[k]!=null)el.value=profile[k];
  });
}
function projectProgress(projectId){
  const events=AIQ.localEvents().filter(e=>e.project_id===projectId);
  const completed=events.filter(e=>e.event_type==="session_completed").length;
  const started=events.filter(e=>e.event_type==="session_started").length;
  if(completed)return {label:"已完成 "+completed+" 次",state:"returning"};
  if(started)return {label:"已有进行记录",state:"started"};
  return {label:"尚未开始",state:"new"};
}
function projectCard(p){
  const progress=projectProgress(p.id);
  const active=p.status==="active";
  const tag=active?(progress.state==="new"?"可进入":"继续探索"):"开发中";
  const body='<div class="project-top"><div class="project-code">'+p.id+'</div><span class="project-state">'+tag+'</span></div>'+
    '<div><p class="project-subtitle">'+p.subtitle+'</p><h3>'+p.title+'</h3><p class="desc">'+p.description+'</p></div>'+
    '<div class="project-foot"><span class="project-progress">'+(active?progress.label:"沿用统一身份 / 数据协议")+'</span><span class="go">'+(active?"进入 →":"即将开放")+'</span></div>';
  return active
    ? '<a class="project-card" data-accent="'+p.accent+'" href="'+p.route+'">'+body+'</a>'
    : '<article class="project-card disabled" data-accent="'+p.accent+'">'+body+'</article>';
}
async function renderProjects(){
  let projects=FALLBACK_PROJECTS;
  try{
    const res=await fetch("../shared/project-registry.json",{cache:"no-store"});
    if(res.ok){
      const data=await res.json();
      if(Array.isArray(data.projects))projects=data.projects;
    }
  }catch(e){}
  $("#projectGrid").innerHTML=projects.map(projectCard).join("");
}
function showHub(profile){
  onboarding.classList.add("hidden");
  hub.classList.remove("hidden");
  $("#profileName").textContent=profile.name||"参与者";
  $("#profileAvatar").textContent=(profile.name||"A").trim().slice(0,1).toUpperCase();
  const bits=[];
  if(profile.age)bits.push(profile.age+" 岁");
  if(profile.origin)bits.push("成长于 "+profile.origin);
  if(profile.location)bits.push("现居 "+profile.location);
  if(profile.currentWork)bits.push(profile.currentWork);
  $("#profileMeta").textContent=bits.join(" · ")||"基本信息已保存";
  $("#participantId").textContent=profile.participant_id;
  renderProjects();
}
function showForm(profile){
  fill(profile);
  hub.classList.add("hidden");
  onboarding.classList.remove("hidden");
}
function init(){
  const profile=AIQ.getProfile();
  if(profile)showHub(profile); else showForm(null);
}
$("#saveProfile").onclick=()=>{
  if(!form.reportValidity())return;
  const values=Object.fromEntries(new FormData(form).entries());
  const profile=AIQ.saveProfile(values);
  const back=AIQ.returnUrl();
  if(back){location.href=back;return}
  showHub(profile);
};
$("#editProfile").onclick=()=>showForm(AIQ.getProfile());
init();