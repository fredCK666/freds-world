// Pure pixel functions shared by the editor and regression checks.
export function hairAlphaFromScores(channels,hairIndex=1){
 if(!Array.isArray(channels)||channels.length<2||!channels[hairIndex])throw Error('缺少頭髮辨識資料');
 const length=channels[hairIndex].length;
 if(!channels.every(c=>c.length===length))throw Error('辨識資料尺寸不一致');
 const alpha=new Uint8ClampedArray(length);let count=0;
 for(let i=0;i<length;i++){
  const hair=channels[hairIndex][i];let other=-Infinity;
  for(let c=0;c<channels.length;c++)if(c!==hairIndex)other=Math.max(other,channels[c][i]);
  if(Number.isFinite(hair)&&hair>other){alpha[i]=Math.round(255*Math.min(1,.6+Math.max(0,hair-other)*2));count++}
 }
 return{alpha,count};
}
export function recolorPixels(source,mask,color,intensity){
 if(source.length!==mask.length||source.length%4)throw Error('像素尺寸不一致');
 if(!/^#[0-9a-f]{6}$/i.test(color))throw Error('色碼無效');
 const out=new Uint8ClampedArray(source),rgb=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16));
 const strength=Math.max(0,Math.min(1,intensity));
 for(let i=0;i<out.length;i+=4){
  const alpha=mask[i+3]/255*strength;if(alpha<.003)continue;
  const light=(source[i]*.2126+source[i+1]*.7152+source[i+2]*.0722)/255;
  for(let c=0;c<3;c++){const target=Math.min(255,rgb[c]*(.36+light*.8)+light*22);out[i+c]=source[i+c]*(1-alpha)+target*alpha}
 }
 return out;
}
