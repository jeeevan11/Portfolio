let audioCtx = null
let lastClickTime = 0
let clickCount = 0

function initCtx() {
  if (audioCtx) return
  audioCtx = new (window.AudioContext || window.webkitAudioContext)()
}

function buildAndPlay(velocity) {
  const ctx = audioCtx
  const now = ctx.currentTime

  const baseFreq = clickCount % 2 === 0 ? 2200 : 2600
  const freq = baseFreq + Math.random() * 300
  clickCount++

  const duration = 0.012
  const bufferSize = Math.ceil(ctx.sampleRate * duration)
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < bufferSize; i++) {
    const t = i / bufferSize
    data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 12)
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer

  const bp = ctx.createBiquadFilter()
  bp.type = 'bandpass'
  bp.frequency.value = freq
  bp.Q.value = 3.5

  const body = ctx.createBiquadFilter()
  body.type = 'peaking'
  body.frequency.value = freq * 0.45
  body.gain.value = 6
  body.Q.value = 4

  const gain = ctx.createGain()
  const vol = Math.min(0.18, 0.08 + Math.abs(velocity) * 0.006)
  gain.gain.setValueAtTime(vol, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration)

  source.connect(bp)
  bp.connect(body)
  body.connect(gain)
  gain.connect(ctx.destination)
  source.start(now)
  source.stop(now + duration + 0.002)
}

// Try to play: resume context if needed, then build sound.
// Called from any event context — works immediately if context is running,
// otherwise fires buildAndPlay as soon as resume() resolves.
function tryPlay(velocity) {
  if (!audioCtx) return
  if (audioCtx.state === 'running') {
    buildAndPlay(velocity)
  } else {
    audioCtx.resume().then(() => {
      if (audioCtx.state === 'running') buildAndPlay(velocity)
    }).catch(() => {})
  }
}

export function initMechanicalClicks(lenis) {
  // Create context immediately so it can be resumed at the first opportunity.
  // Browsers require a user gesture to resume but creating eagerly shortens the delay.
  initCtx()

  // Hard-unlock on every real activation event (click, touch, key)
  function unlockNow() {
    if (!audioCtx) return
    if (audioCtx.state !== 'running') audioCtx.resume().catch(() => {})
  }
  const activationEvents = ['click', 'pointerdown', 'touchstart', 'keydown']
  activationEvents.forEach(e => document.addEventListener(e, unlockNow, { passive: true }))

  // Mechanical sound on every click (links, buttons, anywhere)
  document.addEventListener('click', () => tryPlay(1.6))

  // Scroll ticks — attempt resume+play on every tick so the first permitted
  // scroll event (Chrome allows wheel in some contexts) plays immediately.
  lenis.on('scroll', ({ velocity }) => {
    const speed = Math.abs(velocity)
    if (speed < 0.3) return

    const now = Date.now()
    const interval = Math.max(45, 180 - speed * 22)
    if (now - lastClickTime < interval) return
    lastClickTime = now

    tryPlay(velocity)
  })

  return () => {
    activationEvents.forEach(e => document.removeEventListener(e, unlockNow))
  }
}
