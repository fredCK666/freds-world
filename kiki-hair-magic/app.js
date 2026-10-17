import{hairAlphaFromScores,recolorPixels}from'./hair-color.js';
import{WORKS,SERVICES,NOVEMBER_MENU,LENGTHS,COLORS,estimate,LINE_URL}from'./data.js?v=20261018-polish1';
const $=s=>document.querySelector(s);const $$=s=>Array.from(document.querySelectorAll(s));
let favorites=new Set();try{favorites=new Set(JSON.parse(localStorage.getItem('kiki-favorites')||'[]').filter(id=>WORKS.some(w=>w.id===id)))}catch{}
let filter='全部作品',expanded=false,chosenColor=null,currentColor=COLORS[0],toastTimer;
const money=n=>'$'+n.toLocaleString('zh-TW');
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('visible'),3000)}
function crop(work){const el=document.createElement('div');el.className='crop actual-photo';const img=document.createElement('img');img.src=work.cover;img.alt=work.name;img.loading='lazy';img.decoding='async';el.append(img);return el}
function albumViewer(w){
 const shell=document.createElement('div');shell.className='album-viewer';
 const track=document.createElement('div');track.className='album-track';track.tabIndex=0;track.setAttribute('aria-label',w.name+'，左右滑動查看作品');
 const photos=w.reel?[]:(w.photos.length?w.photos:[w.cover]);
 photos.forEach((src,i)=>{const slide=document.createElement('div');slide.className='album-slide';slide.setAttribute('role','group');slide.setAttribute('aria-label',`照片 ${i+1} / ${photos.length}`);const img=document.createElement('img');img.src=src;img.alt=`${w.name}・第 ${i+1} 張`;img.loading=i?'lazy':'eager';slide.append(img);track.append(slide)});
 if(w.hasVideo){const slide=document.createElement('div');slide.className='album-slide video-slide';const poster=document.createElement('img');poster.src=w.cover;poster.alt=w.name+'影片封面';const play=document.createElement('button');play.className='btn dark video-play';play.textContent=w.reel?'▶ 播放 Reels':'▶ 查看這篇作品的影片';play.onclick=()=>{const frame=document.createElement('iframe');frame.src=`https://www.instagram.com/${w.reel?'reel':'p'}/${w.id}/embed/?hl=zh-tw`;frame.title=w.name+' Instagram 影片';frame.allow='autoplay; encrypted-media; fullscreen; picture-in-picture';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';slide.replaceChildren(frame);};slide.append(poster,play);track.append(slide)}
 const total=track.children.length;let index=0;const controls=document.createElement('div');controls.className='album-controls';const prev=document.createElement('button'),next=document.createElement('button'),counter=document.createElement('span');prev.textContent='←';next.textContent='→';prev.setAttribute('aria-label','上一張');next.setAttribute('aria-label','下一張');counter.setAttribute('aria-live','polite');
 const update=()=>{index=Math.round(track.scrollLeft/Math.max(track.clientWidth,1));counter.textContent=`${index+1} / ${total}`;prev.disabled=index===0;next.disabled=index>=total-1;};
 const move=delta=>track.scrollTo({left:Math.max(0,Math.min(total-1,index+delta))*track.clientWidth,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
 prev.onclick=()=>move(-1);next.onclick=()=>move(1);track.addEventListener('scroll',update,{passive:true});track.addEventListener('keydown',e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();move(e.key==='ArrowRight'?1:-1)}});
 controls.hidden=total<2;controls.append(prev,counter,next);shell.append(track,controls);update();
 const help=document.createElement('p');help.className='album-hint';help.textContent=total>1?'左右滑動，或使用箭頭查看完整作品':(w.reel?'影片由 Instagram 提供':'作品照片');shell.append(help);
 if(w.hasVideo){const fallback=document.createElement('a');fallback.className='text-link video-fallback';fallback.href=w.source;fallback.target='_blank';fallback.rel='noopener noreferrer';fallback.textContent='也可以到 Instagram 觀看原影片 ↗';shell.append(fallback)}
 return shell;
}

$$('[data-photo]').forEach(el=>{const photo=crop(WORKS.find(w=>w.id===el.dataset.photo));photo.querySelector('img').loading='eager';photo.querySelector('img').fetchPriority='high';el.prepend(photo)});
const featuredIds=['DNapdFBT9nL','DMnUm4PTAgz','DYZgpAhgaNv','DQeGdq1gcdj','DN2yLNpQmmz','DdT47mtgfk2','DdwAXBDBecW','DebovT-BfLn'];
const displayWorks=[...featuredIds.map(id=>WORKS.find(w=>w.id===id)).filter(Boolean),...WORKS.filter(w=>!featuredIds.includes(w.id))];
function persistFavorites(){try{localStorage.setItem('kiki-favorites',JSON.stringify([...favorites]))}catch{}renderFavorites();$$('[data-favorite]').forEach(b=>{const selected=favorites.has(b.dataset.favorite);b.classList.toggle('selected',selected);b.textContent=selected?'♥':'♡';b.setAttribute('aria-pressed',String(selected));b.setAttribute('aria-label',(selected?'取消收藏':'收藏')+WORKS.find(w=>w.id===b.dataset.favorite).name)})}
function toggleFavorite(id){if(favorites.has(id))favorites.delete(id);else favorites.add(id);persistFavorites();if(filter==='我的收藏')renderGallery()}
function renderFilters(){const labels=['全部作品','日系短髮','單色染','特殊色','區塊染','Reels','髮廊日常','我的收藏'];$('#work-filters').replaceChildren(...labels.map(label=>{const b=document.createElement('button');b.className='filter'+(filter===label?' active':'');b.textContent=label;b.setAttribute('aria-pressed',String(filter===label));b.onclick=()=>{filter=label;expanded=false;renderFilters();renderGallery()};return b}))}
function renderGallery(){const works=displayWorks.filter(w=>filter==='全部作品'||filter==='我的收藏'&&favorites.has(w.id)||w.category===filter||filter==='Reels'&&w.reel);$('#gallery').replaceChildren();const shown=expanded?works:works.slice(0,8);shown.forEach(w=>{const card=document.createElement('article');card.className='work-card';const photo=document.createElement('div');photo.className='work-photo';const open=document.createElement('button');open.className='work-open';open.setAttribute('aria-label','查看'+w.name);open.append(crop(w));const badge=document.createElement('span');badge.className='media-badge';badge.textContent=w.reel?'▶ Reels':w.photos.length+' 張'+(w.hasVideo?' · 影片':'');open.append(badge);open.onclick=()=>openWork(w);const fav=document.createElement('button');fav.className='favorite';fav.dataset.favorite=w.id;fav.onclick=()=>toggleFavorite(w.id);photo.append(open,fav);const info=document.createElement('div');info.className='work-info';const h=document.createElement('h3');h.textContent=w.name;const p=document.createElement('p');p.textContent=w.tags;info.append(h,p);card.append(photo,info);$('#gallery').append(card)});if(!works.length){const p=document.createElement('p');p.className='empty-fav';p.textContent='還沒有收藏作品，點照片上的愛心就能加入。';$('#gallery').append(p)}$('#more-works').hidden=works.length<=8;$('#gallery-count').textContent=`${filter} · 顯示 ${shown.length} / ${works.length} 件`;$('#more-works').textContent=expanded?'收起部分作品 ↑':`查看其餘 ${works.length-shown.length} 件作品 ↓`;persistFavorites()}
$('#more-works').onclick=()=>{const collapsing=expanded;expanded=!expanded;renderGallery();if(collapsing)$('#works').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'})};
function openWork(w){const root=$('#work-detail');root.replaceChildren();const photo=albumViewer(w);const text=document.createElement('div');text.className='detail-text';const tag=document.createElement('div');tag.className='eyebrow';tag.textContent='KIKI’S WORK / '+w.category;const title=document.createElement('h2');title.textContent=w.name;const note=document.createElement('p');note.className='small-copy';note.textContent=w.tags+'。喜歡這款的氛圍嗎？把它加入清單，讓 Kiki 依你的髮況評估。';const actions=document.createElement('div');actions.className='detail-actions';const ask=document.createElement('button');ask.className='btn dark';ask.textContent='我想做這款 ↗';ask.onclick=()=>{favorites.add(w.id);persistFavorites();$('#work-dialog').close();$('#consult').scrollIntoView({behavior:'smooth'});toast('已加入諮詢清單')};const save=document.createElement('button');save.className='btn outline';save.textContent=favorites.has(w.id)?'取消收藏':'♡ 先收藏';save.onclick=()=>{toggleFavorite(w.id);save.textContent=favorites.has(w.id)?'取消收藏':'♡ 先收藏'};actions.append(ask,save);const source=document.createElement('a');source.className='text-link work-source';source.href=w.source;source.target='_blank';source.rel='noopener noreferrer';source.textContent=(w.author==='vale._.kiki777'?'Kiki 原始貼文':'合作貼文 · @'+w.author)+' ↗';text.append(tag,title,note,source,actions);root.append(photo,text);$('#work-dialog').showModal();photo.querySelector('.album-track').scrollLeft=0}
function renderFavorites(){const root=$('#favorite-list');root.replaceChildren();$('#fav-count').textContent=favorites.size;if(!favorites.size){const p=document.createElement('p');p.className='empty-fav';p.textContent='還沒有心動作品？點照片上的 ♡，收藏你的變身靈感。';root.append(p)}WORKS.filter(w=>favorites.has(w.id)).forEach(w=>{const row=document.createElement('div');row.className='fav-item';const thumb=document.createElement('div');thumb.className='fav-thumb';thumb.append(crop(w));const p=document.createElement('p');p.textContent=w.name;const b=document.createElement('button');b.textContent='×';b.setAttribute('aria-label','移除'+w.name);b.onclick=()=>toggleFavorite(w.id);row.append(thumb,p,b);root.append(row)})}
$$('.dialog-close').forEach(b=>b.onclick=()=>b.closest('dialog').close());$$('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close()}}));
$('#work-dialog').addEventListener('close',()=>$('#work-detail').replaceChildren());
let priceTab='november';
function renderPrices(){
 const tabs=[['november','11 月價格'],['perm','燙髮／縮毛']];
 $('#price-tabs').replaceChildren(...tabs.map(([id,label])=>{const b=document.createElement('button');b.textContent=label;b.className=id===priceTab?'active':'';b.setAttribute('aria-pressed',String(id===priceTab));b.onclick=()=>{priceTab=id;renderPrices()};return b}));
 if(priceTab==='november'){
  $('#price-table').innerHTML='<h3>11 月染髮・剪髮</h3><table class="price-table"><thead><tr><th scope="col">服務內容</th><th scope="col">11 月價格</th></tr></thead><tbody>'+NOVEMBER_MENU.map(item=>{const s=SERVICES[item.service]||item;return '<tr><td>'+s.name+'<br><span class="small-copy">'+item.detail+'</span></td><td>'+money(s.price)+'</td></tr>'}).join('')+'</tbody></table><p class="included">漂染 $4,499 用到好，含漂兩次＋上色；每加 1 色另加 $1,000。設計染髮含區塊漂＋上色。</p>';
  return;
 }
 const s=SERVICES.perm;
 $('#price-table').innerHTML='<h3>'+s.name+'</h3><table class="price-table"><thead><tr><th scope="col">髮長</th><th scope="col">原價</th><th scope="col">優惠價</th></tr></thead><tbody>'+LENGTHS.map((len,i)=>'<tr><td>'+len+'</td><td>'+(s.original[i]===s.prices[i]?'—':'<del>'+money(s.original[i])+'</del>')+'</td><td>'+money(s.prices[i])+'</td></tr>').join('')+'</tbody></table><p class="included">'+s.included+'</p>';
}
function extraColorCount(){const n=Number($('#extra-colors').value);return Number.isFinite(n)?Math.max(0,Math.floor(n)):0}
function currentEstimate(){return estimate($('#estimate-service').value,$('#estimate-length').value,$('#add-cut').checked,$('#add-tone').checked,extraColorCount())}
function updateEstimate(){
 const service=$('#estimate-service').value;
 const canCut=['single','bleach','design'].includes(service);
 $('#cut-addon').hidden=!canCut;$('#tone-addon').hidden=service!=='single';$('#color-addon').hidden=service!=='bleach';
 if(!canCut)$('#add-cut').checked=false;
 if(service!=='single')$('#add-tone').checked=false;
 if(service!=='bleach')$('#extra-colors').value='0';
 $('#estimate-length').disabled=service==='cut'||service==='custom';
 const amount=currentEstimate();
 $('#estimate-total').textContent=amount===null?'先聊聊':money(amount);
 $('#estimate-note').textContent=service==='perm'?'方案已含剪髮。依髮況確認最終報價。':service==='cut'?'11 月剪髮 $500，包含洗髮。':service==='bleach'?'11 月漂染含漂兩次＋上色；每加 1 色另加 $1,000。依目前選項試算。':service==='design'?'11 月設計染髮含區塊漂＋上色。依目前選項試算。':amount===null?'特殊設計、護髮或不確定的項目，由 Kiki 個別評估。':'11 月單色染 $1,499。依目前選項試算，非最終報價。';
 $('#consult-service').value=({single:'染髮',bleach:'漂染／特殊色',design:'設計染髮／區塊染',perm:'燙髮／縮毛矯正',cut:'剪髮',custom:'還沒決定，想先聊聊'})[service];
}
['estimate-service','estimate-length','add-cut','add-tone'].forEach(id=>$('#'+id).addEventListener('change',updateEstimate));
$('#consult-service').addEventListener('change',()=>{const service=({'染髮':'single','漂染／特殊色':'bleach','設計染髮／區塊染':'design','剪髮':'cut','燙髮／縮毛矯正':'perm','護髮／頭皮護理':'custom','還沒決定，想先聊聊':'custom'})[$('#consult-service').value];const label=$('#consult-service').value;$('#estimate-service').value=service;updateEstimate();$('#consult-service').value=label});
$('#extra-colors').addEventListener('input',updateEstimate);
$('#extra-colors').addEventListener('change',()=>{$('#extra-colors').value=String(extraColorCount());updateEstimate()});
const date=new Date();$('#year').textContent=date.getFullYear();$('#guest-date').min=`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
function buildConsult(){const selected=WORKS.filter(w=>favorites.has(w.id)).map(w=>w.name);const amount=currentEstimate();return ['Kiki 你好！我想詢問髮型／預約 ♡',`稱呼：${$('#guest-name').value.trim()||'尚未填寫'}`,`想做：${$('#consult-service').value}`,`目前髮長：${LENGTHS[Number($('#estimate-length').value)]}`,`希望日期：${$('#guest-date').value||'想先討論'}`,`偏好時段：${$('#guest-time').value}`,`預算：${$('#guest-budget').value}`,`染燙紀錄：${$('#hair-history').value}`,selected.length?'喜歡的作品：\n'+selected.map(t=>'・'+t).join('\n'):'喜歡的作品：想請你推薦',chosenColor?`試色靈感：${chosenColor[0]}（${chosenColor[1]}）；模擬圖將另外附上`:'',`網站試算（11 月）：${SERVICES[$('#estimate-service').value].name}／${amount===null?'需個別諮詢':money(amount)+'（僅供參考）'}`,$('#estimate-service').value==='bleach'?'漂染內容：漂兩次＋上色'+(extraColorCount()?'；額外加 '+extraColorCount()+' 色（每色 $1,000）':''):'',$('#estimate-service').value==='design'?'設計染內容：區塊漂＋上色':'',$('#add-cut').checked?'加購：剪髮 $500':'',$('#add-tone').checked?'加購：褪色提亮／色素回填 $800':'',`想補充：${$('#guest-note').value.trim()||'想請你協助評估適合的造型。'}`,'以上為諮詢，實際價格與可預約時間請你再幫我確認，謝謝！'].filter(Boolean).join('\n')}
$('#consult-form').onsubmit=e=>{e.preventDefault();if(!$('#consult-form').reportValidity())return;$('#consult-result').value=buildConsult();$('#consult-dialog').showModal()};$('#copy-consult').onclick=async()=>{try{await navigator.clipboard.writeText($('#consult-result').value);toast('已複製，開啟 LINE 後貼上即可')}catch{$('#consult-result').focus();$('#consult-result').select();toast('請長按清單文字並選擇複製')}};
renderFilters();renderGallery();renderPrices();updateEstimate();
// Photo processing stays entirely on this device. No photo upload or persistence.
const canvas=$('#hair-canvas'),ctx=canvas.getContext('2d',{willReadFrequently:true}),original=document.createElement('canvas'),octx=original.getContext('2d',{willReadFrequently:true}),mask=document.createElement('canvas'),mctx=mask.getContext('2d',{willReadFrequently:true});
let hasPhoto=false,maskMode=null,drawing=false,showOriginal=false,segmenterPromise=null,photoGeneration=0,processing=false,maskReady=false,manualRevision=0;
function hairStatus(text,state='waiting'){$('#hair-status').textContent=text;$('#photo-status').textContent=text;$('#photo-status').dataset.state=state;$('#manual-help').hidden=state!=='error';}
function exitOriginal(){showOriginal=false;$('#compare').textContent='查看原圖';$('#preview-label').textContent=maskReady?'模擬效果':'尚未套色';}
function chooseColor(){exitOriginal();renderColor();if(hasPhoto&&!maskReady)toast(processing?'正在辨識頭髮，完成後會套用你選的顏色。':'請先辨識頭髮，或點「手動標記頭髮」。');}
function renderSwatches(){const root=$('#swatches');root.replaceChildren(...COLORS.map(c=>{const b=document.createElement('button');b.className='swatch'+(currentColor[1]===c[1]?' active':'');b.setAttribute('aria-label',c[0]);b.setAttribute('aria-pressed',String(currentColor[1]===c[1]));const dot=document.createElement('i');dot.style.background=c[1];const t=document.createElement('span');t.textContent=c[0];b.append(dot,t);b.onclick=()=>{currentColor=c;$('#custom-color').value=c[1];renderSwatches();chooseColor()};return b}))}
function renderColor(){if(!hasPhoto)return;ctx.drawImage(original,0,0);if(showOriginal||!maskReady)return;const pixels=octx.getImageData(0,0,canvas.width,canvas.height),mp=mctx.getImageData(0,0,canvas.width,canvas.height);pixels.data.set(recolorPixels(pixels.data,mp.data,currentColor[1],Number($('#intensity').value)/100));ctx.putImageData(pixels,0,0)}
$('#custom-color').oninput=e=>{currentColor=['自訂髮色',e.target.value];renderSwatches();chooseColor()};$('#intensity').oninput=()=>{$('#intensity-value').textContent=$('#intensity').value+'%';renderColor()};
async function loadSegmenter(){
 if(!segmenterPromise)segmenterPromise=(async()=>{
  const{FilesetResolver,ImageSegmenter}=await import('../assets/vision_bundle.js');
  const wasm=await FilesetResolver.forVisionTasks(new URL('./assets/wasm', import.meta.url).href);
  // RGB model is compatible with CPU preprocessing; the previous RGBA model was not.
  const parts=await Promise.all(['01','02'].map(async part=>{const response=await fetch(new URL('./assets/selfie_multiclass_256x256.tflite.part-'+part,import.meta.url));if(!response.ok)throw new Error('無法載入髮色模型');return new Uint8Array(await response.arrayBuffer())}));
  const model=new Uint8Array(parts.reduce((sum,part)=>sum+part.length,0));let offset=0;for(const part of parts){model.set(part,offset);offset+=part.length}
  return ImageSegmenter.createFromOptions(wasm,{canvas:document.createElement('canvas'),baseOptions:{modelAssetBuffer:model,delegate:'CPU'},runningMode:'IMAGE',outputCategoryMask:false,outputConfidenceMasks:true});
 })().catch(e=>{segmenterPromise=null;throw e});
 return segmenterPromise;
}
async function autoMask(){
 if(!hasPhoto||processing)return;processing=true;const generation=photoGeneration,revision=manualRevision;
 $('#auto-mask').disabled=true;hairStatus('正在載入並辨識頭髮，首次使用請稍候…','loading');
 if(!maskReady)$('#preview-label').textContent='辨識中…';
 await new Promise(r=>setTimeout(r,60));let timer;
 try{
  const segmenter=await Promise.race([loadSegmenter(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('載入逾時')),60000)})]);
  clearTimeout(timer);if(generation!==photoGeneration||revision!==manualRevision)return;
  let count=0;
  const result=segmenter.segment(original);
  const masks=result?.confidenceMasks;if(!masks?.length)throw Error('沒有取得辨識結果');
  const labels=segmenter.getLabels();const index=labels.findIndex(x=>x.toLowerCase()==='hair');
  if(index<0)throw Error('沒有頭髮分類');
  const decoded=hairAlphaFromScores(masks.map(m=>m.getAsFloat32Array()),index);count=decoded.count;
  if(count<20)throw Error('找不到清楚的頭髮');
  const tmp=document.createElement('canvas');tmp.width=masks[index].width;tmp.height=masks[index].height;
  const tc=tmp.getContext('2d'),id=tc.createImageData(tmp.width,tmp.height);
  for(let i=0;i<decoded.alpha.length;i++)id.data[i*4+3]=decoded.alpha[i];
  tc.putImageData(id,0,0);mctx.globalCompositeOperation='source-over';mctx.clearRect(0,0,mask.width,mask.height);mctx.drawImage(tmp,0,0,mask.width,mask.height);
  masks.forEach(m=>m.close?.());
  maskReady=count>=20;exitOriginal();renderColor();hairStatus('頭髮辨識完成！現在點選色票就能換色。','ready');
 }catch(error){
  if(generation===photoGeneration&&revision===manualRevision){
   console.warn('Kiki hair segmentation:',error?.message||String(error));
   if(maskReady)hairStatus('這次辨識未完成，已保留目前的試色範圍。','ready');
   else{$('#preview-label').textContent='尚未套色';hairStatus('未能自動辨識。可重試，或點下方按鈕用手指標記頭髮。','error');}
  }
 }finally{
  clearTimeout(timer);processing=false;$('#auto-mask').disabled=!hasPhoto;
  if(hasPhoto&&generation!==photoGeneration)autoMask();
 }
}
$('#photo-upload').onchange=async e=>{const file=e.target.files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)){toast('請選擇 JPG、PNG 或 WebP 照片');e.target.value='';return}if(file.size>15*1024*1024){toast('照片超過 15 MB，請先縮小再上傳');e.target.value='';return}const url=URL.createObjectURL(file),img=new Image(),gen=++photoGeneration;img.onload=()=>{if(gen!==photoGeneration){URL.revokeObjectURL(url);return}const scale=Math.min(1,850/Math.max(img.naturalWidth,img.naturalHeight));for(const c of[canvas,original,mask]){c.width=Math.round(img.naturalWidth*scale);c.height=Math.round(img.naturalHeight*scale)}octx.drawImage(img,0,0,original.width,original.height);hasPhoto=true;maskReady=false;manualRevision++;showOriginal=false;$('#compare').textContent='查看原圖';$('#preview-label').textContent='等待辨識';$('#upload-empty').hidden=true;canvas.hidden=false;$('#canvas-top').hidden=false;$('#canvas-bottom').hidden=false;$('#photo-feedback').hidden=false;$('#manual-help').hidden=true;$('#paint').disabled=false;$('#erase').disabled=false;$('#auto-mask').disabled=false;setBrush(null);renderColor();URL.revokeObjectURL(url);if(processing){$('#hair-status').textContent='照片已更換，請稍後點「自動辨識頭髮」。'}else autoMask()};img.onerror=()=>{URL.revokeObjectURL(url);toast('無法讀取這張照片，請換一張 JPG 或 PNG')};img.src=url;e.target.value=''};
$('#replace-photo').onclick=()=>$('#photo-upload').click();$('#delete-photo').onclick=()=>{photoGeneration++;hasPhoto=false;maskReady=false;manualRevision++;drawing=false;maskMode=null;for(const c of[canvas,original,mask]){c.width=1;c.height=1}canvas.hidden=true;$('#canvas-top').hidden=true;$('#canvas-bottom').hidden=true;$('#photo-feedback').hidden=true;$('#upload-empty').hidden=false;$('#paint').disabled=true;$('#erase').disabled=true;$('#auto-mask').disabled=true;hairStatus('照片已從頁面清除。');toast('已刪除照片')};$('#auto-mask').onclick=autoMask;
function setBrush(mode){maskMode=mode;for(const id of['paint','erase']){$('#'+id).classList.toggle('active',mode===id);$('#'+id).setAttribute('aria-pressed',String(mode===id))}canvas.style.cursor=mode?'crosshair':'default'}$('#paint').onclick=()=>{setBrush(maskMode==='paint'?null:'paint');if(maskMode){manualRevision++;exitOriginal();hairStatus('在照片的頭髮上塗抹，就能加入試色範圍。','manual')}};$('#erase').onclick=()=>{setBrush(maskMode==='erase'?null:'erase');if(maskMode){manualRevision++;exitOriginal();hairStatus('在誤選的位置塗抹，移除多餘的試色。','manual')}};
let lastPoint=null;function point(e){const r=canvas.getBoundingClientRect();return[(e.clientX-r.left)*canvas.width/r.width,(e.clientY-r.top)*canvas.height/r.height]}
function brush(e){if(!drawing||!maskMode||showOriginal)return;const p=point(e),r=canvas.getBoundingClientRect(),size=Number($('#brush-size').value)*canvas.width/r.width;mctx.globalCompositeOperation=maskMode==='erase'?'destination-out':'source-over';mctx.strokeStyle='#fff';mctx.fillStyle='#fff';mctx.lineCap='round';mctx.lineJoin='round';mctx.lineWidth=size;mctx.beginPath();mctx.moveTo(...(lastPoint||p));mctx.lineTo(...p);mctx.stroke();mctx.beginPath();mctx.arc(p[0],p[1],size/2,0,Math.PI*2);mctx.fill();mctx.globalCompositeOperation='source-over';lastPoint=p;maskReady=true;$('#preview-label').textContent='模擬效果';renderColor()}
canvas.onpointerdown=e=>{if(!hasPhoto||!maskMode)return;e.preventDefault();drawing=true;lastPoint=null;canvas.setPointerCapture(e.pointerId);brush(e)};canvas.onpointermove=brush;canvas.onpointerup=canvas.onpointercancel=()=>{drawing=false;lastPoint=null};
$('#compare').onclick=()=>{showOriginal=!showOriginal;$('#compare').textContent=showOriginal?'回到試色':'查看原圖';$('#preview-label').textContent=showOriginal?'原始照片':'模擬效果';renderColor()};$('#save-color').onclick=()=>{if(!hasPhoto)return;if(!maskReady){toast('請先完成頭髮辨識或手動標記，再下載試色圖');return;}const previous=showOriginal;showOriginal=false;renderColor();const out=document.createElement('canvas');out.width=canvas.width;out.height=canvas.height+70;const c=out.getContext('2d');c.fillStyle='#fcfaf7';c.fillRect(0,0,out.width,out.height);c.drawImage(canvas,0,0);c.fillStyle='#49355d';c.font=`${Math.max(12,Math.min(20,out.width/24))}px sans-serif`;c.fillText('Kiki 髮色魔法鏡 · '+currentColor[0],12,canvas.height+27);c.font=`${Math.max(10,Math.min(14,out.width/32))}px sans-serif`;c.fillText('色彩模擬僅供參考，實際效果請由 Kiki 評估。',12,canvas.height+51);out.toBlob(blob=>{if(!blob){toast('下載失敗，請重試');return}const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='Kiki-hair-color-preview.png';a.click();setTimeout(()=>URL.revokeObjectURL(url),10000);toast('已產生試色圖，可另外傳給 Kiki')},'image/png');showOriginal=previous;renderColor()};
$('#manual-help').onclick=()=>{manualRevision++;setBrush('paint');exitOriginal();hairStatus('請直接在照片上的頭髮塗抹，選好的顏色會即時出現。','manual');canvas.scrollIntoView({behavior:'smooth',block:'center'});};
$('#use-color').onclick=()=>{chosenColor=[...currentColor];const root=$('#chosen-color');root.hidden=false;root.replaceChildren();const dot=document.createElement('span');dot.className='color-dot';dot.style.background=chosenColor[1];root.append(dot,document.createTextNode('心動髮色：'+chosenColor[0]+' · '+chosenColor[1]));$('#consult').scrollIntoView({behavior:'smooth'});toast('已把喜歡的顏色加入諮詢清單')};renderSwatches();
// Progressive WebMCP: local-only tools never send inquiries or photos.
const modelContext=document.modelContext;
if(modelContext?.registerTool){
 const lifecycle=new AbortController();
 const tool={name:'get_hair_service_estimate',title:'取得 Kiki 服務參考價',description:'依網站同一份價目表計算參考金額；不會成立預約或送出資料。',annotations:{readOnlyHint:true,untrustedContentHint:false},inputSchema:{type:'object',properties:{service:{type:'string',enum:['single','bleach','design','perm','cut','custom']},length:{type:'integer',enum:[0,1,2]},addCut:{type:'boolean'},addTone:{type:'boolean'},extraColors:{type:'integer',minimum:0}},required:['service','length'],additionalProperties:false},execute:async args=>{
  if(!args||!Object.hasOwn(SERVICES,args.service)||![0,1,2].includes(args.length)||args.addCut!==undefined&&typeof args.addCut!=='boolean'||args.addTone!==undefined&&typeof args.addTone!=='boolean')throw new Error('請提供有效服務與髮長');
  if(args.extraColors!==undefined&&(!Number.isInteger(args.extraColors)||args.extraColors<0))throw new Error('加色數量須為非負整數');
  return {service:SERVICES[args.service].name,referenceNTD:estimate(args.service,args.length,args.addCut,args.addTone,args.extraColors),note:'最終報價與預約需由 Kiki 確認。'};
 }};
 try{Promise.resolve(modelContext.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}
 addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
}

