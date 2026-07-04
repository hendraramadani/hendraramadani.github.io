const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const year = document.querySelector("[data-year]");
const progressBar = document.querySelector("[data-scroll-progress]");
const typewriter = document.querySelector("[data-typewriter]");
const revealItems = document.querySelectorAll(".reveal");
const counters = document.querySelectorAll("[data-counter]");
const projectCards = document.querySelectorAll(".project-card");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const navLinks = [...(nav?.querySelectorAll('a[href^="#"]') ?? [])];
const sections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (year) {
  year.textContent = new Date().getFullYear();
}

const setScrolledState = () => {
  header?.classList.toggle("is-scrolled", window.scrollY > 24);
};

const updateScrollProgress = () => {
  if (!progressBar) return;

  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
  progressBar.style.transform = `scaleX(${Math.min(Math.max(progress, 0), 1)})`;
};

const updateActiveNav = () => {
  if (!sections.length) return;

  const currentSection = sections.reduce((active, section) => {
    const sectionTop = section.offsetTop - 120;
    return window.scrollY >= sectionTop ? section : active;
  }, null);

  navLinks.forEach((link) => {
    link.classList.toggle("is-active", Boolean(currentSection) && link.getAttribute("href") === `#${currentSection.id}`);
  });
};

let scrollTicking = false;
const handleScroll = () => {
  if (scrollTicking) return;

  scrollTicking = true;
  window.requestAnimationFrame(() => {
    setScrolledState();
    updateScrollProgress();
    updateActiveNav();
    scrollTicking = false;
  });
};

setScrolledState();
updateScrollProgress();
updateActiveNav();
window.addEventListener("scroll", handleScroll, { passive: true });

navToggle?.addEventListener("click", () => {
  const isOpen = nav?.classList.toggle("is-open");
  document.body.classList.toggle("nav-open", Boolean(isOpen));
  header?.classList.toggle("is-open", Boolean(isOpen));
  navToggle.setAttribute("aria-expanded", String(Boolean(isOpen)));
  navToggle.setAttribute("aria-label", isOpen ? "Tutup menu" : "Buka menu");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    nav?.classList.remove("is-open");
    document.body.classList.remove("nav-open");
    header?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Buka menu");
  });
});

const runTypewriter = () => {
  if (!typewriter) return;

  const text = typewriter.dataset.typewriter || typewriter.textContent.trim();

  if (prefersReducedMotion) {
    typewriter.textContent = text;
    return;
  }

  let index = 0;
  typewriter.textContent = "";
  typewriter.classList.add("is-typing");

  const typeNext = () => {
    typewriter.textContent = text.slice(0, index);
    index += 1;

    if (index <= text.length) {
      window.setTimeout(typeNext, 44);
      return;
    }

    window.setTimeout(() => typewriter.classList.remove("is-typing"), 900);
  };

  window.setTimeout(typeNext, 260);
};

const formatCounter = (value, decimals, suffix) => `${value.toFixed(decimals)}${suffix}`;

const animateCounter = (counter) => {
  if (counter.dataset.animated === "true") return;

  counter.dataset.animated = "true";

  const target = Number(counter.dataset.value || counter.textContent.replace(/[^\d.]/g, ""));
  const decimals = Number(counter.dataset.decimals || 0);
  const suffix = counter.dataset.suffix || "";

  if (Number.isNaN(target) || prefersReducedMotion) {
    counter.textContent = formatCounter(target || 0, decimals, suffix);
    return;
  }

  const duration = 1200;
  const startTime = window.performance.now();

  const tick = (now) => {
    const elapsed = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - elapsed, 3);
    counter.textContent = formatCounter(target * eased, decimals, suffix);

    if (elapsed < 1) {
      window.requestAnimationFrame(tick);
    }
  };

  window.requestAnimationFrame(tick);
};

const setupRevealAnimation = () => {
  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach((item) => item.classList.add("is-visible"));
    counters.forEach(animateCounter);
    return;
  }

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.18 },
  );

  revealItems.forEach((item) => revealObserver.observe(item));

  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      });
    },
    { threshold: 0.72 },
  );

  counters.forEach((counter) => counterObserver.observe(counter));
};

const setupProjectTilt = () => {
  const canTilt = !prefersReducedMotion && window.matchMedia("(pointer: fine)").matches;
  if (!canTilt) return;

  projectCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;
      const rotateX = (0.5 - y) * 7;
      const rotateY = (x - 0.5) * 9;

      card.classList.add("is-tilting");
      card.style.setProperty("--tilt-x", `${rotateX.toFixed(2)}deg`);
      card.style.setProperty("--tilt-y", `${rotateY.toFixed(2)}deg`);
      card.style.setProperty("--lift", "-6px");
    });

    card.addEventListener("pointerleave", () => {
      card.classList.remove("is-tilting");
      card.style.setProperty("--tilt-x", "0deg");
      card.style.setProperty("--tilt-y", "0deg");
      card.style.setProperty("--lift", "0px");
    });
  });
};

runTypewriter();
setupRevealAnimation();
setupProjectTilt();
