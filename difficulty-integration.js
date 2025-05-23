// Atualize as importações no main.js antes de usar esse arquivo
// Foi detectado que o main.js já possui imports corretos:
//   import { DifficultyManager } from './managers/DifficultyManager.js'
//   import { currentDifficulty, DIFFICULTY_LEVELS } from './config/DifficultyConfig.js'

// Função para ser adicionada ao main.js
let difficultyManager;

// Função para iniciar jogo após seleção de dificuldade
function onDifficultySelected(difficulty) {
  // Atualiza a interface com as novas configurações
  updateSettingsUI(DEFAULT_SETTINGS);
  
  // Atualiza as entidades no jogo baseado nas novas configurações
  updateEntitiesBasedOnSettings();
  
  // Inicia o jogo
  gameStarted = true;
  
  // Stop camera rotation when game starts
  cameraRotationActive = false;
  
  // Handle audio initialization and play
  const playAudio = async () => {
    try {
      // Check if user muted audio
      if (audio.volume !== 0) {
        await audio.play()
        // Update the icon just to be safe
        document.getElementById('btn-volume-img').src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}Audio.svg`
      } else {
        document.getElementById('btn-volume-img').src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}NoAudio.svg`
      }
    } catch (err) {
      console.log('Audio could not play automatically:', err)
      // In case of autoplay failure, we keep the mute icon
      muteVolume()
    }
  }
  
  // Enhanced minimap animation with smoother timing
  const minimapContainer = document.getElementById('minimap-container');
  const showMinimap = document.getElementById('show-minimap').checked;
  
  if (showMinimap) {
    toggleMinimap(true);
  } else {
    toggleMinimap(false);
  }
  
  playAudio()
  
  gsap.to(camera.position, { ...finalPosition, duration: 2 })
  gsap.to(scene.fog, { duration: 2, near: 20, far: 55 })
  animateButtonOut(btnPlay)
  if (btnSettings) {
    animateButtonOut(btnSettings)
    // Close settings sidebar if it's open
    const settingsSidebar = document.getElementById('settings-sidebar');
    if (settingsSidebar && settingsSidebar.classList.contains('open')) {
      settingsSidebar.classList.remove('open');
    }
  }
  
  btnToggleCamera.style.display = 'block'
  animateCameraButtonIn(btnToggleCamera)
  
  // Register event listener but don't start the snake movement yet
  // The snake will start moving when the player presses a movement key
  registerEventListener()
  
  // Show settings tab after game starts with a slight delay
  const settingsTab = document.getElementById('settings-tab');
  if (settingsTab) {
    settingsTab.classList.remove('theme-green', 'theme-lilac', 'theme-orange');
    settingsTab.classList.add(`theme-${paletteName.toLowerCase()}`);
    // Add slight delay to show after camera movement starts
    setTimeout(() => animateSettingsTab(settingsTab, true), 1000);
  }
  
  // Initialize minimap
  minimap = new Minimap(GRID_WIDTH, GRID_HEIGHT);
}

// Função para atualizar o slider de velocidade
function updateSpeedRangeListener() {
  document.getElementById('speed-range').addEventListener('input', function() {
    if (currentDifficulty !== DIFFICULTY_LEVELS.CUSTOM) {
      // In non-Custom modes, reset the slider to match settings
      const speedValue = DEFAULT_SETTINGS.snakeSpeed;
      // Convert milliseconds to slider value (approx 1-10)
      const sliderValue = Math.round((300 - speedValue) / 16);
      this.value = sliderValue;
      document.getElementById('speed-value').textContent = sliderValue;
      return; // Não permitir alterações em modos predefinidos
    }
    
    const sliderVal = parseInt(this.value);
    document.getElementById('speed-value').textContent = sliderVal;
    
    // Converter o valor do slider para milissegundos (menor = mais rápido)
    DEFAULT_SETTINGS.snakeSpeed = 300 - (sliderVal * 16);
    
    // If the game is already running, restart the move interval with the new speed
    if (isRunning) {
      clearInterval(isRunning);
      isRunning = setInterval(() => {
        snake.update();
      }, DEFAULT_SETTINGS.snakeSpeed);
    }
  });
}

// Função para inicializar o botão Play com o modal de dificuldade
function initializeDifficultySystem() {
  // Inicializa o gerenciador de dificuldade
  difficultyManager = new DifficultyManager(DEFAULT_SETTINGS, onDifficultySelected);
  
  // Substitui o event listener existente do botão Play
  btnPlay.addEventListener('click', function () {
    if (!gameStarted) {
      // Mostra o modal de dificuldade em vez de iniciar o jogo diretamente
      difficultyManager.showModal();
    }
  });
  
  // Atualiza o event listener do slider de velocidade
  updateSpeedRangeListener();
}
