// Dashboard 目前先使用 Prototype 假資料；這裡處理首頁日期與新增紀錄入口。
const todayDate = document.getElementById('todayDate');

if (todayDate) {
  const today = new Date();
  const rocYear = today.getFullYear() - 1911;
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  todayDate.textContent = `民國 ${rocYear} 年 ${month} 月 ${day} 日`;
}

// Dashboard 上「沒有指定顧客」的紀錄入口，先進入顧客選擇頁。
// 今日預約中的「本次施作 / 開始服務」已經知道顧客，因此保留直接進紀錄表的流程。
const quickRecordLink = document.querySelector('.quick-actions a[href="record-form.html"]');
if (quickRecordLink) quickRecordLink.href = 'select-customer.html';

const sideRecordLink = document.querySelector('.sidebar .nav a[href="record-form.html"]');
if (sideRecordLink) sideRecordLink.href = 'select-customer.html';

const mobileRecordLink = document.querySelector('.mobile-nav a[href="record-form.html"]');
if (mobileRecordLink) mobileRecordLink.href = 'select-customer.html';
