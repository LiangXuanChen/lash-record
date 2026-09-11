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

    row.append(name, remove);
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
