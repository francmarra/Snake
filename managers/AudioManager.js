export function muteVolume(audio, btnVolumeImg, paletteName, capitalize, gsap) {
  gsap.to(audio, { volume: 0, duration: 0.3 })
  if (btnVolumeImg) {
    gsap.killTweensOf(btnVolumeImg)
    btnVolumeImg.src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}NoAudio.svg`
  }
}

export function unmuteVolume(audio, btnVolumeImg, paletteName, initialVolume, capitalize, gsap) {
  if (btnVolumeImg) {
    gsap.killTweensOf(btnVolumeImg)
    btnVolumeImg.src = `/ThemeBtn/${paletteName.toLowerCase()}/${capitalize(paletteName)}Audio.svg`
  }
  gsap.to(audio, { volume: initialVolume, duration: 0.3 })
}