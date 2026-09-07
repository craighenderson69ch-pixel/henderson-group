/* Scroll reveal + counters + parallax + nav scroll */
(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* --- Nav scrolled state --- */
  const nav = document.querySelector(".nav");
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 32) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* --- Hero parallax --- */
  const heroBg = document.querySelector(".hero-bg img");
  if (heroBg && !prefersReduced) {
    let ticking = false;
    function updateHero() {
      const y = window.scrollY;
      const rate = Math.min(y * 0.08, 48);
      heroBg.style.transform = `scale(1.32) translate3d(0, ${rate}px, 0)`;
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(updateHero); ticking = true; }
    }, { passive: true });
  }

  /* --- Number count-up (must complete; never stay on 0) --- */
  function formatFinal(el) {
    const target = parseFloat(el.dataset.count);
    if (Number.isNaN(target)) return el.textContent;
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    return prefix + target.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
  }
  function finishCount(el) {
    el.textContent = formatFinal(el);
    el.dataset.counted = "1";
  }
  function startCountUp(el) {
    if (!el || !el.dataset.count || el.dataset.counted === "1") return;
    el.dataset.counted = "1";
    finishCount(el);
  }
  function countersIn(root) {
    const found = [];
    if (root.dataset && root.dataset.count) found.push(root);
    if (root.querySelectorAll) {
      root.querySelectorAll("[data-count]").forEach(function (el) { found.push(el); });
    }
    return found;
  }
  function startCountersIn(root) {
    countersIn(root).forEach(startCountUp);
  }

  /* --- Reveal on scroll (IntersectionObserver) --- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        startCountersIn(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0, rootMargin: "80px 0px 80px 0px" });

  document.querySelectorAll(".reveal, [data-count], .tstep").forEach(el => io.observe(el));

  /* Viewport check + late fallback — do not rely on the observer alone. */
  function flushVisibleCounters() {
    document.querySelectorAll("[data-count]").forEach(function (el) {
      const rect = el.getBoundingClientRect();
      const visible = rect.bottom > 0 && rect.top < (window.innerHeight || 800) + 80;
      if (visible) startCountUp(el);
    });
  }
  flushVisibleCounters();
  window.addEventListener("load", flushVisibleCounters, { once: true });
  window.addEventListener("scroll", flushVisibleCounters, { passive: true });
  setTimeout(function () {
    document.querySelectorAll("[data-count]").forEach(finishCount);
  }, 2400);

  /* --- Active section in the sticky nav --- */
  const navLinks = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
  const navTargets = navLinks
    .map((a) => {
      const id = a.getAttribute("href").slice(1);
      return { a, el: document.getElementById(id) };
    })
    .filter((row) => row.el);
  function markCurrentNav() {
    if (!navTargets.length) return;
    const line = 120;
    let current = navTargets[0];
    navTargets.forEach((row) => {
      if (row.el.getBoundingClientRect().top <= line) current = row;
    });
    navLinks.forEach((a) => {
      const on = current && a === current.a;
      a.classList.toggle("is-current", on);
      if (on) a.setAttribute("aria-current", "location");
      else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", markCurrentNav, { passive: true });
  markCurrentNav();

  /* --- World map pulses (staggered ping) --- */
  const pulses = document.querySelectorAll(".map-pulse");
  pulses.forEach((p, i) => {
    p.style.animationDelay = (i * 0.4) + "s";
  });

  /* --- Mobile nav --- */
  const mobileToggle = document.querySelector(".nav-mobile-toggle");
  const links = document.querySelector(".nav-links");
  if (mobileToggle && links) {
    mobileToggle.addEventListener("click", () => {
      const open = links.classList.toggle("mobile-open");
      mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => {
        links.classList.remove("mobile-open");
        mobileToggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  /* --- Continent dot-grid (decorative, drawn in JS to keep markup clean) --- */
  (function drawContinents() {
    const g = document.getElementById("continents");
    if (!g) return;
    const bands = [
      [90,  [[140,220],[400,450]]],
      [110, [[130,240],[390,470],[600,680]]],
      [130, [[110,260],[380,490],[590,690]]],
      [150, [[100,275],[370,500],[580,700]]],
      [170, [[110,285],[365,520],[570,710]]],
      [190, [[120,290],[360,540],[560,720]]],
      [210, [[130,290],[365,545],[560,720]]],
      [230, [[145,285],[380,535],[565,715]]],
      [250, [[160,280],[400,520],[570,710]]],
      [270, [[175,270],[420,510],[580,700]]],
      [290, [[195,260],[430,500],[590,690]]],
      [310, [[210,255],[225,268],[440,490],[600,680]]],
      [330, [[220,272],[450,485],[615,675]]],
      [350, [[228,282],[460,480],[640,700]]],
      [370, [[238,288],[650,710]]],
      [390, [[248,282],[660,710]]],
      [410, [[252,274]]],
    ];
    let out = "";
    bands.forEach(([y, xs]) => {
      xs.forEach(([x1, x2]) => {
        for (let x = x1; x <= x2; x += 8) {
          const jx = x + (Math.sin(x * y) * 0.7);
          const jy = y + (Math.cos(x * y) * 0.7);
          out += '<circle cx="' + jx.toFixed(1) + '" cy="' + jy.toFixed(1) + '" r="0.9" opacity="' + (0.35 + Math.random() * 0.35).toFixed(2) + '"/>';
        }
      });
    });
    g.innerHTML = out;
  })();
})();
