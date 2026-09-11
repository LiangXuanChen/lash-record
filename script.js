const presets = {
  cute: {
    name: "可愛型",
    segmentCount: 3
  },

  sexy: {
    name: "性感型",
    segmentCount: 3
  },

  glamour: {
    name: "華麗型",
    segmentCount: 2
  },

  innocent: {
    name: "無辜型",
    segmentCount: 4
  }
};


const curlOptions = [
  "J",
  "JC",
  "C",
  "SC",
  "CC"
];


const lengthOptions = [
  7,
  8,
  9,
  10,
  11,
  12,
  13
];


let selectedStyle = "cute";


function createDefaultSegments(count){

  return Array.from(
    {length:count},
    () => ({
      curl:"C",
      length:9
    })
  );

}


/*
  左右眼資料分開。

  未來存 DB 時，
  左眼與右眼的施作區域
  可以分別保存。
*/

let leftSegments =
  createDefaultSegments(
    presets[selectedStyle].segmentCount
  );


let rightSegments =
  createDefaultSegments(
    presets[selectedStyle].segmentCount
  );


function renderAll(){

  renderEye(
    "left",
    leftSegments
  );

  renderEye(
    "right",
    rightSegments
  );

}


function renderEye(
  side,
  segments
){

  const editor =
    document.getElementById(
      side + "Segments"
    );


  /*
    桌機：

    JS 依照目前區域數量
    動態產生欄位。

    平板 / 手機：

    CSS Media Query
    會重新控制欄數。
  */

  editor.style.gridTemplateColumns =
    `repeat(${segments.length}, minmax(0,1fr))`;


  editor.innerHTML = "";


  segments.forEach(
    (seg,index)=>{

      const div =
        document.createElement("div");


      div.className = "segment";


      const curls =
        curlOptions
          .map(
            x =>
              `<option
                value="${x}"
                ${x === seg.curl ? "selected" : ""}
              >
                ${x}
              </option>`
          )
          .join("");


      const lengths =
        lengthOptions
          .map(
            x =>
              `<option
                value="${x}"
                ${x === seg.length ? "selected" : ""}
              >
                ${x} mm
              </option>`
          )
          .join("");


      div.innerHTML = `

        <span class="segment-name">
          範圍 ${index + 1}
        </span>

        <select
          data-kind="curl"
          data-index="${index}"
        >
          ${curls}
        </select>

        <select
          data-kind="length"
          data-index="${index}"
        >
          ${lengths}
        </select>

        <button
          class="remove"
          data-remove="${index}"
        >
          刪除此區
        </button>

      `;


      editor.appendChild(div);

    }
  );


  /*
    睫毛捲度 / 長度
    下拉選單改變
  */

  editor
    .querySelectorAll("select")
    .forEach(
      el => {

        el.addEventListener(
          "change",
          e => {

            const i =
              Number(
                e.target.dataset.index
              );


            if(
              e.target.dataset.kind
              ===
              "curl"
            ){

              segments[i].curl =
                e.target.value;

            }
            else{

              segments[i].length =
                Number(
                  e.target.value
                );

            }


            drawEye(
              side,
              segments
            );

          }
        );

      }
    );


  /*
    刪除施作區域
  */

  editor
    .querySelectorAll(
      "[data-remove]"
    )
    .forEach(
      el => {

        el.addEventListener(
          "click",
          e => {

            if(
              segments.length <= 1
            ){

              alert(
                "至少保留 1 個施作區域。"
              );

              return;

            }


            segments.splice(
              Number(
                e.target.dataset.remove
              ),
              1
            );


            renderEye(
              side,
              segments
            );

          }
        );

      }
    );


  drawEye(
    side,
    segments
  );

}


function drawEye(
  side,
  segments
){

  const n =
    segments.length;


  const left = 30;

  const right = 470;

  const width =
    right - left;

  const baselineY = 120;


  /*
    畫眼型弧線
  */

  let svg = `

    <svg
      viewBox="0 0 500 150"
      aria-label="${
        side === "left"
        ? "左眼"
        : "右眼"
      }施作圖"
    >

      <path
        class="arc"
        d="
          M ${left} ${baselineY}
          Q 250 55
          ${right} ${baselineY}
        "
      />

  `;


  /*
    畫每個施作區域的分隔線
  */

  for(
    let i = 1;
    i < n;
    i++
  ){

    const x =
      left +
      width * i / n;


    svg += `

      <line
        class="divider"
        x1="${x}"
        y1="62"
        x2="${x}"
        y2="${baselineY}"
      />

    `;

  }


  /*
    顯示每個區域的
    捲度與長度
  */

  segments.forEach(
    (seg,i)=>{

      const x =
        left +
        width *
        (i + 0.5) /
        n;


      svg += `

        <text
          class="label"
          x="${x}"
          y="27"
        >
          ${seg.curl}
        </text>


        <text
          class="length"
          x="${x}"
          y="47"
        >
          ${seg.length} mm
        </text>

      `;

    }
  );


  svg += `</svg>`;


  document
    .getElementById(
      side + "EyeSvg"
    )
    .innerHTML = svg;

}


/*
  款式預設
*/

document
  .querySelectorAll(
    ".preset"
  )
  .forEach(
    btn => {

      btn.addEventListener(
        "click",
        ()=>{

          selectedStyle =
            btn.dataset.style;


          const count =
            presets[
              selectedStyle
            ].segmentCount;


          /*
            套用款式時

            左右眼都重新依照
            款式預設建立。

            每區預設：

            捲度 C
            長度 9mm
          */

          leftSegments =
            createDefaultSegments(
              count
            );


          rightSegments =
            createDefaultSegments(
              count
            );


          document
            .querySelectorAll(
              ".preset"
            )
            .forEach(
              x =>
                x.classList.remove(
                  "active"
                )
            );


          btn
            .classList
            .add(
              "active"
            );


          renderAll();

        }
      );

    }
  );


/*
  新增左眼施作區域
*/

document
  .getElementById(
    "addLeft"
  )
  .addEventListener(
    "click",
    ()=>{

      leftSegments.push({
        curl:"C",
        length:9
      });


      renderEye(
        "left",
        leftSegments
      );

    }
  );


/*
  新增右眼施作區域
*/

document
  .getElementById(
    "addRight"
  )
  .addEventListener(
    "click",
    ()=>{

      rightSegments.push({
        curl:"C",
        length:9
      });


      renderEye(
        "right",
        rightSegments
      );

    }
  );


/*
  儲存測試
*/

document
  .getElementById(
    "save"
  )
  .addEventListener(
    "click",
    ()=>{

      const data = {

        /*
          畫面顯示用
          民國年
        */
        serviceDateRoc:
          formatRocDate(
            selectedDate
          ),


        /*
          未來 DB 儲存用
          西元日期
        */
        serviceDate:
          formatWesternDate(
            selectedDate
          ),


        lashStyleText:
          document
            .getElementById(
              "lashStyleText"
            )
            .value,


        lashType:
          document
            .getElementById(
              "lashType"
            )
            .value,


        amount:
          document
            .getElementById(
              "amount"
            )
            .value,


        note:
          document
            .getElementById(
              "note"
            )
            .value,


        presetStyleCode:
          selectedStyle,


        presetStyleName:
          presets[
            selectedStyle
          ].name,


        leftEyeSegments:
          leftSegments,


        rightEyeSegments:
          rightSegments

      };


      document
        .getElementById(
          "output"
        )
        .textContent =
          JSON.stringify(
            data,
            null,
            2
          );

    }
  );


/* =========================
   民國日期選擇器
   ========================= */


/*
  畫面：

  115/09/11

  未來 DB：

  2026-09-11
*/


const dateDisplay =
  document.getElementById(
    "rocDateDisplay"
  );


const calendar =
  document.getElementById(
    "rocCalendar"
  );


const calendarTitle =
  document.getElementById(
    "calendarTitle"
  );


const calendarDays =
  document.getElementById(
    "calendarDays"
  );


const now =
  new Date();


let selectedDate =
  new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );


let viewingYear =
  selectedDate.getFullYear();


let viewingMonth =
  selectedDate.getMonth();


function pad2(value){

  return String(value)
    .padStart(
      2,
      "0"
    );

}


/*
  西元轉民國日期
*/

function formatRocDate(date){

  return `${
    date.getFullYear() - 1911
  }/${
    pad2(
      date.getMonth() + 1
    )
  }/${
    pad2(
      date.getDate()
    )
  }`;

}


/*
  DB 使用的西元日期
*/

function formatWesternDate(date){

  return `${
    date.getFullYear()
  }-${
    pad2(
      date.getMonth() + 1
    )
  }-${
    pad2(
      date.getDate()
    )
  }`;

}


/*
  比較是否為同一天
*/

function sameDate(
  a,
  b
){

  return (
    a.getFullYear()
      ===
    b.getFullYear()

    &&

    a.getMonth()
      ===
    b.getMonth()

    &&

    a.getDate()
      ===
    b.getDate()
  );

}


/*
  畫出日期選擇器
*/

function renderCalendar(){

  calendarTitle.textContent =
    `民國 ${
      viewingYear - 1911
    } 年 ${
      pad2(
        viewingMonth + 1
      )
    } 月`;


  calendarDays.innerHTML = "";


  const firstDay =
    new Date(
      viewingYear,
      viewingMonth,
      1
    )
    .getDay();


  const daysInMonth =
    new Date(
      viewingYear,
      viewingMonth + 1,
      0
    )
    .getDate();


  /*
    月初前面的空白格
  */

  for(
    let i = 0;
    i < firstDay;
    i++
  ){

    const empty =
      document.createElement(
        "span"
      );


    empty.className =
      "calendar-empty";


    calendarDays
      .appendChild(
        empty
      );

  }


  /*
    當月日期
  */

  for(
    let day = 1;
    day <= daysInMonth;
    day++
  ){

    const date =
      new Date(
        viewingYear,
        viewingMonth,
        day
      );


    const button =
      document.createElement(
        "button"
      );


    button.type =
      "button";


    button.className =
      "calendar-day";


    button.textContent =
      day;


    if(
      sameDate(
        date,
        selectedDate
      )
    ){

      button
        .classList
        .add(
          "selected"
        );

    }


    if(
      sameDate(
        date,
        now
      )
    ){

      button
        .classList
        .add(
          "today"
        );

    }


    button.addEventListener(
      "click",
      ()=>{

        selectedDate =
          date;


        dateDisplay.value =
          formatRocDate(
            selectedDate
          );


        calendar.hidden =
          true;


        renderCalendar();

      }
    );


    calendarDays
      .appendChild(
        button
      );

  }

}


/*
  開啟 / 關閉日期選擇器
*/

function openCalendar(){

  calendar.hidden =
    !calendar.hidden;


  if(
    !calendar.hidden
  ){

    viewingYear =
      selectedDate
        .getFullYear();


    viewingMonth =
      selectedDate
        .getMonth();


    renderCalendar();

  }

}


/*
  預設日期顯示今天
*/

dateDisplay.value =
  formatRocDate(
    selectedDate
  );


dateDisplay
  .addEventListener(
    "click",
    openCalendar
  );


document
  .getElementById(
    "rocDateButton"
  )
  .addEventListener(
    "click",
    openCalendar
  );


/*
  上一個月
*/

document
  .getElementById(
    "prevMonth"
  )
  .addEventListener(
    "click",
    ()=>{

      viewingMonth--;


      if(
        viewingMonth < 0
      ){

        viewingMonth = 11;

        viewingYear--;

      }


      renderCalendar();

    }
  );


/*
  下一個月
*/

document
  .getElementById(
    "nextMonth"
  )
  .addEventListener(
    "click",
    ()=>{

      viewingMonth++;


      if(
        viewingMonth > 11
      ){

        viewingMonth = 0;

        viewingYear++;

      }


      renderCalendar();

    }
  );


/*
  回到今天
*/

document
  .getElementById(
    "todayButton"
  )
  .addEventListener(
    "click",
    ()=>{

      selectedDate =
        new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );


      viewingYear =
        selectedDate
          .getFullYear();


      viewingMonth =
        selectedDate
          .getMonth();


      dateDisplay.value =
        formatRocDate(
          selectedDate
        );


      calendar.hidden =
        true;


      renderCalendar();

    }
  );


/*
  點擊日期元件之外
  自動關閉日期選擇器
*/

document
  .addEventListener(
    "click",
    event => {

      if(
        !event.target.closest(
          ".roc-date-wrap"
        )
      ){

        calendar.hidden =
          true;

      }

    }
  );


/*
  初始畫面
*/

renderAll();
