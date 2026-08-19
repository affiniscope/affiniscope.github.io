(function () {
  "use strict";

  const config = window.LOVE_PHASE_TWO_CONFIG;
  if (!config) throw new Error("第二段階の設定データが読み込まれていません。");

  const $ = (selector) => document.querySelector(selector);

  function renderParagraphs(container, paragraphs) {
    container.replaceChildren();
    paragraphs.forEach((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      container.append(element);
    });
  }

  function renderList(container, items) {
    container.replaceChildren();
    items.forEach((item) => {
      const element = document.createElement("li");
      element.textContent = item;
      container.append(element);
    });
  }

  function configureLink(link, url, label) {
    const labelTarget = link.querySelector("[data-link-label]");
    if (labelTarget) labelTarget.textContent = label;
    else link.textContent = label;
    if (url) {
      link.href = url;
      link.removeAttribute("aria-disabled");
      link.classList.remove("is-disabled");
      return;
    }

    link.href = "#";
    link.setAttribute("aria-disabled", "true");
    link.classList.add("is-disabled");
    link.addEventListener("click", (event) => event.preventDefault());
  }

  function createDirectVideo() {
    const video = document.createElement("video");
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.title = config.video.title;
    if (config.video.posterUrl) video.poster = config.video.posterUrl;

    const source = document.createElement("source");
    source.src = config.video.mediaUrl;
    if (config.video.mimeType) source.type = config.video.mimeType;
    video.append(source);

    const fallback = document.createElement("a");
    fallback.href = config.video.mediaUrl;
    fallback.textContent = "動画を開く";
    video.append(fallback);
    video.addEventListener("ended", markVideoComplete);
    return video;
  }

  function createEmbeddedVideo() {
    const iframe = document.createElement("iframe");
    iframe.src = config.video.embedUrl;
    iframe.title = config.video.title;
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    return iframe;
  }

  function renderVideo() {
    const slot = $("#video-embed-slot");
    const previewButton = $("#video-completion-preview");

    if (config.video.mediaUrl) {
      slot.replaceChildren(createDirectVideo());
      previewButton.hidden = true;
      return;
    }

    if (config.video.embedUrl) {
      slot.replaceChildren(createEmbeddedVideo());
      previewButton.hidden = true;
      return;
    }

    previewButton.hidden = !config.video.showPreviewCompletionButton;
  }

  function markVideoComplete() {
    const content = $("#post-video-content");
    if (!content.hidden) return;

    content.hidden = false;
    requestAnimationFrame(() => content.classList.add("is-visible"));
    content.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function initialize() {
    $("[data-course-presenter]").textContent = config.course.presenter;
    $("[data-course-title]").textContent = config.course.title;
    renderParagraphs($("[data-course-copy]"), config.course.paragraphs);
    renderList($("[data-consultation-topics]"), config.consultation.topics);

    $("[data-consultation-bonus-title]").textContent = config.consultation.participationBonus.title;
    const bonusItems = $("[data-consultation-bonus-items]");
    renderList(bonusItems, config.consultation.participationBonus.items);
    bonusItems.hidden = config.consultation.participationBonus.items.length === 0;

    $("[data-age-notice]").textContent = `※無料個別相談は${config.consultation.minimumAge}歳以上の方を対象としています。`;
    configureLink($("#guidebook-link"), config.guidebook.receiveUrl, config.guidebook.linkLabel);
    configureLink($("#official-line-cta"), config.officialLine.friendUrl, config.officialLine.ctaLabel);
    configureLink($("#consultation-cta"), config.consultation.applicationUrl, config.consultation.ctaLabel);

    const receiveStatus = $("#guidebook-receive-status");
    receiveStatus.hidden = Boolean(config.guidebook.receiveUrl);
    $("#video-completion-preview").addEventListener("click", markVideoComplete);
    window.addEventListener("love-video-complete", markVideoComplete);
    renderVideo();
  }

  window.LovePhaseTwo = Object.freeze({ markVideoComplete });
  initialize();
})();