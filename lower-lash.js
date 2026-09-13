// 下睫毛選填區塊：目前品牌固定為 M，只提供長度與根數設定。
(() => {
  const style = document.createElement('style');
  style.textContent = `
    .upper-lash-section,
    .lower-lash-section{
      margin:0 0 24px;
      border:1px solid #e4ddd8;
      border-radius:15px;
      background:#fdfbf9;
      overflow:hidden;
    }
    .upper-lash-header,
    .lower-lash-header{
      display:flex;
      align-items:center;
      justify-content:space-between;
      gap:14px;
      padding:14px 16px;
      background:#f7f3f0;
      border-bottom:1px solid #e4ddd8;
    }
    .upper-lash-title,
    .lower-lash-title{font-weight:800;font-size:18px}
    .upper-lash-content{padding:16px}
    .upper-lash-content .eyes-grid{margin:0}
    .upper-lash-content .eye-panel{
      background:#fff;
      border-color:#e4ddd8;
      box-shadow:inset 0 0 0 1px rgba(255,255,255,.45);
    }
    .lower-lash-optional{margin-left:6px;color:#a16d69;font-size:13px;font-weight:700}
    .lower-lash-toggle-label{
      display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;white-space:nowrap;
    }
    .lower-lash-toggle-label input{
      position:absolute;opacity:0;pointer-events:none;
    }
    .lower-lash-switch{
      position:relative;width:46px;height:26px;flex:0 0 auto;
      border-radius:999px;background:#cfc6c1;transition:.2s ease;
    }
    .lower-lash-switch::after{
      content:"";position:absolute;top:3px;left:3px;width:20px;height:20px;
      border-radius:50%;background:#fff;box-shadow:0 1px 4px rgba(0,0,0,.2);transition:.2s ease;
    }
    .lower-lash-toggle-label input:checked + .lower-lash-switch{background:#302a27}
    .lower-lash-toggle-label input:checked + .lower-lash-switch::after{transform:translateX(20px)}
    .lower-lash-content{padding:16px}
    .lower-lash-brand{margin-bottom:12px;font-size:14px;color:#6f625c}
    .lower-eyes-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}
    .lower-eye-panel{
      border:1px solid #e4ddd8;border-radius:12px;padding:12px;background:#fff;min-width:0;
    }
    .lower-eye-title{text-align:center;font-weight:800;font-size:17px;margin-bottom:9px}
    .lower-segments{display:grid;gap:8px}
    .lower-segment{
      border:1px solid #e4ddd8;border-radius:10px;padding:9px;background:#fdfbf9;text-align:center;
    }
    .lower-segment-name{display:block;font-weight:700;font-size:13px;margin-bottom:5px}
    .lower-lash-count-row{
      display:grid;grid-template-columns:120px minmax(0,220px);gap:10px;align-items:center;margin-top:14px;
    }
    .lower-lash-count-row label{font-weight:700;font-size:14px}
    @media(max-width:767px){
      .upper-lash-header{padding:13px 12px}
      .upper-lash-content{padding:12px 10px}
      .upper-lash-content .eyes-grid{gap:10px;margin:0}
      .lower-lash-header{align-items:flex-start;flex-direction:column;padding:13px 12px}
      .lower-lash-toggle-label{width:100%;justify-content:flex-start}
      .lower-lash-content{padding:12px 10px}
      .lower-eyes-grid{grid-template-columns:1fr;gap:10px}
      .lower-segments{grid-template-columns:repeat(2,minmax(0,1fr))}
      .lower-lash-count-row{grid-template-columns:1fr;gap:5px}
      .lower-lash-count-row select{font-size:16px;min-height:40px}
    }
  `;
  document.head.appendChild(style);

  const toggle = document.getElementById('lowerLashToggle');
  const content = document.getElementById('lowerLashContent');
  const leftContainer = document.getElementById('lowerLeftSegments');
  const rightContainer = document.getElementById('lowerRightSegments');
  const addLeft = document.getElementById('addLowerLeft');
  const addRight = document.getElementById('addLowerRight');
  const countSelect = document.getElementById('lowerLashCount');

  if (!toggle || !content || !leftContainer || !rightContainer) return;

  // 前端先提供下睫毛常用長度；之後再與設定頁的動態資料串接。
  const lowerLengthOptions = [4, 5, 6, 7];
  const lowerCountOptions = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem('lashRecordSettings'));
      const items = saved?.lowerLashCounts;
      if (Array.isArray(items) && items.length) return items.map(String);
    } catch {}
    return ['20', '30'];
  })();

  const state = {
    left: [{ length: lowerLengthOptions[0] }],
    right: [{ length: lowerLengthOptions[0] }]
  };

  function lengthOptionsHtml(selected) {
    return lowerLengthOptions.map(value =>
      `<option value="${value}"${value === selected ? ' selected' : ''}>${value} mm</option>`
    ).join('');
  }

  function renderSide(side) {
    const segments = state[side];
    const container = side === 'left' ? leftContainer : rightContainer;
    container.innerHTML = '';

    segments.forEach((segment, index) => {
      const card = document.createElement('div');
      card.className = 'lower-segment';
      card.innerHTML = `
        <span class="lower-segment-name">範圍 ${index + 1}</span>
        <select aria-label="下睫毛${side === 'left' ? '左眼' : '右眼'}範圍 ${index + 1} 長度">
          ${lengthOptionsHtml(segment.length)}
        </select>
        <button type="button" class="remove">刪除此區</button>
      `;

      const select = card.querySelector('select');
      select.addEventListener('change', () => {
        segment.length = Number(select.value);
      });

      const remove = card.querySelector('.remove');
      remove.disabled = segments.length === 1;
      if (segments.length === 1) {
        remove.style.opacity = '.45';
        remove.style.cursor = 'default';
      }
      remove.addEventListener('click', () => {
        if (segments.length <= 1) return;
        segments.splice(index, 1);
        renderSide(side);
      });

      container.appendChild(card);
    });
  }

  function addSegment(side) {
    state[side].push({ length: lowerLengthOptions[0] });
    renderSide(side);
  }

  if (countSelect) {
    countSelect.innerHTML = lowerCountOptions.map(value =>
      `<option value="${value}">${value} 根</option>`
    ).join('');
  }

  toggle.addEventListener('change', () => {
    content.hidden = !toggle.checked;
  });
  addLeft?.addEventListener('click', () => addSegment('left'));
  addRight?.addEventListener('click', () => addSegment('right'));

  renderSide('left');
  renderSide('right');

  // 測試儲存輸出同步補上下睫毛內容，不改原本主流程。
  document.getElementById('save')?.addEventListener('click', () => {
    const output = document.getElementById('output');
    if (!output) return;

    try {
      const data = JSON.parse(output.textContent || '{}');
      data.lowerLash = toggle.checked ? {
        brand: 'M',
        count: countSelect ? countSelect.value : '',
        left: state.left.map(item => ({ length: item.length })),
        right: state.right.map(item => ({ length: item.length }))
      } : null;
      output.textContent = JSON.stringify(data, null, 2);
    } catch {
      // 原本輸出若不是 JSON，就不額外處理。
    }
  });
})();
