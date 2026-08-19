(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.LoveFormState = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function getOptionalDateState(date) {
    const selectedCount = [date.year, date.month, date.day]
      .map(Number)
      .filter((value) => value > 0).length;

    if (selectedCount === 0) return "empty";
    if (selectedCount === 3) return "complete";
    return "partial";
  }

  return Object.freeze({ getOptionalDateState });
});