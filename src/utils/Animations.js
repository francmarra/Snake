// Funções centralizadas de animação para botões e elementos da UI/jogo
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

export function animateSettingsTab(element, show = true, options = {}) {
  if (show) {
    // Mostra o separador de definições com efeito de deslize
    gsap.fromTo(
      element,
      { autoAlpha: 0, right: "-3rem" },
      {
        duration: 0.5,
        autoAlpha: 1,
        right: 0,
        display: 'flex',
        ease: 'power3.out',
        ...options
      }
    );
  } else {
    // Esconde o separador de definições com efeito de deslize
    gsap.to(element, {
      duration: 0.5,
      autoAlpha: 0,
      right: "-3rem",
      ease: 'power3.in',
      onComplete: () => {
        element.style.display = 'none';
        if (typeof options.onComplete === 'function') options.onComplete();
      },
      ...options
    });
  }
}

export function animateEntitiesIn(entities) {
  gsap.from(
    entities.map((entity) => entity.mesh.scale),
    {
      x: 0,
      y: 0,
      z: 0,
      duration: 1,
      ease: 'elastic.out(1.5, 0.5)',
      stagger: {
        grid: [20, 20],
        amount: 0.7,
      },
    }
  );
}

export function animateMinimapIn(minimapContainer, options = {}) {
  if (!minimapContainer) return;
  
  minimapContainer.style.display = 'block';
  minimapContainer.style.opacity = '0';
  minimapContainer.style.transform = 'scale(0.7) translateY(30px)';
  
  gsap.to(minimapContainer, {
    opacity: 1,
    scale: 1,
    y: 0,
    duration: 1.2,
    delay: 1.0,
    ease: "back.out(1.7)",
    onComplete: () => {
      gsap.to(minimapContainer, {
        scale: 1.05,
        duration: 0.3,
        repeat: 1,
        yoyo: true,
        ease: "sine.inOut"
      });
    },
    ...options
  });
}

export function animateCameraPosition(camera, position, options = {}) {
  gsap.to(camera.position, { 
    ...position, 
    duration: 2,
    ...options 
  });
}

export function animateButtonClick(element, options = {}) {
  gsap.to(element, {
    scale: 0.9,
    duration: 0.1,
    onComplete: () => {
      gsap.to(element, {
        scale: 1,
        duration: 0.3,
        ease: "elastic.out(1.2, 0.7)",
        ...options.onCompleteOptions
      });
    },
    ...options
  });
}

export function animatePaletteSelectors(paletteSelectors, sideBar = null, options = {}) {
  if (sideBar) {
    gsap.to(sideBar, {
      opacity: 1,
      delay: 0.5,
      onComplete: () => {
        gsap.to(paletteSelectors, {
          duration: 1,
          x: 0,
          autoAlpha: 1,
          ease: "elastic.out(1.2, 0.9)",
          stagger: {
            amount: 0.2,
          },
          ...options
        });
      },
      ...options
    });
  } else {
    gsap.to(paletteSelectors, {
      duration: 1,
      delay: 0.5,
      x: 0,
      autoAlpha: 1,
      ease: "elastic.out(1.2, 0.9)",
      stagger: {
        amount: 0.2,
      },
      ...options
    });
  }
}

export function animateSettingsGear(gear, options = {}) {
  gsap.to(gear, {
    rotation: "+=360",
    duration: 1,
    ease: "power2.inOut",
    ...options
  });
}
