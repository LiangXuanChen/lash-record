// 依上／下睫毛本數自動帶入建議金額，金額欄位仍可人工修改。
(() => {
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

  relabelOptions();
  applySuggestedAmount();

  upperSelect.addEventListener('change', applySuggestedAmount);
  lowerToggle?.addEventListener('change', applySuggestedAmount);
  lowerSelect?.addEventListener('change', applySuggestedAmount);
})();
