import { useRef, useEffect } from 'react'
import './Details.css'

const FILL_COUNT = 8 // /public/creative-fills/1.jpeg … 8.jpeg

// Tiny tonal chime for Creative hover/press — soft sine pluck, distinct from
// the mechanical click sounds. Cheap WebAudio, no asset.
let _chimeCtx = null
let _lastChimeAt = 0
function playCreativeChime(velocity = 1) {
  try {
    if (!_chimeCtx) _chimeCtx = new (window.AudioContext || window.webkitAudioContext)()
    const ctx = _chimeCtx
    if (ctx.state === 'suspended') ctx.resume().catch(() => {})
    const now = ctx.currentTime
    if (now - _lastChimeAt < 0.06) return // anti-spam
    _lastChimeAt = now
    // Pentatonic-ish notes so repeated hovers stay pleasant
    const notes = [880, 988, 1175, 1318, 1568]
    const f = notes[Math.floor(Math.random() * notes.length)]
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(f, now)
    const gain = ctx.createGain()
    const peak = Math.min(0.06, 0.025 + velocity * 0.02)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(peak, now + 0.012)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)
    osc.connect(gain); gain.connect(ctx.destination)
    osc.start(now); osc.stop(now + 0.34)
  } catch (e) { /* ignore */ }
}

function Details() {
  const showColor = () => document.body.classList.add('navDetailsHover')
  const hideColor = () => document.body.classList.remove('navDetailsHover')

  const headingHandlers = {
    onMouseEnter: showColor,
    onMouseLeave: hideColor,
    onTouchStart: showColor,
    onTouchEnd: hideColor,
    onTouchCancel: hideColor,
  }

  const fillRef = useRef(null)
  const lastFillIndexRef = useRef(-1)

  const pickRandomFill = () => {
    if (!fillRef.current) return
    let next
    do {
      next = Math.floor(Math.random() * FILL_COUNT) + 1
    } while (next === lastFillIndexRef.current && FILL_COUNT > 1)
    lastFillIndexRef.current = next
    fillRef.current.style.backgroundImage = `url('/creative-fills/${next}.jpeg')`
  }

  const handleCreativeHover = () => {
    pickRandomFill()
    playCreativeChime(0.6)
  }

  // Press-and-hold: show the image *currently* filling the stencil at full size.
  // Release / leave the page → vanishes.
  const handleCreativePress = (e) => {
    if (e && e.preventDefault) e.preventDefault()
    playCreativeChime(1.4)
    const peek = document.getElementById('creativePeek')
    if (peek) {
      const idx = lastFillIndexRef.current > 0 ? lastFillIndexRef.current : 1
      peek.src = `/creative-fills/${idx}.jpeg`
    }
    document.body.classList.add('creativePeek')
  }
  const handleCreativeRelease = () => {
    document.body.classList.remove('creativePeek')
  }

  useEffect(() => {
    pickRandomFill() // initial image so the first reveal is never blank

    // Preload all 8 images so press → instant peek (no loading flash)
    for (let i = 1; i <= FILL_COUNT; i++) {
      const pre = new Image()
      pre.src = `/creative-fills/${i}.jpeg`
    }

    let wasShowing = document.body.classList.contains('showCreativeFill')
    const observer = new MutationObserver(() => {
      const isShowing = document.body.classList.contains('showCreativeFill')
      if (isShowing && !wasShowing) pickRandomFill()
      wasShowing = isShowing
    })
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] })

    // Global release safety — peek vanishes regardless of where the
    // mouse/finger ends up when released (drift, leave, blur).
    const release = () => document.body.classList.remove('creativePeek')
    window.addEventListener('mouseup', release)
    window.addEventListener('touchend', release)
    window.addEventListener('touchcancel', release)
    window.addEventListener('blur', release)
    document.addEventListener('visibilitychange', release)

    return () => {
      observer.disconnect()
      window.removeEventListener('mouseup', release)
      window.removeEventListener('touchend', release)
      window.removeEventListener('touchcancel', release)
      window.removeEventListener('blur', release)
      document.removeEventListener('visibilitychange', release)
    }
  }, [])

  return (
    <div id="details">
      <p>
        <span className="headingWord" {...headingHandlers}>Independent</span>
      </p>
      <p>
        <span
          className="creativeWord"
          role="button"
          tabIndex={0}
          aria-label="Press and hold to view"
          onMouseEnter={handleCreativeHover}
          onMouseDown={handleCreativePress}
          onTouchStart={handleCreativePress}
          onContextMenu={(e) => e.preventDefault()}
        >
          <span className="creativeWordBase">Creative</span>
          <span className="creativeWordFill" ref={fillRef} aria-hidden="true">Creative</span>
        </span>
        {' '}
        <span className="headingWord" {...headingHandlers}>Developer</span>
      </p>
    </div>
  )
}

export default Details
