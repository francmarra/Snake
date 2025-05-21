// Implementação do minimapa para o jogo Snake 3D
export default class Minimap {
  constructor(gridWidth, gridHeight) {
    this.canvas = document.getElementById('minimap');
    this.ctx = this.canvas.getContext('2d');
    this.gridWidth = gridWidth;
    this.gridHeight = gridHeight;
    
    // Ajusta o cálculo do tamanho da célula para o canvas maior
    this.cellSize = Math.min(
      this.canvas.width / this.gridWidth,
      this.canvas.height / this.gridHeight
    );
    
    // Centra a grelha no canvas
    this.offsetX = (this.canvas.width - this.cellSize * this.gridWidth) / 2;
    this.offsetY = (this.canvas.height - this.cellSize * this.gridHeight) / 2;
    
    // Inicializa o minimapa com estilo melhorado
    this.clear();
    this.drawGrid();
  }
  // Limpa o minimapa
  clear() {
    // Cria um fundo em gradiente
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

  // Desenha as linhas da grelha
  drawGrid() {
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    this.ctx.lineWidth = 0.7;

    // Desenha linhas verticais
    for (let x = 0; x <= this.gridWidth; x++) {
      const xPos = this.offsetX + x * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(xPos, this.offsetY);
      this.ctx.lineTo(xPos, this.offsetY + this.gridHeight * this.cellSize);
      this.ctx.stroke();
    }

    // Desenha linhas horizontais
    for (let y = 0; y <= this.gridHeight; y++) {
      const yPos = this.offsetY + y * this.cellSize;
      this.ctx.beginPath();
      this.ctx.moveTo(this.offsetX, yPos);
      this.ctx.lineTo(this.offsetX + this.gridWidth * this.cellSize, yPos);
      this.ctx.stroke();
    }
  }
  // Desenha a cobra no minimapa
  drawSnake(snake, color) {
    // Desenha cada segmento da cobra
    let current = snake.body.head;
    let isHead = true;
    let segmentCount = 0;
    
    while (current) {
      const position = current.data.mesh.position;
      // Usa coordenadas exatas sem arredondar para manter precisão
      const x = position.x;
      const z = position.z;
      
      // Calcula a posição em pixels no minimapa
      const pixelX = this.offsetX + x * this.cellSize + this.cellSize / 2;
      const pixelY = this.offsetY + z * this.cellSize + this.cellSize / 2;
      
      // Desenha o segmento da cobra
      if (isHead) {
        // Desenha a cabeça com estilo diferente
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.strokeStyle = color;
        this.ctx.lineWidth = 2;
        
        this.ctx.beginPath();
        this.ctx.arc(
          pixelX,
          pixelY,
          this.cellSize / 2 - 1,
          0,
          Math.PI * 2
        );
        this.ctx.fill();
        this.ctx.stroke();
      } else {
        // Desenha segmentos do corpo com efeito pulsante baseado na posição
        const alpha = 0.7 + 0.3 * Math.sin(segmentCount * 0.2 + Date.now() * 0.003);
        this.ctx.fillStyle = color;
        this.ctx.globalAlpha = alpha;
        
        // Desenha cada segmento como quadrado centrado na posição exata
        const halfCell = this.cellSize / 2 - 1;
        this.ctx.fillRect(
          pixelX - halfCell, 
          pixelY - halfCell, 
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
  
  // Desenha frutas no minimapa
  drawFruits(fruits, color) {
    fruits.forEach(fruit => {
      const position = fruit.mesh.position;
      // Usa coordenadas exatas sem arredondar
      const x = position.x;
      const z = position.z;
      
      // Calcula a posição em pixels
      const pixelX = this.offsetX + x * this.cellSize + this.cellSize / 2;
      const pixelY = this.offsetY + z * this.cellSize + this.cellSize / 2;
      
      // Desenha a fruta como círculo com efeito pulsante
      const pulseFactor = 0.8 + 0.2 * Math.sin(Date.now() * 0.005);
      const radius = (this.cellSize / 2 - 1) * pulseFactor;
      
      // Desenha efeito de brilho
      const gradient = this.ctx.createRadialGradient(
        pixelX,
        pixelY,
        radius * 0.5,
        pixelX,
        pixelY,
        radius * 1.3
      );
      
      gradient.addColorStop(0, color);
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      this.ctx.fillStyle = gradient;
      this.ctx.beginPath();
      this.ctx.arc(
        pixelX,
        pixelY,
        radius * 1.3,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      // Desenha a fruta
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.arc(
        pixelX,
        pixelY,
        radius,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
    });
  }
  
  // Desenha bombas no minimapa
  drawBombs(bombs) {
    bombs.forEach(bomb => {
      const position = bomb.mesh.position;
      // Usa coordenadas exatas sem arredondar
      const x = position.x;
      const z = position.z;
      
      // Calcula a posição em pixels
      const pixelX = this.offsetX + x * this.cellSize + this.cellSize / 2;
      const pixelY = this.offsetY + z * this.cellSize + this.cellSize / 2;
      
      // Desenha a bomba com efeito de perigo pulsante
      const pulseIntensity = 0.5 + 0.5 * Math.sin(Date.now() * 0.008);
      const bombColor = `rgba(255, ${Math.floor(50 * pulseIntensity)}, 0, 1)`;
      
      // Desenha círculo da bomba
      this.ctx.fillStyle = bombColor;
      this.ctx.beginPath();
      this.ctx.arc(
        pixelX,
        pixelY,
        this.cellSize / 2 - 2,
        0,
        Math.PI * 2
      );
      this.ctx.fill();
      
      // Desenha cruz de perigo
      this.ctx.strokeStyle = '#FFFFFF';
      this.ctx.lineWidth = 2;
      
      // Desenha X
      this.ctx.beginPath();
      this.ctx.moveTo(
        pixelX - this.cellSize / 3,
        pixelY - this.cellSize / 3
      );
      this.ctx.lineTo(
        pixelX + this.cellSize / 3,
        pixelY + this.cellSize / 3
      );
      this.ctx.moveTo(
        pixelX + this.cellSize / 3,
        pixelY - this.cellSize / 3
      );
      this.ctx.lineTo(
        pixelX - this.cellSize / 3,
        pixelY + this.cellSize / 3
      );
      this.ctx.stroke();
    });
  }
  // Atualiza o minimapa
  update(snake, fruits, bombs, palette) {
    this.clear();
    this.drawGrid();
    
    // Obtém cores da paleta e converte para string hexadecimal
    const snakeColorHex = `#${palette.snakeColor.toString(16).padStart(6, '0')}`;
    const fruitColorHex = `#${palette.fruitColor.toString(16).padStart(6, '0')}`;
    
    // Desenha entidades
    this.drawFruits(fruits, fruitColorHex);
    this.drawBombs(bombs);
    this.drawSnake(snake, snakeColorHex);
  }
}
