(function () {
  const root = window;
  if (!root || !root.gsap) {
    return;
  }

  const gsap = root.gsap;
  const ScrollTrigger = root.ScrollTrigger;
  if (ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
  }

  const prefersReducedMotion = root.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initTimelineReveals() {
    if (prefersReducedMotion || !ScrollTrigger) {
      return;
    }

    const grids = document.querySelectorAll("[data-timeline-grid]");
    grids.forEach((grid) => {
      const cards = grid.querySelectorAll(".card");
      if (!cards.length) {
        return;
      }

      gsap.set(cards, {
        clipPath: "inset(0% 48% 0% 48%)",
        opacity: 0,
        y: 32,
      });

      gsap.to(cards, {
        clipPath: "inset(0% 0% 0% 0%)",
        opacity: 1,
        y: 0,
        xPercent: (index) => (index % 2 === 0 ? -4 : 4),
        ease: "power3.out",
        duration: 0.9,
        stagger: {
          each: 0.12,
          from: "center",
        },
        scrollTrigger: {
          trigger: grid,
          start: "top 72%",
          once: true,
        },
        onComplete: () => gsap.set(cards, { xPercent: 0 }),
      });
    });
  }

  window.addEventListener("DOMContentLoaded", () => {
    initTimelineReveals();
  });
})();
