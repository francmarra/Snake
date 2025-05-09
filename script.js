import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js';


window.addEventListener('DOMContentLoaded', () => {
  // === VARIÁVEIS GLOBAIS ===
  let gameStarted = false;
  let musicPlaying = false;
  let score = 0;
  
  let direction = new THREE.Vector3(1, 0, 0);
  let nextDirection = direction.clone();
  let lastMoveTime = 0;
  const moveInterval = 300;
  const snake = [];
  const segmentRadius = 0.4;
  const spacing = 1;
  let fruits = [];
  let powerUp = null;
  let powerUpTimeout = null;
  const aspect = window.innerWidth / window.innerHeight;

  const fruitTypes = [
    { name: 'maçã', color: 0xff0000, score: 30 },
    { name: 'banana', color: 0xffff00, score: 15 },
    { name: 'limão', color: 0x99ff00, score: 5 },
  
  ];

  // === CENA, CÂMARA, RENDERER ===
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x20232a, 20, 60);

  const loader = new THREE.CubeTextureLoader();
  const skyTexture = loader.load([
    'assets/skybox/px.jpg',
    'assets/skybox/nx.jpg',
    'assets/skybox/py.jpg',
    'assets/skybox/ny.jpg',
    'assets/skybox/pz.jpg',
    'assets/skybox/nz.jpg',
  ]);
  scene.background = skyTexture;

  

// Câmaras

const perspectiveCamera = new THREE.PerspectiveCamera(60, aspect, 0.1, 100);
perspectiveCamera.position.set(10, 20, 20);
perspectiveCamera.lookAt(0, 0, 0);



const orthoSize = 20;
const orthographicCamera = new THREE.OrthographicCamera(
  -orthoSize * aspect / 2, orthoSize * aspect / 2,
  orthoSize / 2, -orthoSize / 2,
  0.1, 100
);
// Câmera ortográfica (top-down)
orthographicCamera.position.set(0, 30, 0);
orthographicCamera.lookAt(0, 0, 0);

let currentCamera = perspectiveCamera;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  // === LUZES ===
  // 1. Luz ambiente suave
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

  // 2. Luz direcional (simulando sol)
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 20, 10);
directionalLight.castShadow = true;
// Sombras realistas
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -20;
directionalLight.shadow.camera.right = 20;
directionalLight.shadow.camera.top = 20;
directionalLight.shadow.camera.bottom = -20;

scene.add(directionalLight);

// 3. Spotlight focando na cobra (opcional)
const spotLight = new THREE.SpotLight(0xffffff, 0.5);
spotLight.position.set(0, 20, 0);
spotLight.angle = Math.PI / 6;
spotLight.penumbra = 0.3;
spotLight.decay = 2;
spotLight.distance = 50;
spotLight.castShadow = true;

scene.add(spotLight);



  // === CHÃO E BASE ===
  const textureLoader = new THREE.TextureLoader();
  const tileTex = textureLoader.load('https://threejs.org/examples/textures/checker.png');
  tileTex.wrapS = tileTex.wrapT = THREE.RepeatWrapping;
  tileTex.repeat.set(10, 10);
  tileTex.magFilter = THREE.NearestFilter;

  const floor = new THREE.Mesh(new THREE.PlaneGeometry(20, 20), new THREE.MeshStandardMaterial({ map: tileTex }));
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = 0.01;
  floor.receiveShadow = true;
  scene.add(floor);

  const base = new THREE.Mesh(new THREE.BoxGeometry(20, 1, 20), new THREE.MeshStandardMaterial({ color: 0x303030 }));
  base.position.y = -0.5;
  base.receiveShadow = true;
  scene.add(base);

  // === PAREDES ===
  const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const wallHeight = 2;
  const wallThickness = 0.5;
  const size = 20;

  const wallN = new THREE.Mesh(new THREE.BoxGeometry(size, wallHeight, wallThickness), wallMaterial);
  wallN.position.set(0, wallHeight / 2, -size / 2);
  scene.add(wallN);

  const wallS = wallN.clone();
  wallS.position.z = size / 2;
  scene.add(wallS);

  const wallW = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, size), wallMaterial);
  wallW.position.set(-size / 2, wallHeight / 2, 0);
  scene.add(wallW);

  const wallE = wallW.clone();
  wallE.position.x = size / 2;
  scene.add(wallE);

  // === COBRA ===
  const headMat = new THREE.MeshStandardMaterial({ color: 0x2E7D32 });
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x4CAF50 });

  const head = new THREE.Mesh(new THREE.SphereGeometry(segmentRadius, 16, 16), headMat);
  head.position.set(0, segmentRadius, 0);
  scene.add(head);
  snake.push(head);

  for (let i = 1; i < 3; i++) {
    const body = new THREE.Mesh(new THREE.SphereGeometry(segmentRadius, 16, 16), bodyMat);
    body.position.set(-i * spacing, segmentRadius, 0);
    scene.add(body);
    snake.push(body);
  }

  // === OLHOS ===
  function createEye(xDir) {
    const eyeGeo = new THREE.SphereGeometry(0.1, 12, 12);
    const eyeMat = new THREE.MeshStandardMaterial({ color: 0xffffff });
    const pupilGeo = new THREE.SphereGeometry(0.05, 8, 8);
    const pupilMat = new THREE.MeshStandardMaterial({ color: 0x000000 });

    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    const pupil = new THREE.Mesh(pupilGeo, pupilMat);
    eye.position.set(xDir * 0.15, 0.15, 0.3);
    pupil.position.set(xDir * 0.15, 0.15, 0.35);
    head.add(eye);
    head.add(pupil);
  }
  createEye(1);
  createEye(-1);

  // === LÍNGUA ===
  const tongueGeo = new THREE.ConeGeometry(0.05, 0.3, 8);
  const tongueMat = new THREE.MeshStandardMaterial({ color: 0xff4444 });
  const tongue = new THREE.Mesh(tongueGeo, tongueMat);
  tongue.rotation.x = Math.PI / 2;
  tongue.position.set(0, 0, 0.3);
  head.add(tongue);
  let tongueDirection = 1;
  const tongueSpeed = 0.01;
  const tongueMin = 0.2;
  const tongueMax = 0.35;

  function animateTongue() {
    tongue.position.z += tongueDirection * tongueSpeed;
    if (tongue.position.z > tongueMax || tongue.position.z < tongueMin) {
      tongueDirection *= -1;
    }
  }

  // === FRUTA ===
  function spawnFruit() {
    const type = fruitTypes[Math.floor(Math.random() * fruitTypes.length)];
    let fruit;
    
    switch (type.name) {
      case 'maçã':
        fruit = new THREE.Group();
  
        const appleBody = new THREE.Mesh(
          new THREE.SphereGeometry(0.35, 16, 16),
          new THREE.MeshStandardMaterial({ color: type.color })
        );
        const appleStem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.05, 0.05, 0.2, 8),
          new THREE.MeshStandardMaterial({ color: 0x4d2600 })
        );
        appleStem.position.y = 0.4;
        fruit.add(appleBody);
        fruit.add(appleStem);
        break;
  
        case 'banana':
          const bananaMat = new THREE.MeshStandardMaterial({ color: type.color });
          const bananaGeo = new THREE.CapsuleGeometry(0.15, 0.6, 4, 8); // aumentei o raio
          fruit = new THREE.Mesh(bananaGeo, bananaMat);
          fruit.rotation.set(Math.PI / 2.5, 0, 0.3); // ligeiro arco
          break;
  
          case 'limão':
            const lemonGroup = new THREE.Group();
          
            const lemonMat = new THREE.MeshStandardMaterial({ color: type.color });
            const lemonGeo = new THREE.SphereGeometry(0.35, 20, 20);
            lemonGeo.scale(1.2, 0.8, 1.0); // mais ovalado
            const lemonMesh = new THREE.Mesh(lemonGeo, lemonMat);
            lemonGroup.add(lemonMesh);
          
            // Folhinha
            const leafGeo = new THREE.PlaneGeometry(0.3, 0.15);
            const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, side: THREE.DoubleSide });
            const leaf = new THREE.Mesh(leafGeo, leafMat);
            leaf.position.set(0.1, 0.4, 0);
            leaf.rotation.set(-Math.PI / 4, 0, Math.PI / 8); // levemente inclinada
            lemonGroup.add(leaf);
          
            fruit = lemonGroup;
            break;  
    }
  
    const x = Math.round(Math.random() * 18 - 9);
    const z = Math.round(Math.random() * 18 - 9);
    fruit.position.set(x, 0.4, z);
    fruit.userData = { type: type.name, score: type.score };
    scene.add(fruit);
    fruits.push(fruit);
  }
  

  function updateScore(points) {
    score += points;
    document.getElementById('score').innerText = `Pontuação: ${score}`;
  }



  
  function growSnake() {
    const lastSegment = snake[snake.length - 1];
    const body = new THREE.Mesh(new THREE.SphereGeometry(segmentRadius, 16, 16), bodyMat);
    body.position.copy(lastSegment.position);
    scene.add(body);
    snake.push(body);
  }

  function moveSnake() {
    direction.copy(nextDirection);
    const positions = snake.map(seg => seg.position.clone());
    head.position.add(direction.clone().multiplyScalar(spacing));
  
    // Verifica colisão com bordas
    if (head.position.x < -10 || head.position.x > 10 || head.position.z < -10 || head.position.z > 10) {
      gameOver();
      return;
    }
  
    // Verifica colisão com o corpo
    for (let i = 1; i < snake.length; i++) {
      if (head.position.distanceTo(snake[i].position) < 0.5) {
        gameOver();
        return;
      }
    }
  
    // Verifica colisão com frutas/power-ups/bombas
    for (let i = fruits.length - 1; i >= 0; i--) {
      const fruit = fruits[i];
  
      if (head.position.distanceTo(fruit.position) < 0.6) {
        scene.remove(fruit);
        fruits.splice(i, 1);
  
        // 💣 Bomba
        if (fruit.userData.isBomb) {
          score -= 100;
          updateScore(0);
  
          const toRemove = Math.min(3, snake.length - 1);
          for (let j = 0; j < toRemove; j++) {
            const segment = snake.pop();
            scene.remove(segment);
          }
  
          if (score < 0 || snake.length <= 1) {
            gameOver();
            return;
          }
  
        } else {
          // 🍎🍌🍋 Fruta normal
          updateScore(fruit.userData.score);
          growSnake();
          spawnFruit();
  
          if (Math.random() < 0.2 && !powerUp) {
            spawnPowerUp();
          }
        }
  
        // 💣 Chance da bomba (30%)
        if (Math.random() < 0.3) {
          spawnBomb();
        }
      }
    }
  
    // Verifica colisão com o power-up (estrela)
    if (powerUp && head.position.distanceTo(powerUp.position) < 0.6) {
      updateScore(powerUp.userData.score);
      scene.remove(powerUp);
      powerUp = null;
      clearTimeout(powerUpTimeout);
    }
  
    // Atualiza posições do corpo da cobra
    for (let i = 1; i < snake.length; i++) {
      snake[i].position.copy(positions[i - 1]);
    }
  }
  

  //Função para gerar SuperMaçã
function spawnPowerUp() {
  // Criar forma de estrela 5 pontas
  const starShape = new THREE.Shape();
  const outerRadius = 0.4;
  const innerRadius = 0.2;
  const spikes = 5;

  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) {
      starShape.moveTo(x, y);
    } else {
      starShape.lineTo(x, y);
    }
  }
  starShape.closePath();

  // Extrusão para dar volume
  const extrudeSettings = {
    depth: 0.2,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 2,
    bevelSize: 0.05,
    bevelThickness: 0.05,
  };

  const starGeo = new THREE.ExtrudeGeometry(starShape, extrudeSettings);
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xffa500,       // Laranja
    emissive: 0xffa500,    // Efeito luminoso
    metalness: 0.3,
    roughness: 0.4,
  });

  powerUp = new THREE.Mesh(starGeo, starMat);
  powerUp.rotation.x = Math.PI / 2;
  powerUp.position.set(
    Math.round(Math.random() * 18 - 9),
    0.4,
    Math.round(Math.random() * 18 - 9)
  );
  powerUp.userData = { score: 100 };

  scene.add(powerUp);

  // Desaparece após 10 segundos
  powerUpTimeout = setTimeout(() => {
    if (powerUp) {
      scene.remove(powerUp);
      powerUp = null;
    }
  }, 10000);
}
// funçao para spawn da  bomba 
function spawnBomb() {
  const bomb = new THREE.Group();

  // Corpo da bomba
  const bodyGeo = new THREE.SphereGeometry(0.3, 16, 16);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x111111 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  bomb.add(body);

  // Pavio
  const fuseGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 8);
  const fuseMat = new THREE.MeshStandardMaterial({ color: 0xff0000 });
  const fuse = new THREE.Mesh(fuseGeo, fuseMat);
  fuse.position.set(0, 0.45, 0);
  bomb.add(fuse);

  // Posição aleatória
  const x = Math.round(Math.random() * 18 - 9);
  const z = Math.round(Math.random() * 18 - 9);
  bomb.position.set(x, 0.4, z);
  bomb.userData = { isBomb: true };

  scene.add(bomb);
  fruits.push(bomb); // usamos o mesmo array para facilitar
}



  function gameOver() {
    gameStarted = false;
    document.getElementById('startBtn').style.display = 'inline-block';
    document.getElementById('startBtn').innerText = '🔁 Recomeçar Jogo';
  }

  function animate(time) {
    requestAnimationFrame(animate);

    if (gameStarted) {
      if (!lastMoveTime) lastMoveTime = time;
      if (time - lastMoveTime > moveInterval) {
        moveSnake();
        lastMoveTime = time;
      }
      animateTongue();
    }

    renderer.render(scene, currentCamera);

  }
  animate();


function spawnObstacle(level) {
  if (level >= 3) {
    const obs = new THREE.Mesh(
      new THREE.BoxGeometry(1, 1, 1),
      new THREE.MeshStandardMaterial({ color: 0x993333 })
    );
    obs.position.set(Math.round(Math.random() * 18 - 9), 0.5, Math.round(Math.random() * 18 - 9));
    scene.add(obs);
    obstacles.push(obs);
  }
}



  // === EVENTOS ===
  window.addEventListener('resize', () => {
    const aspect = window.innerWidth / window.innerHeight;
    perspectiveCamera.aspect = aspect;
    perspectiveCamera.updateProjectionMatrix();
  
    orthographicCamera.left = -orthoSize * aspect / 2;
    orthographicCamera.right = orthoSize * aspect / 2;
    orthographicCamera.top = orthoSize / 2;
    orthographicCamera.bottom = -orthoSize / 2;
    orthographicCamera.updateProjectionMatrix();
  
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  window.addEventListener('keydown', (event) => {
    if (!gameStarted) return;
    switch (event.key) {
      case 'ArrowUp': if (direction.z === 0) nextDirection.set(0, 0, -1); break;
      case 'ArrowDown': if (direction.z === 0) nextDirection.set(0, 0, 1); break;
      case 'ArrowLeft': if (direction.x === 0) nextDirection.set(-1, 0, 0); break;
      case 'ArrowRight': if (direction.x === 0) nextDirection.set(1, 0, 0); break;
    }
  });

  // === BOTÕES MENU ===
  document.getElementById('startBtn').addEventListener('click', () => {
    gameStarted = true;
    lastMoveTime = performance.now();
    document.getElementById('startBtn').style.display = 'none';
    score = 0;
    updateScore(0);
    direction.set(1, 0, 0);
    nextDirection.set(1, 0, 0);

    for (let i = 1; i < snake.length; i++) scene.remove(snake[i]);
    snake.length = 1;
    head.position.set(0, segmentRadius, 0);

    for (let fruit of fruits) scene.remove(fruit);
    fruits = [];
    for (let i = 0; i < 3; i++) spawnFruit();

  });


  document.getElementById('toggleCamera').addEventListener('click', () => {
    currentCamera = (currentCamera === perspectiveCamera) ? orthographicCamera : perspectiveCamera;
  });

  document.getElementById('toggleAmbient').addEventListener('click', () => {
    ambientLight.visible = !ambientLight.visible;
  });
  
  document.getElementById('toggleDirectional').addEventListener('click', () => {
    dirLight.visible = !dirLight.visible;
  });
  
  document.getElementById('togglePoint').addEventListener('click', () => {
    pointLight.visible = !pointLight.visible;
  });
  
  const audio = new Audio('assets/musica_jogo.mp3');
  audio.loop = true;

  document.getElementById('toggleMusic').addEventListener('click', () => {
    if (musicPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    musicPlaying = !musicPlaying;
  });
});
