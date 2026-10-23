/** A kitchen-timer ring made with the Web Audio API, so no sound file is needed. */

const RING_EVERY_MS = 2500
/** Stops ringing on its own after a minute, even if nobody is there to stop it. */
const RING_FOR_MS = 60_000

let audio: AudioContext | null = null
let ringing: ReturnType<typeof setInterval> | null = null
let stopAfter: ReturnType<typeof setTimeout> | null = null

export function unlockSound(): void {
  if (typeof AudioContext === 'undefined') return
  audio ??= new AudioContext()
  if (audio.state === 'suspended') void audio.resume()
}

export function startAlarm(): void {
  if (ringing !== null) return
  ring()
  ringing = setInterval(ring, RING_EVERY_MS)
  stopAfter = setTimeout(stopAlarm, RING_FOR_MS)
}

export function stopAlarm(): void {
  if (ringing !== null) clearInterval(ringing)
  if (stopAfter !== null) clearTimeout(stopAfter)
  ringing = null
  stopAfter = null
}

/** Three short high beeps, like a mechanical kitchen timer. */
function ring(): void {
  // Browsers refuse vibration until the reader has tapped the page at least once.
  if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.([200, 100, 200, 100, 200])
  if (!audio) return
  const start = audio.currentTime
  for (let beep = 0; beep < 3; beep += 1) {
    const at = start + beep * 0.22
    const tone = audio.createOscillator()
    const volume = audio.createGain()
    tone.type = 'square'
    tone.frequency.value = 1760
    volume.gain.setValueAtTime(0.0001, at)
    volume.gain.exponentialRampToValueAtTime(0.18, at + 0.01)
    volume.gain.exponentialRampToValueAtTime(0.0001, at + 0.16)
    tone.connect(volume).connect(audio.destination)
    tone.start(at)
    tone.stop(at + 0.18)
  }
}
