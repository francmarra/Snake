import {
    ConeGeometry,
    Mesh,
    MeshStandardMaterial,
    CylinderGeometry,
    Group,
} from 'three'
import Entity from './Entity'

// Shared geometries for performance
const CONE_GEOMETRY = new ConeGeometry(1, 2, 8) // Base cone shape
const TRUNK_GEOMETRY = new CylinderGeometry(0.4, 0.6, 1, 8)

// Materials (will be colored from outside)
const FOLIAGE_MATERIAL = new MeshStandardMaterial({
    flatShading: true,
    color: 0x2d5a3d, // Default pine green
})
const TRUNK_MATERIAL = new MeshStandardMaterial({ 
    flatShading: true, 
    color: 0x8b4513 
})

export default class Tree extends Entity {
    constructor(resolution, color) {
        const group = new Group()
        const scale = 0.6 + Math.random() * 0.6

        // Create trunk
        const trunk = new Mesh(TRUNK_GEOMETRY, TRUNK_MATERIAL)
        trunk.scale.set(scale * 0.4, scale * 1.2, scale * 0.4)
        trunk.castShadow = true
        trunk.receiveShadow = true

        // Create pine layers (3-4 layers for realistic look)
        const numLayers = 3 + Math.floor(Math.random() * 2) // 3 or 4 layers
        const foliageLayers = []

        for (let i = 0; i < numLayers; i++) {
            const layer = new Mesh(CONE_GEOMETRY, FOLIAGE_MATERIAL)

            // Each layer gets smaller and positioned higher
            const layerScale = scale * (1.2 - i * 0.25) // Decreasing size
            const layerHeight = scale * (1.8 + i * 0.8) // Increasing height

            layer.scale.set(layerScale, layerScale * 0.8, layerScale)
            layer.position.y = layerHeight -0.3

            // Add slight rotation variation for natural look
            layer.rotation.y = Math.random() * Math.PI * 2

            // Enable shadows for each layer
            layer.castShadow = true
            layer.receiveShadow = true

            foliageLayers.push(layer)
            group.add(layer)
        }

        // Apply color if provided
        if (color) {
            FOLIAGE_MATERIAL.color.set(color)
        }

        group.add(trunk)

        // Call super before accessing 'this'
        super(group, resolution)

        // Store references on 'this'
        this.foliageLayers = foliageLayers
        this.foliage = foliageLayers[0] // For compatibility

        // Expose material for compatibility with applyPalette
        this.mesh.material = this.foliage.material
    }

    // Method to update all foliage colors when theme changes
    updateFoliageColor(color) {
        this.foliageLayers.forEach(layer => {
            layer.material.color.set(color)
        })
    }
}