# Sistema de Dificuldades para o Jogo Snake

Para simplificar a implementação do sistema de dificuldades, siga estas instruções para integrar o código:

## 1. Copie os arquivos de configuração e gerenciadores

Já criamos estes arquivos para você:
- `config/DifficultyConfig.js`
- `managers/DifficultyManager.js`

## 2. Adicione o modal de dificuldade ao HTML

Adicione este código ao `index.html` antes da div do "settings-tab":

```html
<!-- Difficulty Selection Modal -->
<div id="difficulty-modal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 opacity-0 pointer-events-none transition-opacity duration-300">
  <div class="bg-gray-800 rounded-lg p-8 max-w-md w-full mx-4 transform scale-90 transition-transform duration-300">
    <h2 class="text-2xl font-bold text-white mb-6 text-center">Selecione a Dificuldade</h2>
    
    <div class="space-y-4">
      <!-- Easy -->
      <button id="difficulty-easy" class="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
        <div class="text-lg">🟢 Fácil</div>
        <div class="text-sm opacity-80">Velocidade: Lenta | Frutas: 2 | Bombas: 0 | Objetos: 10</div>
      </button>
      
      <!-- Normal -->
      <button id="difficulty-normal" class="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
        <div class="text-lg">🟡 Normal</div>
        <div class="text-sm opacity-80">Velocidade: Média | Frutas: 1 | Bombas: 1 | Objetos: 20</div>
      </button>
      
      <!-- Hard -->
      <button id="difficulty-hard" class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
        <div class="text-lg">🔴 Difícil</div>
        <div class="text-sm opacity-80">Velocidade: Rápida | Frutas: 1 | Bombas: 3 | Objetos: 30 | Morte nas bordas</div>
      </button>
      
      <!-- Custom -->
      <button id="difficulty-custom" class="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200">
        <div class="text-lg">⚙️ Personalizado</div>
        <div class="text-sm opacity-80">Configure as definições manualmente</div>
      </button>
    </div>
  </div>
</div>
```

## 3. Atualize os imports no main.js

Adicione estas linhas de import ao início do seu arquivo main.js:

```javascript
import { updateSettingsUI } from './managers/SettingsManager'
import { DifficultyManager } from './managers/DifficultyManager.js'
import { currentDifficulty, DIFFICULTY_LEVELS } from './config/DifficultyConfig.js'
```

## 4. Adicione as funções para o sistema de dificuldades

Adicione estas funções ao seu arquivo main.js após a função closeSettings():

```javascript
let difficultyManager;

// Função para iniciar jogo após seleção de dificuldade
function onDifficultySelected(difficulty) {
  // Atualiza a interface com as novas configurações
  updateSettingsUI(DEFAULT_SETTINGS);
  
  // Atualiza as entidades no jogo baseado nas novas configurações
  updateEntitiesBasedOnSettings();
  
  // Inicia o jogo
  gameStarted = true;
  
  // O resto do código de inicialização do jogo
  // (copie o código existente do event listener do btnPlay)
  cameraRotationActive = false;
  
  // Áudio e interface
  const playAudio = async () => {
    try {
      if (audio.volume !== 0) {
        await audio.play();
        document.getElementById('btn-volume-img').src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}Audio.svg`;
      } else {
        document.getElementById('btn-volume-img').src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}NoAudio.svg`;
      }
    } catch (err) {
      console.log('Audio could not play automatically:', err);
      muteVolume();
    }
  };
  
  playAudio();
  
  // Minimap
  const minimapContainer = document.getElementById('minimap-container');
  const showMinimap = document.getElementById('show-minimap').checked;
  
  if (showMinimap) {
    toggleMinimap(true);
  } else {
    toggleMinimap(false);
  }
  
  // Animações da câmera e botões
  gsap.to(camera.position, { ...finalPosition, duration: 2 });
  gsap.to(scene.fog, { duration: 2, near: 20, far: 55 });
  animateButtonOut(btnPlay);
  if (btnSettings) {
    animateButtonOut(btnSettings);
    
    const settingsSidebar = document.getElementById('settings-sidebar');
    if (settingsSidebar && settingsSidebar.classList.contains('open')) {
      settingsSidebar.classList.remove('open');
    }
  }
  
  btnToggleCamera.style.display = 'block';
  animateCameraButtonIn(btnToggleCamera);
  
  // Event listeners e finalização
  registerEventListener();
  
  const settingsTab = document.getElementById('settings-tab');
  if (settingsTab) {
    settingsTab.classList.remove('theme-green', 'theme-lilac', 'theme-orange');
    settingsTab.classList.add(`theme-${paletteName.toLowerCase()}`);
    setTimeout(() => animateSettingsTab(settingsTab, true), 1000);
  }
  
  minimap = new Minimap(GRID_WIDTH, GRID_HEIGHT);
}

// Função para atualizar entidades baseado nas configurações
function updateEntitiesBasedOnSettings() {
  // Ajusta frutas
  while (candies.length > DEFAULT_SETTINGS.numFruits) {
    const fruit = candies.pop();
    scene.remove(fruit.mesh);
  }
  while (candies.length < DEFAULT_SETTINGS.numFruits) {
    addFruit();
  }
  
  // Ajusta bombas
  while (bombs.length > DEFAULT_SETTINGS.numBombs) {
    const bomb = bombs.pop();
    scene.remove(bomb.mesh);
  }
  while (bombs.length < DEFAULT_SETTINGS.numBombs) {
    addBomb();
  }
  
  // Ajusta objetos
  while (entities.length > DEFAULT_SETTINGS.numObjects) {
    const entity = entities.pop();
    scene.remove(entity.mesh);
  }
  while (entities.length < DEFAULT_SETTINGS.numObjects) {
    addEntity();
  }
}
```

## 5. Modifique a função startGame

Substitua a função startGame existente por esta versão:

```javascript
function startGame() {
  if (!snake.isMoving) {
    // Ensure camera rotation is disabled when snake starts moving
    cameraRotationActive = false;
    
    // Hide settings tab when snake starts moving
    const settingsTab = document.getElementById('settings-tab');
    if (settingsTab && settingsTab.style.display !== 'none') {
      animateSettingsTab(settingsTab, false);
    }    
    
    // Use a velocidade da cobra das configurações
    const moveInterval = DEFAULT_SETTINGS.snakeSpeed;
    isRunning = setInterval(() => {
      snake.update();
    }, moveInterval);
  }
}
```

## 6. Modifique o event listener do btnPlay

Substitua o event listener existente do botão Play por esta versão:

```javascript
// Inicializa o gerenciador de dificuldade
difficultyManager = new DifficultyManager(DEFAULT_SETTINGS, onDifficultySelected);

btnPlay.addEventListener('click', function () {
  if (!gameStarted) {
    // Mostra o modal de dificuldade em vez de iniciar o jogo diretamente
    difficultyManager.showModal();
  }
});
```

## 7. Atualize o event listener do "speed-range"

Se você tiver um event listener para o controle deslizante de velocidade, atualize-o para usar a configuração correta:

```javascript
document.getElementById('speed-range').addEventListener('input', function() {
  if (currentDifficulty !== DIFFICULTY_LEVELS.CUSTOM) {
    return; // Não permitir alterações em modos predefinidos
  }
  
  const sliderVal = parseInt(this.value);
  document.getElementById('speed-value').textContent = sliderVal;
  
  // Converter o valor do slider para milissegundos (menor = mais rápido)
  DEFAULT_SETTINGS.snakeSpeed = 300 - (sliderVal * 16);
  
  // Se o jogo estiver em execução, reinicie o intervalo com a nova velocidade
  if (isRunning) {
    clearInterval(isRunning);
    isRunning = setInterval(() => {
      snake.update();
    }, DEFAULT_SETTINGS.snakeSpeed);
  }
});
```

## 8. Estilo adicional para o CSS (opcional)

Adicione este estilo ao seu arquivo style.css para melhorar a aparência do modal:

```css
#difficulty-modal button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

#difficulty-modal button:active {
  transform: translateY(0);
}
```

Com estas alterações, você terá implementado o sistema de dificuldades completo no jogo Snake.
