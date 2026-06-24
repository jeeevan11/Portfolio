import { useState, useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import Grain from './Grain'
import { registerLiquidEases, prefersReducedMotion } from '../lib/motion'
import './Maintenance.css'

registerLiquidEases()

export default function Maintenance() {
  const [phase, setPhase] = useState('intro')
  const phaseRef = useRef('intro')
  const videoRef = useRef(null)
  const loaderRef = useRef(null)
  const centerRef = useRef(null)
  const linksRef = useRef(null)
  const tlRef = useRef(null)
  const filmWatchdogRef = useRef(null)

  const go = (next) => { phaseRef.current = next; setPhase(next) }

  const playName = () => {
    const loader = loaderRef.current
    if (!loader) return
    if (tlRef.current) tlRef.current.kill()

    // Reset idle content so it's invisible before the name plays.
    if (centerRef.current) {
      gsap.set(Array.from(centerRef.current.children), { autoAlpha: 0, y: 18 })
    }
    if (linksRef.current) gsap.set(linksRef.current, { autoAlpha: 0, y: 10 })

    const J = loader.querySelector('.ml-j')
    const atin = loader.querySelector('.ml-atin')
    const C = loader.querySelector('.ml-c')
    const hhanwal = loader.querySelector('.ml-hhanwal')

    const w = window.innerWidth
    const h = window.innerHeight
    const isMobile = w < 768
    const initialSize = isMobile ? Math.min(w * 0.082, 40) : Math.min(w * 0.11, 200)
    const finalSize = isMobile ? 18 : 24
    const finalPos = isMobile ? 12 : 20
    const scaleRatio = finalSize / initialSize

    const els = [loader, J, atin, C, hhanwal]
    els.forEach((el) => { el.style.fontSize = initialSize + 'px' })

    atin.style.width = 'auto'
    hhanwal.style.width = 'auto'
    const atinW = atin.offsetWidth
    const hhanwalW = hhanwal.offsetWidth
    atin.style.width = '0px'
    hhanwal.style.width = '0px'
    const jW = J.offsetWidth
    const cW = C.offsetWidth

    const fullW = jW + atinW + cW + hhanwalW
    const initialsW = jW + cW
    const startLeft = isMobile ? w * 0.5 - fullW / 2 : w * 0.5 - initialsW / 2
    const expandLeft = w * 0.5 - fullW / 2

    gsap.set(loader, { x: startLeft, y: h / 2, yPercent: -50, scale: 1, opacity: 0 })
    gsap.set(atin, { width: (isMobile ? atinW : 0) + 'px' })
    gsap.set(hhanwal, { width: (isMobile ? hhanwalW : 0) + 'px' })

    const onParked = () => {
      els.forEach((el) => { el.style.fontSize = finalSize + 'px' })
      gsap.set(loader, { scale: 1, x: finalPos, y: finalPos, yPercent: 0 })
      gsap.set(atin, { width: isMobile ? '0px' : 'auto' })
      gsap.set(hhanwal, { width: isMobile ? '0px' : 'auto' })
      go('idle')
      // Stagger the idle content in — title first, then sub, then play button.
      // Subtitle targets 0.62 opacity to match its CSS dim; others go to 1.
      if (centerRef.current) {
        Array.from(centerRef.current.children).forEach((el, i) => {
          const targetOpacity = el.classList.contains('maint-sub') ? 0.62 : 1
          gsap.to(el, { autoAlpha: targetOpacity, y: 0, duration: 0.95, ease: 'liquid', delay: 0.12 + i * 0.14 })
        })
      }
      if (linksRef.current) {
        gsap.to(linksRef.current, { autoAlpha: 1, y: 0, duration: 0.95, ease: 'liquid', delay: 0.55 })
      }
    }

    const tl = gsap.timeline({ onComplete: onParked })
    tlRef.current = tl

    if (isMobile) {
      tl.to(loader, { opacity: 1, duration: 0.7, ease: 'liquid', delay: 0.1 })
      tl.to(loader, { duration: 0.3 })
      tl.to([atin, hhanwal], { width: 0, duration: 0.8, ease: 'liquidFlow' })
      tl.to(loader, { x: w * 0.5 - initialsW / 2, duration: 0.8, ease: 'liquidFlow' }, '<')
      tl.to(loader, { x: finalPos, y: finalPos, yPercent: 0, scale: scaleRatio, duration: 1.0, ease: 'liquidPour', delay: 0.2 })
    } else {
      tl.to(loader, { opacity: 1, duration: 1.0, ease: 'liquid', delay: 0.2 })
      tl.to([atin, hhanwal], { width: (i) => [atinW, hhanwalW][i] + 'px', duration: 1.8, ease: 'liquidFlow', delay: 0.5 })
      tl.to(loader, { x: expandLeft, duration: 1.8, ease: 'liquidFlow' }, '<')
      tl.to(loader, { x: finalPos, y: finalPos, yPercent: 0, scale: scaleRatio, duration: 2.0, ease: 'liquidPour', delay: 0.5 })
    }
  }

  // Jump straight to the parked/idle end-state with no animation. Used for
  // prefers-reduced-motion and as a watchdog if the intro timeline never
  // completes (rAF suspended on a background tab, a stalled webfont, etc.) —
  // the page must never be left as a blank green screen.
  const settleImmediately = () => {
    if (tlRef.current) { tlRef.current.kill(); tlRef.current = null }
    const loader = loaderRef.current
    if (loader) {
      const isMobile = window.innerWidth < 768
      const finalSize = isMobile ? 18 : 24
      const finalPos = isMobile ? 12 : 20
      const J = loader.querySelector('.ml-j')
      const atin = loader.querySelector('.ml-atin')
      const C = loader.querySelector('.ml-c')
      const hhanwal = loader.querySelector('.ml-hhanwal')
      ;[loader, J, atin, C, hhanwal].forEach((el) => { if (el) el.style.fontSize = finalSize + 'px' })
      gsap.set(loader, { scale: 1, x: finalPos, y: finalPos, yPercent: 0, opacity: 1 })
      if (atin) gsap.set(atin, { width: isMobile ? '0px' : 'auto' })
      if (hhanwal) gsap.set(hhanwal, { width: isMobile ? '0px' : 'auto' })
    }
    go('idle')
    if (centerRef.current) {
      Array.from(centerRef.current.children).forEach((el) => {
        const targetOpacity = el.classList.contains('maint-sub') ? 0.62 : 1
        gsap.set(el, { autoAlpha: targetOpacity, y: 0 })
      })
    }
    if (linksRef.current) gsap.set(linksRef.current, { autoAlpha: 1, y: 0 })
  }

  useEffect(() => {
    let cancelled = false
    if (prefersReducedMotion()) {
      // No fly-in for reduced-motion visitors — show the final state at once.
      settleImmediately()
      return () => { cancelled = true }
    }
    const fontsReady = document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve()
    // Don't let a slow/stalled webfont gate the hero forever — race a timeout.
    const ready = Promise.race([
      fontsReady,
      new Promise((resolve) => setTimeout(resolve, 1200)),
    ])
    ready.then(() => { if (!cancelled) playName() })
    // Safety net: if the timeline never reaches idle, force the visible state.
    const watchdog = setTimeout(() => {
      if (!cancelled && phaseRef.current === 'intro') settleImmediately()
    }, 6000)
    return () => {
      cancelled = true
      clearTimeout(watchdog)
      if (tlRef.current) tlRef.current.kill()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const startFilm = () => {
    if (phaseRef.current !== 'idle') return
    go('film')
    // Stagger content out (reverse order: button → sub → title).
    if (centerRef.current) {
      gsap.to(
        Array.from(centerRef.current.children).reverse(),
        { autoAlpha: 0, y: -14, duration: 0.5, ease: 'liquid', stagger: 0.08 }
      )
    }
    if (loaderRef.current) gsap.to(loaderRef.current, { opacity: 0, duration: 0.6, ease: 'liquid' })
    if (linksRef.current) gsap.to(linksRef.current, { autoAlpha: 0, y: 10, duration: 0.4, ease: 'liquid' })
    const v = videoRef.current
    if (v) {
      try { v.currentTime = 0 } catch { /* not seekable yet */ }
      v.muted = false
      v.volume = 1
      // If playback is rejected (autoplay/codec), don't strand the user on a
      // black screen — return to the message.
      v.play().catch(() => endFilm())
      // Slow-network watchdog: revert if real playback never starts.
      if (filmWatchdogRef.current) clearTimeout(filmWatchdogRef.current)
      filmWatchdogRef.current = setTimeout(() => {
        if (phaseRef.current === 'film' && (v.paused || v.readyState < 3)) endFilm()
      }, 5000)
    }
  }

  const endFilm = () => {
    if (phaseRef.current !== 'film') return
    if (filmWatchdogRef.current) { clearTimeout(filmWatchdogRef.current); filmWatchdogRef.current = null }
    const v = videoRef.current
    if (v) v.pause()
    go('intro')
    // Wait for cinema to fully fade (0.85s) before the name re-emerges.
    window.setTimeout(() => {
      if (phaseRef.current !== 'intro') return
      if (prefersReducedMotion()) settleImmediately()
      else playName()
    }, 750)
  }

  useEffect(() => {
    if (phase !== 'film') return
    const onKey = (e) => { if (e.key === 'Escape') endFilm() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase])

  return (
    <div className={`maint-root phase-${phase}`}>
      <Grain opacity={0.032} />

      <div ref={loaderRef} className="maint-loader" aria-label="Jatin Chhanwal">
        <span className="ml-j">J</span><span className="ml-fill ml-atin">atin</span><span className="ml-c">C</span><span className="ml-fill ml-hhanwal">hhanwal</span>
      </div>

      <main ref={centerRef} className="maint-center">
        <h1 className="maint-title">
          Updating<span className="maint-dot">.</span>
        </h1>
        <p className="maint-sub">
          I&apos;m reworking a few things, back soon.
        </p>

        <button
          className="maint-play"
          type="button"
          onClick={startFilm}
          aria-label="Watch the short film"
        >
          <svg className="maint-ring" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path id="maintRing" d="M60,19 a41,41 0 1,1 -0.01,0" />
            </defs>
            <text>
              <textPath href="#maintRing" startOffset="0" textLength="257" lengthAdjust="spacing">
                WATCH THE FILM • WATCH THE FILM •
              </textPath>
            </text>
          </svg>
          <span className="maint-disc">
            <svg className="maint-tri" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M8.25 7.5 L15.75 12 L8.25 16.5 Z"
                fill="currentColor"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            </svg>
          </span>
        </button>

      </main>

      <div ref={linksRef} className="maint-links">
        <a
          href="/Jatin_Chhanwal_Resume.pdf"
          download
          className="maint-link"
        >AI Resume</a>
        <a
          href="/Jatin_Chhanwal_Resume_Systems.pdf"
          download
          className="maint-link"
        >Systems Resume</a>
        <a
          href="https://www.linkedin.com/in/jatinchhanwal/"
          target="_blank"
          rel="noopener noreferrer"
          className="maint-link"
        >Contact</a>
      </div>

      <div
        className="maint-cinema"
        onClick={endFilm}
        role="button"
        aria-label="Close film"
        aria-hidden={phase !== 'film'}
        tabIndex={phase === 'film' ? 0 : -1}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
            e.preventDefault()
            endFilm()
          }
        }}
      >
        <video
          ref={videoRef}
          className="maint-video"
          src="/ambient.mp4"
          playsInline
          preload="none"
          aria-label="Short ambient film"
          onEnded={endFilm}
          onError={endFilm}
          onPlaying={() => {
            if (filmWatchdogRef.current) {
              clearTimeout(filmWatchdogRef.current)
              filmWatchdogRef.current = null
            }
          }}
        />
        <span className="maint-cinema-hint" aria-hidden="true">
          tap to close · loops back
        </span>
      </div>
    </div>
  )
}
