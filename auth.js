(function () {
  const API_ORIGIN = "https://lash-record.lxstudio.workers.dev";
  const LOGIN_URL = `${API_ORIGIN}/auth/google`;
  const LOGOUT_URL = `${API_ORIGIN}/auth/logout`;

  document.documentElement.classList.add("auth-checking");

  const style = document.createElement("style");
  style.textContent = `
    html.auth-checking body { visibility: hidden; }
    html.auth-required body { margin: 0; visibility: visible; }
    .auth-screen { min-height: 100vh; display: grid; place-items: center; padding: 24px; background: #f4efeb; color: #302a27; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif; }
    .auth-card { width: min(460px, 100%); overflow: hidden; border: 1px solid #e7ddd7; border-radius: 22px; background: #fffdfb; box-shadow: 0 18px 50px rgba(79, 59, 48, .12); text-align: center; }
    .auth-brand-wrap { position: relative; height: 168px; overflow: hidden; background: #d8d0c3; }
    .auth-brand-banner { width: 100%; height: 145px; display: block; object-fit: cover; }
    .auth-brand-wrap::after { content: ""; position: absolute; left: -8%; bottom: -58px; width: 116%; height: 92px; border-radius: 50% 50% 0 0 / 100% 100% 0 0; background: #fffdfb; }
    .auth-content { padding: 8px 28px 34px; }
    .auth-card h1 { margin: 0; font-size: 27px; letter-spacing: .02em; }
    .auth-subtitle { margin: 8px 0 0; color: #746861; font-size: 16px; font-weight: 700; }
    .auth-message { margin: 22px 0 24px; color: #8a7f78; font-size: 14px; line-height: 1.7; }
    .auth-login { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 50px; border-radius: 13px; background: #8b645a; color: #fff; text-decoration: none; font-size: 15px; font-weight: 800; }
    .auth-login:hover { background: #76544c; }
    .auth-note { display: block; margin-top: 16px; color: #9a8d86; font-size: 12px; }
    @media (max-width: 520px) {
      .auth-screen { padding: 18px; }
      .auth-brand-wrap { height: 148px; }
      .auth-brand-banner { height: 125px; }
      .auth-brand-wrap::after { bottom: -57px; height: 88px; }
      .auth-content { padding: 8px 22px 30px; }
      .auth-card h1 { font-size: 25px; }
    }
  `;
  document.head.appendChild(style);

  document.addEventListener("DOMContentLoaded", checkAuthentication);

  async function checkAuthentication() {
    try {
      const response = await fetch(`${API_ORIGIN}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" }
      });
      if (!response.ok) {
        showLogin();
        return;
      }

      const result = await response.json();
      if (!result.authenticated || !result.user) {
        showLogin();
        return;
      }
      showApplication(result.user);
    } catch (error) {
      console.error("Authentication check failed", error);
      showLogin("目前無法連接登入服務，請稍後再試。");
    }
  }

  function showApplication(user) {
    document.documentElement.classList.remove("auth-checking", "auth-required");
    const displayName = user.displayName || user.email;
    const nameElement = document.getElementById("userDisplayName");
    const avatarElement = document.getElementById("userAvatar");
    const logoutElement = document.getElementById("logoutLink");

    if (nameElement) nameElement.textContent = displayName;
    if (avatarElement) avatarElement.textContent = Array.from(displayName)[0] || "店";
    if (logoutElement) logoutElement.href = LOGOUT_URL;

    window.lashCurrentUser = user;
    window.dispatchEvent(new CustomEvent("lash:authenticated", { detail: user }));
  }

  function showLogin(message) {
    document.body.innerHTML = `
      <main class="auth-screen">
        <section class="auth-card" aria-labelledby="authTitle">
          <div class="auth-brand-wrap">
            <img class="auth-brand-banner" src="warmth-logo.svg" alt="WARMTH Lash Design Studio">
          </div>
          <div class="auth-content">
            <h1 id="authTitle">Warmth Lash 後台</h1>
            <div class="auth-subtitle">Warmth Lash 後台登入頁面</div>
            <p class="auth-message">${message || "請先使用已授權的 Google 帳號登入，才能進入管理系統。"}</p>
            <a class="auth-login" href="${LOGIN_URL}">使用 Google 帳號登入</a>
            <small class="auth-note">僅限系統中已啟用的管理帳號</small>
          </div>
        </section>
      </main>
    `;
    document.documentElement.classList.remove("auth-checking");
    document.documentElement.classList.add("auth-required");
  }
})();
