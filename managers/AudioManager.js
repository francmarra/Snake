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
    this.btnVolumeImg = document.getElementById('btn-volume-img') // Cache the image element
    this.paletteName = paletteName
    this.capitalize = capitalize
    this.defaultVolume = 0.7 // Define a default unmuted volume

    // Pause audio initially before setting volume
    this.audio.pause() 

    // Load audio state from browser's cache (localStorage)
    const storedAudioState = localStorage.getItem('snakeGameAudio') // "on" or "off"
    if (storedAudioState === 'off') {
      this.audio.volume = 0
      this.updateVolumeIcon(true) // Update icon to muted
    } else {
      // Default to 'on' if no state is stored or if it's 'on'
      this.audio.volume = this.defaultVolume
      this.updateVolumeIcon(false) // Update icon to unmuted
    }
    // Removed redundant initial volume state logic using 'userVolume'

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
        await this.audio.play();
        // Update the icon just to be safe, though it should be correct
        this.updateVolumeIcon(false);
      } else {
        // Ensure icon is muted if volume is 0
        // This also ensures audio remains paused if it started muted
        if (this.audio.paused === false) { // Only pause if it was somehow playing at volume 0
            this.audio.pause();
        }
        this.updateVolumeIcon(true);
      }
    } catch (error) {
      console.log('Audio play failed:', error);
    }
  }
  
  muteVolume() {
    gsap.to(this.audio, {
      volume: 0,
      duration: 0.3,
      onComplete: () => {
        this.audio.pause(); // Explicitly pause the audio
      }
    });
    this.updateVolumeIcon(true); // Update icon to muted
    localStorage.setItem('snakeGameAudio', 'off');
  }
  
  unmuteVolume() {
    gsap.to(this.audio, { volume: this.defaultVolume, duration: 0.3 });
    this.updateVolumeIcon(false); // Update icon to unmuted
    localStorage.setItem('snakeGameAudio', 'on');

    // Attempt to play the audio.
    // This will start it if it was paused (e.g. by muteVolume or if game started muted)
    // or resume if it was "playing" at volume 0.
    this.audio.play().catch(error => {
      console.log('Audio play failed on unmute:', error);
    });
  }
  
  updateVolumeIcon(isMuted) {
    if (this.btnVolumeImg) {
      gsap.killTweensOf(this.btnVolumeImg); // Stop any existing animation on the icon
      const audioState = isMuted ? 'NoAudio' : 'Audio';
      this.btnVolumeImg.src = `/assets/images/themes/${this.paletteName.toLowerCase()}/${this.capitalize(this.paletteName)}${audioState}.svg`;
    }
  }
  
  updatePalette(paletteName) {
    this.paletteName = paletteName
    // Update volume icon with new palette
    this.updateVolumeIcon(this.audio.volume === 0)
  }
}