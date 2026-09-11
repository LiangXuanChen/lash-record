const params = new URLSearchParams(location.search);
const editingName = params.get("name");
const customers = JSON.parse(localStorage.getItem("lashCustomers") || "[]");
const sampleCustomers = [
  { name:"王小美", phone:"0912-345-678" },
  { name:"陳佳佳", phone:"0933-120-886" },
  { name:"林安安", phone:"0988-521-307" }
];

if(editingName){
  const customer = customers.find(x => x.name === editingName) || sampleCustomers.find(x => x.name === editingName);
  if(customer){
    document.getElementById("name").value = customer.name || "";
    document.getElementById("phone").value = customer.phone || "";
    document.getElementById("birthday").value = customer.birthday || "";
    document.getElementById("social").value = customer.social || "";
    document.getElementById("notes").value = customer.notes || "";
    document.getElementById("signature").value = customer.signature || "";
    document.getElementById("signDate").value = customer.signDate || "";
  }
}

const today = new Date();
const yyyy = today.getFullYear();
const mm = String(today.getMonth() + 1).padStart(2,"0");
const dd = String(today.getDate()).padStart(2,"0");
if(!document.getElementById("signDate").value){
  document.getElementById("signDate").value = `${yyyy}-${mm}-${dd}`;
}

document.getElementById("customerForm").addEventListener("submit", e => {
  e.preventDefault();

  const data = {
    id: Date.now(),
    name: document.getElementById("name").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    birthday: document.getElementById("birthday").value,
    social: document.getElementById("social").value.trim(),
    notes: document.getElementById("notes").value.trim(),
    signature: document.getElementById("signature").value.trim(),
    signDate: document.getElementById("signDate").value,
    lastVisit: "尚無紀錄"
  };

  const saved = JSON.parse(localStorage.getItem("lashCustomers") || "[]");
  const index = saved.findIndex(x => x.name === editingName || (x.name === data.name && x.phone === data.phone));
  if(index >= 0){
    data.id = saved[index].id || data.id;
    data.lastVisit = saved[index].lastVisit || data.lastVisit;
    saved[index] = data;
  }else{
    saved.unshift(data);
  }

  localStorage.setItem("lashCustomers", JSON.stringify(saved));
  location.href = `record-form.html?name=${encodeURIComponent(data.name)}`;
});
