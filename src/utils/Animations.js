// Funções centralizadas de animação para botões e elementos da UI/jogo
import gsap from 'gsap';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

// Register the MotionPathPlugin
gsap.registerPlugin(MotionPathPlugin);

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

// Firefly animation system
let firefliesTimeline = null;
let firefliesActive = false;

export function startFirefliesAnimation(fireflies, fireflyData) {
  if (firefliesActive || !fireflies || fireflies.length === 0) return;
  
  firefliesActive = true;
  firefliesTimeline = gsap.timeline({ repeat: -1 });
  
  fireflies.forEach((firefly, index) => {
    const data = fireflyData[index];
    if (!data) return;
    
    const [startX, startY, startZ, patternType, speed, radius] = data;
    const light = firefly.light;
    const mesh = firefly.mesh;
    
    // Set initial position
    light.position.set(startX, startY, startZ);
    mesh.position.copy(light.position);
    
    // Create animation based on pattern type
    switch (patternType) {
      case 'circular':
        animateCircularPattern(light, mesh, startX, startY, startZ, radius, speed, index);
        break;
      case 'figure8':
        animateFigure8Pattern(light, mesh, startX, startY, startZ, radius, speed, index);
        break;
      case 'vertical':
        animateVerticalPattern(light, mesh, startX, startY, startZ, radius, speed, index);
        break;
      case 'random':
      default:
        animateRandomPattern(light, mesh, startX, startY, startZ, radius, speed, index);
        break;
    }
    
    // Add subtle intensity pulsing
    gsap.to(light, {
      intensity: 0.3,
      duration: 2 + Math.random() * 2,
      repeat: -1,
      yoyo: true,
      ease: "sine.inOut",
      delay: Math.random() * 2
    });
  });
}

function animateCircularPattern(light, mesh, centerX, centerY, centerZ, radius, speed, index) {
  const duration = 8 / speed;
  const offset = (index * Math.PI * 2) / 15; // Distribute fireflies around circle
  
  // Use a simpler approach without motionPath for better compatibility
  gsap.to({}, {
    duration: duration,
    repeat: -1,
    ease: "none",
    delay: offset,
    onUpdate: function() {
      const t = this.progress() * Math.PI * 2;
      light.position.x = centerX + radius * Math.cos(t);
      light.position.z = centerZ + radius * Math.sin(t);
      light.position.y = centerY + Math.sin(Date.now() * 0.001 * speed + offset) * 0.5;
      mesh.position.copy(light.position);
    }
  });
}

function animateFigure8Pattern(light, mesh, centerX, centerY, centerZ, radius, speed, index) {
  const duration = 12 / speed;
  const offset = (index * 0.5);
  
  gsap.to({}, {
    duration: duration,
    repeat: -1,
    ease: "none",
    delay: offset,
    onUpdate: function() {
      const t = this.progress() * Math.PI * 2;
      light.position.x = centerX + radius * Math.sin(t);
      light.position.z = centerZ + radius * Math.sin(t) * Math.cos(t);
      light.position.y = centerY + Math.sin(Date.now() * 0.001 * speed + offset) * 0.3;
      mesh.position.copy(light.position);
    }
  });
}

function animateVerticalPattern(light, mesh, centerX, centerY, centerZ, radius, speed, index) {
  const duration = 6 / speed;
  const offset = index * 0.3;
  
  gsap.to(light.position, {
    y: centerY + radius,
    duration: duration,
    repeat: -1,
    yoyo: true,
    ease: "sine.inOut",
    delay: offset,
    onUpdate: () => {
      // Add slight horizontal drift
      const t = Date.now() * 0.0005 * speed + offset;
      light.position.x = centerX + Math.sin(t) * 0.5;
      light.position.z = centerZ + Math.cos(t) * 0.5;
      mesh.position.copy(light.position);
    }
  });
}

function animateRandomPattern(light, mesh, centerX, centerY, centerZ, radius, speed, index) {
  const duration = 4 / speed;
  const offset = index * 0.2;
  
  function createRandomMovement() {
    const randomX = centerX + (Math.random() - 0.5) * radius * 2;
    const randomY = centerY + (Math.random() - 0.5) * radius * 0.5;
    const randomZ = centerZ + (Math.random() - 0.5) * radius * 2;
    
    gsap.to(light.position, {
      x: randomX,
      y: randomY,
      z: randomZ,
      duration: duration + Math.random() * 2,
      ease: "sine.inOut",
      delay: offset,
      onComplete: createRandomMovement,
      onUpdate: () => {
        mesh.position.copy(light.position);
      }
    });
  }
  
  createRandomMovement();
}

export function stopFirefliesAnimation() {
  if (firefliesTimeline) {
    firefliesTimeline.kill();
    firefliesTimeline = null;
  }
  firefliesActive = false;
}

export function isFirefliesAnimationActive() {
  return firefliesActive;
}
