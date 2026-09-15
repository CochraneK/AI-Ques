(() => {
  'use strict';
  if(!window.AIQ)return;
  const profile=AIQ.ensureProfile({portalUrl:'../portal/',returnTo:location.href});
  if(!profile)return;

  const session=AIQ.startSession('P005','p005-global-adapter-0.1.0');
  let completed=false;
  const $=s=>document.querySelector(s);

  AIQ.recordEvent('screen_entered',{screen:'welcome'},{project_id:'P005',session_id:session.session_id});

  document.addEventListener('click',e=>{
    const next=e.target.closest('[data-next]');
    if(next){
      AIQ.recordEvent('screen_entered',{screen:next.dataset.next||null},{project_id:'P005',session_id:session.session_id});
    }
  },true);

  const chat=$('#chatForm');
  if(chat){
    chat.addEventListener('submit',()=>{
      const text=($('#chatInput')?.value||'').trim();
      if(text)AIQ.recordEvent('chat_user_message',{text,text_length:text.length},{project_id:'P005',session_id:session.session_id});
    },true);
  }

  const portrait=$('#agePortraitBtn');
  if(portrait)portrait.addEventListener('click',()=>AIQ.recordEvent('future_portrait_requested',{}, {project_id:'P005',session_id:session.session_id}));

  const voice=$('#voiceModeBtn');
  if(voice)voice.addEventListener('click',()=>AIQ.recordEvent('voice_mode_toggled',{}, {project_id:'P005',session_id:session.session_id}));

  const capsule=$('#saveCapsuleBtn');
  if(capsule) capsule.addEventListener('click',()=>{
    const action=($('#nextAction')?.value||'').trim();
    AIQ.recordEvent('capsule_saved',{next_action:action||null},{project_id:'P005',session_id:session.session_id});
  },true);

  function finish(reason){
    if(completed)return;
    completed=true;
    AIQ.completeSession(session,{
      reason,
      message_count:document.querySelectorAll('#messages .message').length,
      capsule_count:document.querySelectorAll('#savedCapsules > *').length
    });
  }
  window.addEventListener('pagehide',()=>finish('pagehide'),{once:true});
})();