const STORAGE_KEY = 'lashRecordSettings';

const defaultSettings = {
  lashStyles: ['可愛型', '性感型', '華麗型', '無辜型'],
  lashTypes: ['YY 毛', '山茶花', '扁毛'],
  curls: ['J', 'B', 'C', 'CC', 'D'],
  lengths: ['8 mm', '9 mm', '10 mm', '11 mm', '12 mm', '13 mm']
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

    row.style.top = `${event.clientY - pointerOffsetY}px`;

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
  };

  const endDrag = event => {
    if (!dragging) return;
    dragging = false;

    if (handle.hasPointerCapture?.(event.pointerId)) {
      handle.releasePointerCapture(event.pointerId);
    }

    row.classList.remove('dragging');
    row.removeAttribute('style');

    if (placeholder?.parentNode) {
      placeholder.parentNode.insertBefore(row, placeholder);
      placeholder.remove();
    }

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
    row.style.position = 'fixed';
    row.style.left = `${startRect.left}px`;
    row.style.top = `${startRect.top}px`;
    row.style.width = `${startRect.width}px`;
    row.style.height = `${startRect.height}px`;
    row.style.margin = '0';
    row.style.zIndex = '9999';
    row.style.pointerEvents = 'none';

    document.body.appendChild(row);
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
