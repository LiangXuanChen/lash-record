// Dashboard 目前先使用 Prototype 假資料；這裡只處理首頁日期顯示。
const todayDate = document.getElementById('todayDate');

if (todayDate) {
  const today = new Date();
  const rocYear = today.getFullYear() - 1911;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  todayDate.textContent = `民國 ${rocYear} 年 ${month} 月 ${day} 日`;
}
