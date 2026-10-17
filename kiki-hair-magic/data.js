export const LINE_URL='https://lin.ee/JQiPDiJ';
export const WORKS=[
{id:'pink',name:'莓果奶霜・柔霧粉棕',category:'單色染',tags:'柔霧粉色 / 長髮',file:7355,rect:[474,262,231,310]},
{id:'blue',name:'午夜藍・日系短髮',category:'日系短髮',tags:'深藍 / 層次短髮',file:7353,rect:[238,580,231,307]},
{id:'mint',name:'薄荷精靈・區塊染',category:'區塊染',tags:'薄荷綠 / 臉周設計',file:7354,rect:[1,254,232,310]},
{id:'silver',name:'月光銀灰・層次剪',category:'日系短髮',tags:'銀灰 / 日系層次',file:7354,rect:[238,254,231,310]},
{id:'yellow',name:'檸檬汽水・撞色短髮',category:'特殊色',tags:'亮黃 × 綠 / 個性撞色',file:7353,rect:[474,580,231,307]},
{id:'lavender',name:'紫色水母・漸層靈感',category:'區塊染',tags:'霧紫 / 髮尾變化',file:7355,rect:[1,262,232,310]},
{id:'cat',name:'小貓短髮・輕盈輪廓',category:'日系短髮',tags:'自然黑 / 短髮',file:7353,rect:[1,264,232,309]},
{id:'milktea',name:'奶茶金・柔軟長髮',category:'單色染',tags:'奶茶色 / 層次長髮',file:7353,rect:[238,264,231,309]},
{id:'berry',name:'莓果紅・日常小叛逆',category:'單色染',tags:'酒紅 / 中長髮',file:7356,rect:[1,777,232,307]},
{id:'orange',name:'橘子糖・臉周挑色',category:'區塊染',tags:'橘色 / 臉周區塊',file:7355,rect:[238,894,231,305]},
{id:'blueends',name:'海藍尾韻・層次染',category:'區塊染',tags:'深藍 / 髮尾層次',file:7356,rect:[1,464,232,307]},
{id:'brown',name:'焦糖棕・日系短鮑伯',category:'日系短髮',tags:'暖棕 / 鮑伯短髮',file:7354,rect:[474,883,231,309]},
{id:'innerpink',name:'藏一點粉・內層挑染',category:'區塊染',tags:'黑 × 粉 / 內層設計',file:7355,rect:[474,894,231,305]},
{id:'blonde',name:'奶油金・俐落層次',category:'特殊色',tags:'淺金 / 層次剪',file:7353,rect:[474,1208,231,306]},
{id:'darkblue',name:'夜色藍・低調個性',category:'特殊色',tags:'藍黑 / 長短層次',file:7354,rect:[474,254,231,310]},
{id:'beige',name:'柔霧米棕・自然長髮',category:'單色染',tags:'米棕 / 日常長髮',file:7356,rect:[238,464,231,307]}
];
export const SERVICES={
single:{name:'質感單色染',short:'單色染',price:1499,included:'單色染 $1,499。含色段銜接、單色染髮一次、頭皮隔離、洗髮。褪色提亮／色素回填加購 $800；剪髮加購 $500。'},
bleach:{name:'漂染',short:'漂染',price:4499,included:'$4,499 用到好，包含漂兩次＋上色。每加 1 色另加 $1,000；剪髮加購 $500。'},
design:{name:'設計染髮',short:'設計染髮',price:2999,included:'$2,999，包含區塊漂＋上色。剪髮加購 $500。'},
perm:{name:'氛圍感燙髮／縮毛矯正',short:'燙髮／縮毛',original:[1200,2000,2700],prices:[1200,1400,1890],included:'含修容瀏海設計、客製化捲度、頭皮隔離、洗髮及剪髮。依選擇的燙髮或縮毛方案評估。'},
cut:{name:'設計剪髮',price:500},custom:{name:'特殊設計／先諮詢',prices:null}
};
export const ADD_COLOR_PRICE=1000;
export const NOVEMBER_MENU=[
{service:'single',detail:'單色染'},
{service:'bleach',detail:'用到好｜漂兩次＋上色'},
{service:'extra-color',name:'加色',price:ADD_COLOR_PRICE,detail:'漂染每加 1 色'},
{service:'design',detail:'區塊漂＋上色'},
{service:'cut',detail:'剪髮'}
];
export const LENGTHS=['鎖骨上','鎖骨下','胸至胸下'];
export const COLORS=[['魔法霧紫','#ad79c9'],['櫻花粉','#d48da6'],['奶茶棕','#b49b7a'],['午夜藍','#3f5a9c'],['薄荷綠','#80aa92'],['莓果紅','#9a3f66'],['月光銀','#b4b4c0'],['焦糖橘','#be7945'],['海洋藍','#4293bd'],['煙燻灰','#7e7b8b'],['奶油金','#c9b787'],['可可棕','#755749']];
export function estimate(service,length,cut,tone,extraColors=0){
 const s=SERVICES[service];if(!s||(!Number.isFinite(s.price)&&!s.prices))return null;
 const base=Number.isFinite(s.price)?s.price:s.prices[Math.max(0,Math.min(2,Math.floor(Number(length)||0)))];
 const colorCount=Number(extraColors);
 const addedColors=Number.isFinite(colorCount)?Math.max(0,Math.floor(colorCount)):0;
 return base+(['single','bleach','design'].includes(service)&&cut?SERVICES.cut.price:0)+(service==='single'&&tone?800:0)+(service==='bleach'?addedColors*ADD_COLOR_PRICE:0);
}
