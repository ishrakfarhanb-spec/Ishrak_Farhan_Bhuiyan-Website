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

  function initHeroParallax() {
    if (prefersReducedMotion || !ScrollTrigger) {
      return;
    }

    const hero = document.querySelector(".hero");
    if (!hero) {
      return;
    }

    const heroCopy = hero.querySelector(".hero-copy");
    const heroAnnouncement = hero.querySelector(".hero-announcement__card");

    gsap.to(hero, {
      "--hero-bg-shift": 42,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom+=30% top",
        scrub: true,
      },
    });

    if (heroCopy) {
      gsap.to(heroCopy, {
        "--hero-copy-shift": "-24px",
        opacity: 0,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }

    if (heroAnnouncement) {
      gsap.to(heroAnnouncement, {
        y: -18,
        opacity: 0.6,
        ease: "none",
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: "bottom top",
          scrub: true,
        },
      });
    }
  }

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
    initHeroParallax();
    initTimelineReveals();
  });
})();
