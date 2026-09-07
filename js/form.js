/* Multi-step consultation form
   Steps: 1) Kind of business  2) Where  3) Design brief  4) Contact
   Submits to craig@hendersongroup.com.au via FormSubmit, with mailto fallback.
*/
(function () {
  const STORAGE_KEY = "henderson_form_progress";
  const SUBMIT_KEY = "henderson_submissions";
  const DEST_EMAIL = "craig@hendersongroup.com.au";
  const FORMSUBMIT = "https://formsubmit.co/ajax/" + DEST_EMAIL;
  const LANG = (document.documentElement.getAttribute("lang") || "en").toLowerCase();
  const IS_PT = LANG.indexOf("pt") === 0;

  const I18N = IS_PT ? {
    industry: "Escolha um segmento.",
    country: "Escolha o país ou a região.",
    leadCapacity: "Diga quantos leads qualificados você consegue receber.",
    buyerDescription: "Descreva o cliente que você quer — algumas frases bastam.",
    fullName: "Informe seu nome completo.",
    firmName: "Informe o nome da empresa.",
    email: "Informe um e-mail comercial válido.",
    phone: "Informe um telefone válido.",
    nda: "Confirme o aviso de confidencialidade.",
    continue: "Continuar",
    submit: "Enviar o briefing",
    sending: "Enviando…",
    sendingStatus: "Enviando sua consulta para ",
    relayFail: "Não foi possível confirmar o envio por este navegador. Abrindo um e-mail direto para ",
    relayFailTail: " para a consulta não se perder.",
    restore: "Há uma consulta salva neste aparelho. Quer continuar de onde parou?",
    discard: "Descartar",
    resume: "Continuar",
    review: [
      ["Tipo de negócio", "industry"],
      ["Sede", "country"],
      ["Capacidade de leads", "leadCapacity"],
      ["Cliente desejado", "buyerDescription"],
      ["Valor aproximado", "dealBand"],
      ["Canal preferido", "preferredChannel"],
      ["Melhor horário", "preferredTime"],
    ],
    reviewBuyerEmpty: "—",
  } : {
    industry: "Please select an industry.",
    country: "Please choose a country or region.",
    leadCapacity: "Select how many qualified leads you can handle.",
    buyerDescription: "Please describe the customer you want — a few sentences is enough.",
    fullName: "Please enter your full name.",
    firmName: "Please enter your firm's name.",
    email: "Enter a valid business email address.",
    phone: "Enter a valid phone number.",
    nda: "Please acknowledge the confidentiality terms.",
    continue: "Continue",
    submit: "Send the brief",
    sending: "Sending…",
    sendingStatus: "Sending your enquiry to ",
    relayFail: "The secure email relay could not be confirmed from this browser. Opening a direct email to ",
    relayFailTail: " so the enquiry is not lost.",
    restore: "You have a saved consultation in progress. Continue where you left off?",
    discard: "Discard",
    resume: "Resume",
    review: [
      ["Kind of business", "industry"],
      ["Based in", "country"],
      ["Qualified-lead capacity", "leadCapacity"],
      ["Buyer they want", "buyerDescription"],
      ["Rough client value", "dealBand"],
      ["Preferred channel", "preferredChannel"],
      ["Preferred time", "preferredTime"],
    ],
    reviewBuyerEmpty: "—",
  };

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
    1: function () { return state.data.industry ? null : { industry: I18N.industry }; },
    2: function () { return state.data.country ? null : { country: I18N.country }; },
    3: function () {
      const errs = {};
      if (!state.data.leadCapacity) errs.leadCapacity = I18N.leadCapacity;
      const brief = (state.data.buyerDescription || "").trim();
      if (brief.length < 20) errs.buyerDescription = I18N.buyerDescription;
      return Object.keys(errs).length ? errs : null;
    },
    4: function () {
      const errs = {};
      if (!state.data.fullName || state.data.fullName.trim().length < 2) errs.fullName = I18N.fullName;
      if (!state.data.firmName || state.data.firmName.trim().length < 2) errs.firmName = I18N.firmName;
      const email = (state.data.email || "").trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errs.email = I18N.email;
      const phone = (state.data.phone || "").trim();
      if (!/^[+()\-\s\d]{7,}$/.test(phone)) errs.phone = I18N.phone;
      if (!state.data.nda) errs.nda = I18N.nda;
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
    const pct = (state.step / state.total) * 100;
    const fill = $(".form-progress-fill");
    if (fill) fill.style.width = pct + "%";
    const bar = $(".form-progress-bar");
    if (bar) bar.setAttribute("aria-valuenow", String(state.step));
    $$(".form-progress-labels span").forEach(function (el, i) {
      el.classList.remove("active", "done");
      if (i + 1 < state.step) el.classList.add("done");
      else if (i + 1 === state.step) el.classList.add("active");
    });
  }

  function updateNextState() {
    const next = $(".btn-next");
    if (!next) return;
    if (state.sending) {
      next.disabled = true;
      next.classList.remove("is-ghost");
      next.classList.add("is-sending");
      next.setAttribute("aria-disabled", "true");
      return;
    }
    next.classList.remove("is-sending");
    const ghost = (state.step === 1 && !state.data.industry);
    next.disabled = ghost;
    next.classList.toggle("is-ghost", ghost);
    if (ghost) next.setAttribute("aria-disabled", "true");
    else next.removeAttribute("aria-disabled");
    next.textContent = (state.step === state.total) ? I18N.submit : I18N.continue;
  }

  function showStep(n) {
    state.step = n;
    $$(".form-step").forEach(function (el) { el.classList.remove("active"); });
    const active = $('.form-step[data-step="' + n + '"]');
    if (active) active.classList.add("active");
    updateProgress();
    const back = $(".btn-back");
    if (back) back.disabled = (n === 1);
    updateNextState();
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
      tile.setAttribute("aria-pressed", tile.dataset.value === state.data.industry ? "true" : "false");
      tile.addEventListener("click", function () {
        $$("#industry-grid .radio-tile").forEach(function (t) {
          t.classList.remove("selected");
          t.setAttribute("aria-pressed", "false");
        });
        tile.classList.add("selected");
        tile.setAttribute("aria-pressed", "true");
        state.data.industry = tile.dataset.value;
        showErrors(null);
        updateNextState();
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
    const rows = I18N.review.map(function (row) {
      let val = state.data[row[1]] || I18N.reviewBuyerEmpty;
      if (row[1] === "buyerDescription") {
        const t = (state.data.buyerDescription || "").trim();
        val = !t ? I18N.reviewBuyerEmpty : (t.length > 140 ? t.slice(0, 140) + "…" : t);
      }
      return [row[0], val];
    });
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
    if (nextBtn) { nextBtn.textContent = I18N.sending; }
    updateNextState();
    setStatus(I18N.sendingStatus + DEST_EMAIL + "…");

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
      setStatus(I18N.relayFail + DEST_EMAIL + I18N.relayFailTail, true);
      window.location.href = buildMailto(record, ref);
      showSuccess(ref);
    }).finally(function () {
      state.sending = false;
      updateNextState();
    });
  }

  function offerRestore() {
    const saved = loadSaved();
    if (!saved || !saved.data || Object.values(saved.data).every(function (v) { return !v; })) return;
    const banner = document.createElement("div");
    banner.className = "restore-banner";
    banner.innerHTML = "<span>" + I18N.restore + "</span>"
      + '<div style="display:flex;gap:8px;flex-shrink:0;">'
      + "<button type=\"button\" data-restore-discard>" + I18N.discard + "</button>"
      + "<button type=\"button\" data-restore-resume style=\"background:var(--success);color:var(--ink-000);border-color:var(--success);\">" + I18N.resume + "</button>"
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
    updateNextState();
    offerRestore();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
