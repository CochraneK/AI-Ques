globalThis.P002_CONDITION = (() => {
  const KEY = 'bjtu.p002.condition.v1';
  const options = {
    story: {
      label: '故事问卷',
      description: '默认。保留核心题目与反应格式，以中性故事段落串联。'
    },
    direct: {
      label: '直接问卷',
      description: '不显示故事段落，直接进入题目。'
    },
    scenario: {
      label: '情景选择',
      description: '使用情境判断与选择，输出实验性行为信号。'
    }
  };

  function read(){
    try{
      const raw = localStorage.getItem(KEY);
      if(!raw) return {condition:'story', updated_at:null};
      const parsed = JSON.parse(raw);
      return options[parsed?.condition]
        ? {condition:parsed.condition, updated_at:parsed.updated_at || null}
        : {condition:'story', updated_at:null};
    }catch(_){
      return {condition:'story', updated_at:null};
    }
  }

  function write(condition){
    if(!options[condition]) throw new Error('Unsupported P002 condition');
    const value = {condition, updated_at:new Date().toISOString()};
    localStorage.setItem(KEY, JSON.stringify(value));
    return value;
  }

  function reset(){
    localStorage.removeItem(KEY);
    return {condition:'story', updated_at:null};
  }

  return {key:KEY, options, read, write, reset};
})();
