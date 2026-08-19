(function (root, factory) {
  const earlyTable = typeof module === "object" && module.exports
    ? require("./early-table.js")
    : root.LoveEarlyTable;
  const typeContent = typeof module === "object" && module.exports
    ? require("./type-content.js")
    : root.LOVE_TYPE_CONTENT;
  const api = factory(earlyTable, typeContent);
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LoveDiagnosis = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function (earlyTable, typeContent) {
  "use strict";

  function validateDate(year, month, day) {
    const y = Number(year);
    const m = Number(month);
    const d = Number(day);
    if (![y, m, d].every(Number.isInteger)) return false;
    if (y < earlyTable.MIN_YEAR || y > earlyTable.MAX_YEAR || m < 1 || m > 12) return false;
    return d >= 1 && d <= earlyTable.daysInMonth(y, m);
  }

  function getDiagnosisNumber(baseNumber, day) {
    const base = Number(baseNumber);
    const birthDay = Number(day);
    if (!Number.isInteger(base) || base < 0 || base > 59) {
      throw new RangeError("早見表の数字が不正です。");
    }
    if (!Number.isInteger(birthDay) || birthDay < 1 || birthDay > 31) {
      throw new RangeError("生まれた日が不正です。");
    }
    return ((base + birthDay - 1) % 60) + 1;
  }

  function getTypeByNumber(number) {
    const numeric = Number(number);
    if (!Number.isInteger(numeric) || numeric < 1 || numeric > 60) {
      throw new RangeError("診断番号は1〜60で指定してください。");
    }
    const remainder = numeric % 10;
    const type = typeContent.find((item) => item.remainder === remainder);
    if (!type) throw new Error("対応する恋愛タイプが見つかりません。");
    return type;
  }

  function diagnose(year, month, day) {
    if (!validateDate(year, month, day)) throw new RangeError("正しい生年月日を選択してください。");
    const baseNumber = earlyTable.getBaseNumber(Number(year), Number(month));
    const diagnosisNumber = getDiagnosisNumber(baseNumber, Number(day));
    return Object.freeze({
      year: Number(year), month: Number(month), day: Number(day),
      baseNumber, diagnosisNumber, type: getTypeByNumber(diagnosisNumber)
    });
  }

  return Object.freeze({ validateDate, getDiagnosisNumber, getTypeByNumber, diagnose });
});
