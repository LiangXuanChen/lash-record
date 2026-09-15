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
    .auth-card { width: min(420px, 100%); padding: 36px 28px; border: 1px solid #e7ddd7; border-radius: 22px; background: #fffdfb; box-shadow: 0 18px 50px rgba(79, 59, 48, .12); text-align: center; }
    .auth-logo { width: 58px; height: 58px; margin: 0 auto 18px; border-radius: 18px; display: grid; place-items: center; background: #f2e7e2; color: #8b645a; font-size: 28px; font-weight: 900; }
    .auth-card h1 { margin: 0; font-size: 25px; letter-spacing: .04em; }
    .auth-card p { margin: 10px 0 24px; color: #8a7f78; font-size: 14px; line-height: 1.7; }
    .auth-login { display: flex; align-items: center; justify-content: center; width: 100%; min-height: 48px; border-radius: 13px; background: #8b645a; color: #fff; text-decoration: none; font-size: 15px; font-weight: 800; }
    .auth-login:hover { background: #76544c; }
    .auth-note { display: block; margin-top: 16px; color: #9a8d86; font-size: 12px; }
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
          <div class="auth-logo" aria-hidden="true">L</div>
          <h1 id="authTitle">美睫工作台</h1>
          <p>${message || "請先使用已授權的 Google 帳號登入，才能進入管理系統。"}</p>
          <a class="auth-login" href="${LOGIN_URL}">使用 Google 帳號登入</a>
          <small class="auth-note">僅限系統中已啟用的管理帳號</small>
        </section>
      </main>
    `;
    document.documentElement.classList.remove("auth-checking");
    document.documentElement.classList.add("auth-required");
  }
})();
