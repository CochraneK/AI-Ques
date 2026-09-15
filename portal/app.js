const $=s=>document.querySelector(s);
const form=$("#profileForm");
const onboarding=$("#onboarding");
const hub=$("#hub");

function fill(profile){
  if(!profile)return;
  ["name","age","origin","location","currentWork"].forEach(k=>{
    const el=form.elements[k];
    if(el && profile[k]!=null)el.value=profile[k];
  });
}
function showHub(profile){
  onboarding.classList.add("hidden");
  hub.classList.remove("hidden");
  $("#profileName").textContent=profile.name||"参与者";
  const bits=[];
  if(profile.age)bits.push(profile.age+" 岁");
  if(profile.origin)bits.push("成长于 "+profile.origin);
  if(profile.location)bits.push("现居 "+profile.location);
  if(profile.currentWork)bits.push(profile.currentWork);
  $("#profileMeta").textContent=bits.join(" · ")||"基本信息已保存";
  $("#participantId").textContent=profile.participant_id;
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