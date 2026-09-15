(() => {
  'use strict';
  const cfg=window.P004_CONFIG||{};
  const base=String(cfg.apiBase||'').replace(/\/$/,'');
  async function post(path,payload,timeoutMs){
    if(!base)return null;
    const controller=new AbortController();
    const timer=setTimeout(()=>controller.abort(),timeoutMs||45000);
    try{
      const r=await fetch(base+path,{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal:controller.signal});
      if(!r.ok)throw new Error('P004 API '+r.status);
      return await r.json();
    }finally{clearTimeout(timer)}
  }
  window.P004_API={
    enabled:Boolean(base),
    chat:p=>post(cfg.chatPath||'/api/p004/chat',p,45000),
    distill:p=>post(cfg.distillPath||'/api/p004/distill',p,180000),
    observe:p=>post(cfg.observePath||'/api/p004/observe',p,45000),
    remember:p=>post(cfg.memoryPath||'/api/p004/memory',p,45000),
    adminSnapshot:p=>post(cfg.adminPath||'/api/p004/admin/snapshot',p,45000)
  };
})();