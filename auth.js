(function () {
  const API_ORIGIN = "https://lash-record.lxstudio.workers.dev";
  const LOGIN_URL = `${API_ORIGIN}/auth/google`;
  const LOGOUT_URL = `${API_ORIGIN}/auth/logout`;

  document.documentElement.classList.add("auth-checking");

  const style = document.createElement("style");
  style.textContent = `
    html.auth-checking body { visibility: hidden; }
    html.auth-required body { margin: 0; visibility: visible; }
    .auth-screen { min-height: 100vh; display: grid; place-items: center; padding: clamp(24px, 5vw, 72px); overflow: hidden; background: radial-gradient(circle at 50% 45%, rgba(255,255,255,.95) 0 34%, rgba(248,244,239,.88) 64%, rgba(235,227,218,.82) 100%), #f3eee8; color: #2f2724; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans TC", "Microsoft JhengHei", sans-serif; }
    .auth-card { position: relative; width: min(760px, 100%); overflow: hidden; border: 1px solid rgba(211,198,187,.62); border-radius: 42px; background: rgba(255,255,255,.96); box-shadow: 0 26px 70px rgba(91,70,56,.18), 0 3px 12px rgba(91,70,56,.08); text-align: center; }
    .auth-brand-panel { position: relative; height: 330px; display: grid; place-items: center; padding-bottom: 58px; overflow: hidden; background-color: #e7d8c9; background-image: radial-gradient(circle at 12% 22%, rgba(116,84,62,.18) 0 2px, transparent 3px), radial-gradient(circle at 78% 64%, rgba(126,92,68,.13) 0 1.5px, transparent 2.5px), radial-gradient(circle at 45% 34%, rgba(255,255,255,.28) 0 1px, transparent 2px), radial-gradient(circle at 68% 18%, rgba(255,255,255,.22) 0 2px, transparent 3px), repeating-radial-gradient(ellipse at 25% 70%, rgba(108,78,58,.035) 0 1px, transparent 1px 5px), linear-gradient(135deg, #eadfd3, #dfcfbf 58%, #eadfd3); background-size: 170px 140px, 210px 180px, 95px 85px, 130px 110px, 17px 13px, auto; }
    .auth-brand-panel::before { content: ""; position: absolute; inset: 0; opacity: .42; mix-blend-mode: multiply; background-image: repeating-linear-gradient(18deg, transparent 0 7px, rgba(93,66,49,.025) 8px 9px), repeating-linear-gradient(102deg, transparent 0 11px, rgba(255,255,255,.15) 12px 13px); }
    .auth-brand { position: relative; z-index: 1; text-shadow: 0 2px 4px rgba(65,48,39,.18); }
    .auth-brand-name { color: #fff; font-size: clamp(38px, 6vw, 54px); font-weight: 400; letter-spacing: .22em; line-height: 1; transform: translateX(.11em); }
    .auth-brand-sub { margin-top: 24px; color: #3e3430; font-size: clamp(13px, 2vw, 18px); font-weight: 500; letter-spacing: .42em; transform: translateX(.21em); }
    .auth-curve { position: absolute; z-index: 2; left: 0; right: 0; bottom: -1px; display: block; width: 100%; height: 92px; }
    .auth-content { padding: 46px clamp(28px, 8vw, 78px) 56px; }
    .auth-title { margin: 0; color: #2d2522; font-size: clamp(34px, 5vw, 48px); font-weight: 800; line-height: 1.18; letter-spacing: -.02em; }
    .auth-title span { display: block; }
    .auth-title span + span { margin-top: 8px; font-size: .92em; letter-spacing: .02em; }
    .auth-description { max-width: 570px; margin: 34px auto 42px; color: #897a73; font-size: clamp(17px, 2.6vw, 23px); font-weight: 500; line-height: 1.65; letter-spacing: .04em; }
    .auth-login { display: grid; grid-template-columns: 104px minmax(0,1fr); align-items: center; width: 100%; min-height: 86px; overflow: hidden; border-radius: 20px; background: linear-gradient(110deg, #9a6d5f, #8b6258 52%, #a77b6e); color: #fff; text-decoration: none; box-shadow: 0 9px 20px rgba(112,76,65,.16); transition: transform .18s ease, box-shadow .18s ease, filter .18s ease; }
    .auth-login:hover { transform: translateY(-2px); box-shadow: 0 13px 26px rgba(112,76,65,.22); filter: brightness(1.04); }
    .auth-login:focus-visible { outline: 3px solid rgba(139,98,88,.3); outline-offset: 4px; }
    .auth-google-mark { display: grid; place-items: center; min-height: 50px; border-right: 1px solid rgba(255,255,255,.58); font-family: Arial, sans-serif; font-size: 49px; font-weight: 700; line-height: 1; }
    .auth-login-text { padding: 0 24px; font-size: clamp(18px, 3vw, 25px); font-weight: 600; letter-spacing: .04em; }
    .auth-note { display: block; margin-top: 38px; color: #897a73; font-size: clamp(14px, 2.2vw, 19px); font-weight: 500; letter-spacing: .04em; }
    @media (max-height: 820px) and (min-width: 601px) {
      .auth-screen { padding: 18px; }
      .auth-card { width: min(680px, 100%); border-radius: 34px; }
      .auth-brand-panel { height: 235px; padding-bottom: 40px; }
      .auth-brand-name { font-size: 42px; }
      .auth-brand-sub { margin-top: 17px; font-size: 14px; }
      .auth-curve { height: 66px; }
      .auth-content { padding: 24px 58px 30px; }
      .auth-title { font-size: 34px; }
      .auth-title span + span { margin-top: 4px; }
      .auth-description { margin: 18px auto 22px; font-size: 17px; }
      .auth-login { grid-template-columns: 82px minmax(0,1fr); min-height: 64px; border-radius: 16px; }
      .auth-google-mark { min-height: 38px; font-size: 38px; }
      .auth-login-text { font-size: 19px; }
      .auth-note { margin-top: 19px; font-size: 14px; }
    }
    @media (max-width: 600px) {
      .auth-screen { padding: 16px; }
      .auth-card { border-radius: 30px; }
      .auth-brand-panel { height: 245px; padding-bottom: 42px; }
      .auth-brand-sub { margin-top: 17px; letter-spacing: .3em; transform: translateX(.15em); }
      .auth-curve { height: 66px; }
      .auth-content { padding: 32px 24px 38px; }
      .auth-description { margin: 24px auto 30px; }
      .auth-login { grid-template-columns: 76px minmax(0,1fr); min-height: 68px; border-radius: 16px; }
      .auth-google-mark { min-height: 40px; font-size: 38px; }
      .auth-login-text { padding: 0 12px; }
      .auth-note { margin-top: 26px; }
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
          <div class="auth-brand-panel">
            <div class="auth-brand">
              <div class="auth-brand-name">WARMTH</div>
              <div class="auth-brand-sub">LASH DESIGN STUDIO</div>
            </div>
            <svg class="auth-curve" viewBox="0 0 1000 130" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 0 Q500 130 1000 0 V130 H0 Z" fill="#fff"></path>
            </svg>
          </div>
          <div class="auth-content">
            <h1 id="authTitle" class="auth-title"><span>Warmth Lash</span><span>後台登入頁面</span></h1>
            <p class="auth-description">${message || "請先使用已授權的 Google 帳號登入，<br>才能進入管理系統。"}</p>
            <a class="auth-login" href="${LOGIN_URL}">
              <span class="auth-google-mark" aria-hidden="true">G</span>
              <span class="auth-login-text">使用 Google 帳號登入</span>
            </a>
            <small class="auth-note">僅限系統中已啟用的管理帳號</small>
          </div>
        </section>
      </main>
    `;
    document.documentElement.classList.remove("auth-checking");
    document.documentElement.classList.add("auth-required");
  }
})();
