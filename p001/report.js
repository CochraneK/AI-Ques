(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const chips=(arr,cls='poster-chip')=>(arr||[]).map(x=>'<span class="'+cls+'">'+esc(x)+'</span>').join('');
const numbered=arr=>(arr||[]).map((x,i)=>'<span class="poster-rank-chip"><b>'+(i+1)+'</b>'+esc(x)+'</span>').join('');
const valuePills=items=>(items||[]).map(x=>'<span class="value-pill" style="--v:'+esc(x.color||'#d8b15c')+'"><i></i>'+esc(x.label)+'</span>').join('');
const countLine=c=>['N','E','O','A','C'].map(k=>k+' '+(c?.[k]??0)).join(' · ');
function quote(text,fallback){return esc((text||'').trim()||fallback)}
function allRanked(rank,selected){
 const seen=new Set(), out=[];
 for(const x of (rank||[])){if(x&&!seen.has(x)){seen.add(x);out.push(x)}}
 for(const x of (selected||[])){if(x&&!seen.has(x)){seen.add(x);out.push(x)}}
 return out;
}
function html(result,code,style='diary'){
 const hz=result.future_horizon_label||'未来';
 const cur=allRanked(result.current_rank_labels,result.current_selected_labels);
 const ideal=allRanked(result.ideal_rank_labels,result.ideal_selected_labels);
 const vals=(result.value_rank_items||[]).length?result.value_rank_items:(result.value_rank_labels||[]).map(x=>({label:x,color:'#d8b15c'}));
 const scenes=result.future_context_labels||[], obstacles=result.obstacle_labels||[];
 const shared=result.shared_trait_labels||[], idealOnly=result.ideal_only_labels||[];
 const distance=result.future_distance_0_100??'—', overlap=result.future_overlap_percent??'—';
 return '<div class="report-composite">'+
 '<article class="share-poster full-info '+style+'">'+
 '<div class="poster-blob b1"></div><div class="poster-blob b2"></div>'+
 '<header><span class="poster-kicker">A NOTE ACROSS TIME</span><span class="poster-code">'+esc(code)+'</span></header>'+
 '<h2>现在的我，<br>正在走向怎样的自己？</h2>'+
 '<section class="poster-list-section"><small>01 · 现在的我 · 全部入选</small><div class="poster-rank-wrap">'+numbered(cur)+'</div><p class="poster-meta">五维来源：'+esc(countLine(result.domain_counts_current))+'</p></section>'+
 '<section class="poster-list-section ideal-block"><small>02 · 理想的我 · 全部入选</small><div class="poster-rank-wrap">'+numbered(ideal)+'</div><p class="poster-meta">理想自我候选默认不含 N 维负向特质 · '+esc(countLine(result.domain_counts_ideal))+'</p></section>'+
 '<div class="poster-detail-grid">'+
 '<section class="poster-list-section"><small>03 · 两边都保留</small><div class="poster-chip-wrap">'+(chips(shared)||'<span class="poster-empty">暂无</span>')+'</div></section>'+
 '<section class="poster-list-section"><small>04 · 理想方向中新出现</small><div class="poster-chip-wrap">'+(chips(idealOnly)||'<span class="poster-empty">暂无</span>')+'</div></section>'+
 '</div>'+
 '<section class="poster-list-section"><small>05 · 我最看重</small><div class="poster-chip-wrap">'+valuePills(vals)+'</div></section>'+
 '<section class="poster-list-section future-block"><small>06 · 我和'+esc(hz)+'的连接</small><div class="future-metrics"><div><b>'+esc(distance)+'</b><span>距离 / 100</span></div><div class="poster-orbits"><i class="mini-now"></i><i class="mini-future" style="margin-left:'+(Math.min(100,Number(overlap)||0)*-.20)+'px"></i></div><div><b>'+esc(overlap)+'%</b><span>圆形重叠</span></div></div></section>'+
 '<section class="poster-list-section"><small>07 · '+esc(hz)+'的一天</small><div class="poster-chip-wrap">'+(chips(scenes)||'<span class="poster-empty">暂无</span>')+'</div></section>'+
 '<section class="poster-list-section"><small>08 · 可能卡住我的地方</small><div class="poster-chip-wrap">'+(chips(obstacles)||'<span class="poster-empty">暂无</span>')+'</div><p class="poster-action">卡住时，我先：<b>'+esc(result.action_label||'—')+'</b></p></section>'+
 '<section class="poster-message"><small>09 · 我想送给'+esc(hz)+'的自己</small><p>“'+quote(result.future_message,'继续往前，也别忘了照顾自己。')+'”</p></section>'+
 '<section class="poster-message reply"><small>10 · 我希望'+esc(hz)+'的自己对现在的我说</small><p>“'+quote(result.future_reply,'你已经走得比想象中远了。')+'”</p></section>'+
 '<footer>写给'+esc(hz)+'的我 · '+esc(code)+'</footer>'+
 '</article></div>';
}
function rr(ctx,x,y,w,h,r){const q=Math.min(r,w/2,h/2);ctx.beginPath();ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);ctx.closePath()}
function wrap(ctx,text,maxWidth){
 const chars=Array.from(String(text||''));const lines=[];let line='';
 for(const ch of chars){const test=line+ch;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=ch}else line=test}
 if(line)lines.push(line);return lines.length?lines:['—'];
}
function canvas(result,code,style='diary'){
 const hz=result.future_horizon_label||'未来';
 const cur=allRanked(result.current_rank_labels,result.current_selected_labels);
 const ideal=allRanked(result.ideal_rank_labels,result.ideal_selected_labels);
 const vals=(result.value_rank_labels||[]);
 const shared=result.shared_trait_labels||[], idealOnly=result.ideal_only_labels||[], scenes=result.future_context_labels||[], obstacles=result.obstacle_labels||[];
 const futureMsg=(result.future_message||'继续往前，也别忘了照顾自己。').trim();
 const futureReply=(result.future_reply||'你已经走得比想象中远了。').trim();
 const sections=[
   ['01  现在的我 · 全部入选',cur.map((x,i)=>(i+1)+'. '+x).join('  ')||'暂无'],
   ['02  理想的我 · 全部入选',ideal.map((x,i)=>(i+1)+'. '+x).join('  ')||'暂无'],
   ['03  两边都保留',shared.join(' · ')||'暂无'],
   ['04  理想方向中新出现',idealOnly.join(' · ')||'暂无'],
   ['05  我最看重',vals.join(' · ')||'暂无'],
   ['06  '+hz+'的一天',scenes.join(' · ')||'暂无'],
   ['07  可能卡住我的地方',obstacles.join(' · ')||'暂无'],
   ['08  卡住时我先做',result.action_label||'—'],
   ['09  我想送给'+hz+'的自己','“'+futureMsg+'”'],
   ['10  我希望'+hz+'的自己对现在的我说','“'+futureReply+'”']
 ];
 const palette=style==='magazine'
   ?{bg1:'#28231f',bg2:'#21443a',ink:'#fffaf3',muted:'#d8cbc0',card:'rgba(255,255,255,.08)',line:'rgba(255,255,255,.14)',accent:'#ffb090',mint:'#83dcb9'}
   :style==='letter'
   ?{bg1:'#f6fbf3',bg2:'#fff1df',ink:'#344236',muted:'#71806e',card:'rgba(255,255,255,.76)',line:'rgba(80,100,70,.12)',accent:'#ef9b82',mint:'#77cda9'}
   :{bg1:'#fff4e5',bg2:'#edf5e9',ink:'#493c33',muted:'#7e7066',card:'rgba(255,255,255,.68)',line:'rgba(100,76,58,.11)',accent:'#ff9177',mint:'#7fd7b5'};
 const W=1080,pad=72,boxW=W-pad*2;
 const probe=document.createElement('canvas').getContext('2d');probe.font='30px "PingFang SC","Microsoft YaHei",sans-serif';
 let estimated=560;
 for(const [,body] of sections){estimated+=130+wrap(probe,body,boxW-72).length*44}
 estimated+=300;
 const H=Math.max(2200,estimated);
 const c=document.createElement('canvas');c.width=W;c.height=H;const ctx=c.getContext('2d');
 const g=ctx.createLinearGradient(0,0,W,H);g.addColorStop(0,palette.bg1);g.addColorStop(1,palette.bg2);ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
 ctx.globalAlpha=.18;ctx.fillStyle=palette.accent;ctx.beginPath();ctx.arc(930,120,210,0,Math.PI*2);ctx.fill();ctx.fillStyle=palette.mint;ctx.beginPath();ctx.arc(120,H-170,240,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 let y=86;ctx.fillStyle=palette.muted;ctx.font='700 22px sans-serif';ctx.fillText('A NOTE ACROSS TIME',pad,y);ctx.textAlign='right';ctx.fillText(String(code||''),W-pad,y);ctx.textAlign='left';
 y+=82;ctx.fillStyle=palette.ink;ctx.font='700 62px "Songti SC","STSong",serif';ctx.fillText('现在的我，正在走向怎样的自己？',pad,y);
 y+=52;ctx.fillStyle=palette.muted;ctx.font='26px sans-serif';ctx.fillText('写给'+hz+'的我 · 一张完整的自我记录',pad,y);
 y+=64;
 // Future metrics card
 rr(ctx,pad,y,boxW,180,34);ctx.fillStyle=palette.card;ctx.fill();ctx.strokeStyle=palette.line;ctx.stroke();
 ctx.fillStyle=palette.muted;ctx.font='700 22px sans-serif';ctx.fillText('我和'+hz+'的连接',pad+34,y+42);
 ctx.fillStyle=palette.ink;ctx.font='700 52px sans-serif';ctx.fillText(String(result.future_distance_0_100??'—'),pad+34,y+112);ctx.font='22px sans-serif';ctx.fillStyle=palette.muted;ctx.fillText('距离 / 100',pad+122,y+110);
 const overlap=Number(result.future_overlap_percent)||0;ctx.globalAlpha=.72;ctx.fillStyle=palette.accent;ctx.beginPath();ctx.arc(W/2+70,y+100,62,0,Math.PI*2);ctx.fill();ctx.fillStyle=palette.mint;ctx.beginPath();ctx.arc(W/2+70-(overlap*.55),y+100,62,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
 ctx.textAlign='right';ctx.fillStyle=palette.ink;ctx.font='700 52px sans-serif';ctx.fillText(String(result.future_overlap_percent??'—')+'%',W-pad-34,y+112);ctx.textAlign='left';
 y+=210;
 for(const [title,body] of sections){
   ctx.font='30px "PingFang SC","Microsoft YaHei",sans-serif';
   const lines=wrap(ctx,body,boxW-72);const h=92+lines.length*46;
   rr(ctx,pad,y,boxW,h,28);ctx.fillStyle=palette.card;ctx.fill();ctx.strokeStyle=palette.line;ctx.stroke();
   ctx.fillStyle=palette.muted;ctx.font='700 21px sans-serif';ctx.fillText(title,pad+34,y+36);
   ctx.fillStyle=palette.ink;ctx.font='30px "PingFang SC","Microsoft YaHei",sans-serif';
   lines.forEach((line,i)=>ctx.fillText(line,pad+34,y+82+i*46));
   y+=h+22;
 }
 ctx.fillStyle=palette.muted;ctx.font='22px sans-serif';ctx.fillText('P001 · 现在的我 / 理想的我 / 未来的我',pad,H-54);
 return c;
}
window.P001Report={html,canvas};
})();