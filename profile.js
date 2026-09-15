(function () {
  const API_URL = "https://lash-record.lxstudio.workers.dev/api/profile";
  const form = document.getElementById("profileForm");
  const displayNameInput = document.getElementById("displayName");
  const emailInput = document.getElementById("email");
  const avatarInput = document.getElementById("avatarText");
  const avatarPreview = document.getElementById("avatarPreview");
  const saveButton = document.getElementById("saveProfile");
  const status = document.getElementById("profileStatus");
  const avatarButtons = document.querySelectorAll("[data-avatar]");

  window.addEventListener("lash:authenticated", (event) => loadUser(event.detail));
  if (window.lashCurrentUser) loadUser(window.lashCurrentUser);

  avatarInput.addEventListener("input", () => {
    const characters = graphemes(avatarInput.value.trim()).slice(0, 2);
    avatarInput.value = characters.join("");
    updatePreview();
  });

  for (const button of avatarButtons) {
    button.addEventListener("click", () => {
      avatarInput.value = button.dataset.avatar;
      updatePreview();
      avatarInput.focus();
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const displayName = displayNameInput.value.trim();
    const avatarText = avatarInput.value.trim();

    if (!displayName) {
      showStatus("請輸入顯示名稱。", "error");
      displayNameInput.focus();
      return;
    }
    if (graphemes(avatarText).length < 1 || graphemes(avatarText).length > 2) {
      showStatus("頭像請輸入 1～2 個字元。", "error");
      avatarInput.focus();
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "儲存中…";
    showStatus("");

    try {
      const response = await fetch(API_URL, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName, avatarText })
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "儲存失敗");
      }

      loadUser(result.user);
      window.lashCurrentUser = result.user;
      showStatus("個人資料已儲存。", "success");
    } catch (error) {
      console.error("Profile update failed", error);
      showStatus("儲存失敗，請稍後再試。", "error");
    } finally {
      saveButton.disabled = false;
      saveButton.textContent = "儲存個人資料";
    }
  });

  function loadUser(user) {
    displayNameInput.value = user.displayName || "";
    emailInput.value = user.email || "";
    avatarInput.value = user.avatarText || graphemes(user.displayName || "店")[0] || "店";
    updatePreview();
  }

  function updatePreview() {
    const value = avatarInput.value.trim() || "店";
    avatarPreview.textContent = value;
    for (const button of avatarButtons) {
      button.classList.toggle("selected", button.dataset.avatar === value);
    }
  }

  function showStatus(message, type) {
    status.textContent = message;
    status.className = `profile-status${type ? ` ${type}` : ""}`;
  }

  function graphemes(value) {
    if (typeof Intl.Segmenter === "function") {
      const segmenter = new Intl.Segmenter("zh-Hant", { granularity: "grapheme" });
      return Array.from(segmenter.segment(value), ({ segment }) => segment);
    }
    return Array.from(value);
  }
})();
