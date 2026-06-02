/**
 * Controverse SDHI — interactions & animations
 */

(function () {
  "use strict";

  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const backToTop = document.querySelector(".back-to-top");
  const progressBar = document.querySelector(".progress-bar");
  const sections = document.querySelectorAll("main section[id], main nav[id]");
  const sommaireLinks = document.querySelectorAll(".sommaire__link");
  const accordions = document.querySelectorAll(".accordion");
  const reveals = document.querySelectorAll("[data-reveal], .reveal");
  const mapTooltip = document.getElementById("map-tooltip");
  const filterBtns = document.querySelectorAll(".filter-btn");

  /* --- Scroll fluide --- */

  function smoothScrollTo(target) {
    const top = target.getBoundingClientRect().top + window.scrollY - 16;
    window.scrollTo({ top: top, behavior: prefersReducedMotion ? "auto" : "smooth" });
  }

  const heroTitle = document.querySelector(".hero__title");
  const heroParticles = document.querySelector(".hero__particles");
  const heroBgImg = document.querySelector(".hero__bg img");
  const heroSection = document.querySelector(".hero");

  function updateHeroParallax(scrollY) {
    if (prefersReducedMotion || !heroSection) return;
    const y = scrollY;
    if (y > 900) return;

    if (heroParticles) {
      heroParticles.style.transform = "translateY(" + y * 0.06 + "px)";
      heroParticles.style.opacity = String(Math.max(0, 1 - y / 600));
    }
    if (heroBgImg) {
      heroBgImg.style.transform =
        "scale(1.05) translateY(" + y * 0.12 + "px)";
    }
    if (heroSection) {
      heroSection.style.setProperty("--hero-scroll", String(y));
    }
  }

  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener("click", function (e) {
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      smoothScrollTo(target);
    });
  });

  /* --- Scroll : progression --- */

  function onScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (progressBar && docHeight > 0) {
      progressBar.style.width = Math.min(100, (scrollTop / docHeight) * 100) + "%";
    }

    if (backToTop) {
      backToTop.classList.toggle("is-visible", scrollTop > 400);
    }

    let current = "";
    sections.forEach(function (section) {
      if (section.id === "hero") return;
      const top = section.offsetTop - 120;
      if (scrollTop >= top) {
        current = section.getAttribute("id") || "";
      }
    });

    sommaireLinks.forEach(function (link) {
      const href = link.getAttribute("href");
      link.classList.toggle("is-active", href === "#" + current);
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "scroll",
    function () {
      updateHeroParallax(window.scrollY);
    },
    { passive: true }
  );
  onScroll();

  if (backToTop) {
    backToTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
    });
  }

  /* --- Intersection Observer : reveal --- */

  if (!prefersReducedMotion && reveals.length) {
    const revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          const headerEl = entry.target.closest(".section__header");
          if (headerEl) headerEl.classList.add("is-visible");

          if (entry.target.classList.contains("timeline__item")) {
            entry.target.classList.add("is-visible");
          }

          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });

    document.querySelectorAll(".section__header").forEach(function (h) {
      revealObserver.observe(h);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("is-visible");
    });
  }

  /* --- Compteurs animés --- */

  function animateCounter(el) {
    const target = parseFloat(el.dataset.count);
    if (isNaN(target)) return;

    const prefix = el.dataset.prefix || "";
    const suffix = el.dataset.suffix || "";
    const duration = 2200;
    const start = performance.now();
    const decimals = String(target).includes(".") ? 1 : 0;

    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.textContent =
        prefix +
        (decimals ? value.toFixed(1).replace(".", ",") : Math.round(value)) +
        suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  const counterObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll("[data-count]").forEach(function (el) {
    counterObserver.observe(el);
  });

  /* --- Barres sondage --- */

  const barObserver = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        const fill = entry.target;
        const pct = fill.dataset.percent;
        if (pct) fill.style.width = pct + "%";
        barObserver.unobserve(fill);
      });
    },
    { threshold: 0.3 }
  );

  document.querySelectorAll(".survey-stat__fill").forEach(function (fill) {
    barObserver.observe(fill);
  });

  /* --- Tilt 3D sur cartes --- */

  if (!prefersReducedMotion) {
    document.querySelectorAll(".tilt-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(600px) rotateY(" + x * 10 + "deg) rotateX(" + -y * 10 + "deg) translateY(-4px)";
      });

      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  /* --- Ripple --- */

  document.querySelectorAll(".ripple-host").forEach(function (host) {
    host.addEventListener("click", function (e) {
      const rect = host.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = e.clientX - rect.left - size / 2 + "px";
      ripple.style.top = e.clientY - rect.top - size / 2 + "px";
      host.style.position = "relative";
      host.style.overflow = "hidden";
      host.appendChild(ripple);
      setTimeout(function () {
        ripple.remove();
      }, 600);
    });
  });

  /* --- Bouton magnétique --- */

  const magneticBtn = document.querySelector(".btn--magnetic");
  if (magneticBtn && !prefersReducedMotion) {
    magneticBtn.addEventListener("mousemove", function (e) {
      const rect = magneticBtn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      magneticBtn.style.transform =
        "translate(" + x * 0.2 + "px, " + y * 0.2 + "px) translateY(-2px)";
    });
    magneticBtn.addEventListener("mouseleave", function () {
      magneticBtn.style.transform = "";
    });
  }

  /* --- Accordéons --- */

  accordions.forEach(function (accordion) {
    const trigger = accordion.querySelector(".accordion__trigger");
    const panel = accordion.querySelector(".accordion__panel");
    if (!trigger || !panel) return;

    trigger.setAttribute("aria-expanded", "false");
    panel.setAttribute("hidden", "");

    trigger.addEventListener("click", function () {
      const isOpen = accordion.classList.contains("is-open");

      accordions.forEach(function (other) {
        if (other === accordion || other.classList.contains("is-filtered-out")) return;
        other.classList.remove("is-open");
        const t = other.querySelector(".accordion__trigger");
        const p = other.querySelector(".accordion__panel");
        if (t) t.setAttribute("aria-expanded", "false");
        if (p) p.setAttribute("hidden", "");
      });

      accordion.classList.toggle("is-open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
      if (!isOpen) {
        panel.removeAttribute("hidden");
        accordion.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else {
        panel.setAttribute("hidden", "");
      }
    });
  });

  /* --- Filtre arguments --- */

  filterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      const filter = btn.dataset.filter;

      filterBtns.forEach(function (b) {
        b.classList.toggle("is-active", b === btn);
        b.setAttribute("aria-selected", b === btn ? "true" : "false");
      });

      accordions.forEach(function (acc) {
        const camp = acc.dataset.camp;
        const show = filter === "all" || camp === filter;
        acc.classList.toggle("is-filtered-out", !show);
        if (!show) {
          acc.classList.remove("is-open");
          const t = acc.querySelector(".accordion__trigger");
          const p = acc.querySelector(".accordion__panel");
          if (t) t.setAttribute("aria-expanded", "false");
          if (p) p.setAttribute("hidden", "");
        }
      });
    });
  });

  /* --- Glossaire interactif --- */

  document.querySelectorAll(".glossary__item").forEach(function (item) {
    function activate() {
      document.querySelectorAll(".glossary__item.is-active").forEach(function (other) {
        if (other !== item) other.classList.remove("is-active");
      });
      item.classList.toggle("is-active");
    }
    item.addEventListener("click", activate);
    item.addEventListener("keydown", function (e) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        activate();
      }
    });
  });

  /* --- Cartographie SVG --- */

  document.querySelectorAll(".map-node").forEach(function (node) {
    node.addEventListener("mouseenter", function (e) {
      node.classList.add("is-highlighted");
      if (!mapTooltip) return;
      const label = node.dataset.label || node.textContent || "Acteur";
      mapTooltip.textContent = label;
      mapTooltip.hidden = false;
      mapTooltip.style.left = e.clientX + "px";
      mapTooltip.style.top = e.clientY + "px";
    });

    node.addEventListener("mousemove", function (e) {
      if (!mapTooltip || mapTooltip.hidden) return;
      mapTooltip.style.left = e.clientX + "px";
      mapTooltip.style.top = e.clientY + "px";
    });

    node.addEventListener("mouseleave", function () {
      node.classList.remove("is-highlighted");
      if (mapTooltip) mapTooltip.hidden = true;
    });

    node.addEventListener("click", function () {
      document.querySelectorAll(".map-node.is-highlighted").forEach(function (n) {
        if (n !== node) n.classList.remove("is-highlighted");
      });
      node.classList.toggle("is-highlighted");
    });
  });

  /* --- Stagger timeline au scroll --- */

  document.querySelectorAll(".timeline__item").forEach(function (item, i) {
    if (!prefersReducedMotion) {
      item.style.transitionDelay = i * 0.08 + "s";
    }
  });

  /* --- Hero : apparition lettre par lettre (par mots, layout préservé) --- */

  function createLetter(char, delay) {
    const span = document.createElement("span");
    span.className = "letter-char";
    span.textContent = char;
    span.style.animationDelay = delay + "s";
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  function createSpace(delay) {
    const span = document.createElement("span");
    span.className = "letter-space";
    span.innerHTML = "&nbsp;";
    span.style.animationDelay = delay + "s";
    span.setAttribute("aria-hidden", "true");
    return span;
  }

  function createWord(text, delayRef, step) {
    const word = document.createElement("span");
    word.className = "letter-word";
    for (let i = 0; i < text.length; i++) {
      word.appendChild(createLetter(text[i], delayRef.v + delayRef.i * step));
      delayRef.i++;
    }
    return word;
  }

  function appendTextWords(text, container, delayRef, step) {
    const parts = text.split(/(\s+)/);
    parts.forEach(function (part) {
      if (!part) return;
      if (/^\s+$/.test(part)) {
        container.appendChild(createSpace(delayRef.v + delayRef.i * step));
        delayRef.i++;
      } else {
        container.appendChild(createWord(part, delayRef, step));
      }
    });
  }

  function splitHeroText(element, startDelay, step, lineClass) {
    const delayRef = { v: startDelay, i: 0 };
    const line = document.createElement("span");
    line.className = lineClass;

    Array.from(element.childNodes).forEach(function (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        appendTextWords(node.textContent, line, delayRef, step);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const wrap = document.createElement("span");
        if (node.className) wrap.className = node.className;
        appendTextWords(node.textContent, wrap, delayRef, step);
        line.appendChild(wrap);
      }
    });

    element.textContent = "";
    element.appendChild(line);
    return delayRef.i;
  }

  const heroTitleEl = document.getElementById("hero-title");
  const heroSubtitleEl = document.querySelector(".hero__subtitle");

  if (!prefersReducedMotion && heroTitleEl && heroSubtitleEl) {
    const titleStep = 0.032;
    const titleStart = 0.4;
    const titleCount = splitHeroText(heroTitleEl, titleStart, titleStep, "hero__title-line");
    const subtitleStart = titleStart + titleCount * titleStep + 0.3;
    splitHeroText(heroSubtitleEl, subtitleStart, 0.014, "hero__subtitle-line");

    document.body.classList.add("hero-letters-active");
  }

  /* --- Hint : léger scroll pour révéler la suite --- */

  if (heroSection && !prefersReducedMotion) {
    const hint = document.createElement("div");
    hint.className = "hero__scroll-hint";
    hint.setAttribute("aria-hidden", "true");
    hint.innerHTML = "<span>Défiler</span>";
    heroSection.appendChild(hint);

    function hideHint() {
      hint.classList.add("is-hidden");
    }

    window.addEventListener(
      "scroll",
      function () {
        if (window.scrollY > 30) hideHint();
      },
      { passive: true }
    );

    setTimeout(hideHint, 8000);
  }
})();
