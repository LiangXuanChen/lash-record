(()=>{
  function initBirthdayCalendar(){
    const display=document.getElementById('birthdayDisplay');
    const button=document.getElementById('birthdayButton');
    const calendar=document.getElementById('birthdayCalendar');
    const title=document.getElementById('calendarTitle');
    const days=document.getElementById('calendarDays');
    const prev=document.getElementById('prevMonth');
    const next=document.getElementById('nextMonth');
    const today=document.getElementById('todayButton');
    const head=calendar?.querySelector('.cal-head');
    if(!display||!button||!calendar||!title||!days||!prev||!next||!today||!head)return;

    let selectedDate=null;
    let viewDate=new Date();

    const parseRocDate=value=>{
      const m=(value||'').match(/^(\d{1,3})\/(\d{1,2})\/(\d{1,2})$/);
      if(!m)return null;
      const d=new Date(Number(m[1])+1911,Number(m[2])-1,Number(m[3]));
      return Number.isNaN(d.getTime())?null:d;
    };

    const existing=parseRocDate(display.value);
    if(existing){selectedDate=existing;viewDate=new Date(existing);}

    let yearSelect=document.getElementById('birthdayRocYear');
    if(!yearSelect){
      yearSelect=document.createElement('select');
      yearSelect.id='birthdayRocYear';
      yearSelect.setAttribute('aria-label','選擇民國年');
      yearSelect.style.cssText='height:34px;border:1px solid var(--line);border-radius:8px;background:#fff;color:var(--text);padding:0 8px;font-family:inherit;font-size:13px;font-weight:700;outline:none;';
      head.insertBefore(yearSelect,title);
    }

    const currentRocYear=new Date().getFullYear()-1911;
    yearSelect.innerHTML='';
    for(let rocYear=currentRocYear;rocYear>=1;rocYear--){
      const option=document.createElement('option');
      option.value=String(rocYear);
      option.textContent=`民國 ${rocYear} 年`;
      yearSelect.appendChild(option);
    }

    const roc=d=>`${d.getFullYear()-1911}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;

    function render(){
      const y=viewDate.getFullYear();
      const m=viewDate.getMonth();
      yearSelect.value=String(y-1911);
      title.textContent=`${String(m+1).padStart(2,'0')} 月`;
      days.innerHTML='';
      const first=new Date(y,m,1).getDay();
      const count=new Date(y,m+1,0).getDate();
      for(let i=0;i<first;i++){
        const blank=document.createElement('button');
        blank.type='button';
        blank.className='day blank';
        days.appendChild(blank);
      }
      for(let day=1;day<=count;day++){
        const cell=document.createElement('button');
        cell.type='button';
        cell.className='day';
        cell.textContent=String(day);
        if(selectedDate&&selectedDate.getFullYear()===y&&selectedDate.getMonth()===m&&selectedDate.getDate()===day){
          cell.classList.add('selected');
        }
        cell.onclick=()=>{
          selectedDate=new Date(y,m,day);
          display.value=roc(selectedDate);
          display.dataset.iso=`${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
          calendar.hidden=true;
          render();
        };
        days.appendChild(cell);
      }
    }

    function toggleCalendar(event){
      event?.stopPropagation();
      calendar.hidden=!calendar.hidden;
      if(!calendar.hidden){
        if(selectedDate)viewDate=new Date(selectedDate);
        render();
      }
    }

    button.onclick=toggleCalendar;
    display.onclick=toggleCalendar;
    prev.onclick=event=>{event.stopPropagation();viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()-1,1);render();};
    next.onclick=event=>{event.stopPropagation();viewDate=new Date(viewDate.getFullYear(),viewDate.getMonth()+1,1);render();};
    yearSelect.onchange=event=>{event.stopPropagation();viewDate=new Date(Number(yearSelect.value)+1911,viewDate.getMonth(),1);render();};
    today.onclick=event=>{
      event.stopPropagation();
      selectedDate=new Date();
      viewDate=new Date();
      display.value=roc(selectedDate);
      display.dataset.iso=`${selectedDate.getFullYear()}-${String(selectedDate.getMonth()+1).padStart(2,'0')}-${String(selectedDate.getDate()).padStart(2,'0')}`;
      calendar.hidden=true;
      render();
    };
    calendar.addEventListener('click',event=>event.stopPropagation());
    document.addEventListener('click',event=>{if(!event.target.closest('.roc-date-wrap'))calendar.hidden=true;});
    render();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',initBirthdayCalendar,{once:true});
  else initBirthdayCalendar();
})();