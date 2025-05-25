export function muteVolume(audio, btnVolumeImg, paletteName, capitalize, gsap) {
  // Silencia o áudio
  gsap.to(audio, { volume: 0, duration: 0.3 })
  if (btnVolumeImg) {
    gsap.killTweensOf(btnVolumeImg)
    btnVolumeImg.src = `/assets/images/themes/${paletteName.toLowerCase()}/${capitalize(paletteName)}NoAudio.svg`
  }
}

export function unmuteVolume(audio, btnVolumeImg, paletteName, initialVolume, capitalize, gsap) {
  // Ativa o áudio
  if (btnVolumeImg) {
    gsap.killTweensOf(btnVolumeImg)
    btnVolumeImg.src = `/assets/images/themes/${paletteName.toLowerCase()}/${capitalize(paletteName)}Audio.svg`
  }
  gsap.to(audio, { volume: initialVolume, duration: 0.3 })
}