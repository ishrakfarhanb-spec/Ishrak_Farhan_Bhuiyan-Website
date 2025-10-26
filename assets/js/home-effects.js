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
  const hasHoverSupport = root.matchMedia("(hover: hover)").matches;

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

  function initTiltCards() {
    const tiltCards = document.querySelectorAll("[data-tilt-card]");
    if (!tiltCards.length) {
      return;
    }

    if (prefersReducedMotion || !hasHoverSupport) {
      tiltCards.forEach((card) => card.classList.add("tilt-card--static"));
      return;
    }

    tiltCards.forEach((card) => {
      card.style.setProperty("transform-style", "preserve-3d");
      card.addEventListener("pointermove", handleTiltMove);
      card.addEventListener("pointerleave", resetTilt);
      card.addEventListener("pointercancel", resetTilt);
      card.addEventListener("focusout", resetTilt);
    });
  }

  function handleTiltMove(event) {
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const relX = (event.clientX - bounds.left) / bounds.width;
    const relY = (event.clientY - bounds.top) / bounds.height;

    const rotationX = gsap.utils.mapRange(0, 1, 10, -10, relY);
    const rotationY = gsap.utils.mapRange(0, 1, -12, 12, relX);

    gsap.to(card, {
      duration: 0.35,
      rotationX,
      rotationY,
      transformPerspective: 1100,
      transformOrigin: "center",
      ease: "power2.out",
      boxShadow: "0 25px 35px rgba(10, 12, 38, 0.22)",
    });

    const media = card.querySelector(".card-media");
    if (media) {
      gsap.to(media, {
        duration: 0.35,
        translateZ: 32,
        ease: "power2.out",
      });
    }
  }

  function resetTilt(event) {
    const card = event.currentTarget;
    gsap.to(card, {
      duration: 0.45,
      rotationX: 0,
      rotationY: 0,
      boxShadow: "",
      ease: "power3.out",
    });
    const media = card.querySelector(".card-media");
    if (media) {
      gsap.to(media, {
        duration: 0.45,
        translateZ: 0,
        ease: "power3.out",
      });
    }
  }

  window.addEventListener("DOMContentLoaded", () => {
    initTimelineReveals();
    initTiltCards();
  });
})();
