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
let draggedRow = null;
let draggedKey = null;
let touchDraggingRow = null;
let touchDraggingKey = null;

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
    row.draggable = true;
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

    row.addEventListener('dragstart', event => {
      draggedRow = row;
      draggedKey = key;
      row.classList.add('dragging');
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', item);
    });

    row.addEventListener('dragend', () => {
      row.classList.remove('dragging');
      document.querySelectorAll('.setting-item.drag-over').forEach(el => el.classList.remove('drag-over'));
      if (draggedKey) saveOrderFromDom(draggedKey);
      draggedRow = null;
      draggedKey = null;
    });

    row.addEventListener('dragover', event => {
      if (!draggedRow || draggedKey !== key || draggedRow === row) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      const rect = row.getBoundingClientRect();
      const insertAfter = event.clientY > rect.top + rect.height / 2;
      list.insertBefore(draggedRow, insertAfter ? row.nextSibling : row);
    });

    handle.addEventListener('pointerdown', event => {
      if (event.pointerType === 'mouse') return;
      event.preventDefault();
      touchDraggingRow = row;
      touchDraggingKey = key;
      row.classList.add('dragging', 'touch-dragging');
      handle.setPointerCapture(event.pointerId);
    });

    handle.addEventListener('pointermove', event => {
      if (!touchDraggingRow || touchDraggingKey !== key) return;
      event.preventDefault();

      const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.setting-item');
      if (!target || target === touchDraggingRow || target.parentElement !== list) return;

      const rect = target.getBoundingClientRect();
      const insertAfter = event.clientY > rect.top + rect.height / 2;
      list.insertBefore(touchDraggingRow, insertAfter ? target.nextSibling : target);
    });

    const finishTouchDrag = event => {
      if (!touchDraggingRow || touchDraggingKey !== key) return;
      if (handle.hasPointerCapture?.(event.pointerId)) handle.releasePointerCapture(event.pointerId);
      touchDraggingRow.classList.remove('dragging', 'touch-dragging');
      saveOrderFromDom(key);
      touchDraggingRow = null;
      touchDraggingKey = null;
    };

    handle.addEventListener('pointerup', finishTouchDrag);
    handle.addEventListener('pointercancel', finishTouchDrag);

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
