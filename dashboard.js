const defaultCustomers = [
  { id: 1, name: "王小美", phone: "0912-345-678", lastVisit: "115/09/08" },
  { id: 2, name: "陳佳佳", phone: "0933-120-886", lastVisit: "115/09/03" },
  { id: 3, name: "林安安", phone: "0988-521-307", lastVisit: "115/08/29" }
];

function getCustomers(){
  const saved = JSON.parse(localStorage.getItem("lashCustomers") || "[]");
  const map = new Map(defaultCustomers.map(x => [x.name + x.phone, x]));
  saved.forEach(x => map.set((x.name || "") + (x.phone || ""), x));
  return [...map.values()];
}

function renderCustomers(keyword = ""){
  const list = document.getElementById("customerList");
  const customers = getCustomers().filter(x => `${x.name} ${x.phone}`.includes(keyword.trim()));
  document.getElementById("customerCount").textContent = getCustomers().length;

  if(!customers.length){
    list.innerHTML = '<div class="empty">找不到符合的顧客。</div>';
    return;
  }

  list.innerHTML = customers.map(customer => {
    const name = encodeURIComponent(customer.name || "未命名顧客");
    return `
      <div class="customer-item">
        <div class="customer-main">
          <strong>${customer.name || "未命名顧客"}</strong>
          <span>${customer.phone || "未填電話"} ・ 最近來店 ${customer.lastVisit || "尚無紀錄"}</span>
        </div>
        <div class="customer-actions">
          <a class="ghost-btn" href="customer-form.html?name=${name}">顧客資料</a>
          <a class="record-btn" href="record-form.html?name=${name}">美睫紀錄</a>
        </div>
      </div>`;
  }).join("");
}

document.getElementById("customerSearch").addEventListener("input", e => renderCustomers(e.target.value));
renderCustomers();
