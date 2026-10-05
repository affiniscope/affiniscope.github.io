(function () {
  "use strict";

  const form = document.getElementById("diagnosis-form");
  const errorBox = document.getElementById("form-error");
  const results = document.getElementById("results");
  const giftOffer = document.getElementById("solo-gift-offer");
  const pairNextStage = document.getElementById("pair-next-stage");
  const person = "you";

  function addOptions(select, values, suffix) {
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = `${value}${suffix}`;
      select.append(option);
    });
  }

  function updateDays() {
    const year = Number(document.getElementById(`${person}-year`).value);
    const month = Number(document.getElementById(`${person}-month`).value);
    const daySelect = document.getElementById(`${person}-day`);
    const previousDay = Number(daySelect.value);
    daySelect.replaceChildren(new Option("日", ""));
    const maxDays = year && month ? LoveEarlyTable.daysInMonth(year, month) : 31;
    addOptions(daySelect, Array.from({ length: maxDays }, (_, index) => index + 1), "日");
    if (previousDay && previousDay <= maxDays) daySelect.value = String(previousDay);
  }

  function initializeDateInputs() {
    const years = Array.from(
      { length: LoveEarlyTable.MAX_YEAR - LoveEarlyTable.MIN_YEAR + 1 },
      (_, index) => LoveEarlyTable.MAX_YEAR - index
    );
    const months = Array.from({ length: 12 }, (_, index) => index + 1);
    addOptions(document.getElementById(`${person}-year`), years, "年");
    addOptions(document.getElementById(`${person}-month`), months, "月");
    updateDays();
    document.getElementById(`${person}-year`).addEventListener("change", updateDays);
    document.getElementById(`${person}-month`).addEventListener("change", updateDays);
  }

  function readDate() {
    return {
      year: Number(document.getElementById(`${person}-year`).value),
      month: Number(document.getElementById(`${person}-month`).value),
      day: Number(document.getElementById(`${person}-day`).value)
    };
  }

  function readGender() {
    return form.elements["you-gender"].value;
  }

  function isTypeContentHeading(paragraph) {
    const text = paragraph.trim();
    return /タイプ(?:女性|男性)｜あなたの恋愛傾向$/.test(text)
      || /^[1-9]\.\s/.test(text);
  }

  function renderParagraphs(container, paragraphs, emphasizeHeadings = false) {
    container.replaceChildren();
    paragraphs.forEach((paragraph) => {
      const element = document.createElement("p");
      if (emphasizeHeadings && isTypeContentHeading(paragraph)) {
        const heading = document.createElement("strong");
        heading.textContent = paragraph;
        element.append(heading);
      } else {
        element.textContent = paragraph;
      }
      container.append(element);
    });
  }

  // 原稿中の **太字** を強調表示に変換する（記号そのものは表示しない）
  function appendInline(element, text) {
    text.split(/(\*\*[^*]+\*\*)/).forEach((part) => {
      if (!part) return;
      if (/^\*\*[^*]+\*\*$/.test(part)) {
        const strong = document.createElement("strong");
        strong.textContent = part.slice(2, -2);
        element.append(strong);
      } else {
        element.append(document.createTextNode(part));
      }
    });
  }

  function appendHeading(container, text) {
    const heading = document.createElement("h4");
    heading.className = "kanshi-heading";
    appendInline(heading, text);
    container.append(heading);
  }

  function appendLine(container, line) {
    const element = document.createElement("p");
    const lineLink = line.match(/^▼\s*(.+)$/);
    if (lineLink) {
      const link = document.createElement("a");
      link.className = "kanshi-line-link";
      link.href = LOVE_PHASE_TWO_CONFIG.officialLine.friendUrl;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      link.textContent = `▼ ${lineLink[1]}`;
      element.append(link);
    } else if (/^[①-⑳]/.test(line)) {
      const strong = document.createElement("strong");
      strong.className = "kanshi-point";
      appendInline(strong, line);
      element.append(strong);
    } else if (/^□\s*/.test(line)) {
      // 原稿の「□」チェック項目は記号を文字で出さず、枠付きの項目として表示する
      element.className = "kanshi-bullet kanshi-check";
      appendInline(element, line.replace(/^□\s*/, ""));
    } else {
      if (line.startsWith("・")) element.className = "kanshi-bullet";
      appendInline(element, line);
    }
    container.append(element);
  }

  function renderKanshiContent(container, content) {
    container.replaceChildren();
    container.classList.add("kanshi-content");
    if (content.group) {
      appendHeading(container, content.group.heading);
      content.group.lines.forEach((line) => appendLine(container, line));
    }
    content.sections.forEach((section) => {
      appendHeading(container, section.heading);
      section.lines.forEach((line) => appendLine(container, line));
    });
  }

  // 六十干支別の原稿があればそれを表示し、未登録の干支は従来の10タイプ本文を表示する。
  // 干支そのものは内部管理用なので画面には出さない
  function renderTypeResult(containerId, diagnosis, role) {
    const container = document.getElementById(containerId);
    const name = container.querySelector('[data-result="name"]');
    const catchCopy = container.querySelector('[data-result="catch"]');
    const description = container.querySelector('[data-result="description"]');
    const content = KanshiContent.get(diagnosis.kanshi);
    container.dataset.typeKey = diagnosis.type.key;
    container.dataset.kanshi = diagnosis.kanshi;
    container.dataset.contentSource = content ? "kanshi" : "legacy";

    if (content && content.name) {
      // スマホで「タイ／プ」のように途中で改行されないよう、「タイプ」はひとまとまりで折り返す
      const suffix = document.createElement("span");
      suffix.className = "result-card__name-suffix";
      suffix.textContent = "タイプ";
      name.replaceChildren(document.createTextNode(`「${content.name}」`), suffix);
      catchCopy.replaceChildren();
      content.catchCopy.forEach((line, index) => {
        if (index > 0) catchCopy.append(document.createElement("br"));
        appendInline(catchCopy, line);
      });
      catchCopy.hidden = content.catchCopy.length === 0;
    } else {
      name.textContent = `${diagnosis.type.name}タイプ`;
      catchCopy.textContent = "";
      catchCopy.hidden = true;
    }

    if (content) {
      renderKanshiContent(description, content);
    } else {
      description.classList.remove("kanshi-content");
      renderParagraphs(description, diagnosis.type[role], true);
    }
  }

  function showGiftOffer() {
    giftOffer.hidden = false;
    if (pairNextStage) pairNextStage.hidden = true;
  }

  function showError(message) {
    errorBox.textContent = message;
    errorBox.hidden = false;
  }

  form.addEventListener("input", () => {
    errorBox.hidden = true;
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const you = readDate();
    const youGender = readGender();

    if (!LoveDiagnosis.validateDate(you.year, you.month, you.day)) {
      showError("あなたの生年月日をすべて正しく選択してください。");
      return;
    }

    try {
      const youDiagnosis = LoveDiagnosis.diagnose(you.year, you.month, you.day);
      renderTypeResult("you-result", youDiagnosis, youGender);
      showGiftOffer();

      results.hidden = false;
      results.classList.remove("results--visible");
      requestAnimationFrame(() => {
        results.classList.add("results--visible");
        results.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (error) {
      showError(error.message || "診断中にエラーが発生しました。");
    }
  });

  initializeDateInputs();
})();
