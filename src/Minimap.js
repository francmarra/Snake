// Minimap implementation for Snake 3D game
export default class Minimap {
  constructor(gridWidth, gridHeight) {
    this.canvas = document.getElementById('minimap');
    this.ctx = this.canvas.getContext('2d');
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    
    // Adjust cell size calculation for the larger canvas
    this.cellSize = Math.min(
      this.canvas.width / this.gridWidth,
      this.canvas.height / this.gridHeight
    );
    
    // Center the grid in the canvas
    this.offsetX = (this.canvas.width - this.cellSize * this.gridWidth) / 2;
    this.offsetY = (this.canvas.height - this.cellSize * this.gridHeight) / 2;
    
    // Initialize the minimap with improved styling
    this.clear();
    this.drawGrid();
  }
  // Clear the minimap
  clear() {
    // Create a gradient background
    const gradient = this.ctx.createRadialGradient(
      this.canvas.width / 2,
      this.canvas.height / 2,
      0,
      this.canvas.width / 2,
      this.canvas.height / 2,
      this.canvas.width / 2
    );
    
    gradient.addColorStop(0, 'rgba(0, 0, 0, 0.6)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.9)');
    
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  // Draw the grid lines
  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 0.7;

    // Draw vertical grid lines
    for (let x = 0; x <= this.gridWidth; x++) {
      const xPos = this.offsetX + x * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos, this.offsetY);
      this.ctx.lineTo(xPos, this.offsetY + this.gridHeight * this.cellSize);
      this.ctx.stroke();
    }

    // Draw horizontal grid lines
    for (let y = 0; y <= this.gridHeight; y++) {
      const yPos = this.offsetY + y * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, yPos);
      this.ctx.lineTo(this.offsetX + this.gridWidth * this.cellSize, yPos);
      this.ctx.stroke();
    }
  }
  // Draw the snake on the minimap
  drawSnake(snake, color) {
    // Draw each segment of the snake
    let current = snake.body.head;
    let isHead = true;
    let segmentCount = 0;
    
    while (current) {
      const position = current.data.mesh.position;
      // Convert 3D position to 2D grid coordinates
      const x = Math.floor(position.x);
      const z = Math.floor(position.z);
      
      // Draw the snake segment
      if (isHead) {
        // Draw head with a different style
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(
          this.offsetX + x * this.cellSize + this.cellSize / 2,
          this.offsetY + z * this.cellSize + this.cellSize / 2,
          this.cellSize / 2 - 1,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.stroke();
      } else {
        // Draw body segments with a pulsating effect based on segment position
        const alpha = 0.7 + 0.3 * Math.sin(segmentCount * 0.2 + Date.now() * 0.003);
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        
        this.ctx.fillRect(
          this.offsetX + x * this.cellSize + 1, 
          this.offsetY + z * this.cellSize + 1, 
          this.cellSize - 2, 
          this.cellSize - 2
        );
        
        this.ctx.globalAlpha = 1;
      }
      
      isHead = false;
      segmentCount++;
      current = current.next;
    }
  }
  // Draw fruits on the minimap
  drawFruits(fruits, color) {
    fruits.forEach(fruit => {
      const position = fruit.mesh.position;
      // Convert 3D position to 2D grid coordinates
      const x = Math.floor(position.x);
      const z = Math.floor(position.z);
      
      // Draw the fruit as a circle with a pulsating effect
      const pulseFactor = 0.8 + 0.2 * Math.sin(Date.now() * 0.005);
      const radius = (this.cellSize / 2 - 1) * pulseFactor;
      
      // Draw glow effect
      const gradient = this.ctx.createRadialGradient(
        this.offsetX + x * this.cellSize + this.cellSize / 2,
        this.offsetY + z * this.cellSize + this.cellSize / 2,
        radius * 0.5,
        this.offsetX + x * this.cellSize + this.cellSize / 2,
        this.offsetY + z * this.cellSize + this.cellSize / 2,
        radius * 1.3
      );
      
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(
        this.offsetX + x * this.cellSize + this.cellSize / 2,
        this.offsetY + z * this.cellSize + this.cellSize / 2,
        radius * 1.3,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      // Draw fruit
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(
        this.offsetX + x * this.cellSize + this.cellSize / 2,
        this.offsetY + z * this.cellSize + this.cellSize / 2,
        radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });
  }
  // Draw bombs on the minimap
  drawBombs(bombs) {
    bombs.forEach(bomb => {
      const position = bomb.mesh.position;
      // Convert 3D position to 2D grid coordinates
      const x = Math.floor(position.x);
      const z = Math.floor(position.z);
      
      const centerX = this.offsetX + x * this.cellSize + this.cellSize / 2;
      const centerY = this.offsetY + z * this.cellSize + this.cellSize / 2;
      
      // Draw the bomb with a pulsing danger effect
      const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
      const bombColor = `rgba(255, ${Math.floor(50 * pulseIntensity)}, 0, 1)`;
      
      // Draw bomb circle
      this.ctx.fillStyle = bombColor;
      this.ctx.beginPath();
      this.ctx.arc(
        centerX,
        centerY,
        this.cellSize / 2 - 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      // Draw danger cross
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2;
      
      // Draw X
      this.ctx.beginPath();
      this.ctx.moveTo(
        centerX - this.cellSize / 3,
        centerY - this.cellSize / 3
      );
      this.ctx.lineTo(
        centerX + this.cellSize / 3,
        centerY + this.cellSize / 3
      );
      this.ctx.moveTo(
        centerX + this.cellSize / 3,
        centerY - this.cellSize / 3
      );
      this.ctx.lineTo(
        centerX - this.cellSize / 3,
        centerY + this.cellSize / 3
      );
      this.ctx.stroke();
    });
  }
  // Update the minimap
  update(snake, fruits, bombs, palette) {
    this.clear();
    this.drawGrid();
    
    // Get colors from the palette and convert to hex string
    const snakeColorHex = `#${palette.snakeColor.toString(16).padStart(6, '0')}`;
    const fruitColorHex = `#${palette.fruitColor.toString(16).padStart(6, '0')}`;
    
    // Draw entities
    this.drawFruits(fruits, fruitColorHex);
    this.drawBombs(bombs);
    this.drawSnake(snake, snakeColorHex);
  }
}
