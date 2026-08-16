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
      const rate = Math.min(y * 0.35, 240);
      heroBg.style.transform = `scale(1.1) translate3d(0, ${rate}px, 0)`;
      ticking = false;
    }
    window.addEventListener("scroll", () => {
      if (!ticking) { requestAnimationFrame(updateHero); ticking = true; }
    }, { passive: true });
  }

  /* --- Reveal on scroll (IntersectionObserver) --- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        // count-up trigger
        if (entry.target.dataset.count) startCountUp(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

  document.querySelectorAll(".reveal, [data-count], .tstep").forEach(el => io.observe(el));

  /* --- Number count-up --- */
  function startCountUp(el) {
    if (prefersReduced) { el.textContent = formatFinal(el); return; }
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 1600;
    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const val = target * easeOut(t);
      el.textContent = prefix + val.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
      if (t < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + target.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
    }
    requestAnimationFrame(tick);
  }
  function formatFinal(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    return prefix + target.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",") + suffix;
  }

  /* --- World map pulses (staggered ping) --- */
  const pulses = document.querySelectorAll(".map-pulse");
  pulses.forEach((p, i) => {
    p.style.animationDelay = (i * 0.4) + "s";
  });

  /* --- Mobile nav --- */
  const mobileToggle = document.querySelector(".nav-mobile-toggle");
  const links = document.querySelector(".nav-links");
  function setMenu(open) {
    if (!mobileToggle || !links) return;
    links.classList.toggle("mobile-open", open);
    mobileToggle.setAttribute("aria-expanded", open ? "true" : "false");
    mobileToggle.textContent = open ? "Close" : "Menu";
    document.body.classList.toggle("nav-open", open);
  }
  if (mobileToggle && links) {
    mobileToggle.addEventListener("click", () => {
      setMenu(!links.classList.contains("mobile-open"));
    });
    links.querySelectorAll("a").forEach((a) => {
      a.addEventListener("click", () => setMenu(false));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") setMenu(false);
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
