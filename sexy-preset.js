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

    // 讓兩個範圍的文字跟著實際區域置中。
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

  function forceHide(button){
    if(!button) return;
    button.hidden = true;
    button.style.setProperty('display', 'none', 'important');
  }

  function restoreButton(button){
    if(!button) return;
    button.hidden = false;
    button.style.removeProperty('display');
  }

  function updateSexyControls(){
    const isSexy = selectedStyle === 'sexy';

    document
      .querySelectorAll('#leftSegments .remove, #rightSegments .remove')
      .forEach(button => {
        if(isSexy) forceHide(button);
        else restoreButton(button);
      });

    const addLeft = document.getElementById('addLeft');
    const addRight = document.getElementById('addRight');

    if(isSexy){
      forceHide(addLeft);
      forceHide(addRight);
    }else{
      restoreButton(addLeft);
      restoreButton(addRight);
    }
  }

  /*
    renderEye 會重新建立每個範圍卡片，因此每次 render 完成後
    都重新套用性感型的按鈕顯示規則。
  */
  const originalRenderEye = renderEye;

  renderEye = function(side, segments){
    originalRenderEye(side, segments);
    updateSexyControls();
  };

  const sexyButton = document.querySelector('.preset[data-style="sexy"]');

  if(sexyButton){
    sexyButton.addEventListener('click', ()=>{
      leftSegments = createDefaultSegments(2);
      rightSegments = createDefaultSegments(2);
      renderAll();
      updateSexyControls();
    });
  }

  document
    .querySelectorAll('.preset:not([data-style="sexy"])')
    .forEach(button => {
      button.addEventListener('click', updateSexyControls);
    });

  /*
    record-settings.js 或其他程式若再次重建區域卡片，
    MutationObserver 會立即再次隱藏性感型的「刪除此區」。
  */
  ['leftSegments', 'rightSegments'].forEach(id => {
    const target = document.getElementById(id);
    if(!target) return;

    new MutationObserver(()=>{
      if(selectedStyle === 'sexy'){
        target.querySelectorAll('.remove').forEach(forceHide);
      }
    }).observe(target, { childList:true, subtree:true });
  });
})();