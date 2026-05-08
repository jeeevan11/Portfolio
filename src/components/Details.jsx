import { useRef, useEffect } from 'react'
import './Details.css'

const FILL_COUNT = 8 // /public/creative-fills/1.jpeg … 8.jpeg

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

  // Press-and-hold: show the image *currently* filling the stencil at full size.
  // Release / leave the page → vanishes.
  const handleCreativePress = (e) => {
    if (e && e.preventDefault) e.preventDefault()
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
          onMouseEnter={pickRandomFill}
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
