/* Shared HTML escaping for review rows and combobox options. */
(function (root) {
  function escapeHtml(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  root.escapeHtml = escapeHtml;
  if (typeof module !== "undefined" && module.exports) {
    module.exports = { escapeHtml: escapeHtml };
  }
})(typeof window !== "undefined" ? window : globalThis);
