(() => {
  'use strict';

  const KEYS = Object.freeze({
    chars: 'bjtu.p004.characters.v2',
    threads: 'bjtu.p004.threads.v2',
    memory: 'bjtu.p004.memory.v2',
    observer: 'bjtu.p004.observer.v2',
    active: 'bjtu.p004.active.v2',
    consent: 'bjtu.p004.consent.v1',
    p005: 'bjtu.p005.state.v1',
    skillDb: 'bjtu-p004-skill-vault'
  });

  const SAFETY_TERMS = Object.freeze([
    '想死','不想活','结束生命','自杀','伤害自己','割腕','跳楼','活不下去','杀了自己'
  ]);

  function urgentSafety(value){
    const text=String(value||'').toLowerCase();
    return SAFETY_TERMS.some(term=>text.includes(term));
  }

  function normalizeMemoryCandidate(value,max=190){
    const text=String(value||'').replace(/\s+/g,' ').trim();
    return text.length>max ? text.slice(0,Math.max(0,max-1))+'…' : text;
  }

  function defaultConsent(){
    return {p005Observer:false,updatedAt:null};
  }

  function canImportP005(consent){
    return Boolean(consent&&consent.p005Observer===true);
  }

  function removeEvidenceSource(observer,source){
    const current=observer&&typeof observer==='object'?observer:{};
    const evidence=Array.isArray(current.evidence)?current.evidence.filter(item=>item&&item.source!==source):[];
    const imports={...(current.imports&&typeof current.imports==='object'?current.imports:{})};
    delete imports[source];
    return {...current,evidence,imports,updatedAt:new Date().toISOString()};
  }

  function validateCreatorStep(step,draft){
    const value=draft||{};
    if(step===0&&!value.relationship)return '先选一种你们之间的关系';
    if(step===1&&(!Array.isArray(value.traits)||!value.traits.length))return '至少给 TA 一个核心品质';
    if(step===2&&!value.feel)return '选一种你希望 TA 带给你的感觉';
    return '';
  }

  function p004LocalStorageKeys(){
    return [KEYS.chars,KEYS.threads,KEYS.memory,KEYS.observer,KEYS.active,KEYS.consent];
  }

  globalThis.P004_CORE=Object.freeze({
    KEYS,
    SAFETY_TERMS,
    urgentSafety,
    normalizeMemoryCandidate,
    defaultConsent,
    canImportP005,
    removeEvidenceSource,
    validateCreatorStep,
    p004LocalStorageKeys
  });
})();