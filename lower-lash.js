// 下睫毛選填區塊：左右眼共用單一種類、顏色、長度與本數。
(() => {
  const style=document.createElement('style');
  style.textContent=`
    .upper-lash-section,.lower-lash-section{margin:0 0 24px;border:1px solid #e4ddd8;border-radius:15px;background:#fdfbf9;overflow:hidden}
    .upper-lash-header,.lower-lash-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;background:#f7f3f0;border-bottom:1px solid #e4ddd8}
    .upper-lash-title,.lower-lash-title{font-weight:800;font-size:18px}
    .upper-lash-content,.lower-lash-content{padding:16px}
    .upper-lash-content .eyes-grid{margin:16px 0 0}
    .upper-lash-content .eye-panel{background:#fff;border-color:#e4ddd8}

    .lash-card-grid{display:grid;gap:12px;align-items:stretch}
    .upper-lash-fields{grid-template-columns:repeat(3,minmax(0,1fr))}
    .lower-lash-fields.four-cols{grid-template-columns:repeat(4,minmax(0,1fr))}
    .lash-setting-card{display:flex;flex-direction:column;gap:8px;min-width:0;padding:14px;border:1px solid #e4ddd8;border-radius:14px;background:#fff}
    .lash-setting-label{font-size:14px;font-weight:800;color:#5f524b}
    .lash-setting-card select,.lash-setting-card input{width:100%;min-width:0;min-height:46px;padding:0 12px;border:1px solid #d9cec7;border-radius:12px;background:#fff;color:#302a27;font:inherit;outline:none}
    .lash-setting-card select:focus,.lash-setting-card input:focus{border-color:#b99e90;box-shadow:0 0 0 3px rgba(139,100,90,.08)}

    .lower-lash-indicator{display:none;width:max-content;margin:-20px auto 3px;padding:0;background:transparent;color:#332d2a;font-weight:700;font-size:14px;line-height:1.2;text-align:center;position:relative;z-index:2}
    .lower-lash-indicator.is-visible{display:block}
    .lower-lash-optional{margin-left:6px;color:#a16d69;font-size:13px;font-weight:700}
    .lower-lash-toggle-label{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;white-space:nowrap}
    .lower-lash-toggle-label input{position:absolute;opacity:0;pointer-events:none}
    .lower-lash-switch{position:relative;width:46px;height:26px;flex:0 0 auto;border-radius:999px;background:#cfc6c1;transition:.2s}
    .lower-lash-switch::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.2);transition:.2s}
    .lower-lash-toggle-label input:checked+.lower-lash-switch{background:#302a27}
    .lower-lash-toggle-label input:checked+.lower-lash-switch::after{transform:translateX(20px)}

    /* 平板／電腦：金額列維持和原 record-table 相同的第一組欄寬。
       一般列為 130px / 1fr / 130px / 1fr，
       所以金額輸入區寬度直接取第一個 1fr，右邊就會和日期欄位切齊。 */
    @media(min-width:1024px){
      .record-table .full-row:has(#amount){grid-template-columns:130px calc((100% - 260px)/2) 1fr}
      .record-table .full-row:has(#amount) .form-input{padding-right:12px;border-right:1px solid #ded7d2}
      #amount{width:100%}
    }
    @media(min-width:768px) and (max-width:1023px){
      .record-table .full-row:has(#amount){grid-template-columns:120px calc((100% - 240px)/2) 1fr}
      .record-table .full-row:has(#amount) .form-input{padding-right:12px;border-right:1px solid #ded7d2}
      #amount{width:100%}
    }

    @media(max-width:1024px){
      .lower-lash-indicator{margin:-30px auto 3px}
      .lower-lash-fields.four-cols{grid-template-columns:repeat(2,minmax(0,1fr))}
    }
    @media(max-width:767px){
      .upper-lash-content,.lower-lash-content{padding:12px 10px}
      .upper-lash-fields,.lower-lash-fields.four-cols{grid-template-columns:1fr}
      .lower-lash-header{align-items:flex-start;flex-direction:column}
      .lower-lash-indicator{font-size:14px}
      .lash-setting-card{padding:12px}
      .lash-setting-card select,.lash-setting-card input{font-size:16px}
      .record-table .full-row:has(#amount){display:block}
      .record-table .full-row:has(#amount) .form-input{border:0;padding:0 0 8px}
      #amount{width:100%}
    }
  `;
  document.head.appendChild(style);

  const toggle=document.getElementById('lowerLashToggle');
  const content=document.getElementById('lowerLashContent');
  const lengthSelect=document.getElementById('lowerLashLength');
  const countSelect=document.getElementById('lowerLashCount');
  const summaryType=document.getElementById('lowerLashTypeSummary');
  const summaryColor=document.getElementById('lowerLashColorSummary');
  const leftEyeSvg=document.getElementById('leftEyeSvg');
  const rightEyeSvg=document.getElementById('rightEyeSvg');
  if(!toggle||!content||!lengthSelect||!countSelect)return;

  function loadLowerSettings(){
    try{
      const saved=JSON.parse(localStorage.getItem('lashRecordSettings'))||{};
      return{
        types:Array.isArray(saved.lowerLashTypes)&&saved.lowerLashTypes.length?saved.lowerLashTypes:['M'],
        colors:{M:['黑色','棕色'],...(saved.lowerLashColors||{})}
      };
    }catch{
      return{types:['M'],colors:{M:['黑色','棕色']}};
    }
  }

  const lowerSettings=loadLowerSettings();
  if(summaryType){summaryType.innerHTML=lowerSettings.types.map(v=>`<option value="${v}">${v}</option>`).join('');}

  function renderColors(){
    if(!summaryColor)return;
    summaryColor.innerHTML='<option value="">請選擇顏色</option>';
    const colors=lowerSettings.colors[summaryType?.value||'M']||[];
    colors.forEach(v=>{const o=document.createElement('option');o.value=v;o.textContent=v;summaryColor.appendChild(o)});
    if(colors.length) summaryColor.value=colors[0];
  }
  renderColors();

  function createIndicator(eyeSvg,id){
    if(!eyeSvg||document.getElementById(id))return document.getElementById(id);
    const x=document.createElement('div');x.id=id;x.className='lower-lash-indicator';eyeSvg.insertAdjacentElement('afterend',x);return x;
  }
  const leftIndicator=createIndicator(leftEyeSvg,'leftLowerLashIndicator');
  const rightIndicator=createIndicator(rightEyeSvg,'rightLowerLashIndicator');

  lengthSelect.innerHTML=[4,5,6,7].map(v=>`<option value="${v}">${v} mm</option>`).join('');
  let counts=['20','30'];
  try{const s=JSON.parse(localStorage.getItem('lashRecordSettings'));if(Array.isArray(s?.lowerLashCounts)&&s.lowerLashCounts.length)counts=s.lowerLashCounts.map(String)}catch{}
  countSelect.innerHTML=counts.map(v=>`<option value="${v}">${v} 本</option>`).join('');

  function updateIndicators(){
    const text=`${summaryType?.value||'M'}${lengthSelect.value}`;
    [leftIndicator,rightIndicator].forEach(x=>{if(x){x.textContent=text;x.classList.toggle('is-visible',toggle.checked)}});
  }
  function sync(){content.hidden=!toggle.checked;updateIndicators()}

  toggle.addEventListener('change',sync);
  lengthSelect.addEventListener('change',updateIndicators);
  summaryType?.addEventListener('change',()=>{renderColors();updateIndicators()});
  sync();

  document.getElementById('save')?.addEventListener('click',()=>{
    const output=document.getElementById('output');if(!output)return;
    try{
      const data=JSON.parse(output.textContent||'{}');
      data.lowerLash=toggle.checked?{type:summaryType?.value||'M',color:summaryColor?.value||'',length:Number(lengthSelect.value),count:countSelect.value}:null;
      output.textContent=JSON.stringify(data,null,2);
    }catch{}
  });
})();