(() => {
  const previewBox = document.getElementById("signaturePreviewBox");
  const preview = document.getElementById("signaturePreview");
  const liveButton = document.getElementById("openSignature");
  const signatureDone = document.getElementById("signatureDone");
  const dateDisplay = document.getElementById("consentDate");

  if (!previewBox || !preview || !liveButton || !signatureDone || !dateDisplay) return;

  const rocDate = date =>
    `${date.getFullYear() - 1911}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`;
  const today = rocDate(new Date());
  const state = {
    source: "LIVE_DRAWN",
    signedDate: today,
    importedDate: null,
    imageDataUrl: ""
  };

  const style = document.createElement("style");
  style.textContent = `
    .signature-method-actions{display:flex;flex-wrap:wrap;gap:10px;margin-top:10px}
    .signature-method-actions .open-signature{margin-top:0}
    .upload-signature{border:1px solid var(--accent);border-radius:10px;background:#fff;color:var(--accent);padding:10px 16px;font-family:inherit;font-weight:700;cursor:pointer}
    .signature-source{margin:10px 2px 0;color:#786b65;font-size:13px}
    .signature-upload-error{min-height:20px;margin:7px 2px 0;color:#a4443d;font-size:13px}
    .consent-date-input{width:100%;height:44px;border:1px solid var(--line);border-radius:10px;padding:0 12px;background:#fff;color:var(--text);font-size:16px}
    .consent-date-input[readonly]{background:#f9f6f4;color:var(--text)}
    .consent-date-help{margin:7px 2px 0;color:var(--muted);font-size:12px;line-height:1.6}
    .signature-import-info{margin-top:12px;padding:11px 13px;border-radius:10px;background:var(--soft);color:#6c5c52;font-size:13px}
    @media(max-width:767px){.signature-method-actions{display:grid;grid-template-columns:1fr 1fr}.signature-method-actions button{width:100%;padding:10px 8px}}
  `;
  document.head.appendChild(style);

  const actions = document.createElement("div");
  actions.className = "signature-method-actions";
  liveButton.parentNode.insertBefore(actions, liveButton);
  actions.appendChild(liveButton);

  const uploadButton = document.createElement("button");
  uploadButton.id = "uploadPaperSignature";
  uploadButton.className = "upload-signature";
  uploadButton.type = "button";
  uploadButton.textContent = "上傳紙本簽名";
  actions.appendChild(uploadButton);

  const fileInput = document.createElement("input");
  fileInput.id = "paperSignatureFile";
  fileInput.type = "file";
  fileInput.accept = "image/png,image/jpeg,image/webp";
  fileInput.hidden = true;
  actions.appendChild(fileInput);

  const sourceText = document.createElement("p");
  sourceText.className = "signature-source";
  sourceText.textContent = "簽名方式：現場簽名";
  actions.after(sourceText);

  const uploadError = document.createElement("p");
  uploadError.className = "signature-upload-error";
  uploadError.setAttribute("role", "status");
  sourceText.after(uploadError);

  const signedDateInput = document.createElement("input");
  signedDateInput.id = "consentDate";
  signedDateInput.className = "consent-date-input";
  signedDateInput.type = "text";
  signedDateInput.inputMode = "numeric";
  signedDateInput.autocomplete = "off";
  signedDateInput.value = today;
  signedDateInput.readOnly = true;
  signedDateInput.setAttribute("aria-label", "簽署日期");
  dateDisplay.replaceWith(signedDateInput);

  const dateHelp = document.createElement("p");
  dateHelp.className = "consent-date-help";
  dateHelp.textContent = "現場簽名會自動使用今天日期。";
  signedDateInput.after(dateHelp);

  const importInfo = document.createElement("div");
  importInfo.className = "signature-import-info";
  importInfo.hidden = true;
  dateHelp.after(importInfo);

  function publishState() {
    state.signedDate = signedDateInput.value.trim();
    window.lashSignatureState = { ...state };
    document.dispatchEvent(new CustomEvent("lash-signature-change", { detail: { ...state } }));
  }

  function useLiveSignature() {
    state.source = "LIVE_DRAWN";
    state.importedDate = null;
    state.imageDataUrl = preview.getAttribute("src") || "";
    signedDateInput.value = today;
    signedDateInput.readOnly = true;
    signedDateInput.placeholder = "";
    sourceText.textContent = "簽名方式：現場簽名";
    dateHelp.textContent = "現場簽名會自動使用今天日期。";
    importInfo.hidden = true;
    uploadError.textContent = "";
    publishState();
  }

  function usePaperSignature(dataUrl) {
    state.source = "PAPER_IMPORT";
    state.importedDate = today;
    state.imageDataUrl = dataUrl;
    signedDateInput.value = "";
    signedDateInput.readOnly = false;
    signedDateInput.placeholder = "例如：110/01/01";
    sourceText.textContent = "簽名方式：紙本簽名匯入";
    dateHelp.textContent = "請依紙本右下角填寫日期（民國年/月/日）。";
    importInfo.textContent = `系統匯入日期：${today}`;
    importInfo.hidden = false;
    liveButton.textContent = "改用現場簽名";
    uploadButton.textContent = "重新上傳紙本簽名";
    publishState();
    signedDateInput.focus();
  }

  uploadButton.addEventListener("click", () => {
    fileInput.value = "";
    fileInput.click();
  });

  fileInput.addEventListener("change", () => {
    const file = fileInput.files?.[0];
    if (!file) return;

    uploadError.textContent = "";
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      uploadError.textContent = "請選擇 JPG、PNG 或 WebP 圖片。";
      fileInput.value = "";
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      uploadError.textContent = "圖片不可超過 8 MB，請先裁切或壓縮後再上傳。";
      fileInput.value = "";
      return;
    }

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      const dataUrl = String(reader.result || "");
      preview.src = dataUrl;
      preview.style.display = "block";
      previewBox.classList.add("has-signature");
      usePaperSignature(dataUrl);
    });
    reader.addEventListener("error", () => {
      uploadError.textContent = "無法讀取這張圖片，請重新選擇。";
    });
    reader.readAsDataURL(file);
  });

  signatureDone.addEventListener("click", () => {
    requestAnimationFrame(() => {
      useLiveSignature();
    });
  });

  signedDateInput.addEventListener("input", () => {
    if (state.source === "PAPER_IMPORT") publishState();
  });

  signedDateInput.addEventListener("blur", () => {
    if (state.source !== "PAPER_IMPORT" || !signedDateInput.value.trim()) return;
    const value = signedDateInput.value.trim();
    const match = value.match(/^(\d{2,3})\/(\d{1,2})\/(\d{1,2})$/);
    if (!match) {
      uploadError.textContent = "簽署日期請使用民國年/月/日，例如 110/01/01。";
      return;
    }
    const month = Number(match[2]);
    const day = Number(match[3]);
    const year = Number(match[1]) + 1911;
    const parsed = new Date(year, month - 1, day);
    if (
      month < 1 || month > 12 ||
      day < 1 ||
      parsed.getFullYear() !== year ||
      parsed.getMonth() !== month - 1 ||
      parsed.getDate() !== day
    ) {
      uploadError.textContent = "請確認紙本簽署日期是否正確。";
      return;
    }
    signedDateInput.value = `${match[1]}/${String(month).padStart(2, "0")}/${String(day).padStart(2, "0")}`;
    uploadError.textContent = "";
    publishState();
  });

  publishState();
})();
