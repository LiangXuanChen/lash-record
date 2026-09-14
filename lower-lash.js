// 下睫毛選填區塊：左右眼共用單一種類、長度與本數。
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .upper-lash-section,.lower-lash-section{margin:0 0 24px;border:1px solid #e4ddd8;border-radius:15px;background:#fdfbf9;overflow:hidden}
    .upper-lash-header,.lower-lash-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:14px 16px;background:#f7f3f0;border-bottom:1px solid #e4ddd8}
    .upper-lash-title,.lower-lash-title{font-weight:800;font-size:18px}.upper-lash-content{padding:16px}.upper-lash-content .eyes-grid{margin:0}.upper-lash-content .eye-panel{background:#fff;border-color:#e4ddd8;box-shadow:inset 0 0 0 1px rgba(255,255,255,.45)}
    .upper-lash-count-row{display:grid;grid-template-columns:120px minmax(0,220px);gap:10px;align-items:center;margin-top:14px;padding:12px;border:1px solid #e4ddd8;border-radius:12px;background:#fff}.upper-lash-count-row label{font-weight:700;font-size:14px;color:#6f625c}.upper-lash-count-row select{width:100%;min-height:40px}
    .lower-lash-indicator{display:none;width:max-content;margin:-20px auto 3px;padding:0;background:transparent;color:#332d2a;font-weight:700;font-size:14px;line-height:1.2;text-align:center;position:relative;z-index:2}.lower-lash-indicator.is-visible{display:block}
    .lower-lash-optional{margin-left:6px;color:#a16d69;font-size:13px;font-weight:700}.lower-lash-toggle-label{display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;white-space:nowrap}.lower-lash-toggle-label input{position:absolute;opacity:0;pointer-events:none}.lower-lash-switch{position:relative;width:46px;height:26px;flex:0 0 auto;border-radius:999px;background:#cfc6c1;transition:.2s ease}.lower-lash-switch::after{content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.2);transition:.2s ease}.lower-lash-toggle-label input:checked + .lower-lash-switch{background:#302a27}.lower-lash-toggle-label input:checked + .lower-lash-switch::after{transform:translateX(20px)}
    .lower-lash-content{padding:16px}.lower-lash-fields{display:grid;grid-template-columns:minmax(120px,.7fr) minmax(160px,1fr) minmax(160px,1fr);gap:12px;align-items:stretch}.lower-lash-field{display:flex;flex-direction:column;gap:7px;min-width:0;padding:12px;border:1px solid #e4ddd8;border-radius:12px;background:#fff}.lower-lash-field-label{font-weight:700;font-size:14px;color:#6f625c}.lower-lash-brand-value{display:flex;align-items:center;min-height:40px;font-size:17px;color:#302a27}.lower-lash-field select{width:100%;min-height:40px}
    @media(max-width:1024px){.lower-lash-indicator{margin:-30px auto 3px}}
    @media(max-width:767px){.upper-lash-header{padding:13px 12px}.upper-lash-content{padding:12px 10px}.upper-lash-content .eyes-grid{gap:10px;margin:0}.upper-lash-count-row{grid-template-columns:1fr;gap:5px;padding:10px}.upper-lash-count-row select{font-size:16px}.lower-lash-header{align-items:flex-start;flex-direction:column;padding:13px 12px}.lower-lash-toggle-label{width:100%;justify-content:flex-start}.lower-lash-content{padding:12px 10px}.lower-lash-fields{grid-template-columns:1fr;gap:9px}.lower-lash-field{padding:10px}.lower-lash-field select{font-size:16px}.lower-lash-indicator{font-size:14px}}
  `;
  document.head.appendChild(style);

  const toggle = document.getElementById('lowerLashToggle');
  const content = document.getElementById('lowerLashContent');
  const lengthSelect = document.getElementById('lowerLashLength');
  const countSelect = document.getElementById('lowerLashCount');
  const summaryRow = document.getElementById('lowerLashSummaryRow');
  const summaryType = document.getElementById('lowerLashTypeSummary');
  const leftEyeSvg = document.getElementById('leftEyeSvg');
  const rightEyeSvg = document.getElementById('rightEyeSvg');
  if (!toggle || !content || !lengthSelect || !countSelect) return;

  function loadLowerSettings(){
    try{
      const saved=JSON.parse(localStorage.getItem('lashRecordSettings'))||{};
      return {types:Array.isArray(saved.lowerLashTypes)&&saved.lowerLashTypes.length?saved.lowerLashTypes:['M'],colors:saved.lowerLashColors||{M:['黑色','棕色']}};
    }catch{return {types:['M'],colors:{M:['黑色','棕色']}};}
  }
  const lowerSettings=loadLowerSettings();
  if(summaryType){summaryType.innerHTML=lowerSettings.types.map(v=>`<option value="${v}">${v}</option>`).join('');}

  function createIndicator(eyeSvg,id){if(!eyeSvg||document.getElementById(id))return document.getElementById(id);const indicator=document.createElement('div');indicator.id=id;indicator.className='lower-lash-indicator';indicator.setAttribute('aria-live','polite');eyeSvg.insertAdjacentElement('afterend',indicator);return indicator;}
  const leftIndicator=createIndicator(leftEyeSvg,'leftLowerLashIndicator');
  const rightIndicator=createIndicator(rightEyeSvg,'rightLowerLashIndicator');
  const lowerLengthOptions=[4,5,6,7];
  const lowerCountOptions=(()=>{try{const saved=JSON.parse(localStorage.getItem('lashRecordSettings'));const items=saved?.lowerLashCounts;if(Array.isArray(items)&&items.length)return items.map(String);}catch{}return ['20','30'];})();
  lengthSelect.innerHTML=lowerLengthOptions.map(value=>`<option value="${value}">${value} mm</option>`).join('');
  countSelect.innerHTML=lowerCountOptions.map(value=>`<option value="${value}">${value} 本</option>`).join('');

  function updateIndicators(){const type=summaryType?.value||'M';const text=`${type}${lengthSelect.value}`;[leftIndicator,rightIndicator].forEach(indicator=>{if(!indicator)return;indicator.textContent=text;indicator.classList.toggle('is-visible',toggle.checked);});}
  function syncLowerVisibility(){content.hidden=!toggle.checked;if(summaryRow)summaryRow.hidden=!toggle.checked;updateIndicators();}
  toggle.addEventListener('change',syncLowerVisibility);lengthSelect.addEventListener('change',updateIndicators);summaryType?.addEventListener('change',updateIndicators);syncLowerVisibility();

  document.getElementById('save')?.addEventListener('click',()=>{const output=document.getElementById('output');if(!output)return;try{const data=JSON.parse(output.textContent||'{}');data.lowerLash=toggle.checked?{type:summaryType?.value||'M',length:Number(lengthSelect.value),count:countSelect.value}:null;output.textContent=JSON.stringify(data,null,2);}catch{}});
})();