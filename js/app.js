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

  // 結果カードに干支（例：甲辰）を保持しておき、60タイプ別の文章を後から差し込めるようにする
  function renderTypeResult(containerId, diagnosis, role) {
    const container = document.getElementById(containerId);
    container.dataset.typeKey = diagnosis.type.key;
    container.dataset.kanshi = diagnosis.kanshi;
    container.querySelector('[data-result="name"]').textContent = `${diagnosis.type.name}タイプ`;
    renderParagraphs(container.querySelector('[data-result="description"]'), diagnosis.type[role], true);
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
