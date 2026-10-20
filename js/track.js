// アクセス・診断開始・診断完了・LINEボタンのクリックの計測（サーバーへ送るだけで、ブラウザには何も保存しない）。
// 送る内容：イベント名・匿名のセッションID（ページを開くたびに新しく作る）・UTMパラメータ・参照元のホスト名だけ。
(function () {
  "use strict";

  const config = window.LOVE_PHASE_TWO_CONFIG || {};
  const api = config.analytics || config.diagnosisApi;
  const EVENTS_URL = api && api.eventsUrl;

  function randomId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    (window.crypto || window.msCrypto).getRandomValues(bytes);
    return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
  }

  function readAttribution() {
    const params = new URLSearchParams(location.search);
    const attribution = {};
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach((key) => {
      const value = params.get(key);
      if (value) attribution[key] = value.slice(0, 100);
    });
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      if (referrer && referrer.host !== location.host) attribution.referrerHost = referrer.hostname;
    } catch (error) {
      // 参照元が読めない場合は送らない
    }
    return attribution;
  }

  const sessionId = randomId();
  const attribution = readAttribution();

  // ページ移動の直前でも届くよう sendBeacon を使う（text/plain なので事前確認の通信が発生しない）
  function send(event, extra) {
    if (!EVENTS_URL) return;
    const body = JSON.stringify(Object.assign({ event, sessionId, attribution }, extra || {}));
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(EVENTS_URL, new Blob([body], { type: "text/plain" }))) return;
    } catch (error) {
      // 下の fetch で送る
    }
    try {
      fetch(EVENTS_URL, { method: "POST", body, keepalive: true, mode: "no-cors", headers: { "Content-Type": "text/plain" } }).catch(() => {});
    } catch (error) {
      // 計測に失敗しても画面の動作には影響させない
    }
  }

  // LINEボタンのクリック。リンクの移動は止めない（記録は送るだけ）
  document.addEventListener("click", (event) => {
    const link = event.target.closest && event.target.closest(".kanshi-line-link, #official-line-cta");
    if (!link) return;
    const cta = link.id === "official-line-cta" ? "bottom" : link.closest(".kanshi-mid-cta") ? "mid" : "end";
    send("cta_click", { cta });
  }, true);

  send("page_view");

  window.CompassTrack = Object.freeze({ sessionId, attribution, send });
})();
