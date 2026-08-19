(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LoveEarlyTable = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MIN_YEAR = 1954;
  const MAX_YEAR = 2025;
  const START_VALUE = 53; // 提供画像：1954年1月

  function isLeapYear(year) {
    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  }

  function daysInMonth(year, month) {
    const days = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    return days[month - 1];
  }

  function buildTable() {
    const table = {};
    let value = START_VALUE;

    for (let year = MIN_YEAR; year <= MAX_YEAR; year += 1) {
      table[year] = {};
      for (let month = 1; month <= 12; month += 1) {
        table[year][month] = value;
        value = (value + daysInMonth(year, month)) % 60;
      }
      Object.freeze(table[year]);
    }

    return Object.freeze(table);
  }

  const table = buildTable();

  function getBaseNumber(year, month) {
    const numericYear = Number(year);
    const numericMonth = Number(month);
    if (!Number.isInteger(numericYear) || numericYear < MIN_YEAR || numericYear > MAX_YEAR) {
      throw new RangeError(`年は${MIN_YEAR}〜${MAX_YEAR}の範囲で指定してください。`);
    }
    if (!Number.isInteger(numericMonth) || numericMonth < 1 || numericMonth > 12) {
      throw new RangeError("月は1〜12の範囲で指定してください。");
    }
    return table[numericYear][numericMonth];
  }

  return Object.freeze({ MIN_YEAR, MAX_YEAR, table, isLeapYear, daysInMonth, getBaseNumber });
});
