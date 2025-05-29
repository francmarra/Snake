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
  }
  
  update(snake, fruits, bombs, palette) {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw grid background
    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Optional: Draw grid lines
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
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
    
    // Draw bombs
    this.ctx.fillStyle = '#FF0000';
    for (const bomb of bombs) {
      const x = Math.round(bomb.mesh.position.x);
      const z = Math.round(bomb.mesh.position.z);
      this.ctx.fillRect(
        x * this.cellWidth, 
        z * this.cellHeight, 
        this.cellWidth, 
        this.cellHeight
      );
    }
    
    // Draw fruits
    this.ctx.fillStyle = palette.fruitColor ? '#' + new THREE.Color(palette.fruitColor).getHexString() : '#614bdd';
    for (const fruit of fruits) {
      const x = Math.round(fruit.mesh.position.x);
      const z = Math.round(fruit.mesh.position.z);
      this.ctx.fillRect(
        x * this.cellWidth, 
        z * this.cellHeight, 
        this.cellWidth, 
        this.cellHeight
      );
    }
    
    // Draw snake
    // Head color
    const snakeHeadColor = palette.snakeColor ? '#' + new THREE.Color(palette.snakeColor).getHexString() : '#ff470a';
    this.ctx.fillStyle = snakeHeadColor;
    
    // Draw snake body (tracking positions from the snake indexes)
    for (let i = 0; i < snake.indexes.length; i++) {
      const index = snake.indexes[i];
      const x = index % this.gridWidth;
      const z = Math.floor(index / this.gridWidth);
      
      // Special styling for head
      if (i === snake.indexes.length - 1) {
        this.ctx.fillStyle = snakeHeadColor;
      } else {
        // Gradient color for body
        const bodyOpacity = 0.7 + (0.3 * i / snake.indexes.length);
        this.ctx.fillStyle = snakeHeadColor + Math.floor(bodyOpacity * 255).toString(16).padStart(2, '0');
      }
      
      this.ctx.fillRect(
        x * this.cellWidth, 
        z * this.cellHeight, 
        this.cellWidth, 
        this.cellHeight
      );
    }
  }
}
