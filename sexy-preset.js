(()=>{
  /*
    性感型專用調整：
    - 左右眼固定 2 個範圍
    - 左眼分隔線在左側 1/3
    - 右眼分隔線在右側 1/3（即由左算 2/3）
    - 性感型隱藏刪除與新增區域按鈕
    其他預設型不受影響。
  */
  const originalDrawEye = drawEye;

  drawEye = function(side, segments){
    originalDrawEye(side, segments);

    if(selectedStyle !== 'sexy' || segments.length !== 2) return;

    const svg = document.querySelector(`#${side}EyeSvg svg`);
    if(!svg) return;

    const left = 30;
    const right = 470;
    const width = right - left;
    const splitRatio = side === 'left' ? 1 / 3 : 2 / 3;
    const splitX = left + width * splitRatio;

    const divider = svg.querySelector('.divider');
    if(divider){
      divider.setAttribute('x1', splitX);
      divider.setAttribute('x2', splitX);
    }

    // 讓兩個範圍的文字也跟著實際區域置中，而不是仍以 1/2 等分顯示。
    const centers = [
      left + (splitX - left) / 2,
      splitX + (right - splitX) / 2
    ];

    svg.querySelectorAll('.label').forEach((el, index)=>{
      if(centers[index] !== undefined) el.setAttribute('x', centers[index]);
    });
    svg.querySelectorAll('.length').forEach((el, index)=>{
      if(centers[index] !== undefined) el.setAttribute('x', centers[index]);
    });
  };

  function updateSexyControls(){
    const isSexy = selectedStyle === 'sexy';

    document.querySelectorAll('#leftSegments .remove, #rightSegments .remove')
      .forEach(button => button.hidden = isSexy);

    const addLeft = document.getElementById('addLeft');
    const addRight = document.getElementById('addRight');
    if(addLeft) addLeft.hidden = isSexy;
    if(addRight) addRight.hidden = isSexy;
  }

  const sexyButton = document.querySelector('.preset[data-style="sexy"]');
  if(sexyButton){
    sexyButton.addEventListener('click', ()=>{
      // 原本預設事件執行後，只針對性感型改為固定兩區。
      leftSegments = createDefaultSegments(2);
      rightSegments = createDefaultSegments(2);
      renderAll();
      updateSexyControls();
    });
  }

  // 切換到其他款式時，恢復原本可新增／刪除的 UI。
  document.querySelectorAll('.preset:not([data-style="sexy"])').forEach(button=>{
    button.addEventListener('click', updateSexyControls);
  });
})();