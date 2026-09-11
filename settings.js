const STORAGE_KEY = 'lashRecordSettings';

const defaultSettings = {
  lashStyles: ['性感型', '無辜型', '華麗型', '可愛型'],
  lashTypes: ['松風', '赫本', '芭比'],
  curls: ['J', 'JC', 'C', 'SC', 'CC', 'L', 'LD'],
  lengths: ['7 mm', '8 mm', '9 mm', '11 mm', '10 mm', '12 mm', '13 mm']
};

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved ? { ...defaultSettings, ...saved } : { ...defaultSettings };
  } catch {
    return { ...defaultSettings };
  }
}

let settings = loadSettings();

function saveSettings() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function saveOrderFromDom(key) {
  const list = document.getElementById(`${key}List`);
  if (!list) return;

  settings[key] = Array.from(list.querySelectorAll('.setting-item'))
    .map(row => row.dataset.value);

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

    const siblings = Array.from(list.querySelectorAll('.setting-item:not(.dragging)'));
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

    // 拖曳列始終留在原本的 item-list 中，避免脫離 Grid 後寬度／位置跑版。
    row.style.left = `${listRect.left - startRect.left}px`;
  };

  const endDrag = event => {
    if (!dragging) return;
    dragging = false;

    if (handle.hasPointerCapture?.(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }

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

    // 不再把 row append 到 body，讓它保留在原本設定清單的排版環境中。
    handle.setPointerCapture?.(event.pointerId);

    document.addEventListener('pointermove', moveRow, { passive: false });
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', endDrag);
  });
}

function renderList(key) {
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

    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'drag-handle';
    handle.setAttribute('aria-label', `拖曳排序 ${item}`);
    handle.title = '拖曳排序';
    handle.innerHTML = '<span aria-hidden="true">⋮⋮</span>';

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

  if (key === 'lengths' && /^\d+(\.\d+)?$/.test(value)) {
    value = `${value} mm`;
  }

  if (settings[key].some(item => item.toLowerCase() === value.toLowerCase())) {
    input.focus();
    return;
  }

  settings[key].push(value);
  saveSettings();
  input.value = '';
  renderList(key);
  input.focus();
}

Object.keys(defaultSettings).forEach(renderList);

document.querySelectorAll('[data-add]').forEach(button => {
  button.addEventListener('click', () => addItem(button.dataset.add));
});

document.querySelectorAll('.add-row input').forEach(input => {
  input.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    const key = input.id.replace('Input', '');
    addItem(key);
  });
});
