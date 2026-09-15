(() => {
  'use strict';
  if (!window.AIQ) return;

  const profile=AIQ.ensureProfile({portalUrl:'../portal/',returnTo:location.href});
  if(!profile)return;

  const session=AIQ.startSession('P004','p004-global-adapter-0.1.0');
  let completed=false;
  const $=id=>document.getElementById(id);

  AIQ.recordEvent('screen_entered',{screen:'conversation'},{project_id:'P004',session_id:session.session_id});

  const composer=$('composer');
  if(composer){
    composer.addEventListener('submit',()=>{
      const input=$('messageInput');
      const text=(input?.value||'').trim();
      if(text)AIQ.recordEvent('chat_user_message',{text_length:text.length,text:text},{project_id:'P004',session_id:session.session_id});
    },true);
  }

  const report=$('openReportBtn');
  if(report)report.addEventListener('click',()=>AIQ.recordEvent('public_report_opened',{}, {project_id:'P004',session_id:session.session_id}));

  const admin=$('adminBtn');
  if(admin)admin.addEventListener('click',()=>AIQ.recordEvent('admin_demo_opened',{}, {project_id:'P004',session_id:session.session_id}));

  function finish(reason){
    if(completed)return;
    completed=true;
    const turns=Number(String($('turnCount')?.textContent||'0').match(/\d+/)?.[0]||0);
    AIQ.completeSession(session,{reason,turns});
  }

  window.addEventListener('pagehide',()=>finish('pagehide'),{once:true});
})();