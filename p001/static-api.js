(() => {
  'use strict';
  const nativeFetch = window.fetch.bind(window);
  const K = {
    participants: 'bjtu.p001.pages.participants.v1',
    events: 'bjtu.p001.pages.events.v1',
    results: 'bjtu.p001.pages.results.v1',
    settings: 'bjtu.p001.pages.settings.v1'
  };
  const defaults = {
    assignment_mode: 'playful',
    orb_theme: 'sunlight',
    future_horizon_key: 'future',
    future_horizon_label: '未来',
    future_horizon_months: null,
    stj_budget: 24
  };
  const read = (key, fallback) => {
    try { const v = JSON.parse(localStorage.getItem(key)); return v ?? fallback; }
    catch { return fallback; }
  };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const uuid = () => crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const code = () => `BJTU-${Math.random().toString(36).slice(2,6).toUpperCase()}-${String(Math.floor(1000 + Math.random()*9000))}`;
  const json = (obj, status=200) => Promise.resolve(new Response(JSON.stringify(obj), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}}));
  const body = async (opts) => {
    if (!opts?.body) return {};
    try { return JSON.parse(opts.body); } catch { return {}; }
  };
  const settings = () => ({...defaults, ...read(K.settings,{})});
  const participants = () => read(K.participants,[]);
  const saveParticipants = (rows) => write(K.participants,rows);
  const startSession = (p) => ({participant_id:p.participant_id, public_code:p.public_code, session_id:uuid(), ui_mode:'playful', settings:settings()});
  const norm = s => String(s||'').trim().toLowerCase();
  const match = (rows,b) => {
    let list=rows.filter(x=>String(x.alias4||'').toUpperCase()===String(b.alias4||'').toUpperCase());
    if (b.phone) list=list.filter(x=>String(x.phone||'').replace(/\D/g,'')===String(b.phone||'').replace(/\D/g,''));
    if (b.email) list=list.filter(x=>norm(x.email)===norm(b.email));
    return list;
  };
  window.P001_PAGES_MODE = true;
  window.fetch = async (input, opts={}) => {
    const u = new URL(typeof input === 'string' ? input : input.url, location.href);
    if (!u.pathname.startsWith('/api/')) return nativeFetch(input, opts);
    const b = await body(opts);
    if (u.pathname === '/api/settings') return json(settings());
    if (u.pathname === '/api/health') return json({ok:true, version:'p001-pages-beta5.2'});
    if (u.pathname === '/api/student/register') {
      const rows=participants();
      const p={participant_id:uuid(),public_code:code(),alias4:String(b.alias4||'').toUpperCase(),phone:b.phone||'',email:b.email||'',created_at:Date.now()};
      rows.unshift(p); saveParticipants(rows); return json(startSession(p),201);
    }
    if (u.pathname === '/api/student/resume') {
      const p=participants().find(x=>x.public_code===String(b.public_code||'').toUpperCase() && x.alias4===String(b.alias4||'').toUpperCase());
      return p ? json(startSession(p)) : json({error:'not_found'},404);
    }
    if (u.pathname === '/api/student/recover') {
      const hits=match(participants(),b);
      if (hits.length>1) return json({error:'ambiguous'},409);
      return hits.length===1 ? json(startSession(hits[0])) : json({error:'not_found'},404);
    }
    if (u.pathname === '/api/student/event') {
      const rows=read(K.events,[]); rows.push({...b, saved_at:Date.now()});
      if (rows.length>5000) rows.splice(0,rows.length-5000); write(K.events,rows); return json({ok:true});
    }
    if (u.pathname === '/api/student/finalize') {
      const rows=read(K.results,[]); rows.unshift({...b, completed_at:Date.now()}); write(K.results,rows.slice(0,100)); return json({ok:true,saved_at:Date.now()});
    }
    return json({error:'static_pages_endpoint_unavailable'},404);
  };
})();