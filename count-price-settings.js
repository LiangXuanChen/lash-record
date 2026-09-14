// 睫毛本數＋價格設定：沿用既有 lashRecordSettings，避免另外建立一份本機設定。
(() => {
  const STANDARD_UPPER = ['80', '100', '120', '140'];
  const STANDARD_LOWER = ['20', '30'];
  const LEGACY_UPPER = ['80', '90', '100', '110', '120', '130', '140'];
  const DEFAULT_PRICES = {
    upper: { '80': 1000, '100': 1150, '120': 1300, '140': 1450 },
    lower: { '20': 200, '30': 300 }
  };

  if (typeof settings === 'undefined' || typeof saveSettings !== 'function') return;

  // 舊版尚未有價格時進行一次相容性遷移。
  // 若上睫毛仍是舊版完整預設 80~140（每 10 本一級），改成目前正式價目表的四個本數。
  if (JSON.stringify(settings.upperLashCounts || []) === JSON.stringify(LEGACY_UPPER)) {
    settings.upperLashCounts = [...STANDARD_UPPER];
  }
  if (!Array.isArray(settings.lowerLashCounts) || !settings.lowerLashCounts.length) {
    settings.lowerLashCounts = [...STANDARD_LOWER];
  }

  settings.lashCountPrices ||= {};
  settings.lashCountPrices.upper ||= {};
  settings.lashCountPrices.lower ||= {};

  Object.entries(DEFAULT_PRICES.upper).forEach(([count, price]) => {
    if (settings.lashCountPrices.upper[count] == null) settings.lashCountPrices.upper[count] = price;
  });
  Object.entries(DEFAULT_PRICES.lower).forEach(([count, price]) => {
    if (settings.lashCountPrices.lower[count] == null) settings.lashCountPrices.lower[count] = price;
  });
  saveSettings();

  const style = document.createElement('style');
  style.textContent = `
    .count-price-row .item-name{display:flex;align-items:baseline;gap:5px}
    .count-price-unit{font-size:12px;color:#8a7f78;font-weight:700}
    .count-price-editor{display:flex;align-items:center;gap:6px;justify-self:end}
    .count-price-editor span{font-size:13px;color:#8a7f78;font-weight:700}
    .count-price-input{width:100px;border:1px solid #ddd2cc;border-radius:9px;background:#fff;padding:7px 9px;font:inherit;font-size:14px;color:#302a27;text-align:right;outline:none}
    .count-price-input:focus{border-color:#b69489;box-shadow:0 0 0 3px rgba(139,100,90,.1)}
    .count-price-add{grid-template-columns:minmax(90px,1fr) minmax(110px,1fr) auto}
    .count-price-add .price-input{width:100%;border:1px solid #ddd2cc;border-radius:12px;background:#fff;padding:11px 12px;font:inherit;color:#302a27;outline:none}
    .count-price-add .price-input:focus{border-color:#b69489;box-shadow:0 0 0 3px rgba(139,100,90,.1)}
    @media(max-width:767px){
      .count-price-row{grid-template-columns:auto minmax(0,1fr) auto}
      .count-price-editor{grid-column:2/4;justify-self:stretch}
      .count-price-input{width:100%}
      .count-price-add{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);

  const configs = {
    upperLashCounts: { side: 'upper', label: '上睫毛本數' },
    lowerLashCounts: { side: 'lower', label: '下睫毛本數' }
  };

  function normalizePrice(value) {
    const digits = String(value ?? '').replace(/[^0-9]/g, '');
    return digits === '' ? null : Number(digits);
  }

  function renderCountList(key) {
    const config = configs[key];
    const list = document.getElementById(`${key}List`);
    if (!config || !list) return;

    const items = settings[key] || [];
    const prices = settings.lashCountPrices[config.side];
    list.innerHTML = '';

    if (!items.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = '目前尚未設定項目';
      list.appendChild(empty);
      return;
    }

    items.forEach((item, index) => {
      const count = String(item);
      const row = document.createElement('div');
      row.className = 'setting-item count-price-row';
      row.dataset.value = count;

      const handle = makeDragHandle(`${count} 本`);

      const name = document.createElement('div');
      name.className = 'item-name';
      name.innerHTML = `<span>${count}</span><span class="count-price-unit">本</span>`;

      const editor = document.createElement('label');
      editor.className = 'count-price-editor';
      editor.innerHTML = '<span>$</span>';

      const priceInput = document.createElement('input');
      priceInput.type = 'text';
      priceInput.inputMode = 'numeric';
      priceInput.pattern = '[0-9]*';
      priceInput.className = 'count-price-input';
      priceInput.setAttribute('aria-label', `${config.label} ${count} 本價格`);
      priceInput.value = prices[count] == null ? '' : String(prices[count]);
      priceInput.placeholder = '價格';
      priceInput.addEventListener('input', () => {
        priceInput.value = priceInput.value.replace(/[^0-9]/g, '');
      });
      priceInput.addEventListener('change', () => {
        const price = normalizePrice(priceInput.value);
        if (price == null) delete prices[count];
        else prices[count] = price;
        saveSettings();
      });
      editor.appendChild(priceInput);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'delete-btn';
      remove.textContent = '刪除';
      remove.addEventListener('click', () => {
        settings[key].splice(index, 1);
        delete prices[count];
        saveSettings();
        renderCountList(key);
      });

      row.append(handle, name, editor, remove);
      list.appendChild(row);
      enablePhysicalDrag(row, handle, list, key);
    });
  }

  function upgradeAddRow(key) {
    const config = configs[key];
    const countInput = document.getElementById(`${key}Input`);
    const button = document.querySelector(`[data-add="${key}"]`);
    const row = countInput?.closest('.add-row');
    if (!config || !countInput || !button || !row) return;

    row.classList.add('count-price-add');
    countInput.placeholder = `輸入新的${config.label}`;

    const priceInput = document.createElement('input');
    priceInput.type = 'text';
    priceInput.inputMode = 'numeric';
    priceInput.pattern = '[0-9]*';
    priceInput.className = 'price-input';
    priceInput.id = `${key}PriceInput`;
    priceInput.placeholder = '輸入價格';
    row.insertBefore(priceInput, button);

    [countInput, priceInput].forEach(input => {
      input.addEventListener('input', () => {
        input.value = input.value.replace(/[^0-9]/g, '');
      });
    });

    const add = () => {
      const count = countInput.value.trim();
      const price = normalizePrice(priceInput.value);
      if (!/^\d+$/.test(count) || price == null) return;
      if ((settings[key] || []).some(item => String(item) === count)) {
        countInput.focus();
        return;
      }

      settings[key].push(count);
      settings.lashCountPrices[config.side][count] = price;
      saveSettings();
      countInput.value = '';
      priceInput.value = '';
      renderCountList(key);
      countInput.focus();
    };

    // settings.js 已綁定舊版新增事件，使用 capture 先攔截這兩張卡，改走「本數＋價格」流程。
    button.addEventListener('click', event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      add();
    }, true);

    [countInput, priceInput].forEach(input => {
      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter') return;
        event.preventDefault();
        event.stopImmediatePropagation();
        add();
      }, true);
    });
  }

  Object.keys(configs).forEach(key => {
    upgradeAddRow(key);
    renderCountList(key);
  });
})();
