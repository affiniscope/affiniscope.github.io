(function () {
  "use strict";

  const form = document.getElementById("diagnosis-form");
  const errorBox = document.getElementById("form-error");
  const results = document.getElementById("results");
  const resultGrid = document.getElementById("result-grid");
  const resultCross = document.getElementById("result-cross");
  const partnerResult = document.getElementById("partner-result");
  const mismatchResult = document.getElementById("mismatch-result");
  const giftOffer = document.getElementById("solo-gift-offer");
  const giftModeElements = document.querySelectorAll("[data-gift-mode]");
  const soloTypeName = document.querySelector("[data-solo-type-name]");
  const pairYouType = document.querySelector("[data-pair-you-type]");
  const pairPartnerType = document.querySelector("[data-pair-partner-type]");
  const pairNextStage = document.getElementById("pair-next-stage");
  const people = ["you", "partner"];

  function addOptions(select, values, suffix) {
    values.forEach((value) => {
      const option = document.createElement("option");
      option.value = String(value);
      option.textContent = `${value}${suffix}`;
      select.append(option);
    });
  }

  function updateDays(person) {
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
    people.forEach((person) => {
      addOptions(document.getElementById(`${person}-year`), years, "年");
      addOptions(document.getElementById(`${person}-month`), months, "月");
      updateDays(person);
      document.getElementById(`${person}-year`).addEventListener("change", () => updateDays(person));
      document.getElementById(`${person}-month`).addEventListener("change", () => updateDays(person));
    });
  }

  function readDate(person) {
    return {
      year: Number(document.getElementById(`${person}-year`).value),
      month: Number(document.getElementById(`${person}-month`).value),
      day: Number(document.getElementById(`${person}-day`).value)
    };
  }

  function readGender() {
    return form.elements["you-gender"].value;
  }

  function renderParagraphs(container, paragraphs) {
    container.replaceChildren();
    paragraphs.forEach((paragraph) => {
      const element = document.createElement("p");
      element.textContent = paragraph;
      container.append(element);
    });
  }

  function renderTypeResult(containerId, diagnosis, role) {
    const container = document.getElementById(containerId);
    container.querySelector('[data-result="emoji"]').textContent = diagnosis.type.emoji;
    container.querySelector('[data-result="name"]').textContent = `${diagnosis.type.name}タイプ`;
    container.querySelector('[data-result="number"]').textContent = `診断番号 ${diagnosis.diagnosisNumber}`;
    renderParagraphs(container.querySelector('[data-result="description"]'), diagnosis.type[role]);
  }

  function setResultMode(hasPartner) {
    resultGrid.classList.toggle("result-grid--solo", !hasPartner);
    resultCross.hidden = !hasPartner;
    partnerResult.hidden = !hasPartner;
    mismatchResult.hidden = !hasPartner;
    setGiftOfferMode(hasPartner);
    window.dispatchEvent(new CustomEvent("love-diagnosis-mode", { detail: { hasPartner } }));
  }

  function setGiftOfferMode(hasPartner) {
    const mode = hasPartner ? "pair" : "solo";
    giftModeElements.forEach((element) => {
      element.hidden = element.dataset.giftMode !== mode;
    });
    giftOffer.hidden = false;
    pairNextStage.hidden = true;
  }

  function setSoloOfferType(diagnosis) {
    soloTypeName.textContent = diagnosis.type.name + "タイプ";
  }

  function renderPairResult(youDiagnosis, partnerDate, youGender) {
    const partnerDiagnosis = LoveDiagnosis.diagnose(
      partnerDate.year,
      partnerDate.month,
      partnerDate.day
    );
    const partnerGender = youGender === "female" ? "male" : "female";
    const femaleDiagnosis = youGender === "female" ? youDiagnosis : partnerDiagnosis;
    const maleDiagnosis = youGender === "male" ? youDiagnosis : partnerDiagnosis;
    const compatibilityKey = `${femaleDiagnosis.type.key}|${maleDiagnosis.type.key}`;
    const compatibility = LOVE_COMPATIBILITY_DATA[compatibilityKey];
    if (!compatibility) throw new Error("該当するすれ違いデータが見つかりません。");

    renderTypeResult("partner-result", partnerDiagnosis, partnerGender);
    pairYouType.textContent = youDiagnosis.type.name + "タイプ";
    pairPartnerType.textContent = partnerDiagnosis.type.name + "タイプ";
    document.querySelector('[data-mismatch="heading"]').textContent = compatibility.heading;
    const paragraphs = youGender === "male"
      ? compatibility.paragraphs.map((paragraph) => paragraph
        .replaceAll("あなた", "__FEMALE_PARTNER__")
        .replaceAll("彼", "あなた")
        .replaceAll("__FEMALE_PARTNER__", "お相手"))
      : compatibility.paragraphs;
    renderParagraphs(document.querySelector('[data-mismatch="description"]'), paragraphs);
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
    const you = readDate("you");
    const partner = readDate("partner");
    const youGender = readGender();
    const partnerState = LoveFormState.getOptionalDateState(partner);

    if (!LoveDiagnosis.validateDate(you.year, you.month, you.day)) {
      showError("あなたの生年月日をすべて正しく選択してください。");
      return;
    }

    if (partnerState === "partial") {
      showError("お相手の生年月日は、年・月・日をすべて選択するか、空欄にしてください。");
      return;
    }

    if (partnerState === "complete"
      && !LoveDiagnosis.validateDate(partner.year, partner.month, partner.day)) {
      showError("お相手の生年月日を正しく選択してください。");
      return;
    }

    try {
      const hasPartner = partnerState === "complete";
      const youDiagnosis = LoveDiagnosis.diagnose(you.year, you.month, you.day);
      renderTypeResult("you-result", youDiagnosis, youGender);
      setSoloOfferType(youDiagnosis);
      if (hasPartner) renderPairResult(youDiagnosis, partner, youGender);
      setResultMode(hasPartner);

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
