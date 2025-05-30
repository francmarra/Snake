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
  }
  
  update(snake, fruits, bombs, palette) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid background with subtle gradient
    const minimapBgColor = palette.grassColor ? '#' + new THREE.Color(palette.grassColor).getHexString() : '#1a1a1a';
    
    // Create gradient background
    const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
    gradient.addColorStop(0, minimapBgColor);
    gradient.addColorStop(1, this.adjustBrightness(minimapBgColor, -0.2));
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw subtle grid lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
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
    
    // Draw bombs with glow effect
    for (const bomb of bombs) {
      const x = Math.round(bomb.mesh.position.x);
      const z = Math.round(bomb.mesh.position.z);
      const centerX = x * this.cellWidth + this.cellWidth / 2;
      const centerY = z * this.cellHeight + this.cellHeight / 2;
      
      // Glow effect
      const glowGradient = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(this.cellWidth, this.cellHeight) * 0.8
      );
      glowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
      glowGradient.addColorStop(0.7, 'rgba(255, 0, 0, 0.3)');
      glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
      
      this.ctx.fillStyle = glowGradient;
      this.ctx.fillRect(
        x * this.cellWidth - this.cellWidth * 0.2, 
        z * this.cellHeight - this.cellHeight * 0.2, 
        this.cellWidth * 1.4, 
        this.cellHeight * 1.4
      );
      
      // Bomb core
      this.ctx.fillStyle = '#FF0000';
      this.ctx.fillRect(
        x * this.cellWidth + 1, 
        z * this.cellHeight + 1, 
        this.cellWidth - 2, 
        this.cellHeight - 2
      );
    }
    
    // Draw fruits with enhanced styling
    const fruitColor = palette.fruitColor ? '#' + new THREE.Color(palette.fruitColor).getHexString() : '#4CAF50';
    
    for (const fruit of fruits) {
      const x = Math.round(fruit.mesh.position.x);
      const z = Math.round(fruit.mesh.position.z);
      const centerX = x * this.cellWidth + this.cellWidth / 2;
      const centerY = z * this.cellHeight + this.cellHeight / 2;
      
      // Fruit glow
      const fruitGlow = this.ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(this.cellWidth, this.cellHeight) * 0.6
      );
      fruitGlow.addColorStop(0, fruitColor + 'CC');
      fruitGlow.addColorStop(0.8, fruitColor + '44');
      fruitGlow.addColorStop(1, fruitColor + '00');
      
      this.ctx.fillStyle = fruitGlow;
      this.ctx.fillRect(
        x * this.cellWidth - this.cellWidth * 0.1, 
        z * this.cellHeight - this.cellHeight * 0.1, 
        this.cellWidth * 1.2, 
        this.cellHeight * 1.2
      );
      
      // Fruit core with rounded corners
      this.ctx.fillStyle = fruitColor;
      this.drawRoundedRect(
        x * this.cellWidth + 1, 
        z * this.cellHeight + 1, 
        this.cellWidth - 2, 
        this.cellHeight - 2,
        2
      );
    }
    
    // Draw snake with enhanced styling
    const snakeHeadColor = palette.snakeColor ? '#' + new THREE.Color(palette.snakeColor).getHexString() : '#ff470a';
    
    // Draw snake body with gradient and rounded segments
    for (let i = 0; i < snake.indexes.length; i++) {
      const index = snake.indexes[i];
      const x = index % this.gridWidth;
      const z = Math.floor(index / this.gridWidth);
      
      const segmentOpacity = 0.5 + (0.5 * i / snake.indexes.length);
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
        headGlow.addColorStop(0, snakeHeadColor + 'AA');
        headGlow.addColorStop(0.7, snakeHeadColor + '33');
        headGlow.addColorStop(1, snakeHeadColor + '00');
        
        this.ctx.fillStyle = headGlow;
        this.ctx.fillRect(
          x * this.cellWidth - this.cellWidth * 0.2, 
          z * this.cellHeight - this.cellHeight * 0.2, 
          this.cellWidth * 1.4, 
          this.cellHeight * 1.4
        );
        
        this.ctx.fillStyle = snakeHeadColor;
        this.drawRoundedRect(
          x * this.cellWidth + 0.5, 
          z * this.cellHeight + 0.5, 
          this.cellWidth - 1, 
          this.cellHeight - 1,
          3
        );
      } else {
        // Body segments with gradient
        const bodyColor = this.adjustBrightness(snakeHeadColor, -0.3 * (1 - segmentOpacity));
        this.ctx.fillStyle = bodyColor + Math.floor(segmentOpacity * 255).toString(16).padStart(2, '0');
        
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
    const color = hexColor.replace('#', '');
    
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
