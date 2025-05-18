// Centralized animation functions for UI/game buttons and elements
import gsap from 'gsap';

export function animateButtonIn(element, options = {}) {
  gsap.fromTo(
    element,
    { autoAlpha: 0, scale: 0, yPercent: -50, xPercent: -50 },
    {
      duration: 0.8,
      autoAlpha: 1,
      scale: 1,
      yPercent: -50,
      xPercent: -50,
      delay: 0.3,
      ease: 'elastic.out(1.2, 0.7)',
      ...options
    }
  );
}

export function animateButtonOut(element, options = {}) {
  gsap.to(element, {
    duration: 1,
    scale: 0,
    ease: 'elastic.in(1.2, 0.7)',
    onComplete: () => {
      element.style.visibility = 'hidden';
      if (typeof options.onComplete === 'function') options.onComplete();
    },
    ...options
  });
}

export function animateCameraButtonIn(element, options = {}) {
  gsap.fromTo(
    element,
    { autoAlpha: 0, scale: 0 },
    {
      duration: 0.8,
      autoAlpha: 1,
      scale: 1,
      ease: 'elastic.out(1.2, 0.7)',
      delay: 0.3,
      ...options
    }
  );
}
