const STORAGE_KEY = 'lashRecordSettings';

const defaultSettings = {
  lashStyles: ['性感型', '無辜型', '華麗型', '可愛型'],
  lashTypes: ['松風', '赫本', '芭比'],
  lashColors: {
    '松風': ['matte black', 'herbal brown', 'ice mauve', 'sodalite', 'mode khaki', 'sand beige', 'ecru', 'ice white'],
    '赫本': ['black', 'dark mocha', 'leaf', 'ash blue'],
    '芭比': ['black', 'dark mocha']
  },
  curls: ['J', 'JC', 'C', 'SC', 'CC', 'L', 'LD'],
  lengths: ['7 mm', '8 mm', '9 mm', '11 mm', '10 mm', '12 mm', '13 mm']
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return structuredClone(defaultSettings);
    return {
      ...defaultSettings,
      ...saved,
      lashColors: { ...defaultSettings.lashColors, ...(saved.lashColors || {}) }
    };
  } catch {
    return structuredClone(defaultSettings);
  }
}

let settings = loadSettings();

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function saveOrderFromDom(key) {
  const list = document.getElementById(`${key}List`);
  if (!list) return;
  settings[key] = Array.from(list.querySelectorAll(':scope > .setting-item')).map(row => row.dataset.value);
  saveSettings();
}

function enablePhysicalDrag(row, handle, list, key) {
  let placeholder = null;
  let startRect = null;
  let pointerOffsetY = 0;
  let dragging = false;

  const moveRow = event => {
    if (!dragging) return;
    event.preventDefault();
    const targetTop = event.clientY - pointerOffsetY;
    const listRect = list.getBoundingClientRect();
    row.style.transform = `translateY(${targetTop - startRect.top}px)`;
    const siblings = Array.from(list.querySelectorAll(':scope > .setting-item:not(.dragging)'));
    let inserted = false;
    for (const sibling of siblings) {
      const rect = sibling.getBoundingClientRect();
      if (event.clientY < rect.top + rect.height / 2) {
        list.insertBefore(placeholder, sibling);
        inserted = true;
        break;
      }
    }
    if (!inserted) list.appendChild(placeholder);
    row.style.left = `${listRect.left - startRect.left}px`;
  };

  const endDrag = event => {
    if (!dragging) return;
    dragging = false;
    if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    if (placeholder?.parentNode) {
      placeholder.parentNode.insertBefore(row, placeholder);
      placeholder.remove();
    }
    row.classList.remove('dragging');
    row.removeAttribute('style');
    saveOrderFromDom(key);
    document.removeEventListener('pointermove', moveRow, { passive: false });
    document.removeEventListener('pointerup', endDrag);
    document.removeEventListener('pointercancel', endDrag);
  };

  handle.addEventListener('pointerdown', event => {
    if (event.button !== undefined && event.button !== 0) return;
    event.preventDefault();
    startRect = row.getBoundingClientRect();
    pointerOffsetY = event.clientY - startRect.top;
    dragging = true;
    placeholder = document.createElement('div');
    placeholder.className = 'drag-placeholder';
    placeholder.style.height = `${startRect.height}px`;
    list.insertBefore(placeholder, row);
    row.classList.add('dragging');
    row.style.position = 'absolute';
    row.style.left = '0';
    row.style.top = `${startRect.top - list.getBoundingClientRect().top}px`;
    row.style.width = '100%';
    row.style.height = `${startRect.height}px`;
    row.style.margin = '0';
    row.style.zIndex = '20';
    row.style.pointerEvents = 'none';
    handle.setPointerCapture?.(event.pointerId);
    document.addEventListener('pointermove', moveRow, { passive: false });
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
  });
}

function makeDragHandle(item) {
  const handle = document.createElement('button');
  handle.type = 'button';
  handle.className = 'drag-handle';
  handle.setAttribute('aria-label', `拖曳排序 ${item}`);
  handle.title = '拖曳排序';
  handle.innerHTML = '<span aria-hidden="true">⋮⋮</span>';
  return handle;
}

function renderLashTypeList() {
  const list = document.getElementById('lashTypesList');
  if (!list) return;
  list.innerHTML = '';

  settings.lashTypes.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'setting-item lash-type-item';
    row.dataset.value = item;

    const top = document.createElement('div');
    top.className = 'lash-type-top';
    const handle = makeDragHandle(item);
    const name = document.createElement('div');
    name.className = 'item-name';
    name.textContent = item;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-btn';
    remove.textContent = '刪除';
    remove.addEventListener('click', () => {
      settings.lashTypes.splice(index, 1);
      delete settings.lashColors[item];
      saveSettings();
      renderLashTypeList();
    });
    top.append(handle, name, remove);

    const colorArea = document.createElement('div');
    colorArea.className = 'color-area';
    const colorTitle = document.createElement('div');
    colorTitle.className = 'color-title';
    colorTitle.textContent = '顏色';
    const colorList = document.createElement('div');
    colorList.className = 'color-list';
    const colors = settings.lashColors[item] || [];
    colors.forEach((color, colorIndex) => {
      const chip = document.createElement('div');
      chip.className = 'color-chip';
      const colorName = document.createElement('span');
      colorName.textContent = color;
      const colorDelete = document.createElement('button');
      colorDelete.type = 'button';
      colorDelete.textContent = '×';
      colorDelete.setAttribute('aria-label', `刪除 ${color}`);
      colorDelete.addEventListener('click', () => {
        settings.lashColors[item].splice(colorIndex, 1);
        saveSettings();
        renderLashTypeList();
      });
      chip.append(colorName, colorDelete);
      colorList.appendChild(chip);
    });

    const colorAdd = document.createElement('div');
    colorAdd.className = 'color-add';
    const colorInput = document.createElement('input');
    colorInput.type = 'text';
    colorInput.placeholder = '輸入新的顏色';
    const colorButton = document.createElement('button');
    colorButton.type = 'button';
    colorButton.textContent = '＋ 新增顏色';
    const addColor = () => {
      const value = colorInput.value.trim();
      if (!value) return;
      settings.lashColors[item] ||= [];
      if (settings.lashColors[item].some(c => c.toLowerCase() === value.toLowerCase())) return;
      settings.lashColors[item].push(value);
      saveSettings();
      renderLashTypeList();
    };
    colorButton.addEventListener('click', addColor);
    colorInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') { event.preventDefault(); addColor(); }
    });
    colorAdd.append(colorInput, colorButton);
    colorArea.append(colorTitle, colorList, colorAdd);
    row.append(top, colorArea);
    list.appendChild(row);
    enablePhysicalDrag(row, handle, list, 'lashTypes');
  });
}

function renderList(key) {
  if (key === 'lashTypes') { renderLashTypeList(); return; }
  const list = document.getElementById(`${key}List`);
  if (!list) return;
  const items = settings[key] || [];
  list.innerHTML = '';
  if (!items.length) {
    const empty = document.createElement('div');
    empty.className = 'empty';
    empty.textContent = '目前尚未設定項目';
    list.appendChild(empty);
    return;
  }
  items.forEach((item, index) => {
    const row = document.createElement('div');
    row.className = 'setting-item';
    row.dataset.value = item;
    const handle = makeDragHandle(item);
    const name = document.createElement('div');
    name.className = 'item-name';
    name.textContent = item;
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'delete-btn';
    remove.textContent = '刪除';
    remove.addEventListener('click', () => {
      settings[key].splice(index, 1);
      saveSettings();
      renderList(key);
    });
    enablePhysicalDrag(row, handle, list, key);
    row.append(handle, name, remove);
    list.appendChild(row);
  });
}

function addItem(key) {
  const input = document.getElementById(`${key}Input`);
  if (!input) return;
  let value = input.value.trim();
  if (!value) return;
  if (key === 'lengths' && /^\d+(\.\d+)?$/.test(value)) value = `${value} mm`;
  if (settings[key].some(item => item.toLowerCase() === value.toLowerCase())) { input.focus(); return; }
  settings[key].push(value);
  if (key === 'lashTypes') settings.lashColors[value] = [];
  saveSettings();
  input.value = '';
  renderList(key);
  input.focus();
}

['lashStyles', 'lashTypes', 'curls', 'lengths'].forEach(renderList);

document.querySelectorAll('[data-add]').forEach(button => {
  button.addEventListener('click', () => addItem(button.dataset.add));
});

document.querySelectorAll('.add-row input').forEach(input => {
  input.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    addItem(input.id.replace('Input', ''));
  });
});
