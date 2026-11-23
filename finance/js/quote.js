/* Henderson Group /finance/ multi-step quote form
   Submit is a stub until RateMatch's endpoint is wired. */
(function (root) {
  "use strict";

  /* ============================================================
     TODO: Wire this submit handler to RateMatch's quote endpoint.
     PLACEHOLDER: paste the live URL from RateMatch below.
     Leave empty to keep the client-side stub (current behaviour).
     ============================================================ */
  var RATEMATCH_QUOTE_ENDPOINT = ""; // PLACEHOLDER: RateMatch quote API URL

  var STORAGE_KEY = "hg_finance_quote";
  var LOAN_TYPES = ["home", "car", "personal"];
  var PURPOSE_BY_TYPE = {
    home: ["Buy a home", "Refinance", "Investment property", "Build or renovate"],
    car: ["New car", "Used car", "Refinance a car loan"],
    personal: ["Debt consolidation", "Home improvement", "Vehicle or travel", "Other"]
  };
  var AMOUNT_PRESETS = {
    home: [350000, 550000, 750000, 1000000],
    car: [15000, 25000, 40000, 60000],
    personal: [5000, 10000, 20000, 30000]
  };
  var AMOUNT_BOUNDS = {
    home: { min: 50000, max: 5000000 },
    car: { min: 3000, max: 250000 },
    personal: { min: 2000, max: 100000 }
  };
  var LABELS = {
    home: "Home",
    car: "Car",
    personal: "Personal",
    "full-time": "Full-time",
    "part-time": "Part-time",
    casual: "Casual",
    "self-employed": "Self-employed",
    retired: "Retired",
    other: "Other",
    "under-40k": "Under $40k",
    "40-60k": "$40–60k",
    "60-80k": "$60–80k",
    "80-100k": "$80–100k",
    "100-150k": "$100–150k",
    "150k-plus": "$150k+"
  };

  function emptyData() {
    return {
      loanType: "",
      amount: "",
      purpose: "",
      employment: "",
      incomeRange: "",
      fullName: "",
      email: "",
      mobile: "",
      postcode: "",
      consent: false
    };
  }

  function digits(value) {
    return String(value || "").replace(/[^\d]/g, "");
  }

  function parseAmount(value) {
    var n = parseInt(digits(value), 10);
    return isNaN(n) ? 0 : n;
  }

  function formatAmount(n) {
    if (!n) return "";
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }

  function validateStep(step, data) {
    var errs = {};
    if (step === 1) {
      if (LOAN_TYPES.indexOf(data.loanType) === -1) errs.loanType = "Choose home, car or personal.";
    }
    if (step === 2) {
      var amount = parseAmount(data.amount);
      var bounds = AMOUNT_BOUNDS[data.loanType] || { min: 2000, max: 5000000 };
      if (!amount) errs.amount = "Enter an amount in Australian dollars.";
      else if (amount < bounds.min || amount > bounds.max) {
        errs.amount = "Enter an amount between $" + formatAmount(bounds.min) + " and $" + formatAmount(bounds.max) + ".";
      }
      var purposes = PURPOSE_BY_TYPE[data.loanType] || [];
      if (purposes.indexOf(data.purpose) === -1) errs.purpose = "Choose what the loan is for.";
    }
    if (step === 3) {
      if (!data.employment) errs.employment = "Select your employment.";
      if (!data.incomeRange) errs.incomeRange = "Select an income range.";
    }
    if (step === 4) {
      if (!data.fullName || data.fullName.trim().length < 2) errs.fullName = "Enter your full name.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email || "").trim())) {
        errs.email = "Enter a valid email.";
      }
      var mobile = String(data.mobile || "").replace(/\s+/g, "");
      if (!/^(?:\+?61|0)4\d{8}$/.test(mobile)) errs.mobile = "Enter an Australian mobile number.";
      if (!/^\d{4}$/.test(String(data.postcode || "").trim())) errs.postcode = "Enter a 4-digit Australian postcode.";
      if (!data.consent) errs.consent = "Please confirm the consent box.";
    }
    return Object.keys(errs).length ? errs : null;
  }

  function makeReference() {
    return "HG-LQ-" + Date.now().toString(36).toUpperCase();
  }

  function buildPayload(data, reference) {
    return {
      source: "hendersongroup.com.au/finance",
      partner: "Henderson Group",
      licensee: "RateMatch",
      reference: reference,
      loanType: data.loanType,
      amountAud: parseAmount(data.amount),
      purpose: data.purpose,
      employment: data.employment,
      incomeRange: data.incomeRange,
      fullName: String(data.fullName || "").trim(),
      email: String(data.email || "").trim(),
      mobile: String(data.mobile || "").replace(/\s+/g, ""),
      postcode: String(data.postcode || "").trim(),
      consent: !!data.consent,
      submittedAt: new Date().toISOString()
    };
  }

  /* Stub submit. When RATEMATCH_QUOTE_ENDPOINT is set, POSTs JSON there.
     Until then, resolves locally so the UI can be tested end-to-end. */
  function submitQuote(payload) {
    if (!RATEMATCH_QUOTE_ENDPOINT) {
      if (typeof console !== "undefined" && console.info) {
        console.info("[PLACEHOLDER] RateMatch endpoint not configured. Quote payload:", payload);
      }
      return Promise.resolve({ ok: true, stub: true, reference: payload.reference });
    }
    return fetch(RATEMATCH_QUOTE_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error("rate-match-submit-failed");
      return res.json().catch(function () { return { ok: true, reference: payload.reference }; });
    });
  }

  var api = {
    RATEMATCH_QUOTE_ENDPOINT: RATEMATCH_QUOTE_ENDPOINT,
    LOAN_TYPES: LOAN_TYPES,
    PURPOSE_BY_TYPE: PURPOSE_BY_TYPE,
    AMOUNT_PRESETS: AMOUNT_PRESETS,
    AMOUNT_BOUNDS: AMOUNT_BOUNDS,
    LABELS: LABELS,
    emptyData: emptyData,
    parseAmount: parseAmount,
    formatAmount: formatAmount,
    validateStep: validateStep,
    buildPayload: buildPayload,
    submitQuote: submitQuote,
    makeReference: makeReference
  };

  function boot(document) {
    var form = document.getElementById("hg-quote");
    if (!form) return;

    var state = { step: 1, total: 4, data: emptyData(), sending: false };

    function $(sel, rootEl) { return (rootEl || document).querySelector(sel); }
    function $$(sel, rootEl) { return Array.prototype.slice.call((rootEl || document).querySelectorAll(sel)); }

    function track(event, extra) {
      root.dataLayer = root.dataLayer || [];
      var payload = { event: event };
      if (extra) Object.keys(extra).forEach(function (k) { payload[k] = extra[k]; });
      root.dataLayer.push(payload);
    }

    function save() {
      try { root.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step: state.step, data: state.data })); } catch (e) {}
    }

    function showErrors(errs) {
      $$("[data-err]").forEach(function (el) {
        el.textContent = "";
        el.classList.remove("show");
      });
      $$(".input").forEach(function (el) { el.classList.remove("err"); });
      if (!errs) return;
      Object.keys(errs).forEach(function (field) {
        var box = $('[data-err="' + field + '"]');
        if (box) {
          box.textContent = errs[field];
          box.classList.add("show");
        }
        var input = form.querySelector('[name="' + field + '"]');
        if (input) input.classList.add("err");
      });
    }

    function setStatus(msg, isErr) {
      var el = $("#quote-status");
      if (!el) return;
      el.textContent = msg || "";
      el.classList.toggle("err", !!isErr);
    }

    function renderPresets() {
      var row = $("#amount-presets");
      if (!row) return;
      var presets = AMOUNT_PRESETS[state.data.loanType] || [];
      row.innerHTML = presets.map(function (n) {
        return '<button type="button" class="chip" data-amount="' + n + '">$' + formatAmount(n) + "</button>";
      }).join("");
      $$("[data-amount]", row).forEach(function (btn) {
        btn.addEventListener("click", function () {
          state.data.amount = String(btn.getAttribute("data-amount"));
          var input = $("#amount");
          if (input) input.value = formatAmount(state.data.amount);
          $$("[data-amount]", row).forEach(function (b) { b.setAttribute("aria-pressed", b === btn ? "true" : "false"); });
          showErrors(null);
          save();
        });
      });
    }

    function renderPurpose() {
      var row = $("#purpose-row");
      if (!row) return;
      var options = PURPOSE_BY_TYPE[state.data.loanType] || [];
      row.innerHTML = options.map(function (label) {
        var pressed = state.data.purpose === label ? "true" : "false";
        return '<button type="button" class="chip" data-field="purpose" data-value="' + label + '" aria-pressed="' + pressed + '">' + label + "</button>";
      }).join("");
      bindChoiceButtons(row);
    }

    function updateProgress() {
      var pct = (state.step / state.total) * 100;
      var fill = $(".form-progress-fill");
      if (fill) fill.style.width = pct + "%";
      var bar = $(".form-progress-bar");
      if (bar) bar.setAttribute("aria-valuenow", String(state.step));
      $$(".form-progress-labels span").forEach(function (el, i) {
        el.classList.remove("active", "done");
        if (i + 1 < state.step) el.classList.add("done");
        else if (i + 1 === state.step) el.classList.add("active");
      });
    }

    function updateReview() {
      var el = $("#quote-review");
      if (!el) return;
      var rows = [
        ["Loan", LABELS[state.data.loanType] || state.data.loanType],
        ["Amount", state.data.amount ? "$" + formatAmount(parseAmount(state.data.amount)) : ""],
        ["Purpose", state.data.purpose],
        ["Employment", LABELS[state.data.employment] || state.data.employment],
        ["Income", LABELS[state.data.incomeRange] || state.data.incomeRange]
      ].filter(function (row) { return row[1]; });
      el.innerHTML = rows.map(function (row) {
        return '<div class="review-row"><span>' + row[0] + "</span><span>" + row[1] + "</span></div>";
      }).join("");
    }

    function showStep(n) {
      state.step = n;
      $$(".form-step").forEach(function (el) { el.classList.remove("active"); });
      var active = $('.form-step[data-step="' + n + '"]');
      if (active) active.classList.add("active");
      var back = $("#quote-back");
      if (back) back.disabled = n === 1;
      var next = $("#quote-next");
      if (next) next.textContent = n === state.total ? "Send quote request" : "Continue";
      if (n === 2) {
        renderPresets();
        renderPurpose();
      }
      if (n === state.total) updateReview();
      updateProgress();
      save();
      var shell = $(".form-shell");
      if (shell && n > 1) shell.scrollIntoView({ behavior: "smooth", block: "nearest" });
      track("finance_quote_step", { step: n, loanType: state.data.loanType || undefined });
    }

    function setLoanType(value, jumpToAmount) {
      if (LOAN_TYPES.indexOf(value) === -1) return;
      state.data.loanType = value;
      if (state.data.purpose && (PURPOSE_BY_TYPE[value] || []).indexOf(state.data.purpose) === -1) {
        state.data.purpose = "";
      }
      $$(".loan-card[data-loan]").forEach(function (card) {
        card.setAttribute("aria-pressed", card.getAttribute("data-loan") === value ? "true" : "false");
      });
      $$('#loan-type-grid .choice[data-field="loanType"]').forEach(function (btn) {
        btn.setAttribute("aria-pressed", btn.getAttribute("data-value") === value ? "true" : "false");
      });
      showErrors(null);
      save();
      if (jumpToAmount) {
        showStep(2);
        var quote = document.getElementById("quote");
        if (quote) quote.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }

    function bindChoiceButtons(scope) {
      $$("[data-field]", scope).forEach(function (btn) {
        if (btn.disabled) return;
        btn.addEventListener("click", function () {
          var field = btn.getAttribute("data-field");
          var value = btn.getAttribute("data-value");
          if (field === "loanType") {
            setLoanType(value, false);
            return;
          }
          state.data[field] = value;
          $$( '[data-field="' + field + '"]', btn.parentNode).forEach(function (el) {
            el.setAttribute("aria-pressed", el === btn ? "true" : "false");
          });
          showErrors(null);
          save();
        });
      });
    }

    function next(event) {
      if (event) event.preventDefault();
      if (state.sending) return;
      var errs = validateStep(state.step, state.data);
      if (errs) {
        showErrors(errs);
        return;
      }
      showErrors(null);
      if (state.step < state.total) {
        showStep(state.step + 1);
        return;
      }
      send();
    }

    function back() {
      showErrors(null);
      if (state.step > 1) showStep(state.step - 1);
    }

    function send() {
      var hp = form.querySelector('[name="hp_website"]');
      if (hp && hp.value) return;

      var reference = makeReference();
      var payload = buildPayload(state.data, reference);
      state.sending = true;
      var nextBtn = $("#quote-next");
      if (nextBtn) {
        nextBtn.disabled = true;
        nextBtn.textContent = "Sending…";
      }
      setStatus(RATEMATCH_QUOTE_ENDPOINT ? "Sending to RateMatch…" : "Saving locally — RateMatch endpoint is still a placeholder.");

      submitQuote(payload).then(function () {
        $$(".form-step").forEach(function (el) { el.classList.remove("active"); });
        var actions = $(".form-actions");
        if (actions) actions.style.display = "none";
        var progress = $(".form-progress");
        if (progress) progress.style.display = "none";
        var success = $("#quote-success");
        if (success) success.hidden = false;
        var refEl = $("#quote-ref");
        if (refEl) refEl.textContent = reference;
        setStatus("");
        try { root.sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
        track("finance_quote_submit", { stub: !RATEMATCH_QUOTE_ENDPOINT, loanType: payload.loanType, reference: reference });
      }).catch(function () {
        setStatus("The quote could not be sent. Check the RateMatch endpoint placeholder and try again.", true);
        if (nextBtn) {
          nextBtn.disabled = false;
          nextBtn.textContent = "Send quote request";
        }
      }).then(function () {
        state.sending = false;
      });
    }

    $$(".loan-card[data-loan]").forEach(function (card) {
      card.addEventListener("click", function () {
        setLoanType(card.getAttribute("data-loan"), true);
      });
    });

    bindChoiceButtons($("#loan-type-grid"));
    bindChoiceButtons($("#employment-row"));
    bindChoiceButtons($("#income-row"));

    var amountInput = $("#amount");
    if (amountInput) {
      amountInput.addEventListener("input", function () {
        var n = parseAmount(amountInput.value);
        state.data.amount = n ? String(n) : "";
        amountInput.value = formatAmount(n);
        save();
      });
    }

    ["fullName", "email", "mobile", "postcode"].forEach(function (name) {
      var input = form.querySelector('[name="' + name + '"]');
      if (!input) return;
      input.addEventListener("input", function () {
        state.data[name] = input.value;
        save();
      });
    });

    var consent = $("#consent");
    if (consent) {
      consent.addEventListener("change", function () {
        state.data.consent = consent.checked;
        save();
      });
    }

    form.addEventListener("submit", next);
    var backBtn = $("#quote-back");
    if (backBtn) backBtn.addEventListener("click", back);

    var quoteSection = document.getElementById("quote");
    var mobileCta = $(".mobile-cta");
    if (quoteSection && mobileCta && "IntersectionObserver" in root) {
      var obs = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          mobileCta.classList.toggle("is-hidden", entry.isIntersecting);
        });
      }, { threshold: 0.2 });
      obs.observe(quoteSection);
    }

    showStep(1);
    track("finance_quote_view");
  }

  if (root.document) {
    if (root.document.readyState === "loading") {
      root.document.addEventListener("DOMContentLoaded", function () { boot(root.document); });
    } else {
      boot(root.document);
    }
  }

  root.HGFinanceQuote = api;
  if (typeof module !== "undefined" && module.exports) module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
