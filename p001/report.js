(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const uniq=a=>[...new Set((a||[]).filter(Boolean))];
const top=(a,n)=>uniq(a).slice(0,n);
function compCount(stats){return Math.round(Object.values(stats||{}).reduce((s,x)=>s+Number(x.comparisons||x.matches||0),0)/2)}
function weightedShared(cur,ideal,shared){
 const ci=new Map(cur.map((x,i)=>[x,i])),ii=new Map(ideal.map((x,i)=>[x,i]));
 return uniq(shared).sort((a,b)=>((ci.get(a)??99)+(ii.get(a)??99))-((ci.get(b)??99)+(ii.get(b)??99)));
}
function plusSummary(arr,n){const a=uniq(arr),shown=a.slice(0,n);return {shown,more:Math.max(0,a.length-shown.length)}}
function chips(arr,cls='poster-chip'){return uniq(arr).map(x=>'<span class="'+cls+'">'+esc(x)+'</span>').join('')}
function valuePills(items){return (items||[]).slice(0,3).map(x=>'<span class="value-pill" style="--v:'+esc(x.color||'#d8b15c')+'"><i></i>'+esc(x.label)+'</span>').join('')}
function quote(text,fallback){return esc((text||'').trim()||fallback)}
function digest(result){
 const cur=uniq(result.current_rank_labels||result.current_selected_labels),ideal=uniq(result.ideal_rank_labels||result.ideal_selected_labels);
 const shared=weightedShared(cur,ideal,result.shared_trait_labels||[]).slice(0,3);
 const growth=uniq(result.ideal_only_labels||[]).sort((a,b)=>ideal.indexOf(a)-ideal.indexOf(b)).slice(0,3);
 const values=(result.value_rank_items||[]).length?result.value_rank_items.slice(0,3):(result.value_rank_labels||[]).slice(0,3).map(x=>({label:x,color:'#d8b15c'}));
 const scenes=plusSummary(result.future_context_labels||[],4),obstacles=plusSummary(result.obstacle_labels||[],2);
 return {curTop:cur.slice(0,3),idealTop:ideal.slice(0,3),shared,growth,values,scenes,obstacles,
   currentComparisons:compCount(result.current_stj_stats),idealComparisons:compCount(result.ideal_stj_stats),valueComparisons:compCount(result.value_stj_stats)};
}
function tagList(arr){return arr.length?chips(arr):'<span class="poster-empty">暂时没有特别突出的项目</span>'}
const DOMAIN_META={
 N:{label:'情绪反应',desc:'压力、评价与情绪波动的感受更容易进入你的注意',tip:'给紧张、低落或压力反应留出恢复空间；先做情绪命名、短暂离开刺激源或向可信任的人求助，再处理任务。'},
 E:{label:'活力连接',desc:'人与人之间的互动、表达和行动能量更突出',tip:'把理想特质变成一个可见的社交或表达动作，例如主动发起一次交流、在课堂或团队中多表达一次。'},
 O:{label:'探索想象',desc:'新体验、想象、审美与理解复杂问题更突出',tip:'每周安排一次低成本探索：读一个陌生主题、做一个小作品，或尝试一种新的学习/生活方式。'},
 A:{label:'关系关怀',desc:'合作、体谅、信任和关系质量更突出',tip:'把“理想的关系状态”变成具体行为，同时保留边界：多一次真诚回应，也允许一次明确说“不”。'},
 C:{label:'行动秩序',desc:'责任、规划、坚持与把事情做成更突出',tip:'把理想特质缩小成可重复动作：一个固定触发点 + 一个10分钟动作，比一次性的宏大计划更容易持续。'}
};
function topDomains(counts,allowed=['N','E','O','A','C'],limit=2){
 const rows=allowed.map(k=>[k,Number(counts?.[k]||0)]).filter(x=>x[1]>0).sort((a,b)=>b[1]-a[1]);
 return rows.slice(0,limit).map(x=>x[0]);
}
function domainShares(counts,allowed){
 const total=allowed.reduce((s,k)=>s+Number(counts?.[k]||0),0)||1;
 return Object.fromEntries(allowed.map(k=>[k,Number(counts?.[k]||0)/total]));
}
function interpretation(result,d){
 const current=topDomains(result.domain_counts_current,['N','E','O','A','C'],2);
 const curText=current.length
  ?'在你主动留下的“现在的我”特质里，'+current.map(k=>DOMAIN_META[k].label).join('、')+'来源更常出现。这里反映的是你这次自我选择的重心，而不是标准人格量表分数。'
  :'你这次没有形成特别集中的五维来源结构。';
 const allowed=['E','O','A','C'],cs=domainShares(result.domain_counts_current,allowed),is=domainShares(result.domain_counts_ideal,allowed);
 const shifts=allowed.map(k=>[k,is[k]-cs[k]]).sort((a,b)=>b[1]-a[1]).filter(x=>x[1]>.06).slice(0,2).map(x=>x[0]);
 const shiftText=shifts.length
  ?'从现在到理想，你更想加强'+shifts.map(k=>DOMAIN_META[k].label).join('、')+'相关的方向。结合你选出的“最想成长”特质，这更像是你希望主动增加的行为方式，而不是否定现在的自己。'
  :'现在与理想的五维来源分布整体接近，你的变化更可能集中在少数具体 facet，而不是整个人格方向的大幅改变。';
 const dist=Number(result.future_distance_0_100),ov=Number(result.future_overlap_percent);
 let futureText='你对未来自我的连接感目前处在中间位置：既能看见延续，也保留了变化空间。';
 if(Number.isFinite(dist)&&Number.isFinite(ov)){
   if(dist<=35&&ov>=55)futureText='你把未来的自己感受到得比较近，而且与现在有较多重叠。适合把“理想的我”直接转成近期可重复的行动，让连续感变成现实积累。';
   else if(dist>=65||ov<=25)futureText='未来的自己目前更像一个与现在有距离的版本。与其一次跨很远，更适合先搭一座短桥：把最想成长的一个特质转成未来一到两周能观察到的行为。';
 }
 const growthDomains=topDomains((result.ideal_only||[]).reduce((acc,id)=>{const k=String(id||'')[0];if(DOMAIN_META[k])acc[k]=(acc[k]||0)+1;return acc},{}),allowed,2);
 const tips=[];
 for(const k of growthDomains)tips.push(DOMAIN_META[k].tip);
 const topValue=(result.value_rank_labels||[])[0];
 if(topValue)tips.push('把“'+topValue+'”作为筛选标准：当两个行动方案都可行时，优先选择更能体现这个价值的那个。');
 if(Number(result.domain_counts_current?.N||0)>=2)tips.push(DOMAIN_META.N.tip);
 return {summary:[curText,shiftText,futureText],tips:[...new Set(tips)].slice(0,3)};
}
function html(result,code,style='diary'){
 const hz=result.future_horizon_label||'未来',d=digest(result),distance=result.future_distance_0_100??'—',overlap=result.future_overlap_percent??'—';
 return '<div class="report-composite"><article class="share-poster curated '+style+'">'+
 '<div class="poster-blob b1"></div><div class="poster-blob b2"></div>'+
 '<header><span class="poster-kicker">A NOTE ACROSS TIME</span><span class="poster-code">'+esc(code)+'</span></header>'+
 '<h2>我现在是谁，<br>又想成为谁？</h2>'+
 '<div class="poster-self-grid compact"><section class="poster-self now"><small>现在的我 · Top 3</small><strong>'+esc(d.curTop[0]||'仍在认识自己')+'</strong><div>'+chips(d.curTop.slice(1))+'</div><em>'+d.currentComparisons+' 次取舍</em></section><div class="poster-arrow">→</div><section class="poster-self ideal"><small>理想的我 · Top 3</small><strong>'+esc(d.idealTop[0]||'仍在想象')+'</strong><div>'+chips(d.idealTop.slice(1))+'</div><em>'+d.idealComparisons+' 次取舍</em></section></div>'+
 '<div class="poster-detail-grid"><section class="poster-list-section keep"><small>想保留的</small><div class="poster-chip-wrap">'+tagList(d.shared)+'</div></section><section class="poster-list-section grow"><small>最想长成的方向</small><div class="poster-chip-wrap">'+tagList(d.growth)+'</div></section></div>'+
 '<section class="poster-list-section values"><small>我最看重 · Top 3</small><div class="poster-chip-wrap">'+valuePills(d.values)+'</div></section>'+
 '<section class="poster-list-section future-block"><small>我和'+esc(hz)+'的连接</small><div class="future-metrics"><div><b>'+esc(distance)+'</b><span>距离 / 100</span></div><div class="poster-orbits"><i class="mini-now"></i><i class="mini-future" style="margin-left:'+(Math.min(100,Number(overlap)||0)*-.20)+'px"></i></div><div><b>'+esc(overlap)+'%</b><span>圆形重叠</span></div></div></section>'+ '<section class="poster-insight"><small>基于这次选择的一段解读</small>'+interpretation(result,d).summary.map(x=>'<p>'+esc(x)+'</p>').join('')+'</section>'+
 '<div class="poster-detail-grid"><section class="poster-list-section"><small>'+esc(hz)+'的一天</small><div class="poster-chip-wrap">'+tagList(d.scenes.shown)+(d.scenes.more?'<span class="poster-more">+'+d.scenes.more+'</span>':'')+'</div></section><section class="poster-list-section"><small>最容易卡住</small><div class="poster-chip-wrap">'+tagList(d.obstacles.shown)+(d.obstacles.more?'<span class="poster-more">+'+d.obstacles.more+'</span>':'')+'</div><p class="poster-action">先做：<b>'+esc(result.action_label||'—')+'</b></p></section></div>'+
 '<section class="poster-advice"><small>可以试试</small><ol>'+interpretation(result,d).tips.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ol></section>'+ '<section class="poster-message"><small>我想送给'+esc(hz)+'的自己</small><p>“'+quote(result.future_message,'继续往前，也别忘了照顾自己。')+'”</p></section>'+
 '<section class="poster-message reply"><small>我希望'+esc(hz)+'的自己对现在的我说</small><p>“'+quote(result.future_reply,'你已经走得比想象中远了。')+'”</p></section>'+
 '<footer>写给'+esc(hz)+'的我 · '+esc(code)+' · 排序只展示核心 Top，不代表量表分数</footer></article></div>';
}
function rr(ctx,x,y,w,h,r){const q=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);ctx.closePath()}
function wrap(ctx,text,maxWidth){const chars=Array.from(String(text||'')),lines=[];let line='';for(const ch of chars){const t=line+ch;if(ctx.measureText(t).width>maxWidth&&line){lines.push(line);line=ch}else line=t}if(line)lines.push(line);return lines.length?lines:['—']}
function canvas(result,code,style='diary'){
 const hz=result.future_horizon_label||'未来',d=digest(result),distance=result.future_distance_0_100??'—',overlap=result.future_overlap_percent??'—',interp=interpretation(result,d);
 const palette=style==='magazine'?{bg1:'#28231f',bg2:'#21443a',ink:'#fffaf3',muted:'#d8cbc0',card:'rgba(255,255,255,.09)',line:'rgba(255,255,255,.14)',accent:'#ffb090',mint:'#83dcb9'}:style==='letter'?{bg1:'#f6fbf3',bg2:'#fff1df',ink:'#344236',muted:'#71806e',card:'rgba(255,255,255,.78)',line:'rgba(80,100,70,.12)',accent:'#ef9b82',mint:'#77cda9'}:{bg1:'#fff4e5',bg2:'#edf5e9',ink:'#493c33',muted:'#7e7066',card:'rgba(255,255,255,.72)',line:'rgba(100,76,58,.11)',accent:'#ff9177',mint:'#7fd7b5'};
 const W=1080,H=2320,pad=70,c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
 const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,palette.bg1);g.addColorStop(1,palette.bg2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.globalAlpha=.18;ctx.fillStyle=palette.accent;ctx.beginPath();ctx.arc(940,120,220,0,Math.PI*2);ctx.fill();ctx.fillStyle=palette.mint;ctx.beginPath();ctx.arc(110,H-120,230,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 ctx.fillStyle=palette.muted;ctx.font='700 21px sans-serif';ctx.fillText('A NOTE ACROSS TIME',pad,74);ctx.textAlign='right';ctx.fillText(String(code||''),W-pad,74);ctx.textAlign='left';
 ctx.fillStyle=palette.ink;ctx.font='700 62px "Songti SC","STSong",serif';ctx.fillText('我现在是谁，又想成为谁？',pad,154);
 function box(x,y,w,h){rr(ctx,x,y,w,h,28);ctx.fillStyle=palette.card;ctx.fill();ctx.strokeStyle=palette.line;ctx.stroke()}
 function title(t,x,y){ctx.fillStyle=palette.muted;ctx.font='700 20px sans-serif';ctx.fillText(t,x,y)}
 function lines(text,x,y,w,size=30,lh=42,max=4){ctx.fillStyle=palette.ink;ctx.font=size+'px "PingFang SC","Microsoft YaHei",sans-serif';wrap(ctx,text,w).slice(0,max).forEach((l,i)=>ctx.fillText(l,x,y+i*lh))}
 let y=205;
 // current / ideal
 box(pad,y,450,245);box(560,y,450,245);title('现在的我 · TOP 3',pad+26,y+38);title('理想的我 · TOP 3',586,y+38);
 ctx.fillStyle=palette.ink;ctx.font='700 40px "Songti SC","STSong",serif';ctx.fillText(d.curTop[0]||'仍在认识自己',pad+26,y+92);ctx.fillText(d.idealTop[0]||'仍在想象',586,y+92);
 lines(d.curTop.slice(1).join(' · ')||'—',pad+26,y+140,398,25,36,3);lines(d.idealTop.slice(1).join(' · ')||'—',586,y+140,398,25,36,3);
 ctx.fillStyle=palette.muted;ctx.font='18px sans-serif';ctx.fillText(d.currentComparisons+' 次取舍',pad+26,y+215);ctx.fillText(d.idealComparisons+' 次取舍',586,y+215);y+=275;
 // keep / grow
 box(pad,y,450,165);box(560,y,450,165);title('想保留的',pad+26,y+36);title('最想长成的方向',586,y+36);lines(d.shared.join(' · ')||'暂时没有特别突出的项目',pad+26,y+82,398,27,38,2);lines(d.growth.join(' · ')||'暂时没有特别突出的项目',586,y+82,398,27,38,2);y+=195;
 // values
 box(pad,y,940,145);title('我最看重 · TOP 3',pad+26,y+36);lines(d.values.map(v=>v.label).join(' · ')||'—',pad+26,y+86,888,30,42,2);y+=175;
 // future metrics
 box(pad,y,940,190);title('我和'+hz+'的连接',pad+26,y+36);ctx.fillStyle=palette.ink;ctx.font='700 52px sans-serif';ctx.fillText(String(distance),pad+30,y+114);ctx.font='20px sans-serif';ctx.fillStyle=palette.muted;ctx.fillText('距离 / 100',pad+116,y+112);
 const ov=Number(overlap)||0;ctx.globalAlpha=.68;ctx.fillStyle=palette.accent;ctx.beginPath();ctx.arc(W/2+20,y+108,60,0,Math.PI*2);ctx.fill();ctx.fillStyle=palette.mint;ctx.beginPath();ctx.arc(W/2+20-ov*.5,y+108,60,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 ctx.textAlign='right';ctx.fillStyle=palette.ink;ctx.font='700 52px sans-serif';ctx.fillText(String(overlap)+'%',W-pad-30,y+114);ctx.textAlign='left';y+=220;
 // scenes and obstacles
 box(pad,y,450,205);box(560,y,450,205);title(hz+'的一天',pad+26,y+36);title('最容易卡住',586,y+36);
 lines(d.scenes.shown.join(' · ')+(d.scenes.more?'  +'+d.scenes.more:''),pad+26,y+82,398,25,36,3);
 lines(d.obstacles.shown.join(' · ')+(d.obstacles.more?'  +'+d.obstacles.more:''),586,y+82,398,25,36,2);ctx.fillStyle=palette.muted;ctx.font='19px sans-serif';ctx.fillText('先做：'+(result.action_label||'—'),586,y+172);y+=235;
 // interpretation
 box(pad,y,940,300);title('基于这次选择的一段解读',pad+26,y+36);
 let iy=y+82;for(const p of interp.summary){ctx.font='25px "PingFang SC","Microsoft YaHei",sans-serif';const ls=wrap(ctx,p,888).slice(0,3);ctx.fillStyle=palette.ink;ls.forEach((l,i)=>ctx.fillText(l,pad+26,iy+i*36));iy+=ls.length*36+18}y+=330;
 box(pad,y,940,250);title('可以试试',pad+26,y+36);let ty=y+82;interp.tips.forEach((t,idx)=>{ctx.font='24px "PingFang SC","Microsoft YaHei",sans-serif';const ls=wrap(ctx,(idx+1)+'. '+t,888).slice(0,2);ctx.fillStyle=palette.ink;ls.forEach((l,i)=>ctx.fillText(l,pad+26,ty+i*35));ty+=ls.length*35+14});y+=280;
 // messages
 box(pad,y,940,180);title('我想送给'+hz+'的自己',pad+26,y+36);lines('“'+((result.future_message||'继续往前，也别忘了照顾自己。').trim())+'”',pad+26,y+84,888,29,42,3);y+=210;
 box(pad,y,940,180);title('我希望'+hz+'的自己对现在的我说',pad+26,y+36);lines('“'+((result.future_reply||'你已经走得比想象中远了。').trim())+'”',pad+26,y+84,888,29,42,3);
 ctx.fillStyle=palette.muted;ctx.font='18px sans-serif';ctx.fillText('P001 · 只展示经过取舍的核心结论，不代表标准人格量表分数',pad,H-48);
 return c;
}
window.P001Report={html,canvas};
})();