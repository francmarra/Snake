import Entity from './Entity'
import * as THREE from 'three'

export default class Flower extends Entity {
  constructor(resolution, petalColor = 0xff69b4, centerColor = 0xFFA500) {
    // Create flower geometry with better proportions
    const stemGeometry = new THREE.CylinderGeometry(0.02, 0.04, 1.2, 8)
    const centerGeometry = new THREE.SphereGeometry(0.08, 16, 12)

    // Create materials with more realistic colors and properties
    const stemMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x2d5016,  // Stem color always stays green
      roughness: 0.8,
      metalness: 0.1
    })
    const centerMaterial = new THREE.MeshStandardMaterial({ 
      color: centerColor,
      roughness: 0.6,
      metalness: 0.1
    })
    const petalMaterial = new THREE.MeshStandardMaterial({ 
      color: petalColor,
      roughness: 0.4,
      metalness: 0.05
    })
    const leafMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x228B22,
      roughness: 0.7,
      metalness: 0.1
    })

    // Create meshes
    const stem = new THREE.Mesh(stemGeometry, stemMaterial)
    const center = new THREE.Mesh(centerGeometry, centerMaterial)

    // Position parts
    center.position.y = 0.6

    // Add slight random tilt to center for natural look
    center.rotation.x = (Math.random() - 0.5) * 0.2
    center.rotation.z = (Math.random() - 0.5) * 0.2

    // Create group to hold all parts
    const group = new THREE.Group()
    group.add(stem, center)

    // Create more natural petals with randomness
    const numPetals = 6 + Math.floor(Math.random() * 3); // 6-8 petals randomly
    const baseAngleOffset = Math.random() * Math.PI * 2; // Random starting rotation

    for (let i = 0; i < numPetals; i++) {
      // Add randomness to petal dimensions
      const petalLength = 0.35 + (Math.random() - 0.5) * 0.1;
      const petalWidth = 0.12 + (Math.random() - 0.5) * 0.03;
  
      // Create a more organic petal shape
      const petalShape = new THREE.Shape();
  
      // Start at center point
      petalShape.moveTo(0, 0);
  
      // Create asymmetric, natural-looking petal with slight randomness
      const curvature1 = 0.6 + (Math.random() - 0.5) * 0.2;
      const curvature2 = 0.7 + (Math.random() - 0.5) * 0.2;
  
      petalShape.bezierCurveTo(
        petalWidth * curvature1, petalWidth * 0.8,
        petalLength * 0.7, petalWidth * 0.9,
        petalLength, petalWidth * 0.05
      );
  
      petalShape.bezierCurveTo(
        petalLength * 0.8, -petalWidth * 0.7,
        petalWidth * curvature2, -petalWidth * 0.6,
        0, 0
      );
  
      // Extrude with slight variation
      const extrudeSettings = {
        steps: 1,
        depth: 0.015 + Math.random() * 0.01,
        bevelEnabled: true,
        bevelThickness: 0.002,
        bevelSize: 0.005,
        bevelSegments: 2
      };
  
      const petalGeometry = new THREE.ExtrudeGeometry(petalShape, extrudeSettings);
      const petal = new THREE.Mesh(petalGeometry, petalMaterial.clone());
        // Add natural color variation to petals
      const colorVariation = 0.1;
      const r = ((petalColor >> 16) & 255) / 255;
      const g = ((petalColor >> 8) & 255) / 255;
      const b = (petalColor & 255) / 255;
  
      petal.material.color.setRGB(
        Math.max(0, Math.min(1, r + (Math.random() - 0.5) * colorVariation)),
        Math.max(0, Math.min(1, g + (Math.random() - 0.5) * colorVariation)),
        Math.max(0, Math.min(1, b + (Math.random() - 0.5) * colorVariation))
      );
  
      // Calculate angle with slight randomness for natural arrangement
      const baseAngle = (i / numPetals) * Math.PI * 2 + baseAngleOffset;
      const angleVariation = (Math.random() - 0.5) * 0.3;
      const angle = baseAngle + angleVariation;
  
      // Position and rotate petal with natural variation
      petal.position.y = 0.6 + (Math.random() - 0.5) * 0.02;
      petal.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.2;
      petal.rotation.z = angle;
  
      // Add slight random tilt to each petal
      petal.rotation.y = (Math.random() - 0.5) * 0.4;
  
      group.add(petal);
    }

    // Add more natural leaves
    const numLeaves = 2 + Math.floor(Math.random() * 2); // 2-3 leaves

    for (let i = 0; i < numLeaves; i++) {      // Create more realistic leaf shape using custom geometry
      const leafShape = new THREE.Shape();
      const leafLength = 0.45 + Math.random() * 0.15;
      const leafWidth = 0.15 + Math.random() * 0.05;
  
      // Create pointed leaf shape
      leafShape.moveTo(0, 0);
      leafShape.bezierCurveTo(
        leafWidth * 0.3, leafLength * 0.3,
        leafWidth, leafLength * 0.7,
        leafWidth * 0.1, leafLength
      );
      leafShape.bezierCurveTo(
        -leafWidth * 0.1, leafLength * 0.7,
        -leafWidth, leafLength * 0.3,
        0, 0
      );
        const leafExtrudeSettings = {
        steps: 1,
        depth: 0.008,
        bevelEnabled: true,
        bevelThickness: 0.002,
        bevelSize: 0.003,
        bevelSegments: 1
      };
  
      const leafGeometry = new THREE.ExtrudeGeometry(leafShape, leafExtrudeSettings);
      const leaf = new THREE.Mesh(leafGeometry, leafMaterial.clone());

      // Position leaves more naturally along stem
      const leafAngle = (i / numLeaves) * Math.PI * 2 + Math.random() * Math.PI;
      const leafHeight = i * 0.2 + Math.random() * 0.15;
      const leafDistance = 0.1 + Math.random() * 0.03;
  
      leaf.position.x = Math.cos(leafAngle) * leafDistance;
      leaf.position.z = Math.sin(leafAngle) * leafDistance;
      leaf.position.y = leafHeight;
  
      // Natural leaf orientation
      leaf.rotation.x = Math.PI / 2;
      leaf.rotation.z = leafAngle + Math.PI / 2 + (Math.random() - 0.5) * 0.5;
      leaf.rotation.y = -0.2 + (Math.random() - 0.5) * 0.3;
  
      group.add(leaf);
    }

    // Add subtle random rotation to entire flower
    group.rotation.y = Math.random() * Math.PI * 2;

    super(group, resolution)

    // Enable shadows with better shadow settings
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true
        child.receiveShadow = true

        // Add subtle ambient occlusion effect
        if (child.material) {
          child.material.aoMapIntensity = 0.3;
        }
      }
    })
  }
}