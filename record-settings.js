// 將「設定」頁儲存的項目串接到美睫紀錄表。
const RECORD_SETTINGS_KEY = 'lashRecordSettings';
const RECORD_SETTINGS_DEFAULTS = {
  lashStyles: ['可愛型', '性感型', '華麗型', '無辜型'],
  lashTypes: ['YY 毛', '山茶花', '扁毛'],
  curls: ['J', 'B', 'C', 'CC', 'D'],
  lengths: ['8 mm', '9 mm', '10 mm', '11 mm', '12 mm', '13 mm']
};

function loadRecordSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(RECORD_SETTINGS_KEY));
    return saved ? { ...RECORD_SETTINGS_DEFAULTS, ...saved } : { ...RECORD_SETTINGS_DEFAULTS };
  } catch {
    return { ...RECORD_SETTINGS_DEFAULTS };
  }
}

const recordSettings = loadRecordSettings();

function replaceInputWithSelect(id, items) {
  const oldInput = document.getElementById(id);
  if (!oldInput) return;

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
}

// 接睫樣式、睫毛種類改成設定頁控制的下拉選單。
replaceInputWithSelect('lashStyleText', recordSettings.lashStyles || []);
replaceInputWithSelect('lashType', recordSettings.lashTypes || []);

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
