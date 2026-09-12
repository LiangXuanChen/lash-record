// 將「設定」頁儲存的項目串接到美睫紀錄表。
const RECORD_SETTINGS_KEY = 'lashRecordSettings';
const RECORD_SETTINGS_DEFAULTS = {
  lashStyles: ['性感型', '無辜型', '華麗型', '可愛型'],
  lashTypes: ['松風', '赫本', '芭比'],
  lashColors: {
    '松風': ['matte black', 'herbal brown', 'ice mauve', 'sodalite', 'mode khaki', 'sand beige', 'ecru', 'ice white'],
    '赫本': ['black', 'dark mocha', 'leaf', 'ash blue'],
    '芭比': ['black', 'dark mocha']
  },
  curls: ['J', 'JC', 'C', 'SC', 'CC', 'L', 'LD'],
  lengths: ['7 mm', '8 mm', '9 mm', '11 mm', '10 mm', '12 mm', '13 mm'],
  upperLashCounts: ['80', '90', '100', '110', '120', '130', '140'],
  lowerLashCounts: ['20', '30']
};

function loadRecordSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECORD_SETTINGS_KEY));
    if (!saved) return JSON.parse(JSON.stringify(RECORD_SETTINGS_DEFAULTS));

    return {
      ...RECORD_SETTINGS_DEFAULTS,
      ...saved,
      lashColors: {
        ...RECORD_SETTINGS_DEFAULTS.lashColors,
        ...(saved.lashColors || {})
      }
    };
  } catch {
    return JSON.parse(JSON.stringify(RECORD_SETTINGS_DEFAULTS));
  }
}

const recordSettings = loadRecordSettings();

function replaceInputWithSelect(id, items) {
  const oldInput = document.getElementById(id);
  if (!oldInput) return null;

  const select = document.createElement('select');
  select.id = id;
  select.name = id;

  if (!items.length) {
    const option = document.createElement('option');
    option.value = '';
    option.textContent = '尚未設定選項';
    select.appendChild(option);
  } else {
    items.forEach(item => {
      const option = document.createElement('option');
      option.value = item;
      option.textContent = item;
      select.appendChild(option);
    });
  }

  oldInput.replaceWith(select);
  return select;
}

// 接睫樣式、睫毛種類改成設定頁控制的下拉選單。
replaceInputWithSelect('lashStyleText', recordSettings.lashStyles || []);
const lashTypeSelect = replaceInputWithSelect('lashType', recordSettings.lashTypes || []);

// 睫毛顏色依照睫毛種類連動。
const lashColorSelect = document.getElementById('lashColor');

function renderLashColorOptions(lashType) {
  if (!lashColorSelect) return;

  lashColorSelect.innerHTML = '';

  const nullOption = document.createElement('option');
  nullOption.value = '';
  nullOption.textContent = '請選擇顏色';
  nullOption.selected = true;
  lashColorSelect.appendChild(nullOption);

  const colors = (recordSettings.lashColors && recordSettings.lashColors[lashType]) || [];
  colors.forEach(color => {
    const option = document.createElement('option');
    option.value = color;
    option.textContent = color;
    lashColorSelect.appendChild(option);
  });

  // 每次重新帶入顏色時，都重置成 null 選項。
  lashColorSelect.value = '';
}

if (lashTypeSelect && lashColorSelect) {
  renderLashColorOptions(lashTypeSelect.value);

  lashTypeSelect.addEventListener('change', () => {
    renderLashColorOptions(lashTypeSelect.value);
  });
}

// 左右眼的捲度與長度改讀設定頁資料。
const configuredCurls = (recordSettings.curls || []).filter(Boolean);
const configuredLengths = (recordSettings.lengths || [])
  .map(value => Number.parseFloat(String(value)))
  .filter(value => Number.isFinite(value));

if (configuredCurls.length) {
  curlOptions.splice(0, curlOptions.length, ...configuredCurls);
}
if (configuredLengths.length) {
  lengthOptions.splice(0, lengthOptions.length, ...configuredLengths);
}

function firstCurl() {
  return curlOptions.length ? curlOptions[0] : '';
}

function firstLength() {
  return lengthOptions.length ? lengthOptions[0] : 0;
}

function setSegmentsToFirstOption(segments) {
  segments.forEach(segment => {
    segment.curl = firstCurl();
    segment.length = firstLength();
  });
}

// 初次開啟紀錄表時也使用設定中的第一個捲度、第一個長度。
setSegmentsToFirstOption(leftSegments);
setSegmentsToFirstOption(rightSegments);
renderAll();

// 款式預設本身暫時維持原本四種與區域數量；
// 點擊款式預設後，每個區域只帶入「設定」中的第一個捲度與第一個長度。
document.querySelectorAll('.preset').forEach(button => {
  button.addEventListener('click', () => {
    setSegmentsToFirstOption(leftSegments);
    setSegmentsToFirstOption(rightSegments);
    renderAll();
  });
});

// 手動新增區域時，同樣使用第一個選項，避免回到原本寫死的 C / 9mm。
document.getElementById('addLeft')?.addEventListener('click', () => {
  const segment = leftSegments[leftSegments.length - 1];
  if (segment) {
    segment.curl = firstCurl();
    segment.length = firstLength();
    renderEye('left', leftSegments);
  }
});

document.getElementById('addRight')?.addEventListener('click', () => {
  const segment = rightSegments[rightSegments.length - 1];
  if (segment) {
    segment.curl = firstCurl();
    segment.length = firstLength();
    renderEye('right', rightSegments);
  }
});

// 現有測試儲存輸出補上睫毛顏色，不改動原本 script.js 的儲存流程。
document.getElementById('save')?.addEventListener('click', () => {
  const output = document.getElementById('output');
  if (!output) return;

  try {
    const data = JSON.parse(output.textContent || '{}');
    data.lashColor = lashColorSelect ? lashColorSelect.value : '';
    output.textContent = JSON.stringify(data, null, 2);
  } catch {
    // 原本輸出若不是 JSON，就不額外處理。
  }
});
