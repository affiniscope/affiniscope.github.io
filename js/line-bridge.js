// 診断結果のタイプをLINEへ引き継ぐ。
// 診断のたびにサーバーで一時的な診断番号を発行し、LINEボタンを「診断番号入りのメッセージが入力済みのトーク画面」に差し替える。
// 生年月日はサーバーへ送らない（送るのは判定済みのタイプだけ）。
(function () {
  "use strict";

  const config = LOVE_PHASE_TWO_CONFIG.lineBridge;
  const LINK_SELECTOR = ".kanshi-line-link, #official-line-cta";
  const WAIT_ON_CLICK_MS = 3000;
  let pending = null;
  let preparedUrl = null;

  function buildUrl(code, typeLabel) {
    const text = config.messageTemplate.replace("{typeLabel}", typeLabel).replace("{code}", code);
    return `https://line.me/R/oaMessage/${encodeURIComponent(config.lineId)}/?${encodeURIComponent(text)}`;
  }

  function applyUrl(url) {
    document.querySelectorAll(LINK_SELECTOR).forEach((link) => {
      link.href = url;
    });
  }

  function prepare(typeCode) {
    preparedUrl = null;
    pending = null;
    if (!config || !config.apiBase || !typeCode) return;
    const request = fetch(`${config.apiBase.replace(/\/$/, "")}/api/diagnoses`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ typeCode })
    })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (pending !== request) return;
        if (data && data.code && data.typeLabel) {
          preparedUrl = buildUrl(data.code, data.typeLabel);
          applyUrl(preparedUrl);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (pending === request) pending = null;
      });
    pending = request;
  }

  // 番号の発行が間に合う前に押された場合は少しだけ待ち、間に合わなければ通常のLINEリンクへ進む
  document.addEventListener(
    "click",
    (event) => {
      const link = event.target.closest && event.target.closest(LINK_SELECTOR);
      if (!link || !pending || preparedUrl) return;
      event.preventDefault();
      const waiting = pending;
      Promise.race([waiting, new Promise((resolve) => setTimeout(resolve, WAIT_ON_CLICK_MS))]).then(() => {
        window.location.href = preparedUrl || link.href;
      });
    },
    true
  );

  window.LineBridge = Object.freeze({ prepare });
})();
