(function (root, factory) {
  const config = factory();
  if (typeof module === "object" && module.exports) module.exports = config;
  root.LOVE_PHASE_TWO_CONFIG = config;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  return Object.freeze({
    course: Object.freeze({
      presenter: "占い師みらい",
      title: "恋愛タイプ別マスター無料講座",
      paragraphs: Object.freeze([
        "あなたと彼がすれ違ってしまうのは、愛情がないからとは限りません。",
        "タイプが違えば、愛情の伝え方や距離の取り方も変わります。",
        "私自身も昔、この違いを知らず、大切な恋愛ですれ違った経験があります。",
        "もしあの時知っていたら、彼の行動の受け取り方も違っていたかもしれません。",
        "そんな経験から、この無料講座を作りました。"
      ])
    }),
    video: Object.freeze({
      mediaUrl: "../../Downloads/納品_無料個別相談VSL動画.mp4",
      posterUrl: "",
      mimeType: "video/mp4",
      embedUrl: "",
      provider: "",
      title: "恋愛タイプ別マスター無料講座",
      showPreviewCompletionButton: true
    }),
    guidebook: Object.freeze({
      receiveUrl: "",
      linkLabel: "恋愛タイプ別ガイドブックを受け取る"
    }),
    officialLine: Object.freeze({
      friendUrl: "https://line.me/R/oaMessage/%40457xohef",
      ctaLabel: "公式LINEで無料講座を受け取る"
    }),
    consultation: Object.freeze({
      applicationUrl: "",
      ctaLabel: "無料個別相談に申し込む",
      topics: Object.freeze([
        "今のお二人がすれ違っている理由",
        "お相手との関係で今何を優先するべきか",
        "タイプを踏まえたお相手との接し方",
        "今後どのように関係を進めていくか"
      ]),
      participationBonus: Object.freeze({
        title: "🎁 無料個別相談 参加者限定特典あり",
        items: Object.freeze([])
      }),
      minimumAge: 20
    })
  });
});