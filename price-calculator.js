// 依上／下睫毛本數自動帶入建議金額，金額欄位仍可人工修改。
(() => {
  const STANDARD_UPPER = ['80', '100', '120', '140'];
  const LEGACY_UPPER = ['80', '90', '100', '110', '120', '130', '140'];
  const DEFAULT_PRICES = {
    upper: { '80': 1000, '100': 1150, '120': 1300, '140': 1450 },
    lower: { '20': 200, '30': 300 }
  };

  const upperSelect = document.getElementById('upperLashCount');
  const lowerToggle = document.getElementById('lowerLashToggle');
  const lowerSelect = document.getElementById('lowerLashCount');
  const amountInput = document.getElementById('amount');
  if (!upperSelect || !amountInput) return;

  function loadPrices() {
    try {
      const saved = JSON.parse(localStorage.getItem('lashRecordSettings')) || {};
      return {
        upper: { ...DEFAULT_PRICES.upper, ...((saved.lashCountPrices || {}).upper || {}) },
        lower: { ...DEFAULT_PRICES.lower, ...((saved.lashCountPrices || {}).lower || {}) }
      };
    } catch {
      return DEFAULT_PRICES;
    }
  }

  function normalizeLegacyUpperOptions() {
    const current = Array.from(upperSelect.options).map(option => option.value).filter(Boolean);
    if (JSON.stringify(current) !== JSON.stringify(LEGACY_UPPER)) return;

    upperSelect.innerHTML = '';
    STANDARD_UPPER.forEach(value => {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = `${value} 本`;
      upperSelect.appendChild(option);
    });
  }

  function relabelOptions() {
    Array.from(upperSelect.options).forEach(option => {
      if (option.value) option.textContent = `${option.value} 本`;
    });
    if (lowerSelect) {
      Array.from(lowerSelect.options).forEach(option => {
        if (option.value) option.textContent = `${option.value} 本`;
      });
    }
  }

  function calculateSuggestedAmount() {
    const prices = loadPrices();
    const upperPrice = Number(prices.upper[String(upperSelect.value)]) || 0;
    const lowerPrice = lowerToggle?.checked && lowerSelect
      ? (Number(prices.lower[String(lowerSelect.value)]) || 0)
      : 0;
    return upperPrice + lowerPrice;
  }

  function applySuggestedAmount() {
    amountInput.value = String(calculateSuggestedAmount());
  }

  normalizeLegacyUpperOptions();
  relabelOptions();
  applySuggestedAmount();

  upperSelect.addEventListener('change', applySuggestedAmount);
  lowerToggle?.addEventListener('change', applySuggestedAmount);
  lowerSelect?.addEventListener('change', applySuggestedAmount);
})();
