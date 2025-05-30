import gsap from 'gsap'
import { animateButtonClick } from '../src/utils/Animations.js'

export function muteVolume(audio, btnVolumeImg, paletteName, capitalize) {
  // Silencia o áudio
  gsap.to(audio, { volume: 0, duration: 0.3 })
  if (btnVolumeImg) {
    gsap.killTweensOf(btnVolumeImg)
    btnVolumeImg.src = `/assets/images/themes/${paletteName.toLowerCase()}/${capitalize(paletteName)}NoAudio.svg`
  }
}

export function unmuteVolume(audio, btnVolumeImg, paletteName, initialVolume, capitalize) {
  // Ativa o áudio
  if (btnVolumeImg) {
    gsap.killTweensOf(btnVolumeImg)
    btnVolumeImg.src = `/assets/images/themes/${paletteName.toLowerCase()}/${capitalize(paletteName)}Audio.svg`
  }
  gsap.to(audio, { volume: initialVolume, duration: 0.3 })
}

export class AudioController {
  constructor(paletteName, capitalize) {
    this.audio = document.getElementById('audio')
    this.btnVolume = document.getElementById('btn-volume')
    this.paletteName = paletteName
    this.capitalize = capitalize

    // Load audio state from browser's cache (localStorage)
    const storedAudioState = localStorage.getItem('snakeGameAudio') // "on" or "off"
    if (storedAudioState === 'off') {
      this.audio.volume = 0
    } else {
      this.audio.volume = 0.7
    }
    this.initialVolume = this.audio.volume
    this.audio.pause() // Ensure it's paused initially

    // Initialize volume state
    const userVolume = 'on' // Default value, not loaded from localStorage
    if (userVolume === 'off') {
      this.muteVolume()
    }
    
    this.setupVolumeButton()
  }
  
  setupVolumeButton() {
    if (!this.btnVolume) return
    
    this.btnVolume.addEventListener('click', () => {
      // Add a small scale animation for feedback
      animateButtonClick(this.btnVolume)
      
      // Check if audio is muted
      if (this.audio.volume === 0) {
        this.unmuteVolume()
      } else {
        this.muteVolume()
      }
    })
    
    this.btnVolume.addEventListener('mouseenter', function () {
      this.style.transform = 'scale(1.15)'
      this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)'
    })
    this.btnVolume.addEventListener('mouseleave', function () {
      this.style.transform = 'scale(1)'
      this.style.transition = 'all 0.2s cubic-bezier(0.42,0,0.58,1)'
    })
  }
  
  async playAudio() {
    try {
      // Check if user muted audio
      if (this.audio.volume !== 0) {
        await this.audio.play()
        // Update the icon just to be safe
        this.updateVolumeIcon(false)
      } else {
        this.updateVolumeIcon(true)
      }
    } catch (error) {
      console.log('Audio play failed:', error)
    }
  }
  
  muteVolume() {
    muteVolume(this.audio, document.getElementById('btn-volume-img'), this.paletteName, this.capitalize)
    localStorage.setItem('snakeGameAudio', 'off')
  }
  
  unmuteVolume() {
    unmuteVolume(this.audio, document.getElementById('btn-volume-img'), this.paletteName, this.initialVolume, this.capitalize)
    localStorage.setItem('snakeGameAudio', 'on')
  }
  
  updateVolumeIcon(isMuted) {
    const btnVolumeImg = document.getElementById('btn-volume-img')
    if (btnVolumeImg) {
      const audioState = isMuted ? 'NoAudio' : 'Audio'
      btnVolumeImg.src = `/assets/images/themes/${this.paletteName.toLowerCase()}/${this.capitalize(this.paletteName)}${audioState}.svg`
    }
  }
  
  updatePalette(paletteName) {
    this.paletteName = paletteName
    // Update volume icon with new palette
    this.updateVolumeIcon(this.audio.volume === 0)
  }
}