/* Multi-step consultation form
   Steps: 1) Kind of business  2) Where  3) Design brief  4) Contact
   Submits to craig@hendersongroup.com.au via FormSubmit, with mailto fallback.
*/
(function () {
  const STORAGE_KEY = "henderson_form_progress";
  const SUBMIT_KEY = "henderson_submissions";
  const DEST_EMAIL = "craig@hendersongroup.com.au";
  const FORMSUBMIT = "https://formsubmit.co/ajax/" + DEST_EMAIL;

  const state = {
    step: 1,
    total: 4,
    data: {
      industry: "",
      country: "",
      leadCapacity: "",
      buyerDescription: "",
      dealBand: "",
      preferredChannel: "",
      preferredTime: "",
      fullName: "",
      firmName: "",
      email: "",
      phone: "",
      nda: false,
    },
    started: null,
    sending: false,
  };

  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  function save() {
    try {
      state.started = state.started || Date.now();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        step: state.step, data: state.data, started: state.started
      }));
    } catch (e) { /* ignore */ }
  }
  function loadSaved() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function clearSaved() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
  }

  const validators = {
    1: function () { return state.data.industry ? null : { industry: "Please select an industry." }; },
    2: function () { return state.data.country ? null : { country: "Please choose a country or region." }; },
    3: function () {
      const errs = {};
      if (!state.data.leadCapacity) errs.leadCapacity = "Select how many qualified leads you can handle.";
      const brief = (state.data.buyerDescription || "").trim();
      if (brief.length < 20) errs.buyerDescription = "Please describe the customer you want — a few sentences is enough.";
      return Object.keys(errs).length ? errs : null;
    },
    4: function () {
      const errs = {};
      if (!state.data.fullName || state.data.fullName.trim().length < 2) errs.fullName = "Please enter your full name.";
      if (!state.data.firmName || state.data.firmName.trim().length < 2) errs.firmName = "Please enter your firm's name.";
      const email = (state.data.email || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = "Enter a valid business email address.";
      const phone = (state.data.phone || "").trim();
      if (!/^[+()\-\s\d]{7,}$/.test(phone)) errs.phone = "Enter a valid phone number.";
      if (!state.data.nda) errs.nda = "Please acknowledge the confidentiality terms.";
      return Object.keys(errs).length ? errs : null;
    },
  };

  function showErrors(errs) {
    $$("[data-err]").forEach(function (el) { el.classList.remove("show"); el.textContent = ""; });
    $$(".input, .select, .combo-input, textarea.input").forEach(function (el) { el.classList.remove("err"); });
    if (!errs) return;
    Object.entries(errs).forEach(function (entry) {
      const field = entry[0], msg = entry[1];
      const el = $('[data-err="' + field + '"]');
      if (el) { el.textContent = msg; el.classList.add("show"); }
      const input = $('[name="' + field + '"]') || $('[data-field="' + field + '"] .combo-input');
      if (input) input.classList.add("err");
    });
  }

  function setStatus(msg, isErr) {
    const el = $(".form-status");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("err", !!isErr);
  }

  function updateProgress() {
    const pct = ((state.step - 1) / state.total) * 100;
    const fill = $(".form-progress-fill");
    if (fill) fill.style.width = pct + "%";
    $$(".form-progress-labels span").forEach(function (el, i) {
      el.classList.remove("active", "done");
      if (i + 1 < state.step) el.classList.add("done");
      else if (i + 1 === state.step) el.classList.add("active");
    });
  }

  function showStep(n) {
    state.step = n;
    $$(".form-step").forEach(function (el) { el.classList.remove("active"); });
    const active = $('.form-step[data-step="' + n + '"]');
    if (active) active.classList.add("active");
    updateProgress();
    const back = $(".btn-back");
    if (back) back.disabled = (n === 1);
    const next = $(".btn-next");
    if (next) next.textContent = (n === state.total) ? "Submit Request →" : "Continue →";
    const shell = $(".form-shell");
    if (shell) shell.scrollIntoView({ behavior: "smooth", block: "nearest" });
    save();
  }

  function next() {
    if (state.sending) return;
    const check = validators[state.step] && validators[state.step]();
    if (check) { showErrors(check); return; }
    showErrors(null);
    if (state.step < state.total) showStep(state.step + 1);
    else submit();
  }
  function back() {
    showErrors(null);
    if (state.step > 1) showStep(state.step - 1);
  }

  function setupIndustryTiles() {
    $$("#industry-grid .radio-tile").forEach(function (tile) {
      tile.addEventListener("click", function () {
        $$("#industry-grid .radio-tile").forEach(function (t) { t.classList.remove("selected"); });
        tile.classList.add("selected");
        state.data.industry = tile.dataset.value;
        showErrors(null);
        save();
      });
      if (tile.dataset.value === state.data.industry) tile.classList.add("selected");
    });
  }

  function setupPillGroups() {
    $$("[data-pillgroup]").forEach(function (group) {
      const field = group.dataset.pillgroup;
      $$(".pill", group).forEach(function (pill) {
        pill.addEventListener("click", function () {
          $$(".pill", group).forEach(function (p) { p.classList.remove("selected"); });
          pill.classList.add("selected");
          state.data[field] = pill.dataset.value;
          showErrors(null);
          save();
        });
        if (pill.dataset.value === state.data[field]) pill.classList.add("selected");
      });
    });
  }

  function setupCountryCombo() {
    const combo = $("[data-field='country']");
    if (!combo || !window.COUNTRIES) return;
    const input = $(".combo-input", combo);
    const list = $(".combo-list", combo);

    function render(filter) {
      const f = (filter || "").trim().toLowerCase();
      const items = window.COUNTRIES
        .filter(function (row) { return !f || row[1].toLowerCase().indexOf(f) !== -1; })
        .slice(0, 100);
      list.innerHTML = items.map(function (row) {
        return '<div class="combo-opt" data-name="' + row[1] + '"><span class="flag">' + row[0] + "</span>" + row[1] + "</div>";
      }).join("");
      $$(".combo-opt", list).forEach(function (opt) {
        opt.addEventListener("mousedown", function (e) {
          e.preventDefault();
          input.value = opt.dataset.name;
          state.data.country = opt.dataset.name;
          combo.classList.remove("open");
          showErrors(null);
          save();
        });
      });
    }

    input.addEventListener("focus", function () { render(input.value); combo.classList.add("open"); });
    input.addEventListener("blur", function () { setTimeout(function () { combo.classList.remove("open"); }, 120); });
    input.addEventListener("input", function () {
      state.data.country = input.value;
      render(input.value);
      combo.classList.add("open");
      save();
    });
    if (state.data.country) input.value = state.data.country;
  }

  function setupInputs() {
    $$(".input[name], textarea.input[name]").forEach(function (inp) {
      const name = inp.name;
      if (state.data[name]) inp.value = state.data[name];
      inp.addEventListener("input", function () { state.data[name] = inp.value; save(); });
      inp.addEventListener("blur", function () { showErrors(null); });
    });
    const nda = $("[name='nda']");
    if (nda) {
      nda.checked = !!state.data.nda;
      nda.addEventListener("change", function () { state.data.nda = nda.checked; save(); showErrors(null); });
    }
  }

  function updateReview() {
    const rows = [
      ["Kind of business", state.data.industry || "—"],
      ["Based in", state.data.country || "—"],
      ["Qualified-lead capacity", state.data.leadCapacity || "—"],
      ["Buyer they want", (function () {
        const t = (state.data.buyerDescription || "").trim();
        if (!t) return "—";
        return t.length > 140 ? t.slice(0, 140) + "…" : t;
      })()],
      ["Rough client value", state.data.dealBand || "—"],
      ["Preferred channel", state.data.preferredChannel || "—"],
      ["Preferred time", state.data.preferredTime || "—"],
    ];
    const el = $(".review-list");
    if (el) el.innerHTML = rows.map(function (row) {
      return '<div class="review-row"><span class="k">' + row[0] + '</span><span class="v">' + row[1] + "</span></div>";
    }).join("");
  }

  function buildMailto(record, ref) {
    const lines = [
      "Private consultation request — " + ref,
      "",
      "Name: " + record.fullName,
      "Firm: " + record.firmName,
      "Email: " + record.email,
      "Phone: " + record.phone,
      "Kind of business: " + record.industry,
      "Based in: " + record.country,
      "Qualified-lead capacity: " + record.leadCapacity,
      "Buyer they want: " + record.buyerDescription,
      "Rough client value: " + (record.dealBand || "—"),
      "Preferred channel: " + record.preferredChannel,
      "Preferred time: " + (record.preferredTime || "—"),
      "Confidentiality acknowledged: yes",
      "Submitted: " + record.submittedAt,
    ];
    return "mailto:" + DEST_EMAIL
      + "?subject=" + encodeURIComponent("Henderson Group consultation — " + record.industry + " — " + record.firmName)
      + "&body=" + encodeURIComponent(lines.join("\n"));
  }

  function showSuccess(ref) {
    clearSaved();
    const progress = $(".form-progress");
    if (progress) progress.style.display = "none";
    $$(".form-step").forEach(function (el) { el.classList.remove("active"); });
    const actions = $(".form-actions");
    if (actions) actions.style.display = "none";
    const success = $(".form-success");
    if (success) success.classList.add("active");
    const idEl = $(".submission-id");
    if (idEl) idEl.textContent = ref;
    setStatus("");
  }

  function submit() {
    const hp = $("[name='hp_website']");
    if (hp && hp.value) { return; }

    const ref = "HG-" + Date.now().toString(36).toUpperCase();
    const record = Object.assign({}, state.data, {
      submittedAt: new Date().toISOString(),
      startedAt: state.started ? new Date(state.started).toISOString() : null,
      durationSeconds: state.started ? Math.round((Date.now() - state.started) / 1000) : null,
      reference: ref,
    });

    try {
      const list = JSON.parse(localStorage.getItem(SUBMIT_KEY) || "[]");
      list.push(record);
      localStorage.setItem(SUBMIT_KEY, JSON.stringify(list));
    } catch (e) {}

    state.sending = true;
    const nextBtn = $(".btn-next");
    if (nextBtn) { nextBtn.disabled = true; nextBtn.textContent = "Sending…"; }
    setStatus("Sending your enquiry to " + DEST_EMAIL + "…");

    const payload = {
      _subject: "Henderson Group consultation — " + record.industry + " — " + record.firmName,
      _template: "table",
      _captcha: "false",
      _replyto: record.email,
      name: record.fullName,
      email: record.email,
      phone: record.phone,
      firm: record.firmName,
      industry: record.industry,
      region: record.country,
      leadCapacity: record.leadCapacity,
      buyerDescription: record.buyerDescription,
      dealBand: record.dealBand || "—",
      preferredChannel: record.preferredChannel || "—",
      preferredTime: record.preferredTime || "—",
      reference: ref,
      message: "Design-brief enquiry from the Henderson Group site.",
    };

    fetch(FORMSUBMIT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(payload),
    }).then(function (res) {
      if (!res.ok) throw new Error("submit-failed");
      return res.json().catch(function () { return {}; });
    }).then(function () {
      showSuccess(ref);
    }).catch(function () {
      setStatus("The secure email relay could not be confirmed from this browser. Opening a direct email to " + DEST_EMAIL + " so the enquiry is not lost.", true);
      window.location.href = buildMailto(record, ref);
      showSuccess(ref);
    }).finally(function () {
      state.sending = false;
      if (nextBtn) nextBtn.disabled = false;
    });
  }

  function offerRestore() {
    const saved = loadSaved();
    if (!saved || !saved.data || Object.values(saved.data).every(function (v) { return !v; })) return;
    const banner = document.createElement("div");
    banner.className = "restore-banner";
    banner.innerHTML = "<span>You have a saved consultation in progress. Continue where you left off?</span>"
      + '<div style="display:flex;gap:8px;flex-shrink:0;">'
      + "<button type=\"button\" data-restore-discard>Discard</button>"
      + "<button type=\"button\" data-restore-resume style=\"background:var(--success);color:var(--ink-000);border-color:var(--success);\">Resume</button>"
      + "</div>";
    const shell = $(".form-shell");
    shell.insertBefore(banner, shell.firstChild);
    banner.querySelector("[data-restore-resume]").addEventListener("click", function () {
      Object.assign(state.data, saved.data);
      state.started = saved.started;
      setupIndustryTiles();
      setupPillGroups();
      setupInputs();
      const cInput = $(".combo-input");
      if (cInput && state.data.country) cInput.value = state.data.country;
      showStep(Math.min(saved.step || 1, state.total));
      banner.remove();
    });
    banner.querySelector("[data-restore-discard]").addEventListener("click", function () {
      clearSaved();
      banner.remove();
    });
  }

  function init() {
    setupIndustryTiles();
    setupPillGroups();
    setupCountryCombo();
    setupInputs();

    const nextBtn = $(".btn-next");
    const backBtn = $(".btn-back");
    if (nextBtn) nextBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (state.step === state.total) updateReview();
      next();
    });
    if (backBtn) backBtn.addEventListener("click", function (e) {
      e.preventDefault();
      back();
    });

    document.addEventListener("keydown", function (e) {
      const inForm = document.activeElement && document.activeElement.closest(".form-shell");
      if (!inForm) return;
      if (e.key === "Enter" && document.activeElement.tagName !== "TEXTAREA") {
        e.preventDefault();
        next();
      }
    });

    const obs = new MutationObserver(function () {
      const s4 = $(".form-step[data-step='4']");
      if (s4 && s4.classList.contains("active")) updateReview();
    });
    $$(".form-step").forEach(function (el) {
      obs.observe(el, { attributes: true, attributeFilter: ["class"] });
    });

    updateProgress();
    offerRestore();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
