// 下睫毛種類與顏色設定。沿用 lashRecordSettings，未來可直接映射到資料庫主檔。
(() => {
  const STORAGE_KEY = 'lashRecordSettings';
  const DEFAULT_TYPES = ['M'];
  const DEFAULT_COLORS = { M: ['黑色', '棕色'] };
  const expanded = new Set();

  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};
      if (!Array.isArray(data.lowerLashTypes)) data.lowerLashTypes = [...DEFAULT_TYPES];
      data.lowerLashColors = { ...DEFAULT_COLORS, ...(data.lowerLashColors || {}) };
      data.lowerLashTypes.forEach(type => { if (!Array.isArray(data.lowerLashColors[type])) data.lowerLashColors[type] = []; });
      return data;
    } catch {
      return { lowerLashTypes: [...DEFAULT_TYPES], lowerLashColors: JSON.parse(JSON.stringify(DEFAULT_COLORS)) };
    }
  }

  let data = load();
  function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }

  // 第一次載入即寫回，讓其他頁面也能取得下睫毛種類與顏色。
  save();

  function render() {
    const list = document.getElementById('lowerLashTypesList');
    if (!list) return;
    list.innerHTML = '';

    if (!data.lowerLashTypes.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.textContent = '目前尚未設定項目';
      list.appendChild(empty);
      return;
    }

    data.lowerLashTypes.forEach((type, index) => {
      const row = document.createElement('div');
      row.className = 'setting-item lash-type-item';

      const top = document.createElement('div');
      top.className = 'lash-type-top';

      const spacer = document.createElement('span');
      spacer.className = 'drag-handle';
      spacer.innerHTML = '<span aria-hidden="true">⋮⋮</span>';

      const nameWrap = document.createElement('div');
      nameWrap.className = 'lash-type-name-wrap';
      const name = document.createElement('div');
      name.className = 'item-name';
      name.textContent = type;
      const toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'color-toggle';
      toggle.setAttribute('aria-expanded', expanded.has(type) ? 'true' : 'false');
      toggle.innerHTML = '<span class="toggle-arrow" aria-hidden="true">⌄</span>';
      nameWrap.append(name, toggle);

      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'delete-btn';
      remove.textContent = '刪除';
      remove.addEventListener('click', () => {
        data.lowerLashTypes.splice(index, 1);
        delete data.lowerLashColors[type];
        expanded.delete(type);
        save();
        render();
      });
      top.append(spacer, nameWrap, remove);

      const colors = data.lowerLashColors[type] || [];
      const colorArea = document.createElement('div');
      colorArea.className = 'color-area';
      colorArea.hidden = !expanded.has(type);
      const title = document.createElement('div');
      title.className = 'color-title';
      title.textContent = `顏色（${colors.length}）`;
      const colorList = document.createElement('div');
      colorList.className = 'color-list';

      colors.forEach((color, colorIndex) => {
        const chip = document.createElement('div');
        chip.className = 'color-chip';
        const text = document.createElement('span');
        text.textContent = color;
        const del = document.createElement('button');
        del.type = 'button';
        del.textContent = '×';
        del.addEventListener('click', () => {
          data.lowerLashColors[type].splice(colorIndex, 1);
          expanded.add(type);
          save();
          render();
        });
        chip.append(text, del);
        colorList.appendChild(chip);
      });

      const add = document.createElement('div');
      add.className = 'color-add';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = '輸入新的顏色';
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = '＋ 新增顏色';
      const addColor = () => {
        const value = input.value.trim();
        if (!value || colors.some(x => x.toLowerCase() === value.toLowerCase())) return;
        data.lowerLashColors[type].push(value);
        expanded.add(type);
        save();
        render();
      };
      button.addEventListener('click', addColor);
      input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addColor(); } });
      add.append(input, button);
      colorArea.append(title, colorList, add);

      toggle.addEventListener('click', () => {
        expanded.has(type) ? expanded.delete(type) : expanded.add(type);
        render();
      });

      row.append(top, colorArea);
      list.appendChild(row);
    });
  }

  function addType() {
    const input = document.getElementById('lowerLashTypesInput');
    const value = input?.value.trim();
    if (!value || data.lowerLashTypes.some(x => x.toLowerCase() === value.toLowerCase())) return;
    data.lowerLashTypes.push(value);
    data.lowerLashColors[value] = [];
    save();
    input.value = '';
    render();
    input.focus();
  }

  document.getElementById('addLowerLashType')?.addEventListener('click', addType);
  document.getElementById('lowerLashTypesInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); addType(); }
  });
  render();
})();