import * as THREE from 'three';

// Implementação do minimapa para o jogo Snake 3D
export default class Minimap {
  constructor(gridWidth, gridHeight) {
    this.canvas = document.getElementById('minimap');
    this.ctx = this.canvas.getContext('2d');
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;

    // Calculate cell size based on canvas size
    this.cellWidth = this.canvas.width / gridWidth;
    this.cellHeight = this.canvas.height / gridHeight;

    // Enable smooth rendering
    this.ctx.imageSmoothingEnabled = false;

    // Fixed colors for minimap background, grid, and bombs for consistent contrast
    this.fixedInternalColors = {
      background: '#222222', 
      grid: 'rgba(255, 255, 255, 0.08)',
      bomb: '#adb5bd', // Very dark grey for bombs, almost black
    };

    // For pulsating effect
    this.pulseAngle = 0;
  }
  
  update(snake, fruits, bombs, obstacles, palette) { 
    // Update pulse factor for animation
    this.pulseAngle += 0.08; // Speed of pulsation
    if (this.pulseAngle > Math.PI * 2) {
      this.pulseAngle -= Math.PI * 2;
    }
    // Pulsation intensity will range from 0 (min glow addition) to 1 (max glow addition)
    const pulseIntensity = (Math.sin(this.pulseAngle) + 1) / 2; // Normalized to 0-1

    // Clear canvas with fixed background color
    this.ctx.fillStyle = this.fixedInternalColors.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw subtle grid lines
    this.ctx.strokeStyle = this.fixedInternalColors.grid;
    this.ctx.lineWidth = 0.5;

    // Vertical grid lines
    for (let x = 0; x <= this.gridWidth; x++) {
      this.ctx.beginPath();
      this.ctx.moveTo(x * this.cellWidth, 0);
      this.ctx.lineTo(x * this.cellWidth, this.canvas.height);
      this.ctx.stroke();
    }

    // Horizontal grid lines
    for (let y = 0; y <= this.gridHeight; y++) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y * this.cellHeight);
      this.ctx.lineTo(this.canvas.width, y * this.cellHeight);
      this.ctx.stroke();
    }

    // Draw obstacles (dynamic rocks and trees) using their theme colors
    for (const obstacle of obstacles) {
      let obstacleColorHex = '#AAAAAA'; // Default fallback grey
      if (obstacle.constructor.name === 'Rock' && palette.rockColor) {
        obstacleColorHex = '#' + new THREE.Color(palette.rockColor).getHexString();
      } else if (obstacle.constructor.name === 'Tree' && palette.treeColor) {
        obstacleColorHex = '#' + new THREE.Color(palette.treeColor).getHexString();
      } else if (obstacle.constructor.name === 'Flower' && palette.flowerPetalColor) {
        obstacleColorHex = '#' + new THREE.Color(palette.flowerPetalColor).getHexString();
      } else if (obstacle.constructor.name === 'Mushroom' && palette.mushroomCapColor) {
        obstacleColorHex = '#' + new THREE.Color(palette.mushroomCapColor).getHexString();
      }
      // Add more else if blocks here for other obstacle types if needed

      this.ctx.fillStyle = obstacleColorHex;
      const x = Math.round(obstacle.mesh.position.x);
      const z = Math.round(obstacle.mesh.position.z);
      this.ctx.fillRect(
        x * this.cellWidth + 1,
        z * this.cellHeight + 1,
        this.cellWidth - 2,
        this.cellHeight - 2
      );
    }

    // Draw bombs with glow effect using fixed black color
    const bombColorHex = this.fixedInternalColors.bomb; 
    for (const bomb of bombs) {
      const x = Math.round(bomb.mesh.position.x);
      const z = Math.round(bomb.mesh.position.z);
      const centerX = x * this.cellWidth + this.cellWidth / 2;
      const centerY = z * this.cellHeight + this.cellHeight / 2;
  
      // Pulsating glow effect for bombs
      const baseGlowRadiusBomb = Math.max(this.cellWidth, this.cellHeight) * 0.7; // Base size of glow
      const pulsatingGlowRadiusBomb = baseGlowRadiusBomb + (Math.max(this.cellWidth, this.cellHeight) * 0.4 * pulseIntensity); // Glow expands

      const glowGradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, pulsatingGlowRadiusBomb
      );
      // Intense glow for bombs
      glowGradient.addColorStop(0, bombColorHex + 'E6');    // Opacity E6 (~90%)
      glowGradient.addColorStop(0.5, bombColorHex + '80');  // Opacity 80 (~50%)
      glowGradient.addColorStop(1, bombColorHex + '00');    // Opacity 00 (0%)
  
      this.ctx.fillStyle = glowGradient;
      this.ctx.fillRect(
        centerX - pulsatingGlowRadiusBomb, 
        centerY - pulsatingGlowRadiusBomb, 
        pulsatingGlowRadiusBomb * 2, 
        pulsatingGlowRadiusBomb * 2
      );
  
      // Bomb core
      this.ctx.fillStyle = bombColorHex;
      this.ctx.fillRect(
        x * this.cellWidth + 1, 
        z * this.cellHeight + 1, 
        this.cellWidth - 2, 
        this.cellHeight - 2
      );
    }

    // Draw fruits with enhanced styling using theme fruit color
    const fruitColorHex = palette.fruitColor ? '#' + new THREE.Color(palette.fruitColor).getHexString() : '#FFFF00'; // Fallback to yellow
    for (const fruit of fruits) {
      const x = Math.round(fruit.mesh.position.x);
      const z = Math.round(fruit.mesh.position.z);
      const centerX = x * this.cellWidth + this.cellWidth / 2;
      const centerY = z * this.cellHeight + this.cellHeight / 2;
  
      // Pulsating Fruit glow
      const baseGlowRadiusFruit = Math.max(this.cellWidth, this.cellHeight) * 0.5; // Base size of glow
      const pulsatingGlowRadiusFruit = baseGlowRadiusFruit + (Math.max(this.cellWidth, this.cellHeight) * 0.3 * pulseIntensity); // Glow expands

      const fruitGlow = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, pulsatingGlowRadiusFruit
      );
      // Intense glow for fruits
      fruitGlow.addColorStop(0, fruitColorHex + 'E6'); 
      fruitGlow.addColorStop(0.6, fruitColorHex + '99'); 
      fruitGlow.addColorStop(1, fruitColorHex + '00');
  
      this.ctx.fillStyle = fruitGlow;
      this.ctx.fillRect(
        centerX - pulsatingGlowRadiusFruit, 
        centerY - pulsatingGlowRadiusFruit, 
        pulsatingGlowRadiusFruit * 2, 
        pulsatingGlowRadiusFruit * 2
      );
  
      // Fruit core with rounded corners
      this.ctx.fillStyle = fruitColorHex;
      this.drawRoundedRect(
        x * this.cellWidth + 1, 
        z * this.cellHeight + 1, 
        this.cellWidth - 2, 
        this.cellHeight - 2,
        2
      );
    }

    // Draw snake with enhanced styling using theme snake color
    const snakeHeadColorHex = palette.snakeColor ? '#' + new THREE.Color(palette.snakeColor).getHexString() : '#00FF00'; // Fallback to green
    // Draw snake body with gradient and rounded segments
    for (let i = 0; i < snake.indexes.length; i++) {
      const index = snake.indexes[i];
      const x = index % this.gridWidth;
      const z = Math.floor(index / this.gridWidth);
  
      const segmentOpacity = 0.6 + (0.4 * i / snake.indexes.length); // Adjusted for fixed colors
      const isHead = i === snake.indexes.length - 1;
  
      if (isHead) {
        // Head with special styling and glow
        const headGlow = this.ctx.createRadialGradient(
          x * this.cellWidth + this.cellWidth / 2, 
          z * this.cellHeight + this.cellHeight / 2, 0,
          x * this.cellWidth + this.cellWidth / 2, 
          z * this.cellHeight + this.cellHeight / 2, 
          Math.max(this.cellWidth, this.cellHeight) * 0.8
        );
        headGlow.addColorStop(0, snakeHeadColorHex + 'AA');
        headGlow.addColorStop(0.7, snakeHeadColorHex + '55');
        headGlow.addColorStop(1, snakeHeadColorHex + '00');

        this.ctx.fillStyle = headGlow;
        this.ctx.fillRect(
          x * this.cellWidth - this.cellWidth * 0.2, 
          z * this.cellHeight - this.cellHeight * 0.2, 
          this.cellWidth * 1.4, 
          this.cellHeight * 1.4
        );

        this.ctx.fillStyle = snakeHeadColorHex;
        this.drawRoundedRect(
          x * this.cellWidth + 0.5, 
          z * this.cellHeight + 0.5, 
          this.cellWidth - 1, 
          this.cellHeight - 1,
          3
        );
      } else {
        // Body segments with gradient based on theme color
        const bodyColor = this.adjustBrightness(snakeHeadColorHex, -0.4 * (1 - segmentOpacity)); // Darken tail more
        // Ensure alpha is correctly appended for hex colors
        const alphaHex = Math.floor(segmentOpacity * 255).toString(16).padStart(2, '0');
        this.ctx.fillStyle = bodyColor + alphaHex;


        this.drawRoundedRect(
          x * this.cellWidth + 1, 
          z * this.cellHeight + 1, 
          this.cellWidth - 2, 
          this.cellHeight - 2,
          2
        );
      }
    }
  }
  
  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
    this.ctx.fill();
  }
  
  adjustBrightness(hexColor, factor) {
    // Remove # if present
    let color = hexColor.replace('#', '');
    if (color.length === 3) { // Handle shorthand hex (e.g., #F00)
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }

    // Parse RGB
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(color.substr(4, 2), 16);

    // Adjust brightness
    const newR = Math.max(0, Math.min(255, r + (r * factor)));
    const newG = Math.max(0, Math.min(255, g + (g * factor)));
    const newB = Math.max(0, Math.min(255, b + (b * factor)));

    // Convert back to hex
    return '#' + 
      Math.round(newR).toString(16).padStart(2, '0') +
      Math.round(newG).toString(16).padStart(2, '0') +
      Math.round(newB).toString(16).padStart(2, '0');
  }
}
