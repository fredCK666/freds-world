(()=>{
  'use strict';
  const data=window.CF_TRANSLATIONS,supported=['zh-Hant','zh-Hans','en'];
  let language='zh-Hant';
  try{const saved=localStorage.getItem('cardflow-language');if(supported.includes(saved))language=saved;}catch{}
  const escapeRE=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  const englishRE=new RegExp(Object.keys(data.en).sort((a,b)=>b.length-a.length).map(escapeRE).join('|'),'g');
  const simpleRE=new RegExp(Object.keys(data.simplifiedPhrases).sort((a,b)=>b.length-a.length).map(escapeRE).join('|'),'g');
  function translate(value,lang=language){
    const text=String(value??'');if(lang==='zh-Hant'||!/[\u3400-\u9fff]/.test(text))return text;
    if(lang==='zh-Hans')return text.replace(simpleRE,k=>data.simplifiedPhrases[k]).replace(/[\u3400-\u9fff]/g,c=>data.simplifiedCharacters[c]||c);
    const trimmed=text.trim();if(Object.hasOwn(data.en,trimmed))return text.replace(trimmed,data.en[trimmed]);
    // Counts and progress use complete sentence templates rather than word order from Chinese.
    const patterns=[
      [/^共 (\d+) 筆 · 顯示 (\d+) 筆$/,m=>`${m[2]} of ${m[1]} records`],
      [/^已完成 (\d+) \/ (\d+) 筆模擬任務$/,m=>`${m[1]} / ${m[2]} simulated tasks completed`],
      [/^(儲值中 · )?已儲值 (\d+) \/ (\d+) 張 · 尚餘 ([\d,]+) 點$/,m=>`${m[1]?'Topping up · ':''}${m[2]} / ${m[3]} cards credited · ${m[4]} credits remaining`],
      [/^(\d+) 張點卡 · 共 ([\d,]+) 點$/,m=>`${m[1]} cards · ${m[2]} credits total`],
      [/^已新增 (\d+) 筆，本批最多 100 筆。$/,m=>`Added ${m[1]} tasks (maximum 100 per batch).`],
      [/^已加入 (\d+) 筆示範 QR 任務$/,m=>`Added ${m[1]} sample QR tasks`],
      [/^已移除 (\d+) 筆完成任務，交易紀錄保留$/,m=>`Cleared ${m[1]} completed tasks; transaction records retained`],
      [/^已匯入 (\d+) 張測試點卡(?:，略過 (\d+) 筆重複或無效資料)?。$/,m=>`Imported ${m[1]} test cards${m[2]?`; skipped ${m[2]} duplicate or invalid rows`:''}.`]
    ];
    for(const [re,format] of patterns){const match=trimmed.match(re);if(match)return text.replace(trimmed,format(match));}
    return text.replace(englishRE,key=>data.en[key]).replace(/，/g,', ').replace(/。/g,'.').replace(/：/g,': ').replace(/、/g,', ').replace(/；/g,'; ').replace(/（/g,' (').replace(/）/g,')').replace(/「/g,'“').replace(/」/g,'”').replace(/【/g,'[').replace(/】/g,']').replace(/(\d)(pts|cards|tasks)/g,'$1 $2');
  }
  const textSources=new WeakMap(),attributeSources=new WeakMap(),templateSources=new WeakMap();
  const excluded='script,style,textarea,[data-no-i18n]';
  let observer,queued=false;
  function apply(){
    if(observer)observer.disconnect();
    const walker=document.createTreeWalker(document.documentElement,NodeFilter.SHOW_TEXT);let node;
    while((node=walker.nextNode())){
      if(!node.parentElement||node.parentElement.closest(excluded))continue;
      const current=node.nodeValue;let state=textSources.get(node);
      if(!state||current!==state.rendered)state={source:current,rendered:current};
      const rendered=translate(state.source);if(current!==rendered)node.nodeValue=rendered;
      state.rendered=rendered;textSources.set(node,state);
    }
    document.querySelectorAll('[aria-label],[placeholder],[title],meta[name="description"]').forEach(el=>{
      if(el.closest('[data-no-i18n]'))return;
      let states=attributeSources.get(el);if(!states){states={};attributeSources.set(el,states);}
      for(const attr of ['aria-label','placeholder','title',...(el.matches('meta')?['content']:[])]){
        if(!el.hasAttribute(attr))continue;const current=el.getAttribute(attr);let state=states[attr];
        if(!state||state.rendered!==current)state={source:current};
        const rendered=translate(state.source);if(current!==rendered)el.setAttribute(attr,rendered);state.rendered=rendered;states[attr]=state;
      }
    });
    const editor=document.querySelector('#templateEditor');
    if(editor&&typeof replyTemplate!=='undefined'){
      let state=templateSources.get(editor);
      if(!state&&replyTemplate===defaultTemplate)state={source:defaultTemplate,rendered:editor.value};
      if(state&&editor.value===state.rendered){editor.value=translate(state.source);state.rendered=editor.value;templateSources.set(editor,state);}
    }
    document.documentElement.lang=language;
    document.querySelectorAll('[data-language-switch]').forEach(select=>{select.value=language;});
    if(observer)observer.observe(document.documentElement,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','placeholder','title','content']});
  }
  const rawReply=typeof reply==='function'?reply:null;
  if(rawReply)reply=function(record){return translate(rawReply(record));};
  const rawCopy=typeof copy==='function'?copy:null;
  if(rawCopy)copy=async function(content){const field=document.querySelector("#replyText");return rawCopy(field&&field.value===content?content:translate(content));};
  const rawDownload=typeof download==='function'?download:null;
  if(rawDownload)download=function(name,content,type){
    // Keep templates importable in every language, including English and Simplified Chinese headers.
    if(name.includes('測試點卡範例')&&language==='en')content=content.replace('卡號,卡密,面額','card_no,card_pin,amount');
    return rawDownload(translate(name),translate(content),type);
  };
  function changeLanguage(next){
    if(!supported.includes(next))return;
    const old=language,field=document.querySelector('#replyText');
    let record=null,mayUpdate=false;
    if(rawReply&&field&&typeof selectedRecord!=='undefined'){
      record=records.find(r=>r.id===selectedRecord);
      mayUpdate=record&&field.value===translate(rawReply(record),old);
    }
    language=next;try{localStorage.setItem('cardflow-language',next);}catch{}
    if(mayUpdate)field.value=translate(rawReply(record));
    apply();
  }
  document.querySelectorAll('[data-language-switch]').forEach(select=>select.addEventListener('change',()=>changeLanguage(select.value)));
  observer=new MutationObserver(()=>{if(!queued){queued=true;queueMicrotask(()=>{queued=false;apply();});}});
  window.CFI18N={translate,setLanguage:changeLanguage,get language(){return language;},refresh:apply};
  if(rawReply&&typeof selectedRecord!=='undefined'&&selectedRecord)selectRecord(selectedRecord);
  apply();
})();
